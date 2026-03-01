/**
 * Force luma.gl (DeckGL v9) to use WebGL2 instead of WebGPU.
 *
 * DeckGL v9 probes WebGPU first. When navigator.gpu.requestAdapter() returns
 * null (Electron, VMs, older GPUs), luma crashes reading adapter.limits
 * before it can fall back to WebGL2.
 *
 * Fix: register the webgl2Adapter and call enforceWebGL2() so luma never
 * attempts the WebGPU path.
 *
 * Import this at the top of any file that renders a DeckGL component.
 * Gated on typeof window — safe to import in SSR.
 *
 * WHY instance tracking instead of a boolean flag:
 * Next.js 16 Turbopack can re-evaluate @luma.gl/core's module-level code during
 * HMR, which runs `export const luma = new Luma()` again and replaces
 * globalThis.luma with a fresh empty Luma instance (no registered adapters).
 * A boolean flag "did we ever run?" won't catch this replacement.
 * Instead we compare the current globalThis.luma to the instance we last
 * initialized — if different, re-register on the new instance.
 */

type WindowWithLuma = Window & {
  __lumaInstance?: object;
};

if (typeof window !== 'undefined') {
  const win = window as WindowWithLuma;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { luma } = require('@luma.gl/core') as {
    luma: {
      registerAdapters: (adapters: unknown[]) => void;
      enforceWebGL2: () => void;
    };
  };

  // Re-init whenever the singleton was replaced (HMR re-evaluation of @luma.gl/core)
  if (win.__lumaInstance !== (luma as unknown as object)) {
    win.__lumaInstance = luma as unknown as object;

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { webgl2Adapter } = require('@luma.gl/webgl') as {
        webgl2Adapter: unknown;
      };

      luma.registerAdapters([webgl2Adapter]);
      luma.enforceWebGL2();
    } catch {
      // Adapter already registered on this instance — safe to ignore.
    }
  }
}

export {};
