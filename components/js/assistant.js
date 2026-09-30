/* Frantz-assistenten — scripted demo. No real AI: answers come from the rules below. */

class AssistantChat {
  static USER = { first: 'Kari', company: 'Vokser AS' };

  static CAMPAIGNS = [
    {
      id: '129041', ref: '22 31', title: 'Sykepleier Oslo', badge: 'badge--active', status: 'Aktiv',
      channels: 'Meta, Nettsteder', day: 'Dag 25 av 30', spent: 'kr 34 900', budget: 'kr 48 200',
      clicks: '312', target: '380',
      summary: 'Kampanjen går bedre enn plan. 312 personer har trykket «Søk». Det er 82 % av målet, og det er 5 dager igjen.',
      history: [['15.09.2026', 'Budsjett flyttet mot Meta'], ['08.09.2026', 'Målgruppen utvidet'], ['03.09.2026', 'Kampanjen startet']]
    },
    {
      id: '129072', ref: '22 40', title: 'Helsefagarbeider Tromsø', badge: 'badge--setup', status: 'Under arbeid',
      channels: 'Meta, Nettsteder', day: 'Starter 05.10', spent: 'kr 0', budget: 'kr 28 000',
      clicks: '0', target: '40',
      summary: 'Annonsene er klare. Du må godkjenne dem innen 02.10, så kan kampanjen starte 05.10.',
      history: [['29.09.2026', 'Annonsene er laget'], ['26.09.2026', 'Bestillingen er mottatt']]
    },
    {
      id: '129074', ref: '22 41', title: 'Barnehagelærer Drammen', badge: 'badge--ordered', status: 'Bestilt',
      channels: 'Frantz anbefaler', day: 'Ønsket start 07.10', spent: 'kr 0', budget: 'kr 32 000',
      clicks: '0', target: '45',
      summary: 'Frantz har fått bestillingen. Martin Karlsen starter på den innen 1 arbeidsdag.',
      history: [['30.09.2026', 'Bestillingen er mottatt']]
    }
  ];

  static FIELDS = [
    ['ref', 'Deres referanse'], ['title', 'Stillingstittel'], ['place', 'Arbeidssted'],
    ['deadline', 'Søknadsfrist'], ['link', 'Stillingslenke'], ['budget', 'Totalbudsjett'],
    ['channels', 'Kanaler'], ['period', 'Periode'], ['images', 'Bilder'], ['logo', 'Logo'],
    ['shortText', 'Kort tekst'], ['preview', 'Forhåndsvisning'], ['sender', 'Avsender']
  ];

  static REQUIRED = ['link', 'title', 'place', 'deadline', 'budget', 'channels', 'images', 'logo', 'shortText', 'preview'];

  static SOURCE = {
    text: ['source-tag--text', 'Fra deg'],
    link: ['source-tag--link', 'Fra stillingslenken'],
    ai: ['source-tag--ai', 'AI-forslag'],
    missing: ['source-tag--missing', 'Mangler']
  };

  static PLACES = {
    oslo: 'Oslo', bergen: 'Bergen', tromso: 'Tromsø', trondheim: 'Trondheim', stavanger: 'Stavanger',
    bodo: 'Bodø', alesund: 'Ålesund', kristiansand: 'Kristiansand', drammen: 'Drammen'
  };

  static EXAMPLE_ORDER = [
    'Kampanje: 22 45 Intensivsykepleier Tromsø',
    'Totalbudsjett: 30 000 kr',
    'Kanaler: Meta og LinkedIn',
    'Stillingslenke: https://jobber.example.no/stilling/intensivsykepleier-tromso',
    'Periode: snarest til søknadsfrist',
    'Toppbilde er vedlagt.',
    'Kunden skal se forhåndsvisning før kampanjen starter.'
  ].join('\n');

  constructor(root) {
    this.root = root;
    this.log = root.querySelector('.chat__log');
    this.input = root.querySelector('.composer__input');
    this.fileInput = root.querySelector('.composer__file');
    this.fileList = root.querySelector('.composer__files');
    this.queue = Promise.resolve();
    this.pending = [];
    this.newId = '129077';
    this.context = root.dataset.context || ''; // 'form' = the page has a campaign form the assistant can fill in
    this.bindEvents();
    this.reset();
  }

