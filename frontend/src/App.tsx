import { useState, useEffect } from 'react';
import { db, seedDefaults } from './db';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import AddMeal from './pages/AddMeal';

type Screen = 'loading' | 'onboarding' | 'dashboard' | 'add-meal';

function App() {
  const [screen, setScreen] = useState<Screen>('loading');
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    async function init() {
      await seedDefaults();
      const settings = await db.settings.get('default');
      if (settings?.onboarding_completed) {
        setScreen('dashboard');
      } else {
        setScreen('onboarding');
      }
    }
    init();
  }, []);

  if (screen === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-text-secondary">로딩 중...</p>
      </div>
    );
  }

  if (screen === 'onboarding') {
    return <Onboarding onComplete={() => setScreen('dashboard')} />;
  }

  if (screen === 'add-meal') {
    return (
      <AddMeal
        initialDate={selectedDate}
        onBack={() => setScreen('dashboard')}
        onAdded={() => setScreen('dashboard')}
      />
    );
  }

  return (
    <Dashboard
      onAddMeal={(date) => {
        setSelectedDate(date);
        setScreen('add-meal');
      }}
    />
  );
}

export default App;
