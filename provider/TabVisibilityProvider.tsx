import React, { createContext, useContext, useState } from "react";

interface TabVisibilityContextProps {
  isTabVisible: boolean;
  setTabVisible: (visible: boolean) => void;
}

const TabVisibilityContext = createContext<
  TabVisibilityContextProps | undefined
>(undefined);

export const TabVisibilityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isTabVisible, setIsTabVisible] = useState(true);

  const setTabVisible = (visible: boolean) => {
    setIsTabVisible(visible);
  };

  return (
    <TabVisibilityContext.Provider value={{ isTabVisible, setTabVisible }}>
      {children}
    </TabVisibilityContext.Provider>
  );
};

export const useTabVisibility = () => {
  const context = useContext(TabVisibilityContext);
  if (!context) {
    throw new Error(
      "useTabVisibility must be used within a TabVisibilityProvider"
    );
  }
  return context;
};
