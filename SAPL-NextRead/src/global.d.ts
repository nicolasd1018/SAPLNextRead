import User from "./Types/User";

export {};

declare global {
  interface Window {
    electronAPI: {
      runWebScraper: (text: string) => Promise<string[]>;
      runAgeFinder: (title: string, subtitle) => Promise<string[]>;
    };
    api: {
      addUser: (username: string, password?: string) => Promise<void>;
      getUsers: () => Promise<User[]>;
      getPassword: (id: number) => Promise<string>;
    }
  }
}
