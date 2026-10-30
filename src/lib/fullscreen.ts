type PrefixedHTMLElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

type PrefixedDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};

export function getFullscreenElement(): Element | null {
  const prefixedDocument = document as PrefixedDocument;
  return document.fullscreenElement ?? prefixedDocument.webkitFullscreenElement ?? null;
}

export async function enterSystemFullscreen() {
  if (getFullscreenElement()) return true;

  const element = document.documentElement as PrefixedHTMLElement;
  if (element.requestFullscreen) {
    try {
      await element.requestFullscreen();
      return true;
    } catch {
      // Safari versions before 16.4 only expose the prefixed API.
    }
  }

  if (element.webkitRequestFullscreen) {
    try {
      await element.webkitRequestFullscreen();
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

export async function exitSystemFullscreen() {
  if (!getFullscreenElement()) return;

  const prefixedDocument = document as PrefixedDocument;
  if (document.exitFullscreen) {
    try {
      await document.exitFullscreen();
      return;
    } catch {
      // Continue with the prefixed Safari API if available.
    }
  }

  if (prefixedDocument.webkitExitFullscreen) {
    try {
      await prefixedDocument.webkitExitFullscreen();
    } catch {
      // The browser may already have exited fullscreen through its own gesture.
    }
  }
}
