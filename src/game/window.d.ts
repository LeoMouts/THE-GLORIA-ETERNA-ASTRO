// The render layer emits `onclick="Game.foo()"` inline handlers, so the
// Game controller (and a few debug hooks) must live on `window`.
export {};

declare global {
  interface Window {
    Game: Record<string, (...args: any[]) => void>;
    ST: unknown;
    storage?: {
      get(key: string): Promise<{ key: string; value: unknown } | null>;
      set(key: string, value: unknown): Promise<{ key: string; value: unknown }>;
      delete(key: string): Promise<{ key: string; deleted: true }>;
    };
    __APP_INTERNALS__: Record<string, unknown>;
    __APP__: Record<string, unknown>;
    resetCareer: () => void;
    __forceReset__: () => void;
  }
}
