/* Keep submitted material with its order. Blob storage avoids temporary preview URLs. */
(function (root) {
  'use strict';
  var opening;
  function database() {
    if (!opening) opening = new Promise(function (resolve, reject) {
      var request = indexedDB.open('frantzCampaignMaterialV1', 1);
      request.onupgradeneeded = function () { request.result.createObjectStore('orders', { keyPath: 'id' }); };
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () { opening = null; reject(request.error); };
    });
    return opening;
  }
  async function save(record) {
    var db = await database();
    return new Promise(function (resolve, reject) {
      var tx = db.transaction('orders', 'readwrite');
      tx.objectStore('orders').put(record);
      tx.oncomplete = function () { resolve(record.id); };
      tx.onerror = tx.onabort = function () { reject(tx.error || new Error('Material could not be stored')); };
    });
  }
  async function read(id) {
    var db = await database();
    return new Promise(function (resolve, reject) {
      var tx = db.transaction('orders', 'readonly'), request = tx.objectStore('orders').get(String(id));
      request.onsuccess = function () { resolve(request.result || null); };
      request.onerror = function () { reject(request.error); };
    });
  }
  var mainFile = null, attachments = [];
  function validMain(file) {
    return file && ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'].indexOf(file.type) !== -1 && file.size <= 10 * 1024 * 1024;
  }
  // Capture originals before the creation form clears its file inputs.
  document.addEventListener('change', function (e) {
    if (e.target.id === 'an-bilde-fil' && validMain(e.target.files[0])) mainFile = e.target.files[0];
    if (e.target.id === 'filer') {
      var offset = 0;
      document.querySelectorAll('[data-fjern-fil]').forEach(function (button) { offset = Math.max(offset, Number(button.dataset.fjernFil) + 1); });
      Array.prototype.forEach.call(e.target.files, function (file, i) { attachments[offset + i] = file; });
    }
  }, true);
  document.addEventListener('drop', function (e) {
    if (e.target.closest('#an-slipp') && validMain(e.dataTransfer.files[0])) mainFile = e.dataTransfer.files[0];
  }, true);
  document.addEventListener('click', function (e) {
    if (e.target.closest('#an-fjern, [data-annonse-bilde]')) mainFile = null;
    var remove = e.target.closest('[data-fjern-fil]');
    if (remove) attachments.splice(Number(remove.dataset.fjernFil), 1);
  }, true);
  function snapshot(order, options) {
    var ad = options.ad, hasMaterial = !!(ad.bildeUrl || ad.egetBilde);
    var names = options.files || [];
    var files = names.map(function (name, i) {
      var file = attachments[i];
      return { navn: name, fil: file && file.name === name ? file : null };
    });
    var image = null;
    if (hasMaterial) {
      if (ad.bildeUrl && mainFile) image = { navn: mainFile.name, fil: mainFile, kilde: 'opplastet' };
      else if (!ad.bildeUrl && /^[a-z0-9][a-z0-9._-]*\.(jpe?g|png|webp)$/i.test(ad.bilde)) image = { navn: ad.bilde, sti: '../assets/media/' + ad.bilde, kilde: 'mediebibliotek' };
      else throw new Error('Upload the original image again');
    }
    return {
      id: root.crypto.randomUUID(), ordre: order, innsendt: new Date().toISOString(),
      materiell: {
        kilder: options.sourceFile ? [{ navn: options.sourceFile.name, fil: options.sourceFile, kilde: 'stillingsgrunnlag' }] : [],
        logo: ad.logoFil ? { navn: ad.logoFil.name, fil: ad.logoFil, kilde: 'egen-logo' } : null,
        crop: ad.crop ? Object.assign({}, ad.crop) : null, template: ad.template || '', modus: options.mode, designbrief: options.brief || '', bilde: image, filer: files,
        tittel: ad.tittel || '', tekst: ad.tekst || '', knapp: ad.knapp || 'Søk nå',
        ferdig: !!ad.erFerdig, video: !!ad.video, avsender: options.sender || '',
        kanaler: options.channels.slice(), utseende: Object.assign({}, ad.utseende),
        utsnitt: options.position || '50% 50%'
      }
    };
  }
  root.FrantzCampaignMaterial = { save: save, read: read, snapshot: snapshot };
})(window);
