/*!
 *
 *                ((((
 *          ((((((((
 *       (((((((
 *     (((((((           ****
 *   (((((((          *******
 *  ((((((((       **********     *********       ****    ***
 *  ((((((((    ************   **************     ***    ****
 *  ((((((   *******  *****   *****        *     **    ******        *****
 *  (((   *******    ******   ******            ****  ********   ************
 *      *******      *****     **********      ****    ****     ****      ****
 *    *********************         *******   *****   ****     ***************
 *     ********************            ****   ****    ****    ****
 *                 *****    *****   *******  *****   *****     *****     **
 *                *****     *************    ****    *******     **********
 *
 *  Date: Monday, November 10, 2025 @ 15:16:39 ET
 *  By: Cawe Coy
 *
 *  Created by 4Site Studios
 *  Come work with us or join our team, we would love to hear from you
 *  https://www.4sitestudios.com/en
 *
 */

// Simplified mocks for compatibility if ENGrid/EnForm objects are not present
const ENGrid = {
  watchForError: (callback) => {
    if (!callback) return;
    const observer = new MutationObserver(() => {
      if (document.querySelector(".en__errorHeader")) callback();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  },
};
const EngridLogger = function (name) {
  this.name = name;
  this.log = (...args) => console.log(`[${this.name}]`, ...args);
};
const EnForm = {
  getInstance: () => ({
    onSubmit: {
      subscribe: (cb) => {
        const f = document.querySelector("form");
        if (f) f.addEventListener("submit", cb);
      },
    },
    onError: {
      subscribe: (cb) => document.addEventListener("enFormError", cb),
    },
  }),
};

class iFrame {
  constructor() {
    this._form = EnForm.getInstance();
    this.logger = new EngridLogger("iFrame");
    this.lastHeight = 0;
    this.resizeWatcher = null;
    this.resizeWatcherStopper = null;
    if (this.inIframe()) {
      if (document.readyState !== "loading") this.onLoaded();
      else document.addEventListener("DOMContentLoaded", () => this.onLoaded());
      this._form.onError.subscribe(() => {
        const firstError = document.querySelector(
          ".en__field--validationFailed"
        );
        const scrollTo = firstError
          ? firstError.getBoundingClientRect().top
          : 0;
        this.logger.log(
          `Error detected. Requesting parent scroll to: ${scrollTo}px`
        );
        window.parent.postMessage({ scrollTo }, "*");
        setTimeout(() => this.sendIframeHeight(), 100);
      });
    } else {
      this._form.onError.subscribe(() => {
        const el = document.querySelector(".en__field--validationFailed");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      });
    }
  }
  onLoaded() {
    this.logger.log("iFrame DOM content loaded. Initializing.");
    window.parent.postMessage({ iframePageLoaded: true }, "*");
    setTimeout(() => this.sendIframeHeight(true), 300);
    window.addEventListener("load", () => {
      this.logger.log("Window 'load' event fired. Sending final height.");
      setTimeout(() => this.sendIframeHeight(true), 100);
    });
    window.addEventListener(
      "resize",
      this.debounceWithImmediate(() => this.sendIframeHeight())
    );
    document.addEventListener("click", () => this.watchForResize());
    this._form.onSubmit.subscribe(() => this.logger.log("Form submitted."));
    ENGrid.watchForError(this.sendIframeHeight.bind(this));
  }
  _getLastVisibleElementMarginBottom() {
    const elements = Array.from(document.body.getElementsByTagName("*"));
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i],
        style = window.getComputedStyle(el);
      if (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        el.offsetHeight > 0
      ) {
        const marginBottom = parseInt(style.marginBottom, 10);
        return isNaN(marginBottom) ? 0 : marginBottom;
      }
    }
    return 0;
  }
  sendIframeHeight(force = false) {
    const bodyHeight = document.body.offsetHeight;
    const lastMargin = this._getLastVisibleElementMarginBottom();
    const height = bodyHeight + lastMargin + 16; // 16px buffer: Fix for cut-off issue on small screens
    if (force || height !== this.lastHeight) {
      this.lastHeight = height;
      this.logger.log(
        `Sending iFrame height: ${height}px (body: ${bodyHeight}, margin: ${lastMargin}, Forced: ${force})`
      );
      window.parent.postMessage({ frameHeight: height }, "*");
    }
  }
  watchForResize(duration = 2000, interval = 200) {
    clearInterval(this.resizeWatcher);
    clearTimeout(this.resizeWatcherStopper);
    this.logger.log(`Starting resize watcher for ${duration}ms.`);
    this.resizeWatcher = setInterval(() => this.sendIframeHeight(), interval);
    this.resizeWatcherStopper = setTimeout(() => {
      clearInterval(this.resizeWatcher);
      this.logger.log("Resize watcher stopped.");
    }, duration);
  }
  inIframe() {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }
  debounceWithImmediate(func, timeout = 1000) {
    let timer,
      firstEvent = true;
    return (...args) => {
      clearTimeout(timer);
      if (firstEvent) {
        func.apply(this, args);
        firstEvent = false;
      }
      timer = setTimeout(() => {
        func.apply(this, args);
        firstEvent = true;
      }, timeout);
    };
  }
}
new iFrame();
