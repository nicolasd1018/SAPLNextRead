import User from "./Types/User";

export {};

declare global {
  interface Window {
    electronAPI: {
      runWebScraper: (text: string) => Promise<string[]>;
      runAgeFinder: (title: string, subtitle) => Promise<string[]>;
    };
    api: {
      addUser: (username: string, password?: string) => Promise<number>;
      getUsers: () => Promise<User[]>;
      getPassword: (id: number) => Promise<string>;
      getUser: (id: number) => Promise<User>;
      updateList: (id: number, list: string[]) => Promise<void>;
    }
  }
}
