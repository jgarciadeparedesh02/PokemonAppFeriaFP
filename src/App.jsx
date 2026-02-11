import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ShopPage from './pages/ShopPage';
import CollectionPage from './pages/CollectionPage';
import PackOpeningPage from './pages/PackOpeningPage';
import BottomNav from './components/BottomNav';

const AppContent = () => {
  const location = useLocation();

  // Hide nav on pack opening screen for immersion
  const hideNav = location.pathname.startsWith('/open');

  return (
    <div className="bg-background min-h-screen font-sans selection:bg-primary/30">
      <main className="max-w-md mx-auto relative min-h-screen">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<ShopPage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/open/:setId" element={<PackOpeningPage />} />
        </Routes>

        {!hideNav && <BottomNav />}
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
