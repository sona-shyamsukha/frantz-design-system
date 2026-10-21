/* Use the original logo without recolouring or cropping it. */
(function (root) {
  'use strict';
  function render(element, sender, url) {
    element.classList.toggle('has-custom-logo', !!url);
    element.dataset.mark = sender.charAt(0).toUpperCase();
    if (!url) { element.textContent = sender; return; }
    var image = element.querySelector('img');
    if (!image) {
      image = document.createElement('img');
      image.className = 'ad-custom-logo';
      element.replaceChildren(image);
    }
    if (image.getAttribute('src') !== url) image.src = url;
    image.alt = 'Logo for ' + sender;
  }
  root.FrantzAdLogo = { render: render };
})(window);
