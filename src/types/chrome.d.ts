declare namespace chrome {
  export const storage: {
    local: {
      get(key: string): Promise<any>;
      set(items: { [key: string]: any }): Promise<void>;
    };
  };
  
  export const alarms: {
    create(name: string, options: { when: number }): Promise<void>;
    onAlarm: {
      addListener(callback: (alarm: { name: string }) => void): void;
    };
  };
  
  export const notifications: {
    create(id: string, options: any): Promise<void>;
    onButtonClicked: {
      addListener(callback: (notificationId: string, buttonIndex: number) => void): void;
    };
  };
} 