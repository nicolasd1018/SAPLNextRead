export {};

declare global {
  interface Window {
    electronAPI: {
      runWebScraper: (text: string) => Promise<string[]>;
      runAgeFinder: (title: string, subtitle) => Promise<string[]>;
    };
  }
}
