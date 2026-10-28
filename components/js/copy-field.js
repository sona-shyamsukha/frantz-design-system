/* One accessible copy control for tracking code, campaign numbers and links. */
(function (root) {
  'use strict';
  if (root.FrantzCopyField) return;
  function create(value, options) {
    options = options || {};
    var row = document.createElement('div'); row.className = 'copy-field';
    var label = options.label || 'verdi';
    var content = document.createElement(options.url ? 'a' : 'code');
    content.className = 'copy-field__value'; content.textContent = options.text || value;
    // options.text: a short label when the value is too long to show, e.g. in a table. The button still copies the full value.
    if (options.text) content.title = value;
    if (options.url) { content.href = options.url; content.target = '_blank'; content.rel = 'noopener'; }
    else content.tabIndex = 0;
    var button = document.createElement('button');
    button.type = 'button'; button.className = 'btn btn--ghost btn--sm'; button.dataset.copyValue = value;
    button.setAttribute('aria-label', 'Kopier ' + label.toLocaleLowerCase('nb-NO'));
    button.title = button.getAttribute('aria-label');
    button.innerHTML = '<span class="icon-lucide icon-lucide--copy" aria-hidden="true"></span>';
    var status = document.createElement('span'); status.className = 'copy-field__status sr-only'; status.setAttribute('role', 'status');
    row.append(content, button, status);
    return row;
  }
  document.addEventListener('click', async function (event) {
    var button = event.target.closest('[data-copy-value]');
    if (!button || button.disabled) return;
    var row = button.closest('.copy-field'), status = row.querySelector('.copy-field__status');
    var label = button.getAttribute('aria-label');
    button.disabled = true;
    try {
      await navigator.clipboard.writeText(button.dataset.copyValue);
      button.innerHTML = '<span class="icon-lucide icon-lucide--check" aria-hidden="true"></span>';
      button.setAttribute('aria-label', 'Kopiert'); button.title = 'Kopiert';
      status.className = 'copy-field__status sr-only'; status.textContent = 'Kopiert.';
      setTimeout(function () {
        button.innerHTML = '<span class="icon-lucide icon-lucide--copy" aria-hidden="true"></span>';
        button.setAttribute('aria-label', label); button.title = label; status.textContent = '';
      }, 2000);
    } catch (error) {
      status.className = 'copy-field__status form-hint'; status.textContent = 'Kunne ikke kopiere. Marker verdien og kopier den selv.';
    } finally { button.disabled = false; }
  });
  root.FrantzCopyField = Object.freeze({ create: create });
})(window);
