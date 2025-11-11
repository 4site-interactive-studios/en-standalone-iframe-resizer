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

/**
 * Finds the iframe element that sent a postMessage event.
 * @param {MessageEvent} event The 'onmessage' event object.
 * @returns {HTMLIFrameElement|undefined} The iframe element or undefined if not found.
 */
function getFrameByEvent(event) {
  return [].slice
    .call(document.getElementsByTagName("iframe"))
    .filter(function (iframe) {
      return iframe.contentWindow === event.source;
    })[0];
}

/**
 * Handles incoming messages from child iframes.
 */
window.onmessage = (e) => {
  const iframe = getFrameByEvent(e);
  if (!iframe) {
    return; // Message is not from a known iframe on this page.
  }

  // --- Resize the iframe based on its content height ---
  if (e.data.hasOwnProperty("frameHeight")) {
    iframe.style.height = `${e.data.frameHeight}px`;
  }

  // --- On new page load, scroll to iframe ONLY if it's not in view ---
  else if (e.data.hasOwnProperty("iframePageLoaded")) {
    const rect = iframe.getBoundingClientRect();
    const isOutOfView = rect.top < 0 || rect.top > window.innerHeight;

    if (isOutOfView) {
      console.log("iFrame is out of view. Scrolling to top of iFrame.");
      const elDistanceToTop = window.pageYOffset + rect.top;
      window.scrollTo({
        top: elDistanceToTop,
        left: 0,
        behavior: "smooth",
      });
    } else {
      console.log("iFrame is already in view. No scroll necessary.");
    }
  }

  // --- Scroll to a specific point within the iframe (e.g., for errors) ---
  else if (e.data.hasOwnProperty("scrollTo")) {
    const scrollToPosition =
      e.data.scrollTo + window.scrollY + iframe.getBoundingClientRect().top;
    window.scrollTo({
      top: scrollToPosition,
      left: 0,
      behavior: "smooth",
    });
    console.log("Scrolling to specific point in iframe:", scrollToPosition);
  }
};
