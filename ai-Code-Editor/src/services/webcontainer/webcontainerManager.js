import { WebContainer } from '@webcontainer/api';

/**
 * Singleton WebContainer instance and boot promise.
 * Avoids creating multiple instances on re-renders, fast project switching, or React StrictMode.
 */
let webcontainerInstance = null;
let bootPromise = null;

/**
 * Check if the current browser window is Cross-Origin Isolated.
 * WebContainer requires SharedArrayBuffer which is only available when cross-origin isolated.
 */
export function isCrossOriginIsolated() {
  return typeof window !== 'undefined' && window.crossOriginIsolated === true;
}

/**
 * Get the singleton WebContainer instance.
 * Boots the container on the first call and returns the existing instance subsequently.
 */
export async function getWebContainer() {
  if (webcontainerInstance) {
    return webcontainerInstance;
  }

  if (bootPromise) {
    return bootPromise;
  }

  if (!isCrossOriginIsolated()) {
    throw new Error(
      'WebContainer requires Cross-Origin Isolation (window.crossOriginIsolated === true). ' +
      'Ensure the server response includes "Cross-Origin-Opener-Policy: same-origin" and "Cross-Origin-Embedder-Policy: require-corp" headers.'
    );
  }

  bootPromise = WebContainer.boot()
    .then((instance) => {
      webcontainerInstance = instance;
      return instance;
    })
    .catch((err) => {
      bootPromise = null;
      throw err;
    });

  return bootPromise;
}

/**
 * Get the current WebContainer instance if already booted, or null.
 */
export function getActiveWebContainerInstance() {
  return webcontainerInstance;
}
