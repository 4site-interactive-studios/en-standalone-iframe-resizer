# Dynamic iFrame Resizing and Communication Scripts

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

```

### Step 2: Add the Child Script

Place the child.js script on **every page** that will be loaded inside the `<iframe>`.

## The "Secret Sauce": How Height is Calculated

Getting an accurate content height that works for both expansion and contraction is tricky. This script uses a hybrid method:
1.  It gets the `document.body.offsetHeight`. This value is perfect for measuring the rendered layout and correctly reports shrinking height when content is collapsed.
2.  However, `offsetHeight` doesn't include the `margin-bottom` of the last element in the body (a browser quirk called "collapsing margins").
3.  The script programmatically finds the last visible element on the page and reads its computed `margin-bottom`.
4.  The final, correct height is `offsetHeight + last element's margin-bottom`.

This ensures a pixel-perfect fit under all conditions.
```
