import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Steps, message, Flex } from 'antd';
import api from '../api';
import { AxiosResponse } from 'axios';

const { Step } = Steps;

const Chatbot: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [step, setStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    startSession();
  }, []);

  const startSession = async () => {
    try {
      const response = await api.post('/session/start');
      setSessionId(response.data.sessionId);
      api
        .get(`/session/${response.data.sessionId}/question`)
        .then((response: AxiosResponse) => {
          setCurrentQuestion(response.data.question);
        })
        .catch((error) => {
          console.error(error);
          message.error('Error fetching question');
        });
    } catch (error) {
      console.error(error);
      message.error('Error starting session');
    }
  };

  const submitAnswer = async () => {
    setLoading(true);
    try {
      const response = await api.post(`/session/${sessionId}/answer`, {
        answer: userAnswer,
      });
      if (response.data.nextQuestion) {
        setStep(step + 1);
        setCurrentQuestion(response.data.nextQuestion);
        setUserAnswer('');
      } else {
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
    <Flex align="center" justify="center" vertical gap={10} style={{ width: '100%' }}>
      <Steps current={step} style={{ marginTop: '20px', justifyContent: 'center', width: '50%' }}>
        {Array.from({ length: 10 }).map((_, index) => (
          <Step key={index} />
        ))}
      </Steps>
      <Card title={`Question ${step + 1}`} bordered={false}>
        <p>{currentQuestion}</p>
        <Input.TextArea
          rows={4}
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Type your answer..."
          autoSize={{ minRows: 4, maxRows: 6 }}
        />
        <Button
          type="primary"
          onClick={submitAnswer}
          loading={loading}
          disabled={!userAnswer || loading}
          style={{ marginTop: '10px' }}>
          Submit Answer
        </Button>
      </Card>
    </Flex>
  );
};

export default Chatbot;
