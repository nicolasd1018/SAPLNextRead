export {};

declare global {
  interface Window {
    electronAPI: {
      runPythonScript: (text: string) => Promise<string[]>;
    };
  }
}
