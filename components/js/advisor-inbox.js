/* Advisor inbox — demo behaviour: approve the AI draft, take over, hand back to AI. */

class AdvisorInbox {
  constructor(root) {
    this.root = root;
    this.thread = root.querySelector('.case__thread');
    this.reply = root.querySelector('.reply__input');
    this.sendBtn = root.querySelector('[data-action="send"]');
    this.takeBtn = root.querySelector('[data-action="take-over"]');
    this.notice = root.querySelector('[data-notice]');
    this.replyHead = root.querySelector('.reply__head span:last-child');
    this.states = root.querySelectorAll('[data-state]');
    this.human = false;
    this.bindEvents();
  }

  bindEvents() {
    this.sendBtn.addEventListener('click', () => this.send());
    this.takeBtn.addEventListener('click', () => this.toggleTakeOver());
    this.reply.addEventListener('input', () => {
      if (!this.human) this.replyHead.textContent = 'Utkast fra AI · redigert av deg';
    });
  }

  setState(cls, label) {
    this.states.forEach((s) => {
      s.className = 'inbox__state ' + cls;
      s.textContent = label;
    });
  }

  toggleTakeOver() {
    this.human = !this.human;
    this.takeBtn.replaceChildren();
    const icon = document.createElement('span');
    icon.className = 'icon-lucide icon-lucide--' + (this.human ? 'sparkles' : 'headset');
    icon.setAttribute('aria-hidden', 'true');
    this.takeBtn.append(icon, document.createTextNode(this.human ? 'Gi tilbake til AI' : 'Ta over samtalen'));
    this.replyHead.textContent = this.human ? 'Du skriver selv · AI svarer ikke kunden nå' : 'Utkast fra AI';
    this.showNotice(this.human
      ? 'Du har tatt over. Assistenten svarer ikke kunden før du gir saken tilbake.'
      : 'Saken er gitt tilbake til assistenten. Den svarer kunden på enkle spørsmål igjen.', 'info');
  }

  showNotice(text, kind) {
    this.notice.className = 'alert alert--' + kind;
    this.notice.querySelector('.alert__body').textContent = text;
    this.notice.hidden = false;
  }

  send() {
    const text = this.reply.value.trim();
    if (!text) {
      this.showNotice('Skriv et svar før du sender.', 'error');
      this.reply.focus();
      return;
    }
    const msg = document.createElement('div');
    msg.className = 'msg msg--advisor';
    const av = document.createElement('span');
    av.className = 'msg__avatar';
    const ic = document.createElement('span');
    ic.className = 'icon-lucide icon-lucide--headset';
    ic.setAttribute('aria-hidden', 'true');
    av.append(ic);
    const body = document.createElement('div');
    body.className = 'msg__body';
    const meta = document.createElement('span');
    meta.className = 'msg__meta';
    meta.textContent = 'Jonas · rådgiver hos Frantz · nå';
    const bubble = document.createElement('div');
    bubble.className = 'msg__bubble';
    bubble.style.whiteSpace = 'pre-line';
    bubble.textContent = text;
    body.append(meta, bubble);
    msg.append(av, body);
    this.thread.append(msg);

    this.reply.value = '';
    this.reply.disabled = true;
    this.sendBtn.disabled = true;
    this.setState('inbox__state--customer', 'Venter på kunde');
    this.showNotice('Svaret er sendt i kampanjetråden og som svar i Karis e-posttråd «[#129041 · Deres ref. 22 31] Sykepleier Oslo».', 'success');
    const pane = this.root.querySelector('.case');
    pane.scrollTo({ top: Math.max(0, msg.offsetTop - 120), behavior: 'smooth' });
  }
}

document.querySelectorAll('[data-advisor-inbox]').forEach((el) => new AdvisorInbox(el));
