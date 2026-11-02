/* Approvals and change requests share one explicit, cancellable response dialog. */
(function (root) {
  'use strict';
  var active = null;
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }
  function isConfirmed(value) { return String(value || '').trim().toLocaleLowerCase('nb-NO') === 'godkjent'; }
  function open(options) {
    if (active) return Promise.resolve(null);
    return new Promise(function (resolve) {
      var changes = options.kind === 'changes';
      function valid(value) { return changes ? !!String(value || '').trim() : isConfirmed(value); }
      var opener = document.activeElement, done = false;
      var dialog = el('dialog', 'approval-dialog approval-confirm');
      var id = 'approval-confirm-' + root.crypto.randomUUID();
      var form = el('form', 'approval-confirm__form');
      var head = el('div', 'approval-inline__head');
      var title = el('h3', '', options.title), description = el('p', '', options.description);
      title.id = id + '-title'; description.id = id + '-description';
      dialog.setAttribute('aria-labelledby', title.id); dialog.setAttribute('aria-describedby', description.id);
      var close = el('button', 'approval-dialog__close'); close.type = 'button'; close.setAttribute('aria-label', 'Lukk');
      var icon = el('span', 'icon-lucide icon-lucide--x'); icon.setAttribute('aria-hidden', 'true'); close.append(icon);
      head.append(title, close);
      var group = el('div', 'form-group'), label = el('label', 'form-label', changes ? 'Hva må endres?' : 'Kommentar');
      var hint = el('p', 'form-hint', changes ? options.hint || 'Beskriv hva som må endres, og hvilken annonse det gjelder hvis det er flere.' : 'Skriv «godkjent» for å bekrefte.'); hint.id = id + '-hint';
      var field = el('textarea', 'form-textarea'); field.id = id + '-comment'; field.rows = 3; field.required = true;
      field.autocomplete = 'off'; field.spellcheck = changes; field.setAttribute('aria-describedby', hint.id); label.htmlFor = field.id;
      if (options.placeholder) field.placeholder = options.placeholder;
      if (options.comment) field.value = options.comment;
      group.append(label, hint, field);
      var actions = el('div', 'approval-inline__actions approval-confirm__actions');
      var cancel = el('button', 'btn btn--secondary', 'Avbryt'); cancel.type = 'button';
      var send = el('button', 'btn btn--primary', options.submitLabel || (changes ? 'Send endringsønske' : 'Send godkjenning')); send.type = 'submit'; send.disabled = !valid(field.value);
      actions.append(cancel, send); form.append(head, description, group, actions); dialog.append(form); document.body.append(dialog);
      function finish(comment) {
        if (done) return;
        done = true;
        if (dialog.open) dialog.close();
        dialog.remove(); active = null;
        if (opener && opener.isConnected && !opener.disabled && opener.getClientRects().length) opener.focus({ preventScroll: true });
        resolve(comment);
      }
      active = { cancel: function () { finish(null); } };
      close.addEventListener('click', active.cancel); cancel.addEventListener('click', active.cancel);
      dialog.addEventListener('cancel', function (event) { event.preventDefault(); finish(null); });
      dialog.addEventListener('click', function (event) {
        if (event.target !== dialog) return;
        var bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) finish(null);
      });
      field.addEventListener('input', function () { send.disabled = !valid(field.value); });
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        if (send.disabled || !valid(field.value)) return;
        send.disabled = true; finish(field.value.trim());
      });
      dialog.showModal(); field.focus({ preventScroll: true });
    });
  }
  root.FrantzApprovalConfirm = Object.freeze({ open: open, isConfirmed: isConfirmed, cancel: function () { if (active) active.cancel(); } });
})(window);