  bindEvents() {
    this.root.querySelector('.composer').addEventListener('submit', (e) => {
      e.preventDefault();
      this.send();
    });
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.send();
      }
    });
    this.input.addEventListener('input', () => this.autosize());
    this.root.querySelector('[data-action="attach"]').addEventListener('click', () => this.fileInput.click());
    this.fileInput.addEventListener('change', () => {
      Array.from(this.fileInput.files).forEach((f) => this.addPendingFile(f.name));
      this.fileInput.value = '';
      if (this.awaiting === 'images' || this.awaiting === 'logo') this.send();
      else this.input.focus();
    });
    this.root.querySelector('[data-action="human"]').addEventListener('click', () => {
      this.userSays('Jeg vil snakke med en rådgiver');
      this.askHuman();
    });
    this.root.querySelector('[data-action="restart"]').addEventListener('click', () => this.reset());
  }

  reset() {
    this.session = (this.session || 0) + 1;
    this.log.replaceChildren();
    this.pending = [];
    this.renderPending();
    this.mode = null;
    this.awaiting = null;
    this.draft = null;
    this.orderBtn = null;
    this.current = null;
    this.misses = 0;
    this.formOffered = false;
    this.queue = Promise.resolve();
    this.greet();
  }


  /* ---------- Rendering ---------- */

  esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  icon(name) {
    const i = this.el('span', 'icon-lucide icon-lucide--' + name);
    i.setAttribute('aria-hidden', 'true');
    return i;
  }

  now() {
    const d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  addMsg(role, bubble, extras) {
    const msg = this.el('div', 'msg msg--' + role);
    if (role !== 'system') {
      const av = this.el('span', 'msg__avatar');
      av.append(this.icon(role === 'ai' ? 'sparkles' : role === 'advisor' ? 'headset' : 'user-round'));
      msg.append(av);
    }
    const body = this.el('div', 'msg__body');
    if (role !== 'system') {
      const who = role === 'ai' ? 'Frantz-assistenten' : role === 'advisor' ? 'Jonas · rådgiver hos Frantz' : 'Du';
      body.append(this.el('span', 'msg__meta', who + ' · ' + this.now()));
    }
    if (bubble) body.append(bubble);
    (extras || []).forEach((x) => x && body.append(x));
    msg.append(body);
    this.log.append(msg);
    this.scroll();
    return msg;
  }

  scroll() {
    this.log.scrollTop = this.log.scrollHeight;
  }

  userSays(text, files) {
    const bubble = this.el('div', 'msg__bubble', text);
    let fileRow = null;
    if (files && files.length) {
      fileRow = this.el('div', 'msg__files');
      files.forEach((f) => {
        const c = this.el('span', 'file-chip');
        c.append(this.icon('paperclip'), document.createTextNode(f));
        fileRow.append(c);
      });
    }
    this.addMsg('user', text ? bubble : null, [fileRow]);
  }

  system(text) {
    const b = this.el('div', 'msg__bubble');
    b.append(this.icon('check'), document.createTextNode(text));
    this.addMsg('system', b);
  }

  // html must be trusted: every value that comes from the user goes through esc().
  say(html, opts) {
    opts = opts || {};
    const session = this.session;
    this.queue = this.queue.then(() => new Promise((resolve) => {
      if (session !== this.session) return resolve();
      const typing = this.el('div', 'msg msg--ai');
      const av = this.el('span', 'msg__avatar');
      av.append(this.icon('sparkles'));
      const t = this.el('div', 'typing');
      t.setAttribute('aria-label', 'Assistenten skriver');
      t.append(this.el('span'), this.el('span'), this.el('span'));
      typing.append(av, t);
      this.log.append(typing);
      this.scroll();
      const delay = opts.delay || Math.min(1400, 500 + html.length * 3);
      setTimeout(() => {
        typing.remove();
        if (session !== this.session) return resolve();
        let bubble = null;
        if (html) {
          bubble = this.el('div', 'msg__bubble');
          bubble.innerHTML = html;
        }
        const extras = (opts.extras || []).slice();
        if (opts.chips) extras.push(this.chips(opts.chips));
        this.addMsg('ai', bubble, extras);
        resolve();
      }, delay);
    }));
    return this.queue;
  }

  chips(list) {
    const row = this.el('div', 'quick-replies');
    list.forEach((c) => {
      const b = this.el('button', 'quick-reply' + (c.human ? ' quick-reply--human' : ''), c.label);
      b.type = 'button';
      if (c.icon) b.prepend(this.icon(c.icon));
      b.addEventListener('click', () => {
        row.classList.add('quick-replies--used');
        if (!c.silent) this.userSays(c.label);
        c.run();
      });
      row.append(b);
    });
    return row;
  }

  humanChip() {
    return { label: 'Snakk med en rådgiver', human: true, icon: 'headset', run: () => this.askHuman() };
  }

  linkBox(url) {
    const box = this.el('div', 'linkbox');
    box.append(this.icon('link'), this.el('span', 'linkbox__url', url));
    const copy = this.el('button', 'btn btn--ghost btn--sm', 'Kopier');
    copy.type = 'button';
    copy.addEventListener('click', () => {
      if (navigator.clipboard) navigator.clipboard.writeText('https://' + url).catch(() => {});
      copy.textContent = 'Kopiert';
    });
    box.append(copy);
    return box;
  }


  /* ---------- Composer ---------- */

  autosize() {
    this.input.style.height = 'auto';
    this.input.style.height = Math.min(this.input.scrollHeight, 200) + 'px';
  }

  addPendingFile(name) {
    this.pending.push(name);
    this.renderPending();
  }

  renderPending() {
    this.fileList.replaceChildren();
    this.pending.forEach((name, i) => {
      const c = this.el('span', 'file-chip');
      c.append(this.icon('paperclip'), document.createTextNode(name));
      const x = this.el('button', 'file-chip__remove');
      x.type = 'button';
      x.setAttribute('aria-label', 'Fjern ' + name);
      x.append(this.icon('x'));
      x.addEventListener('click', () => {
        this.pending.splice(i, 1);
        this.renderPending();
      });
      c.append(x);
      this.fileList.append(c);
    });
  }

  prefill(text, files) {
    this.input.value = text;
    (files || []).forEach((f) => this.addPendingFile(f));
    this.autosize();
    this.input.focus();
  }

  send() {
    const text = this.input.value.trim();
    const files = this.pending.slice();
    if (!text && !files.length) return;
    this.input.value = '';
    this.autosize();
    this.pending = [];
    this.renderPending();
    this.userSays(text, files);
    this.handle(text, files);
  }


  /* ---------- Conversation ---------- */

  greet() {
    const u = AssistantChat.USER;
    if (this.context === 'form') {
      return this.say(
        '<p>Hei ' + this.esc(u.first) + '. Du kan fylle ut skjemaet selv, eller la meg gjøre det for deg.</p>' +
        '<p>Lim inn bestillingen eller lenken til stillingsannonsen, så fyller jeg inn skjemaet.</p>',
        { delay: 400, chips: [
          { label: 'Fyll ut skjemaet for meg', icon: 'clipboard-pen', run: () => this.startNew() },
          { label: 'Spør om noe', icon: 'message-square', run: () => this.startAsk() },
          this.humanChip()
        ] }
      );
    }
    this.say(
      '<p>Hei ' + this.esc(u.first) + '. Jeg er Frantz-assistenten. Jeg kan lage kampanjer, følge opp kampanjer og svare på spørsmål.</p>' +
      '<p>Hva vil du gjøre?</p>',
      { delay: 400, chips: this.mainChips() }
    );
  }

  mainChips() {
    return [
      { label: 'Lag ny kampanje', icon: 'plus', run: () => this.startNew() },
      { label: 'Følg opp en kampanje', icon: 'list', run: () => this.startFollowUp() },
      { label: 'Spør om noe', icon: 'message-square', run: () => this.startAsk() },
      this.humanChip()
    ];
  }

  handle(text, files) {
    const t = text.toLowerCase();

    if (this.awaiting) return this.handleAwaiting(text, files);

    if (/rådgiver|menneske|en person|snakke med noen/.test(t)) return this.askHuman();

    if (this.mode === 'change') return this.submitChange(text, files);
    if (this.mode === 'review') return this.applyEdits(text, files);

    if (this.mode === 'paste' || (text.length > 90 && /budsjett|kanal|stilling|lenke|http/.test(t))) {
      return this.readOrder(text, files);
    }

    if (/ny kampanje|lag (en )?kampanje|opprett|bestill/.test(t)) return this.startNew();

    if (this.mode === 'followup' && this.current) {
      if (/rapport/.test(t)) return this.giveLink('report');
      if (/kampanjeside|landingsside/.test(t)) return this.giveLink('landing');
      if (/endre|bytt/.test(t)) return this.startChange();
    }

    const found = this.findCampaigns(text);
    const wantsFollowUp = /følg opp|status|rapport|kampanjeside|landingsside|endre|bytt|lenke/.test(t);
    if (this.mode === 'pick' || found.length || wantsFollowUp) {
      if (found.length === 1) return this.openCampaign(found[0], t);
      if (found.length > 1) return this.pickFrom(found);
      if (this.mode === 'pick') {
        return this.say('<p>Jeg fant ingen kampanje som passer. Prøv navnet, kampanje-ID-en eller deres egen referanse, for eksempel «22 31».</p>',
          { chips: this.campaignChips() });
      }
      return this.startFollowUp();
    }

    if (this.mode === 'ask' || /\?|hva er|hvordan|forskjell|pris|koster/.test(t)) return this.answer(t);

    return this.notSure();
  }

  notSure() {
    this.misses += 1;
    if (this.misses >= 2) {
      return this.say('<p>Jeg forstår ikke helt hva du trenger. Skal jeg sende samtalen til en rådgiver? De ser alt vi har skrevet.</p>',
        { chips: [this.humanChip(), { label: 'Vis valgene igjen', run: () => this.greet() }] });
    }
    return this.say('<p>Jeg er ikke sikker på at jeg forstod. Hva vil du gjøre?</p>', { chips: this.mainChips() });
  }


  /* ---------- New campaign ---------- */

  startNew() {
    this.mode = 'new-start';
    this.say(
      '<p>Supert. Du kan lime inn hele bestillingen, slik du skriver den i en e-post. Legg ved bilder og logo med binders-knappen.</p>' +
      '<p>Eller så stiller jeg deg noen korte spørsmål, ett om gangen.</p>',
      {
        chips: [
          { label: 'Lim inn eksempel-bestilling', icon: 'copy', silent: true, run: () => this.usePasteMode(true) },
          { label: 'Jeg limer inn selv', run: () => this.usePasteMode(false) },
          { label: 'Still meg spørsmål', run: () => this.startGuided() }
        ]
      }
    );
  }

  usePasteMode(example) {
    this.mode = 'paste';
    if (example) {
      this.prefill(AssistantChat.EXAMPLE_ORDER, ['toppbilde-sykepleier.jpg']);
      return;
    }
    this.say('<p>Lim inn teksten under, og trykk send.</p>');
    this.input.focus();
  }

  emptyDraft() {
    const d = {};
    AssistantChat.FIELDS.forEach(([k]) => { d[k] = { value: '', source: 'missing' }; });
    d.period = { value: 'Snarest til søknadsfrist', source: 'ai' };
    d.sender = { value: AssistantChat.USER.company, source: 'ai' };
    return d;
  }

  startGuided() {
    this.mode = 'guided';
    this.draft = this.emptyDraft();
    this.askNext();
  }

  readOrder(text, files) {
    this.mode = 'new';
    this.draft = this.emptyDraft();
    const changed = this.parseInto(this.draft, text, files);
    const req = AssistantChat.REQUIRED;
    const have = req.filter((k) => this.draft[k].source !== 'missing').length;
    if (!changed.length) {
      return this.say('<p>Jeg fant ingen kampanjeinformasjon i teksten. Skal jeg heller stille deg spørsmål?</p>',
        { chips: [{ label: 'Still meg spørsmål', run: () => this.startGuided() }, this.humanChip()] });
    }
    this.say('<p>Takk. Jeg har fylt ut <b>' + have + ' av ' + req.length + '</b> felt. Se hvor hver verdi kommer fra:</p>',
      { extras: [this.renderDraft(false)] }).then(() => this.askNext());
  }

  parseInto(d, text, files) {
    const changed = [];
    const set = (k, value, source) => {
      if (!value) return;
      if (d[k].value !== value) changed.push(k);
      d[k] = { value, source: source || 'text' };
    };
    const t = text || '';

    const ref = /(?:kampanje|ref(?:eranse)?\.?)\s*:?\s*(\d{2}\s?\d{2})\b/i.exec(t);
    if (ref) set('ref', ref[1].replace(/(\d{2})\s?(\d{2})/, '$1 $2'));

    const budget = /(\d{1,3}(?:[ .\u00a0]\d{3})+|\d{4,6})\s*(?:kr|kroner|nok|,-)/i.exec(t) ||
      /budsjett\w*\s*:?\s*(?:kr\.?\s*)?(\d[\d .\u00a0]{2,})/i.exec(t);
    if (budget) {
      const n = parseInt(budget[1].replace(/\D/g, ''), 10);
      if (n >= 1000) set('budget', 'kr ' + n.toLocaleString('nb-NO').replace(/[\u00a0\u202f]/g, ' '));
    }

    const link = /(https?:\/\/[^\s,]+|\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}\/[^\s,]+)/i.exec(t);
    if (link) {
      set('link', link[1].replace(/^https?:\/\//, ''));
      const job = this.lookupJob(link[1]);
      set('title', job.title, 'link');
      set('place', job.place, 'link');
      set('deadline', job.deadline, 'link');
    }

    const found = [];
    [['Meta', /\b(meta|facebook|instagram)\b/i], ['LinkedIn', /linkedin/i], ['Programmatisk', /programmatisk/i],
      ['Snapchat', /snapchat/i], ['TikTok', /tiktok/i], ['Nettsteder', /nettsted|aviser/i]]
      .forEach(([name, re]) => { if (re.test(t)) found.push(name); });
    if (found.length) set('channels', found.join(', '));

    if (/snarest|asap/i.test(t)) set('period', 'Snarest til søknadsfrist');

    const prev = /[^\n.]*forhåndsvis[^\n.]*/i.exec(t);
    if (prev) set('preview', /ikke|uten|trenger ikke/i.test(prev[0]) ? 'Nei, publiser direkte' : 'Ja, kunden godkjenner før start');

    const short = /kort tekst\s*:\s*(.+)/i.exec(t);
    if (short && short[1].trim().length <= 125) set('shortText', short[1].trim());

    (files || []).forEach((f) => {
      if (/logo/i.test(f) || this.awaiting === 'logo') set('logo', f);
      else set('images', d.images.source === 'text' && d.images.value !== f ? d.images.value + ', ' + f : f);
    });

    return changed;
  }

  lookupJob(url) {
    const slug = (url.split(/[?#]/)[0].replace(/\/$/, '').split('/').pop() || '').toLowerCase();
    const words = slug.split(/[-_]/).filter(Boolean);
    const last = words[words.length - 1];
    const place = AssistantChat.PLACES[last] || '';
    const titleWords = place ? words.slice(0, -1) : words;
    const title = titleWords.length && /[a-zæøå]/.test(titleWords[0])
      ? titleWords.join(' ').replace(/^./, (c) => c.toUpperCase())
      : '';
    return { title, place, deadline: '20.10.2026' };
  }

  askNext() {
    const d = this.draft;
    const missing = AssistantChat.REQUIRED.filter((k) => d[k].source === 'missing');
    const next = missing[0];
    this.awaiting = next || null;
    const human = this.humanChip();

    if (this.context === 'form' && !this.formOffered && d.title.value && d.place.value && d.deadline.value) {
      this.formOffered = true;
      return this.offerFormFill();
    }

    if (!next) return this.review('<p>Nå er alt på plass. Sjekk utkastet og bestill når du er klar.</p>');

    switch (next) {
      case 'link':
        return this.say('<p>Lim inn lenken til stillingsannonsen. Jeg henter tittel, sted og søknadsfrist derfra.</p>',
          { chips: [{ label: 'Bruk eksempel-lenke', silent: true, run: () => this.prefill('https://jobber.example.no/stilling/intensivsykepleier-tromso') }] });
      case 'title':
        return this.say('<p>Jeg fant ikke stillingstittelen i lenken. Hva heter stillingen?</p>');
      case 'place':
        return this.say('<p>Hvor er arbeidsstedet?</p>');
      case 'deadline':
        return this.say('<p>Når er søknadsfristen? Skriv datoen, for eksempel 20.10.2026.</p>');
      case 'budget':
        return this.say('<p>Hva er totalbudsjettet for kampanjen?</p>',
          { chips: ['15 000 kr', '30 000 kr', '50 000 kr'].map((b) => ({ label: b, run: () => this.handleAwaiting(b, []) })) });
      case 'channels':
        return this.say('<p>Hvilke kanaler skal kampanjen gå i?</p>', {
          chips: [
            { label: 'Meta', run: () => this.fill('channels', 'Meta', 'text') },
            { label: 'Meta og LinkedIn', run: () => this.fill('channels', 'Meta, LinkedIn', 'text') },
            { label: 'La Frantz anbefale', run: () => this.fill('channels', 'Meta, Nettsteder (anbefalt ut fra budsjett)', 'ai') }
          ]
        });
      case 'images':
        return this.say('<p>Jeg ser ingen bilder ennå. Last opp et bilde, eller bruk bildet fra forrige sykepleier-kampanje.</p>', {
          chips: [
            { label: 'Last opp bilde', icon: 'upload', run: () => this.fileInput.click() },
            { label: 'Bruk bildet fra Sykepleier Oslo', run: () => this.fill('images', 'Toppbilde fra #129041', 'ai') }
          ]
        });
      case 'logo':
        return this.say('<p><b>Logoen mangler.</b> Jeg fant logoen fra kampanjen Sykepleier Bodø (#128984). Skal jeg bruke den?</p>', {
          chips: [
            { label: 'Ja, bruk den', run: () => this.fill('logo', 'Logo fra #128984', 'ai') },
            { label: 'Last opp ny logo', icon: 'upload', run: () => this.fileInput.click() },
            human
          ]
        });
      case 'shortText':
        return this.say('<p><b>Kort tekst mangler.</b> Den vises over bildet i feeden, og kan ha maks 125 tegn. Skal jeg skrive tre forslag ut fra stillingsannonsen?</p>', {
          chips: [
            { label: 'Ja, skriv forslag', icon: 'sparkles', run: () => this.suggestShortText() },
            { label: 'Jeg skriver selv', run: () => this.say('<p>Skriv teksten under. Maks 125 tegn.</p>') }
          ]
        });
      case 'preview':
        return this.say('<p>Skal kunden se en forhåndsvisning før kampanjen starter?</p>', {
          chips: [
            { label: 'Ja, kunden skal se den først', run: () => this.fill('preview', 'Ja, kunden godkjenner før start', 'text') },
            { label: 'Nei, publiser direkte', run: () => this.fill('preview', 'Nei, publiser direkte', 'text') }
          ]
        });
    }
  }

  /* ---------- Fill in the form on the page ---------- */

  offerFormFill() {
    const d = this.draft;
    this.awaiting = null;
    return this.say(
      '<p>Jeg har det skjemaet trenger for å komme i gang:</p>' +
      '<ul><li><b>Stilling:</b> ' + this.esc(d.title.value) + '</li>' +
      '<li><b>Arbeidssted:</b> ' + this.esc(d.place.value) + '</li>' +
      '<li><b>Søknadsfrist:</b> ' + this.esc(d.deadline.value) + '</li></ul>' +
      '<p>Skal jeg fylle det inn i skjemaet?</p>',
      { chips: [
        { label: 'Ja, fyll inn skjemaet', icon: 'clipboard-pen', run: () => this.fillForm() },
        { label: 'Nei, fortsett i chatten', run: () => this.askNext() }
      ] }
    );
  }

  fillForm() {
    const d = this.draft;
    document.dispatchEvent(new CustomEvent('assistant:fill', {
      detail: { title: d.title.value, place: d.place.value, deadline: d.deadline.value, budget: d.budget.value, channels: d.channels.value }
    }));
    this.system('Skjemaet er fylt ut');
    return this.say('<p>Ferdig. Sjekk feltene i skjemaet. Du kan endre alt der.</p><p>Vil du fortsette i skjemaet, eller skal jeg ta resten her i chatten?</p>', {
      chips: [
        { label: 'Jeg fortsetter i skjemaet', icon: 'clipboard-pen', run: () => {
          this.mode = null;
          this.say('<p>Greit. Trykk på «Spør Frantz» hvis du trenger meg igjen.</p>')
            .then(() => setTimeout(() => document.dispatchEvent(new CustomEvent('assistant:close')), 900));
        } },
        { label: 'Ta resten i chatten', run: () => this.askNext() }
      ]
    });
  }

  fill(key, value, source) {
    this.draft[key] = { value, source };
    this.awaiting = null;
    this.askNext();
  }

  handleAwaiting(text, files) {
    const k = this.awaiting;
    const d = this.draft;

    if (/rådgiver|menneske/i.test(text)) return this.askHuman();

    if (k === 'link' || k === 'budget') {
      const before = d[k].value;
      this.parseInto(d, text, files);
      if (d[k].value && d[k].value !== before) {
        this.awaiting = null;
        return this.askNext();
      }
      return this.say(k === 'link'
        ? '<p>Det ser ikke ut som en lenke. Lim inn hele adressen til stillingsannonsen.</p>'
        : '<p>Jeg fant ikke et beløp. Skriv for eksempel «30 000 kr».</p>');
    }

    if (k === 'images' || k === 'logo') {
      if (files.length) {
        this.parseInto(d, text, files);
        if (k === 'logo' && d.logo.source === 'missing') d.logo = { value: files[0], source: 'text' };
        this.awaiting = null;
        return this.askNext();
      }
      return this.say('<p>Jeg ser ingen fil. Trykk på binders-knappen for å legge ved filen.</p>');
    }

    if (k === 'shortText') {
      if (text.length > 125) {
        return this.say('<p>Teksten har ' + text.length + ' tegn. Maks er 125. Kan du korte den ned?</p>');
      }
      return this.fill('shortText', text, 'text');
    }

    if (k === 'title' || k === 'place') return this.fill(k, text, 'text');

    if (k === 'deadline') {
      const m = /(\d{1,2})\.(\d{1,2})\.(\d{4})/.exec(text);
      if (!m) return this.say('<p>Skriv datoen slik: 20.10.2026.</p>');
      return this.fill('deadline', m[1].padStart(2, '0') + '.' + m[2].padStart(2, '0') + '.' + m[3], 'text');
    }

    if (k === 'channels' || k === 'preview') {
      this.parseInto(d, text, files);
      if (d[k].source !== 'missing') {
        this.awaiting = null;
        return this.askNext();
      }
      return this.say('<p>Velg et av alternativene over, eller skriv svaret med egne ord.</p>');
    }

    this.awaiting = null;
    return this.askNext();
  }

  suggestShortText() {
    const d = this.draft;
    const title = d.title.value || 'Sykepleier';
    const place = d.place.value || 'Norge';
    const lower = title.charAt(0).toLowerCase() + title.slice(1);
    const deadline = (d.deadline.value || '').slice(0, 6);
    const options = [
      'Vil du jobbe der det virkelig betyr noe? Bli ' + lower + ' i ' + place + ' og få et sterkt fagmiljø rundt deg.',
      title + ' i ' + place + ': faste stillinger, god oppfølging og kollegaer som stiller opp.' + (deadline ? ' Søk innen ' + deadline : ''),
      'Vi søker ' + lower + ' til ' + place + '. Gode vaktordninger og hjelp til å komme i gang. Søk i dag.'
    ].map((s) => (s.length > 125 ? s.slice(0, 124) + '…' : s));

    const list = options.map((s) => '<li>' + this.esc(s) + ' <span style="color:var(--text-faint)">(' + s.length + ' tegn)</span></li>').join('');
    this.say('<p>Her er tre forslag. Alle er under 125 tegn:</p><ol>' + list + '</ol>', {
      chips: options.map((s, i) => ({ label: 'Bruk ' + (i + 1), run: () => this.fill('shortText', s, 'ai') }))
        .concat([{ label: 'Jeg skriver selv', run: () => this.say('<p>Skriv teksten under. Maks 125 tegn.</p>') }])
    });
  }

  renderDraft(final, changed) {
    const d = this.draft;
    if (final && this.orderBtn) {
      this.orderBtn.disabled = true;
      this.orderBtn.textContent = 'Erstattet av nytt utkast';
    }
    const card = this.el('div', 'draft');
    const head = this.el('div', 'draft__head');
    const title = this.el('div', 'draft__title', final ? 'Klar til bestilling' : 'Kampanjeutkast');
    title.append(this.el('span', 'draft__sub', [d.title.value, d.place.value].filter(Boolean).join(' · ') || 'Ny kampanje'));
    const missing = AssistantChat.REQUIRED.filter((k) => d[k].source === 'missing').length;
    const tag = this.el('span', 'source-tag ' + (missing ? 'source-tag--missing' : 'source-tag--text'),
      missing ? missing + ' felt mangler' : 'Alt er fylt ut');
    head.append(title, tag);

    const rows = this.el('div', 'draft__rows');
    AssistantChat.FIELDS.forEach(([k, label]) => {
      const f = d[k];
      if (k === 'ref' && f.source === 'missing') return;
      const row = this.el('div', 'draft__row' + (f.source === 'missing' ? ' draft__row--missing' : '') +
        ((changed || []).includes(k) ? ' draft__row--changed' : ''));
      const [cls, txt] = AssistantChat.SOURCE[f.source];
      row.append(this.el('span', 'draft__label', label), this.el('p', 'draft__value', f.value || '—'), this.el('span', 'source-tag ' + cls, txt));
      rows.append(row);
    });
    card.append(head, rows);

    const foot = this.el('div', 'draft__foot');
    if (final) {
      const order = this.el('button', 'btn btn--accent btn--sm', 'Bestill kampanjen');
      order.type = 'button';
      order.addEventListener('click', () => {
        order.disabled = true;
        this.orderBtn = null;
        this.order();
      });
      this.orderBtn = order;
      foot.append(order, this.el('span', 'draft__note', 'Ingenting publiseres før en rådgiver har sjekket bestillingen.'));
    } else {
      foot.append(this.el('span', 'draft__note', 'Bestill-knappen kommer når alle felt er fylt ut.'));
    }
    card.append(foot);
    return card;
  }

  review(intro, changed) {
    this.mode = 'review';
    this.awaiting = null;
    return this.say(intro + '<p>Vil du endre noe, skriv det med egne ord, for eksempel «budsjett 35 000 kr».</p>',
      { extras: [this.renderDraft(true, changed)] });
  }

  applyEdits(text, files) {
    const labels = Object.fromEntries(AssistantChat.FIELDS);
    const changed = this.parseInto(this.draft, text, files);
    if (!changed.length) {
      const short = /(?:kort tekst|tekst)\s*:?\s*[«"](.+)[»"]/i.exec(text);
      if (short && short[1].length <= 125) {
        this.draft.shortText = { value: short[1], source: 'text' };
        return this.review('<p>Jeg har oppdatert <b>Kort tekst</b>.</p>', ['shortText']);
      }
      return this.say('<p>Jeg skjønte ikke hva du vil endre. Skriv for eksempel «budsjett 35 000 kr» eller «kanaler Meta og LinkedIn».</p>',
        { chips: [this.humanChip()] });
    }
    return this.review('<p>Jeg har oppdatert: <b>' + changed.map((k) => this.esc(labels[k])).join(', ') + '</b>.</p>', changed);
  }

  order() {
    const d = this.draft;
    const subject = '[#' + this.newId + (d.ref.value ? ' · Deres ref. ' + d.ref.value : '') + '] ' + [d.title.value, d.place.value].filter(Boolean).join(' ');
    this.mode = null;
    this.system('Kampanje #' + this.newId + ' er bestilt');
    const note = d.preview.value.startsWith('Ja')
      ? 'Du får en forhåndsvisning til kunden innen 1–2 virkedager.'
      : 'Kampanjen starter innen 1–2 virkedager.';
    const link = this.el('a', 'quick-reply', 'Se e-posttråden');
    link.href = 'epost-visning.html';
    link.prepend(this.icon('mail'));
    this.say(
      '<p>Takk, bestillingen er sendt. En rådgiver sjekker den nå. ' + this.esc(note) + '</p>' +
      '<p>Jeg har laget <b>én tråd</b> for kampanjen. Alle svar fra Frantz kommer her, og i samme e-posttråd med emnet:</p>' +
      '<p><b>' + this.esc(subject) + '</b></p>' +
      '<p>Svarer du på e-posten, havner svaret i tråden.</p>',
      { extras: [link], chips: [{ label: 'Følg opp en annen kampanje', run: () => this.startFollowUp() }, { label: 'Ferdig for nå', run: () => this.say('<p>Ha en fin dag, ' + this.esc(AssistantChat.USER.first) + '!</p>') }] }
    );
  }


  /* ---------- Follow-up ---------- */

  campaignChips() {
    return AssistantChat.CAMPAIGNS.map((c) => ({ label: c.title, run: () => this.openCampaign(c, '') }));
  }

  startFollowUp() {
    this.mode = 'pick';
    this.say('<p>Hvilken kampanje gjelder det? Skriv navnet, kampanje-ID-en eller deres egen referanse, for eksempel «22 31».</p>',
      { chips: this.campaignChips() });
  }

  findCampaigns(text) {
    const digits = text.replace(/\D/g, '');
    const t = text.toLowerCase();
    return AssistantChat.CAMPAIGNS.filter((c) => {
      if (digits.length >= 4 && (c.ref.replace(/\s/g, '') === digits || c.id === digits || c.id.includes(digits))) return true;
      const place = c.title.split(' ').pop().toLowerCase();
      return t.includes(place) || t.includes(c.title.toLowerCase());
    });
  }

  pickFrom(list) {
    this.mode = 'pick';
    this.say('<p>Jeg fant flere kampanjer. Hvilken mener du?</p>',
      { chips: list.map((c) => ({ label: c.title + ' (#' + c.id + ')', run: () => this.openCampaign(c, '') })) });
  }

  renderCampaign(c) {
    const card = this.el('div', 'draft');
    const head = this.el('div', 'draft__head');
    const title = this.el('div', 'draft__title', c.title);
    title.append(this.el('span', 'draft__sub', '#' + c.id + ' · Deres ref. ' + c.ref + ' · ' + c.channels));
    head.append(title, this.el('span', 'badge ' + c.badge, c.status));

    const facts = this.el('dl', 'draft__facts');
    [['Periode', c.day, ''], ['Budsjett brukt', c.spent, 'av ' + c.budget], ['Søknadsklikk', c.clicks, 'mål ' + c.target]]
      .forEach(([k, v, s]) => {
        const f = this.el('div', 'draft__fact');
        const dd = this.el('dd', null, v);
        if (s) dd.append(this.el('small', null, s));
        f.append(this.el('dt', null, k), dd);
        facts.append(f);
      });

    const sum = this.el('div', 'draft__text');
    sum.append(this.el('b', null, 'Kort fortalt: '), document.createTextNode(c.summary));

    const hist = this.el('ol', 'draft__history');
    hist.setAttribute('aria-label', 'Siste hendelser');
    c.history.forEach(([date, what]) => {
      const li = this.el('li');
      li.append(this.el('time', null, date), this.el('span', null, what));
      hist.append(li);
    });
    card.append(head, facts, sum, hist);
    return card;
  }

  followUpChips() {
    return [
      { label: 'Hent rapportlenke', icon: 'file-text', run: () => this.giveLink('report') },
      { label: 'Hent kampanjesiden', icon: 'link', run: () => this.giveLink('landing') },
      { label: 'Be om endring', icon: 'pencil', run: () => this.startChange() },
      this.humanChip()
    ];
  }

  openCampaign(c, t) {
    this.current = c;
    this.mode = 'followup';
    this.misses = 0;
    this.say('<p>Her er status for <b>' + this.esc(c.title) + '</b>:</p>', { extras: [this.renderCampaign(c)] }).then(() => {
      if (/rapport/.test(t)) return this.giveLink('report');
      if (/kampanjeside|landingsside/.test(t)) return this.giveLink('landing');
      if (/endre|bytt/.test(t)) return this.startChange();
      return this.say('<p>Hva trenger du?</p>', { chips: this.followUpChips() });
    });
  }

  giveLink(kind) {
    const c = this.current;
    const report = kind === 'report';
    const url = 'frantz.no/' + (report ? 'r/' : 'k/') + c.id;
    const text = report
      ? '<p>Her er rapportlenken. Tallene oppdateres hele tiden, så du kan sende lenken rett til kunden.</p>'
      : '<p>Her er kampanjesiden kandidatene kommer til.</p>';
    return this.say(text, { extras: [this.linkBox(url)], chips: this.followUpChips().filter((x) => x.label !== (report ? 'Hent rapportlenke' : 'Hent kampanjesiden')) });
  }

  startChange() {
    this.mode = 'change';
    this.say('<p>Hva vil du endre? Skriv det med egne ord. Legg ved filer med binders-knappen.</p>', {
      chips: [{
        label: 'Eksempel: bytt hovedbildet', silent: true,
        run: () => this.prefill('Kan dere bytte hovedbildet til det vedlagte? Kunden vil heller ha et bilde fra sengeposten.', ['nytt-hovedbilde.jpg'])
      }]
    });
  }

  submitChange(text, files) {
    const c = this.current;
    this.mode = null;
    const live = c.status === 'Aktiv';
    this.say(
      '<p>Takk. ' + (live ? 'Kampanjen er aktiv, så en rådgiver gjør endringen.' : 'En rådgiver gjør endringen.') +
      ' Ingenting endres uten at et menneske har sjekket det.</p>' +
      '<p>Jeg har laget en oppgave med det du skrev' + (files.length ? ' og filen du la ved' : '') + '.</p>'
    ).then(() => this.handoff());
  }


  /* ---------- Questions ---------- */

  startAsk() {
    this.mode = 'ask';
    this.say('<p>Hva lurer du på? Her er noen vanlige spørsmål:</p>', {
      chips: [
        { label: 'Hva er forskjellen på Tailored, Autopublish og Frantz AI?', run: () => this.answer('forskjell') },
        { label: 'Hva koster en kampanje?', run: () => this.answer('pris') },
        { label: 'Hvordan leser jeg rapporten?', run: () => this.answer('rapport') }
      ]
    });
  }

  answer(t) {
    if (/forskjell|tailored|autopublish|frantz ai|frans ai/.test(t)) {
      return this.say(
        '<ul>' +
        '<li><b>Tailored:</b> Frantz lager kampanjen for deg med deres egen avsender, bilder og design.</li>' +
        '<li><b>Autopublish:</b> Stillingen publiseres automatisk. Avsender og annonsebilde lages av Frantz.</li>' +
        '<li><b>Frantz AI:</b> AI foreslår målgruppe og strategi ut fra data, og du bestemmer.</li>' +
        '</ul><p>Vil du ha hjelp til å velge, kan jeg koble deg til en rådgiver.</p>',
        { chips: [{ label: 'Lag ny kampanje', run: () => this.startNew() }, this.humanChip()] }
      );
    }
    if (/pris|koster|tilbud/.test(t)) {
      return this.say('<p>Prisen avhenger av budsjett, kanaler og produkt. Jeg gir ikke tilbud selv. En rådgiver kan sende deg et tilbud, vanligvis samme dag.</p>',
        { chips: [{ label: 'Ja, be om tilbud', human: true, icon: 'headset', run: () => this.handoff() }, { label: 'Nei takk', run: () => this.greet() }] });
    }
    if (/rapport|tall|lese/.test(t)) {
      return this.say(
        '<p>Øverst ser du de tre viktigste tallene:</p>' +
        '<ul><li><b>Besøk på siden:</b> hvor mange som åpnet kampanjesiden.</li>' +
        '<li><b>Meldt interesse:</b> hvor mange som la igjen kontaktinfo.</li>' +
        '<li><b>Søknadsklikk:</b> hvor mange som trykket «Søk».</li></ul>' +
        '<p>Resten av rapporten viser hvor pengene er brukt. Det trenger kunden sjelden.</p>',
        { chips: [{ label: 'Følg opp en kampanje', run: () => this.startFollowUp() }] }
      );
    }
    return this.say('<p>Det vet jeg ikke sikkert, og jeg vil ikke gjette. Skal en rådgiver svare deg?</p>',
      { chips: [this.humanChip(), { label: 'Vis valgene igjen', run: () => this.greet() }] });
  }


  /* ---------- Hand-off to a person ---------- */

  askHuman() {
    this.say('<p>Vil du at en rådgiver hos Frantz tar over? De ser hele samtalen, så du slipper å gjenta deg.</p>', {
      chips: [
        { label: 'Ja, send til en rådgiver', human: true, icon: 'headset', run: () => this.handoff() },
        { label: 'Nei, fortsett her', run: () => this.say('<p>Greit. Hva vil du gjøre?</p>', { chips: this.mainChips() }) }
      ]
    });
  }

  handoff() {
    this.mode = null;
    this.awaiting = null;
    const box = this.el('div', 'handoff');
    const ic = this.el('span', 'handoff__icon');
    ic.append(this.icon('headset'));
    const body = this.el('div');
    body.append(
      this.el('b', null, 'Sendt til en rådgiver hos Frantz'),
      document.createTextNode('Vanlig svartid er innen 4 timer på hverdager. Du får svaret her og på e-post, i samme tråd.')
    );
    const a = this.el('a', null, 'Se hvordan rådgiveren ser saken');
    a.href = 'admin-innboks.html';
    body.append(this.el('br'), a);
    box.append(ic, body);
    const session = this.session;
    this.queue = this.queue.then(() => {
      if (session !== this.session) return null;
      this.addMsg('ai', null, [box]);
      return new Promise((r) => setTimeout(r, 2200));
    }).then(() => {
      if (session === this.session) this.system('Jonas fra Frantz er med i samtalen');
    });
  }
}

document.querySelectorAll('.chat[data-assistant]').forEach((el) => { el.assistant = new AssistantChat(el); });
