import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // ── Categories ──────────────────────────────
  const [math, cs, eng, history, physics, chemistry] = await Promise.all([
    prisma.category.upsert({ where: { name: 'Matematika' }, update: {}, create: { name: 'Matematika' } }),
    prisma.category.upsert({ where: { name: 'Informatika' }, update: {}, create: { name: 'Informatika' } }),
    prisma.category.upsert({ where: { name: 'Ingliz tili' }, update: {}, create: { name: 'Ingliz tili' } }),
    prisma.category.upsert({ where: { name: 'Tarix' }, update: {}, create: { name: 'Tarix' } }),
    prisma.category.upsert({ where: { name: 'Fizika' }, update: {}, create: { name: 'Fizika' } }),
    prisma.category.upsert({ where: { name: 'Kimyo' }, update: {}, create: { name: 'Kimyo' } }),
  ]);

  // ── Users ────────────────────────────────────
  const hash      = await bcrypt.hash('Test1234',  10);
  const adminHash = await bcrypt.hash('Admin1234', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@exam.com' },
    update: {},
    create: { name: 'Administrator', email: 'admin@exam.com', password: adminHash, role: 'ADMIN' },
  });
  const teacher = await prisma.user.upsert({
    where: { email: 'sardor@teacher.com' },
    update: {},
    create: { name: 'Sardor Usmonov', email: 'sardor@teacher.com', password: hash, role: 'TEACHER' },
  });
  const student1 = await prisma.user.upsert({
    where: { email: 'jasur@student.com' },
    update: {},
    create: { name: 'Jasur Toshmatov', email: 'jasur@student.com', password: hash, role: 'STUDENT' },
  });
  const student2 = await prisma.user.upsert({
    where: { email: 'malika@student.com' },
    update: {},
    create: { name: 'Malika Rahimova', email: 'malika@student.com', password: hash, role: 'STUDENT' },
  });
  const student3 = await prisma.user.upsert({
    where: { email: 'bobur@student.com' },
    update: {},
    create: { name: 'Bobur Xasanov', email: 'bobur@student.com', password: hash, role: 'STUDENT' },
  });
  const student4 = await prisma.user.upsert({
    where: { email: 'nilufar@student.com' },
    update: {},
    create: { name: 'Nilufar Qodirov', email: 'nilufar@student.com', password: hash, role: 'STUDENT' },
  });
  const student5 = await prisma.user.upsert({
    where: { email: 'sherzod@student.com' },
    update: {},
    create: { name: 'Sherzod Mirzayev', email: 'sherzod@student.com', password: hash, role: 'STUDENT' },
  });

  const tid = teacher.id;

  // ── Questions: Matematika (12 ta) ─────────────
  const mathQs = await Promise.all([
    prisma.question.create({ data: { text: '2 + 2 = ?', type: 'MCQ', options: ['3','4','5','6'], correctAnswer: '4', points: 1, categoryId: math.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'Pi soni qaysi qiymatga teng?', type: 'MCQ', options: ['3.14','2.71','1.41','1.73'], correctAnswer: '3.14', points: 1, categoryId: math.id, createdById: tid } }),
    prisma.question.create({ data: { text: '7 × 8 = 56', type: 'TRUE_FALSE', correctAnswer: 'true', points: 1, categoryId: math.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'Kvadrat ildiz: √144 = ?', type: 'MCQ', options: ['10','11','12','13'], correctAnswer: '12', points: 1, categoryId: math.id, createdById: tid } }),
    prisma.question.create({ data: { text: '15% of 200 = ?', type: 'MCQ', options: ['25','30','35','40'], correctAnswer: '30', points: 1, categoryId: math.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'log₁₀(1000) = ?', type: 'MCQ', options: ['2','3','4','10'], correctAnswer: '3', points: 2, categoryId: math.id, createdById: tid } }),
    prisma.question.create({ data: { text: '5! (faktorial) = ?', type: 'MCQ', options: ['60','100','120','150'], correctAnswer: '120', points: 2, categoryId: math.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'Sin(90°) = 1', type: 'TRUE_FALSE', correctAnswer: 'true', points: 1, categoryId: math.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'Pifagor teoremasi: a²+b²=c² bu to\'g\'ri burchakli uchburchak uchun', type: 'TRUE_FALSE', correctAnswer: 'true', points: 1, categoryId: math.id, createdById: tid } }),
    prisma.question.create({ data: { text: '2³ = ?', type: 'MCQ', options: ['6','8','9','16'], correctAnswer: '8', points: 1, categoryId: math.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'Aylana uzunligi formulasi qaysi?', type: 'MCQ', options: ['πr²','2πr','πd²','4πr'], correctAnswer: '2πr', points: 1, categoryId: math.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'Kvadratning yuzasi formulasini yozing.', type: 'SHORT_ANSWER', points: 2, categoryId: math.id, createdById: tid } }),
  ]);

  // ── Questions: Informatika (12 ta) ────────────
  const csQs = await Promise.all([
    prisma.question.create({ data: { text: 'HTML nima?', type: 'MCQ', options: ['Dasturlash tili','Belgilash tili','Ma\'lumotlar bazasi','Operatsion tizim'], correctAnswer: 'Belgilash tili', points: 1, categoryId: cs.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'JavaScript frontend va backend da ham ishlatilishi mumkin.', type: 'TRUE_FALSE', correctAnswer: 'true', points: 1, categoryId: cs.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'Python qaysi turdagi til?', type: 'MCQ', options: ['Kompilyatsiya','Interpretatsiya','Assembler','Mashina tili'], correctAnswer: 'Interpretatsiya', points: 2, categoryId: cs.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'SQL nima uchun ishlatiladi?', type: 'MCQ', options: ['Dizayn','Ma\'lumotlar bazasi','Tarmoq','Operatsion tizim'], correctAnswer: 'Ma\'lumotlar bazasi', points: 1, categoryId: cs.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'HTTP 404 kodi nimani bildiradi?', type: 'MCQ', options: ['Server xatosi','Sahifa topilmadi','Ruxsat yo\'q','Muvaffaqiyatli'], correctAnswer: 'Sahifa topilmadi', points: 1, categoryId: cs.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'RAM — doimiy xotira hisoblanadi.', type: 'TRUE_FALSE', correctAnswer: 'false', points: 1, categoryId: cs.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'OOP da "Encapsulation" nima?', type: 'MCQ', options: ['Meros olish','Ma\'lumotlarni yashirish','Ko\'p shakllilik','Abstraksiya'], correctAnswer: 'Ma\'lumotlarni yashirish', points: 2, categoryId: cs.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'Git — versiyalarni boshqarish tizimi.', type: 'TRUE_FALSE', correctAnswer: 'true', points: 1, categoryId: cs.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'TCP/IP modelida nechta qatlam bor?', type: 'MCQ', options: ['3','4','5','7'], correctAnswer: '4', points: 2, categoryId: cs.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'Binary da 1010 = ?', type: 'MCQ', options: ['8','9','10','11'], correctAnswer: '10', points: 2, categoryId: cs.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'API nima?', type: 'MCQ', options: ['Dastur interfeysi','Apparat qurilma','Operatsion tizim','Tarmoq protokoli'], correctAnswer: 'Dastur interfeysi', points: 1, categoryId: cs.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'REST API asosiy tamoyillarini tushuntiring.', type: 'SHORT_ANSWER', points: 3, categoryId: cs.id, createdById: tid } }),
  ]);

  // ── Questions: Ingliz tili (10 ta) ────────────
  const engQs = await Promise.all([
    prisma.question.create({ data: { text: '"Apple" so\'zining tarjimasi nima?', type: 'MCQ', options: ['Olma','Anor','Limon','Nok'], correctAnswer: 'Olma', points: 1, categoryId: eng.id, createdById: tid } }),
    prisma.question.create({ data: { text: '"He go to school" to\'g\'ri gap.', type: 'TRUE_FALSE', correctAnswer: 'false', points: 1, categoryId: eng.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'Past Simple: "I ___ to the market yesterday."', type: 'MCQ', options: ['go','goes','went','gone'], correctAnswer: 'went', points: 1, categoryId: eng.id, createdById: tid } }),
    prisma.question.create({ data: { text: '"Beautiful" so\'zining ma\'nosi?', type: 'MCQ', options: ['Kuchli','Go\'zal','Katta','Tez'], correctAnswer: 'Go\'zal', points: 1, categoryId: eng.id, createdById: tid } }),
    prisma.question.create({ data: { text: '"They are playing football" — Present Continuous.', type: 'TRUE_FALSE', correctAnswer: 'true', points: 1, categoryId: eng.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'Antonim: "Hot" so\'zining aksi?', type: 'MCQ', options: ['Warm','Cool','Cold','Mild'], correctAnswer: 'Cold', points: 1, categoryId: eng.id, createdById: tid } }),
    prisma.question.create({ data: { text: '"I have been studying" — bu qaysi zamon?', type: 'MCQ', options: ['Past Simple','Present Perfect Continuous','Future Perfect','Past Continuous'], correctAnswer: 'Present Perfect Continuous', points: 2, categoryId: eng.id, createdById: tid } }),
    prisma.question.create({ data: { text: '"She sings beautiful" — bu gap to\'g\'ri.', type: 'TRUE_FALSE', correctAnswer: 'false', points: 1, categoryId: eng.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'Plural: "Child" so\'zining ko\'pligi?', type: 'MCQ', options: ['Childs','Childes','Children','Childrens'], correctAnswer: 'Children', points: 1, categoryId: eng.id, createdById: tid } }),
    prisma.question.create({ data: { text: '"Ambitious" so\'zini o\'zbek tiliga tarjima qiling.', type: 'SHORT_ANSWER', points: 2, categoryId: eng.id, createdById: tid } }),
  ]);

  // ── Questions: Fizika (8 ta) ──────────────────
  const physQs = await Promise.all([
    prisma.question.create({ data: { text: 'Yorug\'lik tezligi qancha?', type: 'MCQ', options: ['3×10⁸ m/s','3×10⁶ m/s','3×10¹⁰ m/s','3×10⁴ m/s'], correctAnswer: '3×10⁸ m/s', points: 1, categoryId: physics.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'Nyutonning 1-qonuni inersiya qonuni deyiladi.', type: 'TRUE_FALSE', correctAnswer: 'true', points: 1, categoryId: physics.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'Kuch formulasi: F = ?', type: 'MCQ', options: ['m×v','m×a','m×g','m×t'], correctAnswer: 'm×a', points: 1, categoryId: physics.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'Erkin tushish tezlanishi (g) = ?', type: 'MCQ', options: ['9.8 m/s²','8.9 m/s²','10.8 m/s²','7.8 m/s²'], correctAnswer: '9.8 m/s²', points: 1, categoryId: physics.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'Ohm qonuni: U = I × R', type: 'TRUE_FALSE', correctAnswer: 'true', points: 1, categoryId: physics.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'Issiqlik miqdori birlik?', type: 'MCQ', options: ['Watt','Joule','Newton','Pascal'], correctAnswer: 'Joule', points: 1, categoryId: physics.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'Atom yadrosida proton va neytron bo\'ladi.', type: 'TRUE_FALSE', correctAnswer: 'true', points: 1, categoryId: physics.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'Elektr quvvati (P) formulasi?', type: 'MCQ', options: ['U/I','U×I','I/U','U²×I'], correctAnswer: 'U×I', points: 2, categoryId: physics.id, createdById: tid } }),
  ]);

  // ── Questions: Tarix (6 ta) ───────────────────
  const histQs = await Promise.all([
    prisma.question.create({ data: { text: 'O\'zbekiston mustaqillikka qaysi yilda erishdi?', type: 'MCQ', options: ['1990','1991','1992','1993'], correctAnswer: '1991', points: 1, categoryId: history.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'Amir Temur qaysi asrda yashagan?', type: 'MCQ', options: ['XII','XIII','XIV','XV'], correctAnswer: 'XIV', points: 1, categoryId: history.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'Ulug\'bek rasadxonasi Samarqandda joylashgan.', type: 'TRUE_FALSE', correctAnswer: 'true', points: 1, categoryId: history.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'Birinchi Jahon urushi qachon boshlangan?', type: 'MCQ', options: ['1912','1913','1914','1915'], correctAnswer: '1914', points: 1, categoryId: history.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'Ibn Sino "Tib qonunlari" kitobini yozgan.', type: 'TRUE_FALSE', correctAnswer: 'true', points: 1, categoryId: history.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'Al-Xorazmiy kim edi?', type: 'MCQ', options: ['Shoir','Matematik va astronom','Sarkarda','Tabib'], correctAnswer: 'Matematik va astronom', points: 2, categoryId: history.id, createdById: tid } }),
  ]);

  // ── Questions: Kimyo (6 ta) ───────────────────
  const chemQs = await Promise.all([
    prisma.question.create({ data: { text: 'Suvning kimyoviy formulasi?', type: 'MCQ', options: ['CO₂','H₂O','O₂','NaCl'], correctAnswer: 'H₂O', points: 1, categoryId: chemistry.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'Osh tuzi — NaCl', type: 'TRUE_FALSE', correctAnswer: 'true', points: 1, categoryId: chemistry.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'Kislorod atom raqami?', type: 'MCQ', options: ['6','7','8','9'], correctAnswer: '8', points: 1, categoryId: chemistry.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'pH = 7 qaysi muhit?', type: 'MCQ', options: ['Kislotali','Neytral','Ishqoriy','Aralash'], correctAnswer: 'Neytral', points: 1, categoryId: chemistry.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'CO₂ — karbonat angidrid.', type: 'TRUE_FALSE', correctAnswer: 'true', points: 1, categoryId: chemistry.id, createdById: tid } }),
    prisma.question.create({ data: { text: 'Davriy jadval kim tomonidan tuzilgan?', type: 'MCQ', options: ['Nyuton','Mendeleyev','Darvin','Eyshteyn'], correctAnswer: 'Mendeleyev', points: 1, categoryId: chemistry.id, createdById: tid } }),
  ]);

  const allQs = [...mathQs, ...csQs, ...engQs, ...physQs, ...histQs, ...chemQs];

  // ── Exam 1: 30 savollik (Umumiy bilimlar) ─────
  const exam30 = await prisma.exam.create({ data: {
    title: 'Umumiy bilimlar — 30 savol',
    description: 'Barcha fanlar bo\'yicha keng qamrovli test',
    duration: 45, shuffleQuestions: true, shuffleOptions: true, isPublished: true,
    totalPoints: allQs.slice(0, 30).reduce((s, q) => s + q.points, 0),
    createdById: teacher.id,
  }});
  await prisma.examQuestion.createMany({
    data: allQs.slice(0, 30).map((q, i) => ({ examId: exam30.id, questionId: q.id, order: i + 1 })),
  });

  // ── Exam 2: 25 savollik (Aniq fanlar) ─────────
  const scienceQs = [...mathQs, ...csQs, ...physQs];
  const exam25 = await prisma.exam.create({ data: {
    title: 'Aniq fanlar — 25 savol',
    description: 'Matematika, Informatika va Fizika bo\'yicha test',
    duration: 35, shuffleQuestions: true, shuffleOptions: true, isPublished: true,
    totalPoints: scienceQs.slice(0, 25).reduce((s, q) => s + q.points, 0),
    createdById: teacher.id,
  }});
  await prisma.examQuestion.createMany({
    data: scienceQs.slice(0, 25).map((q, i) => ({ examId: exam25.id, questionId: q.id, order: i + 1 })),
  });

  // ── Exam 3: Matematika ────────────────────────
  const examMath = await prisma.exam.create({ data: {
    title: 'Matematika asoslari',
    description: 'Asosiy matematik tushunchalar',
    duration: 20, shuffleQuestions: false, shuffleOptions: true, isPublished: true,
    totalPoints: mathQs.reduce((s, q) => s + q.points, 0),
    categoryId: math.id,
    createdById: teacher.id,
  }});
  await prisma.examQuestion.createMany({
    data: mathQs.map((q, i) => ({ examId: examMath.id, questionId: q.id, order: i + 1 })),
  });

  // ── Exam 4: Informatika ───────────────────────
  const examCS = await prisma.exam.create({ data: {
    title: 'Informatika: Web asoslari',
    description: 'HTML, JavaScript, Python va boshqalar',
    duration: 20, shuffleQuestions: false, shuffleOptions: false, isPublished: true,
    totalPoints: csQs.reduce((s, q) => s + q.points, 0),
    categoryId: cs.id,
    createdById: teacher.id,
  }});
  await prisma.examQuestion.createMany({
    data: csQs.map((q, i) => ({ examId: examCS.id, questionId: q.id, order: i + 1 })),
  });

  // ── Exam 5: Ingliz tili ───────────────────────
  const examEng = await prisma.exam.create({ data: {
    title: 'Ingliz tili: Grammatika',
    description: 'Grammar, vocabulary va tarjima',
    duration: 18, shuffleQuestions: true, shuffleOptions: true, isPublished: true,
    totalPoints: engQs.reduce((s, q) => s + q.points, 0),
    categoryId: eng.id,
    createdById: teacher.id,
  }});
  await prisma.examQuestion.createMany({
    data: engQs.map((q, i) => ({ examId: examEng.id, questionId: q.id, order: i + 1 })),
  });

  // ── Exam 6: Fizika ────────────────────────────
  const examPhys = await prisma.exam.create({ data: {
    title: 'Fizika: Asosiy qonunlar',
    description: 'Mexanika, elektr va optika asoslari',
    duration: 15, shuffleQuestions: false, shuffleOptions: true, isPublished: true,
    totalPoints: physQs.reduce((s, q) => s + q.points, 0),
    categoryId: physics.id,
    createdById: teacher.id,
  }});
  await prisma.examQuestion.createMany({
    data: physQs.map((q, i) => ({ examId: examPhys.id, questionId: q.id, order: i + 1 })),
  });

  // ── Exam 7: Tarix ─────────────────────────────
  const examHist = await prisma.exam.create({ data: {
    title: 'Tarix: O\'zbekiston va dunyo',
    description: 'O\'rta asr va zamonaviy tarix',
    duration: 12, shuffleQuestions: true, shuffleOptions: false, isPublished: true,
    totalPoints: histQs.reduce((s, q) => s + q.points, 0),
    categoryId: history.id,
    createdById: admin.id,
  }});
  await prisma.examQuestion.createMany({
    data: histQs.map((q, i) => ({ examId: examHist.id, questionId: q.id, order: i + 1 })),
  });

  // ── Exam 8: Kimyo ─────────────────────────────
  const examChem = await prisma.exam.create({ data: {
    title: 'Kimyo: Davriy jadval',
    description: 'Elementlar, formulalar va reaksiyalar',
    duration: 12, shuffleQuestions: false, shuffleOptions: true, isPublished: true,
    totalPoints: chemQs.reduce((s, q) => s + q.points, 0),
    categoryId: chemistry.id,
    createdById: admin.id,
  }});
  await prisma.examQuestion.createMany({
    data: chemQs.map((q, i) => ({ examId: examChem.id, questionId: q.id, order: i + 1 })),
  });

  // ── Exam 9: Qoralama ──────────────────────────
  await prisma.exam.create({ data: {
    title: 'Murakkab test (qoralama)',
    description: 'Tayyorlanmoqda',
    duration: 60, isPublished: false,
    totalPoints: 0,
    createdById: admin.id,
  }});

  // ── Fake Attempts ─────────────────────────────
  const makeAttempt = async (userId: number, examId: number, examQs: typeof allQs, correctRate: number, status: 'SUBMITTED' | 'TIMED_OUT', daysAgo: number) => {
    const submittedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    let totalScore = 0;
    const attempt = await prisma.examAttempt.create({
      data: { examId, userId, status, submittedAt, score: 0 },
    });
    for (const q of examQs) {
      const correct = Math.random() < correctRate;
      let selectedOption: string | null = null;
      let isCorrect = false;
      let pointsEarned = 0;
      if (q.type === 'MCQ') {
        if (correct && q.correctAnswer) {
          selectedOption = q.correctAnswer;
          isCorrect = true;
          pointsEarned = q.points;
        } else if (Array.isArray(q.options) && (q.options as string[]).length > 0) {
          const opts = (q.options as string[]).filter(o => o !== q.correctAnswer);
          selectedOption = opts[Math.floor(Math.random() * opts.length)] || null;
        }
      } else if (q.type === 'TRUE_FALSE') {
        selectedOption = correct ? q.correctAnswer! : (q.correctAnswer === 'true' ? 'false' : 'true');
        isCorrect = selectedOption === q.correctAnswer;
        pointsEarned = isCorrect ? q.points : 0;
      }
      totalScore += pointsEarned;
      await prisma.answer.create({
        data: { attemptId: attempt.id, questionId: q.id, selectedOption, isCorrect, pointsEarned },
      });
    }
    await prisma.examAttempt.update({ where: { id: attempt.id }, data: { score: totalScore } });
    return attempt;
  };

  const exam30Qs = allQs.slice(0, 30);
  const exam25Qs = scienceQs.slice(0, 25);

  // Jasur — yaxshi (75-85%)
  await makeAttempt(student1.id, exam30.id,    exam30Qs, 0.82, 'SUBMITTED', 5);
  await makeAttempt(student1.id, exam25.id,    exam25Qs, 0.76, 'SUBMITTED', 3);
  await makeAttempt(student1.id, examMath.id,  mathQs,   0.80, 'SUBMITTED', 10);
  await makeAttempt(student1.id, examCS.id,    csQs,     0.85, 'SUBMITTED', 8);
  await makeAttempt(student1.id, examEng.id,   engQs,    0.78, 'SUBMITTED', 6);
  await makeAttempt(student1.id, examPhys.id,  physQs,   0.72, 'SUBMITTED', 4);

  // Malika — o'rtacha (52-65%)
  await makeAttempt(student2.id, exam30.id,    exam30Qs, 0.62, 'SUBMITTED', 4);
  await makeAttempt(student2.id, exam25.id,    exam25Qs, 0.58, 'TIMED_OUT', 2);
  await makeAttempt(student2.id, examMath.id,  mathQs,   0.55, 'SUBMITTED', 12);
  await makeAttempt(student2.id, examEng.id,   engQs,    0.65, 'SUBMITTED', 7);
  await makeAttempt(student2.id, examHist.id,  histQs,   0.60, 'SUBMITTED', 9);

  // Bobur — juda yaxshi (80-92%)
  await makeAttempt(student3.id, exam30.id,    exam30Qs, 0.88, 'SUBMITTED', 6);
  await makeAttempt(student3.id, examCS.id,    csQs,     0.90, 'SUBMITTED', 9);
  await makeAttempt(student3.id, exam25.id,    exam25Qs, 0.85, 'SUBMITTED', 1);
  await makeAttempt(student3.id, examMath.id,  mathQs,   0.82, 'SUBMITTED', 3);
  await makeAttempt(student3.id, examPhys.id,  physQs,   0.88, 'SUBMITTED', 5);
  await makeAttempt(student3.id, examChem.id,  chemQs,   0.80, 'SUBMITTED', 8);

  // Nilufar — past (38-52%)
  await makeAttempt(student4.id, exam30.id,    exam30Qs, 0.48, 'SUBMITTED', 7);
  await makeAttempt(student4.id, examMath.id,  mathQs,   0.42, 'TIMED_OUT', 15);
  await makeAttempt(student4.id, examEng.id,   engQs,    0.52, 'SUBMITTED', 11);
  await makeAttempt(student4.id, examHist.id,  histQs,   0.50, 'SUBMITTED', 13);

  // Sherzod — eng yaxshi (88-95%)
  await makeAttempt(student5.id, exam30.id,    exam30Qs, 0.93, 'SUBMITTED', 3);
  await makeAttempt(student5.id, exam25.id,    exam25Qs, 0.92, 'SUBMITTED', 5);
  await makeAttempt(student5.id, examCS.id,    csQs,     0.95, 'SUBMITTED', 7);
  await makeAttempt(student5.id, examMath.id,  mathQs,   0.90, 'SUBMITTED', 2);
  await makeAttempt(student5.id, examEng.id,   engQs,    0.88, 'SUBMITTED', 4);
  await makeAttempt(student5.id, examPhys.id,  physQs,   0.92, 'SUBMITTED', 6);
  await makeAttempt(student5.id, examHist.id,  histQs,   0.85, 'SUBMITTED', 8);
  await makeAttempt(student5.id, examChem.id,  chemQs,   0.90, 'SUBMITTED', 10);

  console.log('✅ Seed muvaffaqiyatli yakunlandi!');
  console.log('──────────────────────────────────────────');
  console.log('👤 Admin:    admin@exam.com        / Admin1234');
  console.log('👨‍🏫 Teacher:  sardor@teacher.com    / Test1234');
  console.log('👨‍🎓 jasur@student.com     / Test1234');
  console.log('👩‍🎓 malika@student.com    / Test1234');
  console.log('👨‍🎓 bobur@student.com     / Test1234');
  console.log('👩‍🎓 nilufar@student.com   / Test1234');
  console.log('👨‍🎓 sherzod@student.com   / Test1234');
  console.log('──────────────────────────────────────────');
  console.log(`📝 Imtihonlar: 8 ta nashr + 1 qoralama`);
  console.log(`📊 Savollar: ${allQs.length} ta`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
