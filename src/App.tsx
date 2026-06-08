import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import HomeScreen from './screens/HomeScreen';
import MemoryScreen from './screens/MemoryScreen';
import CapturedScreen from './screens/CapturedScreen';
import SunsetView from './screens/SunsetView';
import EditScreen from './screens/EditScreen';
import CommunityScreen from './screens/CommunityScreen';
import CommunitySunsetView from './screens/CommunitySunsetView';
import ProfileScreen from './screens/ProfileScreen';
import { SunsetProvider } from './SunsetContext';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/memory" element={<MemoryScreen />} />
        <Route path="/captured" element={<CapturedScreen />} />
        <Route path="/sunset/:id" element={<SunsetView />} />
        <Route path="/sunset/:id/edit" element={<EditScreen />} />
        <Route path="/community" element={<CommunityScreen />} />
        <Route path="/community/:id" element={<CommunitySunsetView />} />
        <Route path="/profile" element={<ProfileScreen />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <SunsetProvider>
        <Layout>
          <AnimatedRoutes />
        </Layout>
      </SunsetProvider>
    </BrowserRouter>
  );
}

export default App;
