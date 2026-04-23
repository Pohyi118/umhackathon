'use client';

import { createContext, useContext } from 'react';

const NavigationContext = createContext(null);

export function NavigationProvider({ children, setActiveView }) {
  return (
    <NavigationContext.Provider value={{ setActiveView }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}
