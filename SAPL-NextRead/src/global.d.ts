export {};

declare global {
  interface Window {
    electronAPI: {
      runWebScraper: (text: string) => Promise<string[]>;
      runAgeFinder: (text: string) => Promise<string[]>;
    };
  }
}
