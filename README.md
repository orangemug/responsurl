# Responsurl

![screenshot](assets/screenshot.png)

The aim is to create an iframe of the target size, but scale it so it fits your screen, with a shareable url. Basically so you can see your mediaqueries in page without having to pan about.

What it's got:

 * Some screen size presets
 * Unit fields are [incremental](https://github.com/orangemug/incremental)able (`ALT/SHIFT`+`UP/DOWN`)
 * A shareable URL

See it in action <http://orangemug.github.com/responsurl>


## Supported browsers
Just Chrome right now, although it'll probably work elsewhere as well.


## Install/run
To install and run your own copy

  npm install
  npm run-script server


## Known Issues
Scrollbars cause wrong dimensions, if the content area is for mobile sizes. Not a problem for OSX (because it doesn't have them).

