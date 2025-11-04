# Dynamic iFrame Resizing and Communication Scripts for Engaging Networks

[Live Demo on CodePen](https://codepen.io/4SiteStudios/pen/MYKRgEe)

This repository contains a robust, dependency-free vanilla JavaScript solution for embedding content via iframes. These scripts handle the complex communication required to make iframes responsive to their content's height, manage page navigation, and provide a seamless user experience.

## The Problem

Standard `<iframe>` elements are static containers. They are unaware of the size of the content loaded inside them, leading to common problems:

1.  **Incorrect Height:** The iframe either has a fixed, ugly height or shows double scrollbars.
2.  **Dynamic Content:** When content inside the iframe changes (e.g., an accordion expands, an error message appears), the iframe doesn't resize to fit.
3.  **Page Navigation:** When a user clicks a link inside the iframe and a new, taller or shorter page loads, the iframe doesn't adjust its height.
4.  **Poor User Experience:** After a form submission, the parent page doesn't scroll to the top of the iframe, leaving the user disoriented.

These scripts solve all of these issues using the browser's `postMessage` API for secure cross-origin communication.

## Features

- **Automatic Resizing:** The iframe automatically adjusts its height to perfectly fit its content.
- **Expands and Shrinks:** Correctly grows when content is expanded and, crucially, shrinks when it's collapsed.
- **Handles Page Navigation:** Reliably resizes after a new page loads within the iframe.
- **Intelligent Scrolling:** After a new page loads (e.g., form submission), it scrolls the parent page to the top of the iframe, but **only if the iframe isn't already in the viewport**.
- **Dynamic Content Watcher:** On any user click, the script actively monitors for height changes for 2 seconds, smoothly resizing for CSS transitions and JS animations.
- **Robust Height Calculation:** Uses a hybrid approach to accurately measure the height, including content, padding, and collapsing bottom margins.
- **No Dependencies:** Written in pure, standalone vanilla JavaScript. No jQuery or other libraries are needed.

## Live Demo

Check out the interactive demo on CodePen: [Dynamic iFrame Resizer Demo](https://codepen.io/4SiteStudios/pen/MYKRgEe)

## How It Works

The solution consists of two scripts: one for the parent page and one for the child page (the content inside the iframe).

1.  **Child Page:** The child script constantly monitors its own size. Whenever a change is detected (page load, click, resize), it calculates its true height. It then sends this information to the parent page using `window.parent.postMessage()`.
2.  **Parent Page:** The parent script listens for messages from the iframe using `window.onmessage`. When it receives a message (e.g., a new height), it dynamically updates the `style.height` of the `<iframe>` element.

### Key Messages

- `{ frameHeight: <number> }`: The child tells the parent what its height should be in pixels.
- `{ iframePageLoaded: true }`: The child notifies the parent that a new page has loaded, triggering the intelligent scroll check.
- `{ scrollTo: <number> }`: The child asks the parent to scroll to a specific vertical offset within the iframe (used for form errors).

## Implementation

### Step 1: Add the Parent Script

Place the parent.js script on the main page that contains your `<iframe>` element. It can be placed in the `<head>` or before the closing `</body>` tag.

```html
<!-- Host page -->
<script src="parent.js"></script>

<iframe
  id="en-iframe"
  src="https://example.com/child.html"
  style="width: 100%; border: 0;"
  scrolling="no"
></iframe>
```

### Step 2: Add the Child Script

Place the child.js script on **every page** that will be loaded inside the `<iframe>`.

```html
<!-- Inside each iframe page you control -->
<script src="/path/to/child.js"></script>
```

### Engaging Networks Integration Notes

If you are embedding Engaging Networks (EN) pages, the scripts include sensible defaults to improve UX:

- Error-aware scrolling (child → parent)

  - When EN validation errors occur, the child script finds the first `.en__field--validationFailed` element and asks the parent to scroll to it using `{ scrollTo: <offsetInChild> }`.
  - The parent script scrolls smoothly to `iframeTop + scrollTo` to ensure the errored field is visible in the host page.

- Page load scrolling safeguard (parent-side)

  - On `{ iframePageLoaded: true }`, the parent scrolls the page to the top of the iframe only if the iframe is outside the current viewport, preventing unexpected jumps after form submissions.

- Height updates during dynamic changes
  - The child sends `{ frameHeight: <px> }` using a hybrid size calculation: `document.body.offsetHeight + lastVisibleElementComputedMarginBottom`, which preserves correct shrinking after collapses/transitions.
  - On user clicks, the child briefly “watches” for size changes (~2s) to capture CSS transitions and quick DOM updates.

These behaviors are auto-detected and work whether EN runtime objects are present or not. If ENGrid/EnForm are missing, lightweight fallbacks keep height updates and error handling functional.

## The "Secret Sauce": How Height is Calculated

Getting an accurate content height that works for both expansion and contraction is tricky. This script uses a hybrid method:

1.  It gets the `document.body.offsetHeight`. This value is perfect for measuring the rendered layout and correctly reports shrinking height when content is collapsed.
2.  However, `offsetHeight` doesn't include the `margin-bottom` of the last element in the body (a browser quirk called "collapsing margins").
3.  The script programmatically finds the last visible element on the page and reads its computed `margin-bottom`.
4.  The final, correct height is `offsetHeight + last element's margin-bottom`.

This ensures a pixel-perfect fit under all conditions.

## How This Differs From iframe-resizer

This project is a focused, dependency-free, two-script solution (`parent.js` + `child.js`) optimized for automatic height, reliable shrinking, and sensible scrolling defaults. In contrast, [iframe-resizer](https://github.com/davidjbradshaw/iframe-resizer) is a full-featured library with a broader API surface, framework adapters, and many configuration options. See the official site: [iframe-resizer.com](https://iframe-resizer.com/).

### Quick Comparison

- **Scope and simplicity**

  - This repo: Minimal, vanilla JS, no build or configuration DSL—just include `parent.js` on the host page and `child.js` in every iframe page you control.
  - iframe-resizer: Comprehensive library with a rich API, options, and framework guides (React, Vue, Angular, jQuery).

- **Height calculation approach**

  - This repo: Hybrid calculation designed to excel at both expansion and contraction. It uses `document.body.offsetHeight` and adds the last visible element’s computed `margin-bottom` to handle collapsing margins, ensuring accurate shrinking after content collapses or transitions.
  - iframe-resizer: Selects from multiple DOM metrics with its own content-size algorithm to find the best value per page, aiming for reliability across diverse layouts ([ref](https://github.com/davidjbradshaw/iframe-resizer), [ref](https://iframe-resizer.com/)).

- **Detecting dynamic changes**

  - This repo: Triggers an active “watch” window on user clicks (about 2 seconds) to smoothly capture CSS transitions and quick JS-driven changes.
  - iframe-resizer: Uses a more sophisticated, continuously optimized strategy (including DOM observation and internal heuristics) to detect both HTML and CSS changes efficiently ([ref](https://github.com/davidjbradshaw/iframe-resizer)).

- **Scrolling behavior**

  - This repo: Opinionated default—after a new page loads inside the iframe, it scrolls the parent to the top of the iframe only if the iframe isn’t already in the viewport (avoids jarring jumps).
  - iframe-resizer: Offers a flexible API for scrolling and parent/child coordination, including parent position info and link propagation, so behavior is highly configurable ([ref](https://iframe-resizer.com/)).

- **Cross-domain usage**

  - Both solutions communicate via `postMessage` and expect cooperation from both host and iframe content. This repo keeps that integration explicit and minimal; iframe-resizer adds features like automatic domain authentication and extended messaging helpers ([ref](https://github.com/davidjbradshaw/iframe-resizer)).

- **When to choose which**
  - Choose this repo if you control both sides, want a tiny footprint with zero dependencies, and need excellent auto-resize (including shrinking) plus sensible scrolling defaults out of the box.
  - Choose iframe-resizer if you need advanced features, extensive configuration, framework-specific guides, or richer parent-child integration capabilities.
