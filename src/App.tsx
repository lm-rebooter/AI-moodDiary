import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd-mobile';
import zhCN from 'antd-mobile/es/locales/zh-CN';

import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Diary from './pages/Diary';
import Analysis from './pages/Analysis';
import Profile from './pages/Profile';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="diary" element={<Diary />} />
            <Route path="analysis" element={<Analysis />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
