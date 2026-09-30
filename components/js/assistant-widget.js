/* Floating Frantz-assistenten. Adds a button and a chat panel to a portal page.
   Load before assistant.js, which starts the chat inside the panel.
   <body data-assistant="form"> tells the assistant the page has a form it can fill in. */

(function () {
  if (document.querySelector('.chat[data-assistant]')) return; // the full-page assistant is already here

  const context = document.body.dataset.assistant || '';

  const fab = document.createElement('button');
  fab.type = 'button';
  fab.className = 'assist-fab';
  fab.setAttribute('aria-haspopup', 'dialog');
  fab.setAttribute('aria-expanded', 'false');
  fab.setAttribute('aria-controls', 'assist-panel');
  fab.innerHTML = '<span class="icon-lucide icon-lucide--sparkles" aria-hidden="true"></span><span class="assist-fab__label">Spør Frantz</span>';
  fab.setAttribute('aria-label', 'Spør Frantz');

  const panel = document.createElement('div');
  panel.className = 'assist-panel';
  panel.id = 'assist-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-labelledby', 'assist-title');
  panel.innerHTML =
    '<section class="chat" data-assistant data-context="' + context + '">' +
      '<header class="chat__head">' +
        '<span class="chat__avatar"><span class="icon-lucide icon-lucide--sparkles icon-lucide--md" aria-hidden="true"></span></span>' +
        '<div>' +
          '<h2 class="chat__title" id="assist-title">Frantz-assistenten</h2>' +
          '<span class="chat__status">Svarer med en gang · En rådgiver tar over når det trengs</span>' +
        '</div>' +
        '<button type="button" class="btn btn--ghost chat__human" data-action="human" aria-label="Snakk med en rådgiver" title="Snakk med en rådgiver"><span class="icon-lucide icon-lucide--headset" aria-hidden="true"></span><span>Snakk med en rådgiver</span></button>' +
        '<button type="button" class="btn btn--ghost" data-action="restart" aria-label="Start ny samtale" title="Start ny samtale"><span class="icon-lucide icon-lucide--rotate-ccw" aria-hidden="true"></span></button>' +
        '<a class="btn btn--ghost" href="assistent.html" aria-label="Åpne i full skjerm" title="Åpne i full skjerm"><span class="icon-lucide icon-lucide--maximize-2" aria-hidden="true"></span></a>' +
        '<button type="button" class="btn btn--ghost" data-widget="close" aria-label="Lukk assistenten" title="Lukk"><span class="icon-lucide icon-lucide--x" aria-hidden="true"></span></button>' +
      '</header>' +
      '<div class="chat__log" role="log" aria-live="polite" aria-label="Samtale med Frantz-assistenten"></div>' +
      '<form class="composer" autocomplete="off">' +
        '<div class="composer__files" aria-label="Vedlegg"></div>' +
        '<div class="composer__box">' +
          '<button type="button" class="composer__btn" data-action="attach" aria-label="Legg ved filer"><span class="icon-lucide icon-lucide--paperclip icon-lucide--md" aria-hidden="true"></span></button>' +
          '<label class="chat__sr" for="assist-input">Skriv til assistenten</label>' +
          '<textarea class="composer__input" id="assist-input" rows="1" placeholder="Skriv eller lim inn bestillingen…"></textarea>' +
          '<button type="submit" class="composer__btn composer__btn--send" aria-label="Send"><span class="icon-lucide icon-lucide--send" aria-hidden="true"></span></button>' +
        '</div>' +
        '<input class="composer__file" type="file" aria-label="Velg filer" multiple accept="image/*,.pdf" hidden>' +
        '<p class="composer__hint">Demo med faste svar, ingen ekte AI</p>' +
      '</form>' +
    '</section>';

  document.body.append(fab, panel);

  const chatEl = panel.querySelector('.chat');
  const input = panel.querySelector('.composer__input');

  function open() {
    document.body.classList.add('assist-open');
    fab.setAttribute('aria-expanded', 'true');
    setTimeout(() => input.focus(), 60);
  }

  function close() {
    document.body.classList.remove('assist-open');
    fab.setAttribute('aria-expanded', 'false');
    fab.focus();
  }

  fab.addEventListener('click', open);
  panel.querySelector('[data-widget="close"]').addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('assist-open')) close();
  });
  document.addEventListener('assistant:close', close);
  // On a phone the panel covers the page, so step aside and let the user see the form get filled in
  document.addEventListener('assistant:fill', () => {
    if (window.matchMedia('(max-width: 860px)').matches) setTimeout(close, 700);
  });

  window.FrantzAssist = {
    open,
    close,
    // Opens the panel and starts the "new campaign" flow, as if the user asked for it.
    startNew(label) {
      open();
      const chat = chatEl.assistant;
      if (!chat) return;
      chat.userSays(label || 'Fyll ut skjemaet for meg');
      chat.startNew();
    }
  };
})();
