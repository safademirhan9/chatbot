import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Steps, message } from 'antd';
import api from '../api';

const { Step } = Steps;

const Chatbot: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [step, setStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [questions, setQuestions] = useState<string[]>([]);

  useEffect(() => {
    startSession();
  }, []);

  const startSession = async () => {
    try {
      const response = await api.post('/session/start');
      setSessionId(response.data.sessionId);
      setQuestions(response.data.questions);
      setCurrentQuestion(response.data.questions[0]);
    } catch (error) {
      console.error(error);
      message.error('Error starting session');
    }
  };

  const submitAnswer = async () => {
    setLoading(true);
    try {
      const response = await api.post('/session/answer', {
        sessionId,
        answer: userAnswer,
      });
      setStep(step + 1);
      setCurrentQuestion(response.data.nextQuestion);
      setUserAnswer('');
      if (step === questions.length - 1) {
        message.success('You have completed all questions!');
      }
    } catch (error) {
      console.error(error);
      message.error('Error submitting answer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <Card title={`Question ${step + 1}`} bordered={false}>
        <p>{currentQuestion}</p>
        <Input.TextArea
          rows={4}
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Type your answer..."
        />
        <Button
          type="primary"
          onClick={submitAnswer}
          disabled={!userAnswer || loading}
          loading={loading}
          style={{ marginTop: '10px' }}>
          Submit Answer
        </Button>
      </Card>

      <Steps current={step} style={{ marginTop: '20px' }}>
        {questions?.map((_, index) => (
          <Step key={index} title={`Q${index + 1}`} />
        ))}
      </Steps>
    </div>
  );
};

export default Chatbot;
