import React, { useState, useEffect } from 'react';
import { TabType, UserProfile, SavedReading, NatalChart, PalmAnalysis } from './types';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { InicioView } from './components/InicioView';
import { QuiromanciaView } from './components/QuiromanciaView';
import { TarotView } from './components/TarotView';
import { AstrologiaView } from './components/AstrologiaView';
import { UserProfileModal } from './components/UserProfileModal';
import { SocialShareModal } from './components/SocialShareModal';
import { SinastriaModal } from './components/SinastriaModal';
import { WidgetsModal } from './components/WidgetsModal';
import { exportFullMysticReportPDF } from './services/pdfExporter';
import { calculateLifePathNumber, calculateExpressionNumber, calculateSoulUrgeNumber } from './data/numerologyData';
import {
  auth,
  db,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  onAuthStateChanged,
  type FirebaseUser
} from './lib/firebase';

const DEFAULT_USER: UserProfile = {
  id: 'user-001',
  fullName: 'Luna Silva',
  birthDate: '1996-07-24',
  birthTime: '14:30',
  birthPlace: 'Santiago, Chile',
  zodiacSign: 'Leo',
  moonSign: 'Piscis',
  ascendant: 'Escorpio',
  lifePathNumber: 7,
  expressionNumber: 11,
  soulUrgeNumber: 4,
  avatarUrl:
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  biometricEnabled: false,
  batterySaver: false,
  theme: 'dark',
  notificationsEnabled: true
};

