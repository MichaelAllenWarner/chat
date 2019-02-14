# Mike's Chat App

This single-page web app is [hosted on Heroku](https://mikes-chat-app.herokuapp.com). It's my second Node/Express project, and it's written in vanilla Javascript (ES6+), HTML, and CSS. It uses WebSockets to transmit messages between server and client.

Unlike my previous projects, this one's biggest challenge was UI/UX. Setting up the basic chat functionality took only a few hours, but getting the app to look right across browsers on a variety of devices took several days. The main difficulty was maintaining a full-viewport layout *except* when the viewport height is too small for the whole app to fit. Specifically: on most mobile browsers, the viewport height shrinks when the virtual keyboard is deployed, which happens every time the user taps an input box. I needed to gracefully ditch the full-viewport layout in that case, while also keeping the viewport centered on the area that the user tapped.

My solution was to use a CSS grid display for the page's main content div in combination with media queries that adjust the grid responsively (no device- or browser-sniffing):

* On a wide viewport, the grid is a single row that's completely visible.

* On a narrow viewport, the grid is a single *column* that's completely visible.

* On a narrow *and short* viewport (as on a mobile device with the virtual keyboard deployed), the grid is a single column, but instead of the whole column being visible, each *row* is exactly tall enough to be completely visible.

This worked well, except that when the narrow-and-short layout was triggered (i.e., when the virtual keyboard popped up), all browsers would automatically scroll to the top of the grid, regardless of which input box the user had tapped. This meant that if the user tapped the bottom input box, the area corresponding to the *top* input box would appear on the screen!

To keep the viewport focused on the correct area, I used the [Element.scrollIntoView()](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView) method, triggered by a window-resize event. This *is* the right solution, but it wasn't working consistently when I first implemented it. Sometimes the scroll method would work, sometimes it wouldn't, and there didn't seem to be any pattern or reasonable explanation. I tried more "fixes" than I can count, each more complex than the last&mdash;"throttling" the window-resize event, "debouncing" it, [both](https://css-tricks.com/the-difference-between-throttling-and-debouncing/), and even switching the trigger from a window-resize event to an input-box&ndash;click event. No change.

Finally I took a step back and tried something much simpler: I removed all CSS transitions that accompanied a change in viewport size (for font-sizes and the like). That did the trick. The timing of the transitions must have been interfering with the execution of the scrollIntoView() method on a window-resize.

Lesson learned: keep things simple.

Creating this app was something of a crash course in modern CSS. When I dabbled in web design several years ago, there were no grids or flexboxes. In this project I used both to good effect. For example, on a narrow-and-short viewport, the grid becomes scrollable, but the header at the top of the page stays put as if its position property were set to "fixed." In fact, its position is *not* fixed, and it stays put because its parent element is a flexbox with 100% height.

I managed to get the app working on Internet Explorer 10, but there are still issues with the CSS.
