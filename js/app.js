var url = require("url");
var debounce = require("lodash.debounce");
var incremental = require("../../incremental");

var qs = document.querySelector.bind(document);
var frameUrl;

/**
 * Scale to a maximum width/height
 *
 * @param {Number} w width
 * @param {Number} h width
 * @param {Number} mw max width
 * @param {Number} mh max width
 * @param {boolean} stretch whether to stretch larger than w/h
 * @return {Object}
 */
function scaleToMax(w, h, mw, mh, stretch) {
  var scale = 1;
  var scaledW = w;
  var scaledH = h;

  if(stretch || (h > mh || w > mw)) {
    var hd = mh/h;
    var wd = mw/w;
    var hd = parseFloat(hd.toFixed(3));
    var wd = parseFloat(wd.toFixed(3));
    
    if(hd<wd) {
      scale = hd;
    } else {
      scale = wd;
    }

    scaledW = w * scale;
    scaledH = h * scale;
  }

  return {
    width: scaledW,
    height: scaledH,
    scale: scale
  };
}

/**
 * Get the available height or the frame
 */
function getAvailableHeight() {
  var padding, bodyHeight;
  var headerEl    = qs("header");
  var containerEl = qs("#display");
  var footerEl    = qs("footer");
  var containerCS = window.getComputedStyle(containerEl);

  // Get the padding
  padding  = parseInt(containerCS.paddingTop);
  padding += parseInt(containerCS.paddingBottom);

  bodyHeight = document.body.clientHeight;
  return (bodyHeight - headerEl.offsetHeight - footerEl.offsetHeight - padding);
}

function updateSelect(sizeStr) {
  var sizesEl  = qs("#sizes");
  for(var i=0; i<sizesEl.options.length; i++) {
    var size = sizesEl[i];
    if(size.value === sizeStr) {
      size.selected = true;
      return;
    }
  }
  sizesEl.value = "-1";
}

function updateUI(url, w, h) {
  var urlEl    = qs("#url");
  var widthEl  = qs("#width");
  var heightEl = qs("#height");

  if(urlEl.value !== url) urlEl.value  = url;
  if(widthEl.value !== w.toString()) widthEl.value  = w;
  if(heightEl.value !== h.toString()) heightEl.value = h;

  updateSelect(w+"x"+h);
}

function render() {
  var query = url.parse(document.location.href, true).query;
  var w   = parseInt(query.w, 10);
  var h   = parseInt(query.h, 10);
  var qUrl = query.url;
  var frameless = (query.frameless === "true");
  var stretch   = (query.stretch   === "true");

  updateUI(qUrl, w, h);

  if(frameless) {
    document.body.classList.add("no-frame");
  } else {
    document.body.classList.remove("no-frame");
  }

  if(w === undefined || h === undefined) {
    return;
  }

  var pcEl = qs(".page-container");
  pcEl.style.width = "auto";
  pcEl.style.height = "auto";

  // Get size of page container
  var pcw = pcEl.offsetWidth;
  var pch = getAvailableHeight();

  var scaledVal = scaleToMax(w, h, pcw, pch, stretch);

  var iframeEl = qs(".page-container iframe");
  pcEl.style.width = scaledVal.width+"px";
  pcEl.style.height = scaledVal.height+"px";

  iframeEl.style["-webkit-transform"] = "scale("+scaledVal.scale+")";
  iframeEl.style["-webkit-transform-origin"] = "0 0";
  iframeEl.style.width = w+"px";
  iframeEl.style.height = h+"px";

  // Check if we have a url match
  if(frameUrl !== qUrl) {
    iframeEl.src = qUrl;
    frameUrl = qUrl;
  }

  var scaledLabelEl = qs(".scaled-by");
  scaledLabelEl.innerHTML = "(scaled by x"+scaledVal.scale+")";
}

render = debounce(render, 100);


function setUrl(url, w, h) {
  history.pushState({}, undefined, document.location.origin+document.location.pathname+"?w="+w+"&h="+h+"&url="+url);
  render();
}

function updateUrl() {
  var url = qs("#url").value;
  var w   = qs("#width").value;
  var h   = qs("#height").value;

  w = parseInt(w, 10);
  h = parseInt(h, 10);

  if(w === undefined || h === undefined) {
    return;
  }

  setUrl(url, w, h);
}

function setup() {
  var urlEl    = qs("#url");
  var widthEl  = qs("#width");
  var heightEl = qs("#height");
  var sizeEl   = qs("#sizes");

  var hdl = incremental.handler({
    modifier: function(e) {
      if(e.altKey) return 100;
      if(e.shiftKey) return 10;
      return 1;
    }
  });

  // incremental handlers
  widthEl.addEventListener("keyup", hdl);
  heightEl.addEventListener("keyup", hdl);

  // URL bindings
  widthEl.addEventListener("keyup", updateUrl);
  heightEl.addEventListener("keyup", updateUrl);
  urlEl.addEventListener("blur", updateUrl);
  urlEl.addEventListener("keyup", function(e) {
    // If enter key is pressed
    if(e.keyCode === 13) updateUrl();
  });

  sizeEl.addEventListener("change", function(e) {
    var parts = e.target.value.split("x");
    if(parts.length === 2) {
      widthEl.value  = parts[0];
      heightEl.value = parts[1];
      updateUrl();
    }
  })

  window.addEventListener("popstate", render);
  window.addEventListener("resize", render);

  // Initial render
  render();
}

window.addEventListener('load', setup, false);

// HACK!
window._responsurl = true;
