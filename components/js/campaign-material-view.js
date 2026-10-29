/* Read-only view of material submitted with an order. Never substitutes demo artwork. */
(function (root) {
  'use strict';
  var urls = [];
  function $(id) { return document.getElementById(id); }
  function source(item) {
    if (item.fil instanceof Blob) { var url = URL.createObjectURL(item.fil); urls.push(url); return url; }
    return /^\.\.\/assets\/media\/[a-z0-9][a-z0-9._-]*\.(jpe?g|png|webp)$/i.test(item.sti || '') ? item.sti : '';
  }
  function platforms(channels) {
    var all = [];
    if (channels.indexOf('Meta') !== -1) all.push(['facebook', 'Facebook'], ['instagram', 'Instagram']);
    if (channels.indexOf('LinkedIn') !== -1) all.push(['linkedin', 'LinkedIn']);
    if (channels.indexOf('Nettsteder og aviser') !== -1) all.push(['nettsteder', 'Nettsteder og aviser']);
    return all.length ? all : [['facebook', 'Facebook']];
  }
  function showText(id, value) { $(id).textContent = value || ''; $(id).parentElement.hidden = !value; }
  function fileRow(item, url) {
    var li = document.createElement('li'), info = document.createElement('div');
    var title = document.createElement('b'); title.textContent = item.navn || 'Fil'; info.appendChild(title);
    var meta = document.createElement('span'); meta.className = 'material-file__meta';
    meta.textContent = !url ? 'Filen er ikke tilgjengelig' : item.kilde === 'mediebibliotek' ? 'Fra mediebiblioteket' : item.fil ? (item.fil.size < 1024 * 1024 ? Math.max(1, Math.round(item.fil.size / 1024)) + ' KB' : (item.fil.size / (1024 * 1024)).toLocaleString('nb-NO', { maximumFractionDigits: 1 }) + ' MB') : 'Innsendt fil';
    info.appendChild(meta); li.appendChild(info);
    if (url) {
      var actions = document.createElement('div'); actions.className = 'material-file__actions';
      var type = item.fil ? item.fil.type : 'image/jpeg';
      if (['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'application/pdf'].indexOf(type) !== -1) {
        var open = document.createElement('a'); open.className = 'link'; open.href = url; open.target = '_blank'; open.rel = 'noopener'; open.textContent = 'Åpne'; open.setAttribute('aria-label', 'Åpne ' + item.navn + ' i ny fane'); actions.appendChild(open);
      }
      var download = document.createElement('a'); download.className = 'link'; download.href = url; download.download = item.navn || 'materiell'; download.textContent = 'Last ned'; download.setAttribute('aria-label', 'Last ned ' + item.navn); actions.appendChild(download);
      li.appendChild(actions);
    }
    return li;
  }
  function render(record) {
    $('material-loading').hidden = true;
    var material = record && record.materiell;
    $('material-empty').hidden = !!material;
    $('submitted-material').hidden = !material;
    if (!material) return;
    var paid = material.modus === 'hjelp';
    if (root.FrantzBrand && material.brandFonts) Object.keys(material.brandFonts).forEach(async function (slot) {
      if (!material.brandFonts[slot]) return;
      try { var family = await root.FrantzBrand.loadFont(material.brandFonts[slot], 'campaign-' + slot); $(slot === 'heading' ? 'submitted-title' : 'submitted-over-text').style.fontFamily = family; } catch (error) { /* The original font remains downloadable in storage; use token defaults for preview. */ }
    });
    $('material-status').textContent = paid ? 'Designforespørsel til Frantz' : record.materialEditedAt ? 'Oppdatert materiell' : 'Innsendt ved bestilling';
    $('material-explanation').textContent = paid ? 'Frantz bekrefter estimert designkostnad med dere før designarbeidet starter. Her ser dere grunnlaget for designet.' : 'Dette er gjeldende utkast og tilhørende filer. Forhåndsvisningen er ikke en godkjent, publisert annonse.';
    showText('material-brief', paid ? material.designbrief : '');
    showText('material-image-text', material.tittel);
    showText('material-ad-text', material.tekst);
    var image = material.bilde, imageUrl = image ? source(image) : '';
    var showPreview = !paid && !!imageUrl;
    $('submitted-preview').hidden = !showPreview;
    $('material-files').replaceChildren();
    if (image) $('material-files').appendChild(fileRow(image, imageUrl));
    var logoUrl = material.logo ? source(material.logo) : '';
    if (material.logo) $('material-files').appendChild(fileRow(material.logo, logoUrl));
    (material.filer || []).forEach(function (file) { $('material-files').appendChild(fileRow(file, source(file))); });
    $('material-files-block').hidden = !$('material-files').children.length;
    $('material-source-files').replaceChildren();
    (material.kilder || []).forEach(function (file) { $('material-source-files').appendChild(fileRow(file, source(file))); });
    $('material-sources-block').hidden = !$('material-source-files').children.length;
    if (paid && !image && !material.logo && !(material.filer || []).length && !material.designbrief) {
      $('material-explanation').textContent = 'Design er forespurt uten vedlegg. Frantz avklarer grunnlag og estimert kostnad med dere før arbeidet starter.';
    }
    if (!showPreview) return;
    var sender = material.avsender || 'Arbeidsgiver';
    $('submitted-sender').textContent = sender; $('submitted-avatar').textContent = sender.charAt(0).toUpperCase();
    var accountIcon = material.brandIcon instanceof Blob ? source({ fil: material.brandIcon }) : '';
    $('submitted-avatar').style.backgroundImage = accountIcon ? 'url("' + accountIcon + '")' : '';
    $('submitted-avatar').style.backgroundSize = 'cover';
    if (accountIcon) $('submitted-avatar').textContent = '';
    $('submitted-over-text').textContent = material.tekst || ''; $('submitted-over-text').hidden = !material.tekst;
    FrantzAdLogo.render($('submitted-logo'), sender, logoUrl); $('submitted-title').textContent = material.tittel || '';
    $('submitted-title').hidden = !material.tittel || material.ferdig;
    $('submitted-logo').hidden = material.ferdig || material.utseende.logo === false;
    $('submitted-job').textContent = record.ordre.stilling || '';
    $('submitted-cta').textContent = material.knapp || 'Søk nå';
    $('submitted-link').textContent = 'frantz.no';
    var creative = $('submitted-creative');
    creative.classList.add('ad-composition');
    creative.dataset.template = material.ferdig ? '' : (material.template || '');
    $('submitted-logo').dataset.mark = sender.charAt(0).toUpperCase();
    var templated = !material.ferdig && !!material.template;
    var savedBackground = material.utseende.bakgrunner && material.utseende.bakgrunner[material.template];
    var background = templated ? savedBackground || (material.template === 'frame' ? '#ecefe9' : '#174c50') : material.utseende.bg || '';
    creative.style.setProperty('--pv-bg', background);
    creative.style.setProperty('--pv-tekst', templated ? FrantzAdColors.textFor(background) : material.utseende.tekst || '');
    creative.classList.toggle('submitted-creative--finished', !!material.ferdig);
    $('submitted-image').hidden = !!material.ferdig;
    if (!material.ferdig) {
      $('submitted-image').style.backgroundImage = 'url("' + imageUrl + '")';
      $('submitted-image').style.setProperty('--pv-pos', material.utsnitt || '50% 50%');
    }
    $('submitted-file-image').hidden = !material.ferdig || material.video;
    $('submitted-video').hidden = !material.video;
    if (material.video) $('submitted-video').src = imageUrl;
    else if (material.ferdig) { $('submitted-file-image').src = imageUrl; $('submitted-file-image').alt = 'Ferdig annonse sendt inn ved bestilling'; }
    if (material.crop && !material.video) FrantzAdCrop.apply($('submitted-image'), $('submitted-file-image'), material.crop, material.ferdig);
    var choices = platforms(material.kanaler || []);
    function choose(platform) {
      $('submitted-ad').dataset.plattform = platform;
      creative.style.aspectRatio = platform === 'linkedin' || platform === 'nettsteder' ? '1 / 1' : '4 / 5';
      $('submitted-ad').setAttribute('aria-label', 'Innsendt annonse på ' + choices.filter(function (x) { return x[0] === platform; })[0][1]);
      $('submitted-platforms').querySelectorAll('button').forEach(function (button) { button.setAttribute('aria-pressed', String(button.dataset.platform === platform)); });
    }
    $('submitted-platforms').replaceChildren();
    choices.forEach(function (choice) {
      var button = document.createElement('button'); button.type = 'button'; button.className = 'filter'; button.dataset.platform = choice[0]; button.textContent = choice[1];
      button.addEventListener('click', function () { choose(choice[0]); }); $('submitted-platforms').appendChild(button);
    });
    choose(choices[0][0]);
  }
  root.addEventListener('pagehide', function (e) { if (!e.persisted) urls.forEach(function (url) { URL.revokeObjectURL(url); }); });
  root.FrantzCampaignMaterialView = { render: render };
})(window);
