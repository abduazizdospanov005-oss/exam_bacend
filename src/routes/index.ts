import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import * as auth     from '../controllers/authController';
import * as question from '../controllers/questionController';
import * as exam     from '../controllers/examController';
import * as attempt  from '../controllers/attemptController';
import * as result   from '../controllers/resultController';
import { upload }    from '../services/cloudinary';

const router = Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, error: 'Ko\'p urinish, keyinroq qayta urining' } });

// ── AUTH ──────────────────────────────────────
router.post('/auth/register', authLimiter, auth.register);
router.post('/auth/login',    authLimiter, auth.login);
router.get ('/auth/me',       authenticateToken, auth.getMe);

// ── CATEGORIES ───────────────────────────────
router.get('/categories', authenticateToken, question.getCategories);

// ── QUESTIONS ─────────────────────────────────
router.get   ('/questions',                  authenticateToken,                                  question.getQuestions);
router.get   ('/questions/:id',              authenticateToken,                                  question.getQuestion);
router.post  ('/questions',                  authenticateToken, authorizeRoles('ADMIN','TEACHER'), question.createQuestion);
router.put   ('/questions/:id',              authenticateToken, authorizeRoles('ADMIN','TEACHER'), question.updateQuestion);
router.delete('/questions/:id',              authenticateToken, authorizeRoles('ADMIN','TEACHER'), question.deleteQuestion);
router.post  ('/questions/:id/upload-image', authenticateToken, authorizeRoles('ADMIN','TEACHER'), upload.single('image'), question.uploadQuestionImage);

// ── EXAMS ──────────────────────────────────────
router.get   ('/exams',                              authenticateToken,                                  exam.getExams);
router.get   ('/exams/:id',                          authenticateToken,                                  exam.getExam);
router.post  ('/exams',                              authenticateToken, authorizeRoles('ADMIN','TEACHER'), exam.createExam);
router.put   ('/exams/:id',                          authenticateToken, authorizeRoles('ADMIN','TEACHER'), exam.updateExam);
router.delete('/exams/:id',                          authenticateToken, authorizeRoles('ADMIN'),           exam.deleteExam);
router.post  ('/exams/:id/questions',                authenticateToken, authorizeRoles('ADMIN','TEACHER'), exam.addQuestionsToExam);
router.delete('/exams/:id/questions/:questionId',    authenticateToken, authorizeRoles('ADMIN','TEACHER'), exam.removeQuestionFromExam);
router.post  ('/exams/:id/publish',                  authenticateToken, authorizeRoles('ADMIN','TEACHER'), exam.publishExam);

// ── ATTEMPTS ──────────────────────────────────
router.post('/attempts/start',       authenticateToken, attempt.startAttempt);
router.post('/attempts/:id/answer',  authenticateToken, attempt.saveAnswer);
router.post('/attempts/:id/submit',  authenticateToken, attempt.submitAttempt);
router.get ('/attempts/:id',         authenticateToken, attempt.getAttempt);

// ── RESULTS ───────────────────────────────────
router.get('/results/my',                    authenticateToken,                                  result.getMyResults);
router.get('/results/leaderboard',           authenticateToken,                                  result.getLeaderboard);
router.get('/results/:attemptId',            authenticateToken,                                  result.getResult);
router.get('/results/exam/:examId/stats',    authenticateToken, authorizeRoles('ADMIN','TEACHER'), result.getExamStats);

export default router;
