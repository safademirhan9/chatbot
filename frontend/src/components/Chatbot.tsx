import React, { useState, useEffect } from 'react';
import { Layout, Input, Button, List, Typography, message, Flex } from 'antd';
import api from '../api';
import { AxiosResponse } from 'axios';

const { Content, Footer } = Layout;
const { Text } = Typography;

const Chatbot: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [conversation, setConversation] = useState<{ sender: 'bot' | 'user'; text: string }[]>([]);
  const [step, setStep] = useState<number>(0);

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
          setConversation((prev) => [...prev, { sender: 'bot', text: response.data.question }]);
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
    if (!userAnswer) return;
    setLoading(true);

    try {
      // Send user answer to the backend
      const response = await api.post(`/session/${sessionId}/answer`, { answer: userAnswer });

      // Add user's answer to the conversation
      setConversation((prev) => [...prev, { sender: 'user', text: userAnswer }]);
      setUserAnswer('');

      // Fetch the next question
      if (response.data.nextQuestion) {
        setStep(step + 1);
        setConversation((prev) => [...prev, { sender: 'bot', text: response.data.nextQuestion }]);
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
    <Layout style={{ height: '100vh' }}>
      <Content style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '10px' }}>
          <List
            dataSource={conversation}
            renderItem={(item, index) => (
              <List.Item key={index} style={{ justifyContent: item.sender === 'bot' ? 'flex-start' : 'flex-end' }}>
                <List.Item.Meta
                  style={{
                    background: item.sender === 'bot' ? '#d1d1d1' : '#1890ff',
                    color: item.sender === 'bot' ? 'black' : 'white',
                    padding: '10px',
                    borderRadius: '10px',
                    maxWidth: '30%',
                    textAlign: item.sender === 'bot' ? 'left' : 'right',
                  }}
                  description={<Text style={{ color: item.sender === 'bot' ? 'black' : 'white' }}>{item.text}</Text>}
                />
              </List.Item>
            )}
          />
        </div>

        <Footer>
          <Flex vertical gap={10} justify="center" align="center">
            <Input.TextArea
              value={userAnswer}
              autoFocus
              onPressEnter={submitAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer..."
              autoSize={{ minRows: 2, maxRows: 4 }}
              style={{ width: '50%' }}
            />
            <Button
              type="primary"
              onClick={submitAnswer}
              loading={loading}
              disabled={!userAnswer || loading}
              style={{ width: '10%' }}>
              Submit Answer
            </Button>
          </Flex>
        </Footer>
      </Content>
    </Layout>
  );
};

export default Chatbot;
