import User from "./Types/User";

export {};

declare global {
  interface Window {
    electronAPI: {
      runWebScraper: (text: string) => Promise<string[]>;
      runAgeFinder: (title: string, subtitle) => Promise<string[]>;
    };
    api: {
      addUser: (username: string, password: string, address: string, firstName: string, lastName: string, email: string, gender: string) => Promise<number>;
      getUsers: () => Promise<User[]>;
      getPassword: (id: number) => Promise<string>;
      getUser: (id: number) => Promise<User>;
      updateList: (id: number, list: string[]) => Promise<void>;
      updateProfilePicture: (id: number, profilePicture: Uint8Array<ArrayBuffer>) => Promise<void>;
      updateAllowedToUseData: (id: number, allowedToUseData: boolean) => Promise<void>;
      updateBookRatingThreshold: (id: number, bookRatingThreshold: number) => Promise<void>;
      updateFirstName: (id: number, firstName: string) => Promise<void>;
      updateLastName: (id: number, lastName: string) => Promise<void>;
      updateEmail: (id: number, email: string) => Promise<void>;
      updateAddress: (id: number, address: string) => Promise<void>;
      updateGender: (id: number, gender: string) => Promise<void>;
      updateUsername: (id: number, username: string) => Promise<void>;
      updatePassword: (id: number, password: string) => Promise<void>;
      addList: (userId: number, listName: string) => Promise<void>;
      deleteList: (listId: number) => Promise<void>;
    };
  }
}
