import { Request, Response, Router } from 'express';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import Session from '../model';

const router = Router();

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Function to call OpenAI and get a generated question
const generateQuestion = async (): Promise<string> => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Generate a thought-provoking question about cats.' },
      ],
      max_tokens: 50,
    });
    return completion.choices[0].message.content as string;
  } catch (error) {
    console.error('Error generating question:', error);
    throw new Error('Failed to generate question');
  }
};

// Function to generate sessionId
const generateSessionId = (): string => Math.random().toString(36).substring(7);

// Start a new session
export const startSession = async (req: Request, res: Response) => {
  try {
    const newSession = new Session({
      sessionId: generateSessionId(),
      currentQuestion: 0,
      questions: [],
    });

    // Fetch the first question using OpenAI
    const firstQuestion = await generateQuestion();
    newSession.questions.push({ question: firstQuestion, answer: '' });

    await newSession.save();
    res.status(201).json({ sessionId: newSession.sessionId });
  } catch (err) {
    console.error(err);
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

    // Generate the next question using OpenAI API
    if (session.currentQuestion >= session.questions.length) {
      const nextQuestion = await generateQuestion();
      session.questions.push({ question: nextQuestion, answer: '' });
    }

    if (session.currentQuestion >= 10) {
      session.endTime = new Date(); // End session after 10 questions
      await session.save();
      return res.json({ message: 'All questions answered, session complete' });
    }

    await session.save();
    const nextQuestion = session.questions[session.currentQuestion].question;
    res.json({ nextQuestion });
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
