/* Choose legible text for a solid creative background. */
(function (root) {
  'use strict';
  function luminance(hex) {
    var channels = hex.slice(1).match(/.{2}/g).map(function (v) {
      var n = parseInt(v, 16) / 255;
      return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
    });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  }
  function contrast(a, b) { var x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function textFor(background) {
    if (!/^#[a-f0-9]{6}$/i.test(background)) return '#000000';
    if (contrast(background, '#123c42') >= 4.5) return '#123c42';
    return contrast(background, '#ffffff') >= 4.5 ? '#ffffff' : '#000000';
  }
  root.FrantzAdColors = { textFor: textFor, contrast: contrast };
})(window);
