# Mike’s Mobile-Friendly Chat App

This single-page web app is [hosted on Heroku](https://mikes-chat-app.herokuapp.com) (Heroku puts it in sleep mode after a period of inactivity, so it might take a few seconds to load). It’s Node/Express on the backend, and React/HTML/CSS on the front end (originally it was vanilla JavaScript/ES6+ on the front, but I’ve adapted it to React).

A few noteworthy things about this project:

* It’s designed mainly with mobile in mind, but it works fine on desktop.

* Makes good use of CSS grids and flexboxes.

* Dark mode!

* The menu slides on and off screen nicely (CSS transition).

* When a new message is received or if the window gets resized, your scroll position in the chat area is preserved.

* It uses WebSockets to transmit data between server and client.

* Compatible with Internet Explorer 10 (though some CSS issues remain).

The biggest challenge here was related to UI/UX and cross-platform compatibility. I wanted to enforce a full-viewport layout *except* when the viewport height is too small for the whole app to fit on the screen. On most mobile browsers (but not Safari!), the viewport height shrinks to too-small territory when the virtual keyboard is deployed, which happens every time the user taps an input box. I needed to gracefully ditch the full-viewport layout in that case, while also keeping the viewport centered on the area that the user tapped&mdash;all without interfering with desktop (or mobile Safari!) functionality.

My solution was to use a CSS grid display for the page’s main content div, in combination with media queries that adjust the grid responsively (no device- or browser-sniffing):

* On a wide viewport, the grid is a single row that’s completely visible.

* On a narrow viewport, the grid is a single *column* that’s completely visible.

* On a narrow *and “too-short”* viewport (as on a mobile device with the virtual keyboard deployed), the grid is a single column, but instead of the whole column being visible, each *row* is exactly tall enough to be completely visible.

This worked well, except that when the narrow-and-short layout was triggered (i.e., when the virtual keyboard popped up), all browsers would automatically scroll to the top of the grid, regardless of which input box the user had tapped. This meant that if a mobile user tapped the bottom input box, the area corresponding to the *top* input box would appear on the screen!

To keep the viewport focused on the correct area, I used the [Element.scrollIntoView()](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView) method, triggered by a window-resize event. This *is* the right solution, but it wasn’t working consistently when I first implemented it. Sometimes the scroll method would work, sometimes it wouldn’t, and there didn’t seem to be any pattern or reasonable explanation. I tried more “fixes” than I can count, each more complex than the last&mdash;“throttling” the window-resize event, “debouncing” it, [both](https://css-tricks.com/the-difference-between-throttling-and-debouncing/), and even switching the trigger from a window-resize event to an input-box&ndash;click event. No change.

Finally I took a step back and tried something much simpler: I removed all CSS transitions that accompanied a change in viewport size (for font-sizes and the like). That did the trick. The timing of the transitions must have been interfering with the execution of the scrollIntoView() method on a window-resize.

Lesson learned: keep things simple!