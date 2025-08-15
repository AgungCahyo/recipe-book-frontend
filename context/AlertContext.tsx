import React, { createContext, useContext, useState } from 'react';

export type AlertType = 'success' | 'error' | 'info' | 'warning';

type AlertData = {
  message: string
  type: AlertType
  visible: boolean
};

type AlertContextProps = {
  alert: AlertData | null;
  showAlert: (message: string, type?: AlertType) => void;
  hideAlert: () => void;
};

const AlertContext = createContext<AlertContextProps>({
  alert: null,
  showAlert: () => {},
  hideAlert: () => {},
});

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [alert, setAlert] = useState<AlertData | null>(null);

 const showAlert = (message: string, type: AlertType = 'info', duration = 2000) => {
  setAlert({ message, type, visible: true })

  if (duration > 0) {
    setTimeout(() => {
      setAlert(null)
    }, duration)
  }
}

const hideAlert = () => setAlert(null)

  return (
    <AlertContext.Provider value={{ alert, showAlert, hideAlert }}>
      {children}
    </AlertContext.Provider>
  );
};
