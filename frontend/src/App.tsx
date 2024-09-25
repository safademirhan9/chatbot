// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Chatbot from './components/Chatbot';
import 'antd/dist/reset.css'; // Import Ant Design styles

const App: React.FC = () => {
  return (
    <div className="App">
      <Chatbot />
    </div>
  );
};

export default App;
