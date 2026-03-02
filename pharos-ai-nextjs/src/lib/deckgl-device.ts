/**
 * Force luma.gl (DeckGL v9) to use WebGL2 instead of WebGPU.
 *
 * Import this BEFORE any @deck.gl/* import.
 */

type WindowWithLuma = Window & {
  __lumaInstance?: object;
  __lumaInitCount?: number;
};

if (typeof window !== 'undefined') {
  const win = window as WindowWithLuma;
  win.__lumaInitCount = (win.__lumaInitCount ?? 0) + 1;

  // Suppress navigator.gpu to prevent WebGPU path
  try {
    Object.defineProperty(navigator, 'gpu', { value: undefined, configurable: true, writable: true });
  } catch { /* non-configurable — enforceWebGL2 is the fallback */ }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { luma } = require('@luma.gl/core') as {
      luma: {
        registerAdapters: (adapters: unknown[]) => void;
        enforceWebGL2: () => void;
      };
    };

    if (win.__lumaInstance !== (luma as unknown as object)) {
      win.__lumaInstance = luma as unknown as object;

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { webgl2Adapter } = require('@luma.gl/webgl') as {
        webgl2Adapter: unknown;
      };

      try { luma.registerAdapters([webgl2Adapter]); } catch { /* already registered */ }
      try { luma.enforceWebGL2(); } catch { /* already enforced */ }
    }
  } catch (e) {
    console.warn('[deckgl-device] luma.gl init failed, will retry on next HMR cycle:', e);
  }
}

export {};
