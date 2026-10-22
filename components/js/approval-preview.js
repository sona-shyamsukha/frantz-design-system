/* Render the frozen creative snapshot, using the same composition, logo and crop as the editor. */
(function (root) {
  'use strict';
  function el(tag, className, text) {
    var item = document.createElement(tag); if (className) item.className = className; if (text) item.textContent = text; return item;
  }
  function channels(names) {
    var formats = { Meta: [['facebook', 'Facebook · feed', '4 / 5'], ['instagram', 'Instagram · feed', '4 / 5'], ['story', 'Instagram · story', '9 / 16']], LinkedIn: [['linkedin', 'LinkedIn · feed', '1 / 1']], 'Nettsteder og aviser': [['nettsteder', 'Nettsteder og aviser', '1 / 1']], Snapchat: [['snapchat', 'Snapchat · story', '9 / 16']], TikTok: [['tiktok', 'TikTok · feed', '9 / 16']] };
    return (names || []).filter(function (name) { return formats[name]; }).map(function (name) { return { name: name, formats: formats[name] }; });
  }
  function mount(host, content) {
    if (host._cleanup) host._cleanup();
    host.replaceChildren();
    if (content.ads && content.ads.length) {
      var previews = [];
      content.ads.forEach(function (ad, index) {
        var section = el('section', 'approval-ad-item'), heading = el('h3', 'approval-ad-name', (index + 1) + '. ' + ad.name), preview = el('div', 'approval-preview');
        section.append(heading, el('p', 'form-hint', ad.type + ' · ' + ad.channel), preview); host.append(section);
        mount(preview, { title: content.title, employer: content.employer, channels: [ad.channel], material: ad.material });
        previews.push(preview);
      });
      host._cleanup = function () { previews.forEach(function (preview) { if (preview._cleanup) preview._cleanup(); }); };
      return true;
    }
    var material = content.material, urls = [], selections = channels(content.channels), sender = material && material.avsender || content.employer || 'Arbeidsgiver';
    function source(item) {
      if (!item) return '';
      if (item.fil instanceof Blob) { var url = URL.createObjectURL(item.fil); urls.push(url); return url; }
      return /^\.\.\/assets\/media\/[a-z0-9][a-z0-9._-]*\.(jpe?g|png|webp)$/i.test(item.sti || '') ? item.sti : '';
    }
    host._cleanup = function () { urls.forEach(function (url) { URL.revokeObjectURL(url); }); };
    if (!material || material.modus === 'hjelp' || (!material.bilde && !material.demoOnly)) {
      host.appendChild(el('p', 'approval-empty', material && material.modus === 'hjelp' ? 'Frantz skal lage annonsedesignet. Ferdige forhåndsvisninger kommer i en egen godkjenningsrunde før publisering.' : 'Det er ikke lagt ved noe annonsemateriell til denne forespørselen.'));
      return false;
    }
    var imageUrl = source(material.bilde), logoUrl = source(material.logo);
    if ((!imageUrl && !material.demoOnly) || !selections.length) { host.appendChild(el('p', 'approval-empty', 'Forhåndsvisningen er ikke tilgjengelig. Be avsenderen legge ved materiellet på nytt.')); return false; }
    var nav = el('div', 'approval-channels'); nav.setAttribute('role', 'group'); nav.setAttribute('aria-label', 'Velg annonsekanal');
    var label = el('label', 'form-label', 'Plassering og format'), select = el('select', 'form-input');
    select.id = 'approval-format-' + root.crypto.randomUUID(); label.htmlFor = select.id;
    var placement = el('div', 'approval-placement'); placement.append(label, select);
    var article = el('article', 'ad-preview approval-ad');
    var header = el('header', 'ad-preview__topp'), avatar = el('span', 'ad-preview__avatar', sender.charAt(0).toUpperCase()), account = el('div');
    avatar.setAttribute('aria-hidden', 'true'); account.append(el('b', '', sender), el('small', '', 'Sponset')); header.append(avatar, account);
    var copy = el('p', 'ad-preview__tekst', material.tekst); copy.hidden = !material.tekst;
    var creative = el('div', 'ad-preview__kreativ ad-composition'), logo = el('div', 'ad-preview__logo'), title = el('h3', 'ad-preview__tittel', material.tittel), image = el('div', 'ad-preview__bilde'), fileImage = el('img', 'approval-file'), video = el('video', 'approval-file');
    image.setAttribute('role', 'img'); image.setAttribute('aria-label', material.bilde && material.bilde.navn || 'Bildet i annonsen');
    logo.dataset.mark = sender.charAt(0).toUpperCase(); root.FrantzAdLogo.render(logo, sender, logoUrl);
    var appearance = material.utseende || {}, templated = !material.ferdig && !!material.template;
    creative.dataset.template = material.ferdig ? '' : material.template || '';
    var background = templated ? appearance.bakgrunner && appearance.bakgrunner[material.template] || (material.template === 'frame' ? 'var(--surface-section)' : 'var(--color-navy)') : appearance.bg || 'var(--color-coral-wash)';
    creative.style.setProperty('--pv-bg', background);
    creative.style.setProperty('--pv-tekst', templated && !background.startsWith('var(') ? root.FrantzAdColors.textFor(background) : appearance.tekst || 'var(--color-navy)');
    title.hidden = material.ferdig || !material.tittel; logo.hidden = material.ferdig || appearance.logo === false;
    image.hidden = material.ferdig; fileImage.hidden = !material.ferdig || material.video; video.hidden = !material.video;
    creative.classList.toggle('approval-creative--file', !!material.ferdig);
    if (material.video) { video.src = imageUrl; video.controls = true; video.playsInline = true; video.preload = 'metadata'; video.setAttribute('aria-label', 'Videoannonsen som skal godkjennes'); }
    else if (material.ferdig) { fileImage.src = imageUrl; fileImage.alt = 'Annonsefilen som er lagt ved forespørselen'; }
    else if (!material.demoOnly) { image.style.backgroundImage = 'url("' + imageUrl + '")'; image.style.setProperty('--pv-pos', material.utsnitt || '50% 50%'); }
    creative.append(logo, title, image, fileImage, video);
    if (material.demoOnly) {
      logo.hidden = true; image.hidden = true;
      creative.classList.add('approval-demo-creative');
      var icon = el('span', 'icon-lucide icon-lucide--lg icon-lucide--' + (material.demoType === 'Video' ? 'play' : 'image'));
      icon.setAttribute('aria-hidden', 'true'); creative.prepend(icon);
    }
    if (material.crop && !material.video) root.FrantzAdCrop.apply(image, fileImage, material.crop, material.ferdig);
    var footer = el('footer', 'ad-preview__bunn'), destination = el('div'); destination.append(el('small', '', 'Ledig stilling'), el('b', '', content.title)); footer.append(destination, el('span', 'ad-preview__cta', material.knapp || 'Søk nå'));
    article.append(header, copy, creative, footer); nav.hidden = selections.length === 1; host.append(nav, placement, article);
    if (material.demoOnly) host.append(el('p', 'form-hint approval-demo-note', material.demoType === 'Video' ? 'Videoeksempel fra kampanjen. Prototypen har ikke en avspillbar videofil.' : 'Samme eksempelvisning som «Se annonsen» i kampanjen.'));
    function chooseFormat() {
      var selected = selections.filter(function (item) { return item.name === nav.dataset.channel; })[0];
      var format = selected.formats.filter(function (item) { return item[0] === select.value; })[0] || selected.formats[0];
      article.dataset.plattform = format[0]; article.setAttribute('aria-label', 'Forhåndsvisning av annonsen: ' + format[1]);
      creative.style.aspectRatio = material.demoOnly && format[0] !== 'story' ? (material.demoType === 'Video' ? '4 / 5' : '1 / 1') : format[2];
      // The artwork fills each placement; preserve the saved crop within that area.
      if (material.crop && !material.video) root.FrantzAdCrop.apply(image, fileImage, material.crop, material.ferdig);
    }
    function chooseChannel(choice) {
      if (nav.dataset.channel === choice.name) return;
      nav.dataset.channel = choice.name;
      nav.querySelectorAll('button').forEach(function (button) { button.setAttribute('aria-pressed', String(button.textContent === choice.name)); });
      select.replaceChildren(); choice.formats.forEach(function (format) { var option = el('option', '', format[1]); option.value = format[0]; select.append(option); });
      placement.hidden = choice.formats.length === 1; chooseFormat();
    }
    selections.forEach(function (choice) { var button = el('button', 'filter', choice.name); button.type = 'button'; button.addEventListener('click', function () { chooseChannel(choice); }); nav.append(button); });
    select.addEventListener('change', chooseFormat); chooseChannel(selections[0]);
    return true;
  }
  root.FrantzApprovalPreview = { mount: mount, channels: channels };
})(window);
