import { Router } from 'express';
import { startSession, getQuestion, submitAnswer } from './helpers';

const router = Router();

// Start a new session
router.post('/start', startSession);

// Get the next question for a session
router.post('/:sessionId/question', getQuestion);

// Submit an answer and get the next question
router.post('/:sessionId/answer', submitAnswer);

export default router;