const INITIAL_READINGS: SavedReading[] = [
  {
    id: 'reading-001',
    date: new Date().toISOString().split('T')[0],
    type: 'tarot',
    title: 'Tirada del Día: La Estrella',
    summary: 'La Estrella (XVII) — Esperanza renovada, sanación e inspiración divina.',
    details: { card: 'La Estrella' },
    cards: ['La Estrella (XVII)']
  },
  {
    id: 'reading-002',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    type: 'quiromancia',
    title: 'Escaneo Mano Izquierda (Innato)',
    summary: 'Mano de Agua. Alta intuición psíquica (94%) y profunda línea de la cabeza.',
    details: { hand: 'left' },
    handSide: 'left'
  }
];

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('inicio');
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  // User Profile state with local persistence
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('celestial_user_profile');
      return saved ? JSON.parse(saved) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  // Saved readings list
  const [savedReadings, setSavedReadings] = useState<SavedReading[]>(() => {
    try {
      const saved = localStorage.getItem('celestial_saved_readings');
      return saved ? JSON.parse(saved) : INITIAL_READINGS;
    } catch {
      return INITIAL_READINGS;
    }
  });

  // Active modal controls
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isWidgetsModalOpen, setIsWidgetsModalOpen] = useState(false);
  const [isSinastriaModalOpen, setIsSinastriaModalOpen] = useState(false);
  const [shareModalData, setShareModalData] = useState<{
    isOpen: boolean;
    title: string;
    content: string;
  }>({
    isOpen: false,
    title: '',
    content: ''
  });

  const [activeNatalChart, setActiveNatalChart] = useState<NatalChart | null>(null);
  const [activePalmAnalysis, setActivePalmAnalysis] = useState<PalmAnalysis | null>(null);

  // Firebase Auth Listener and Firestore Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const cloudProfile = userDocSnap.data() as Partial<UserProfile>;
            setUser(prev => {
              const updated = {
                ...prev,
                ...cloudProfile,
                id: fbUser.uid,
                fullName: cloudProfile.fullName || fbUser.displayName || prev.fullName,
                email: fbUser.email || prev.email,
                avatarUrl: cloudProfile.avatarUrl || fbUser.photoURL || prev.avatarUrl,
                isGoogleAuth: true
              };
              localStorage.setItem('celestial_user_profile', JSON.stringify(updated));
              return updated;
            });
          } else {
            // Create user profile in Firestore
            const initialDoc: Partial<UserProfile> = {
              id: fbUser.uid,
              fullName: fbUser.displayName || user.fullName,
              email: fbUser.email || undefined,
              avatarUrl: fbUser.photoURL || user.avatarUrl,
              birthDate: user.birthDate,
              birthTime: user.birthTime,
              birthPlace: user.birthPlace,
              zodiacSign: user.zodiacSign,
              ascendant: user.ascendant,
              moonSign: user.moonSign,
              lifePathNumber: user.lifePathNumber,
              expressionNumber: user.expressionNumber,
              soulUrgeNumber: user.soulUrgeNumber,
              isGoogleAuth: true
            };
            await setDoc(userDocRef, initialDoc, { merge: true });
            setUser(prev => {
              const updated = { ...prev, ...initialDoc, id: fbUser.uid };
              localStorage.setItem('celestial_user_profile', JSON.stringify(updated));
              return updated;
            });
          }

          // Fetch cloud readings
          const readingsCol = collection(db, 'users', fbUser.uid, 'readings');
          const readingsSnap = await getDocs(readingsCol);
          if (!readingsSnap.empty) {
            const cloudReadings = readingsSnap.docs.map(d => ({
              id: d.id,
              ...d.data()
            })) as SavedReading[];
            setSavedReadings(cloudReadings);
            localStorage.setItem('celestial_saved_readings', JSON.stringify(cloudReadings));
          }
        } catch (err) {
          console.warn('Error syncing with Firestore:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync profile changes to localStorage & recalculate numerology/astrology
  const handleUpdateUser = (updated: Partial<UserProfile>) => {
    setUser(prev => {
      const nextUser = { ...prev, ...updated };
      if (updated.birthDate) {
        nextUser.lifePathNumber = calculateLifePathNumber(updated.birthDate);
      }
      if (updated.fullName) {
        nextUser.expressionNumber = calculateExpressionNumber(updated.fullName);
        nextUser.soulUrgeNumber = calculateSoulUrgeNumber(updated.fullName);
      }
      try {
        localStorage.setItem('celestial_user_profile', JSON.stringify(nextUser));
      } catch (err) {
        console.warn('Storage error', err);
      }

      // Sync with Firestore if authenticated
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          setDoc(userDocRef, nextUser, { merge: true });
        } catch (err) {
          console.warn('Firestore user update error', err);
        }
      }

      return nextUser;
    });
  };

  const handleResetToGuest = () => {
    const guestUser: UserProfile = {
      ...DEFAULT_USER,
      id: 'guest-' + Date.now(),
      fullName: 'Iniciado Celestial',
      isGoogleAuth: false,
      email: undefined
    };
    setUser(guestUser);
    localStorage.setItem('celestial_user_profile', JSON.stringify(guestUser));
  };

  const handleSaveReading = (reading: SavedReading) => {
    setSavedReadings(prev => {
      const updated = [reading, ...prev];
      try {
        localStorage.setItem('celestial_saved_readings', JSON.stringify(updated));
      } catch (err) {
        console.warn('Storage error', err);
      }

      // Sync with Firestore if authenticated
      if (firebaseUser) {
        try {
          const readingDocRef = doc(db, 'users', firebaseUser.uid, 'readings', reading.id);
          setDoc(readingDocRef, reading, { merge: true });
        } catch (err) {
          console.warn('Firestore reading save error', err);
        }
      }

      return updated;
    });
  };

  const handleDeleteReading = (id: string) => {
    setSavedReadings(prev => {
      const updated = prev.filter(r => r.id !== id);
      try {
        localStorage.setItem('celestial_saved_readings', JSON.stringify(updated));
      } catch (err) {
        console.warn('Storage error', err);
      }

      // Sync with Firestore if authenticated
      if (firebaseUser) {
        try {
          const readingDocRef = doc(db, 'users', firebaseUser.uid, 'readings', id);
          deleteDoc(readingDocRef);
        } catch (err) {
          console.warn('Firestore reading delete error', err);
        }
      }

      return updated;
    });
  };

  const handleOpenShare = (title: string, content: string) => {
    setShareModalData({
      isOpen: true,
      title,
      content
    });
  };

  const handleExportFullPDF = (chartOrPalm?: NatalChart | PalmAnalysis) => {
    if (chartOrPalm && 'sunSign' in chartOrPalm) {
      exportFullMysticReportPDF(user, chartOrPalm, activePalmAnalysis);
    } else if (chartOrPalm && 'handSide' in chartOrPalm) {
      exportFullMysticReportPDF(user, activeNatalChart, chartOrPalm);
    } else {
      exportFullMysticReportPDF(user, activeNatalChart, activePalmAnalysis);
    }
  };

  return (
    <div
      className={`min-h-screen bg-[#050208] text-gray-200 font-sans flex flex-col relative selection:bg-[#D4AF37] selection:text-black overflow-x-hidden ${
        user.batterySaver ? 'battery-saver' : ''
      }`}
    >
      {/* Immersive Cosmic Ambient Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-[#4c1d95] rounded-full blur-[130px] opacity-25"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-[#1e40af] rounded-full blur-[130px] opacity-25"></div>
        <div className="absolute top-[35%] right-[15%] w-[40%] h-[40%] bg-[#D4AF37]/5 rounded-full blur-[120px] opacity-40"></div>
        
        {/* Subtle cosmic stars */}
        <div className="absolute top-1/4 right-1/4 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_#fff]"></div>
        <div className="absolute top-1/3 left-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_8px_#fff] opacity-70"></div>
        <div className="absolute bottom-1/4 left-1/4 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_12px_#fff] opacity-50"></div>
        <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-[#D4AF37] rounded-full shadow-[0_0_8px_#D4AF37] opacity-80"></div>
        <div className="absolute top-[15%] left-[20%] w-1 h-1 bg-white rounded-full shadow-[0_0_6px_#fff] opacity-60"></div>
      </div>

      {/* Fixed Header */}
      <Header
        currentTab={currentTab}
        user={user}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenWidgets={() => setIsWidgetsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-lg mx-auto pt-20 px-0 relative z-10">
        {currentTab === 'inicio' && (
          <InicioView
            user={user}
            onOpenSinastria={() => setIsSinastriaModalOpen(true)}
            onOpenEditProfile={() => setIsProfileModalOpen(true)}
            onShareItem={handleOpenShare}
            onNavigateTab={tab => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'quiromancia' && (
          <QuiromanciaView
            user={user}
            onSaveReading={reading => {
              handleSaveReading(reading);
              if (reading.details) setActivePalmAnalysis(reading.details);
            }}
            onShareReading={handleOpenShare}
            onExportPDF={palm => handleExportFullPDF(palm)}
          />
        )}

        {currentTab === 'tarot' && (
          <TarotView
            user={user}
            onSaveReading={handleSaveReading}
            onShareReading={handleOpenShare}
          />
        )}

        {currentTab === 'astrologia' && (
          <AstrologiaView
            user={user}
            onUpdateUser={handleUpdateUser}
            onSaveReading={reading => {
              handleSaveReading(reading);
              if (reading.details) setActiveNatalChart(reading.details);
            }}
            onShareReading={handleOpenShare}
            onExportPDF={chart => handleExportFullPDF(chart)}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation */}
      <Navigation currentTab={currentTab} onChangeTab={setCurrentTab} />

      {/* Modals */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        firebaseUser={firebaseUser}
        onUpdateUser={handleUpdateUser}
        savedReadings={savedReadings}
        onDeleteReading={handleDeleteReading}
        currentChart={activeNatalChart}
        currentPalm={activePalmAnalysis}
        onResetToGuest={handleResetToGuest}
      />

      <SocialShareModal
        isOpen={shareModalData.isOpen}
        onClose={() => setShareModalData(prev => ({ ...prev, isOpen: false }))}
        title={shareModalData.title}
        content={shareModalData.content}
      />

      <SinastriaModal
        isOpen={isSinastriaModalOpen}
        onClose={() => setIsSinastriaModalOpen(false)}
        currentUser={user}
      />

      <WidgetsModal
        isOpen={isWidgetsModalOpen}
        onClose={() => setIsWidgetsModalOpen(false)}
        user={user}
      />
    </div>
  );
}
