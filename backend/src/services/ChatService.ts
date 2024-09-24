import { Request, Response, Router } from 'express';
import Session from '../model';

const router = Router();

// Predefined questions
const questions = [
  'What is your favorite breed of cat, and why?',
  'How do you think cats communicate with their owners?',
  'Have you ever owned a cat? If so, what was their name and personality like?',
  'Why do you think cats love to sleep in small, cozy places?',
  'What’s the funniest or strangest behavior you’ve ever seen a cat do?',
  'Do you prefer cats or kittens, and what’s the reason for your preference?',
  'Why do you think cats are known for being independent animals?',
  'How do you think cats manage to land on their feet when they fall?',
  'What’s your favorite fact or myth about cats?',
  'How would you describe the relationship between humans and cats in three words?',
];

// Helper function to generate sessionId
const generateSessionId = (): string => Math.random().toString(36).substring(7);

// Start a new session
export const startSession = async (req: Request, res: Response) => {
  try {
    const newSession = new Session({
      sessionId: generateSessionId(),
      currentQuestion: 0,
      questions: questions.map((q) => ({ question: q, answer: '' })),
    });

    await newSession.save();
    res.status(201).json({ sessionId: newSession.sessionId });
  } catch (err) {
    res.status(500).json({ error: 'Error starting session' });
  }
};

// Get the next question for the session
export const getQuestion = async (req: Request, res: Response) => {
  const { sessionId } = req.params;

  try {
    const session = await Session.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const question = session.questions[session.currentQuestion];
    if (!question) {
      return res.status(400).json({ error: 'No more questions' });
    }

    res.json({ question: question.question });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching question' });
  }
};

// Submit an answer and proceed to the next question
export const submitAnswer = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { answer } = req.body;

  try {
    const session = await Session.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.questions[session.currentQuestion].answer = answer;
    session.currentQuestion += 1;

    if (session.currentQuestion >= questions.length) {
      session.endTime = new Date();
    }

    await session.save();

    if (session.currentQuestion < questions.length) {
      const nextQuestion = session.questions[session.currentQuestion].question;
      res.json({ nextQuestion });
    } else {
      res.json({ message: 'All questions answered, session complete' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error submitting answer' });
  }
};

// Start a new session
router.post('/start', startSession);

// Get the next question for a session
router.get('/:sessionId/question', getQuestion);

// Submit an answer and get the next question
router.post('/:sessionId/answer', submitAnswer);

export default router;
