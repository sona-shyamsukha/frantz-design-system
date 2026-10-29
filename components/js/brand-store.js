/* Company defaults and original brand files. Campaigns copy these so later edits cannot change old ads. */
(function (root) {
  'use strict';
  var opening;
  function database() {
    if (!opening) opening = new Promise(function (resolve, reject) {
      var request = indexedDB.open('frantzBrandV1', 1);
      request.onupgradeneeded = function () { request.result.createObjectStore('profiles', { keyPath: 'id' }); };
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () { opening = null; reject(request.error); };
    });
    return opening;
  }
  async function read() {
    var db = await database();
    return new Promise(function (resolve, reject) {
      var request = db.transaction('profiles', 'readonly').objectStore('profiles').get('company');
      request.onsuccess = function () { resolve(request.result || null); };
      request.onerror = function () { reject(request.error); };
    });
  }
  async function save(profile) {
    var db = await database();
    return new Promise(function (resolve, reject) {
      var tx = db.transaction('profiles', 'readwrite');
      tx.objectStore('profiles').put(Object.assign({}, profile, { id: 'company' }));
      tx.oncomplete = function () { resolve(); };
      tx.onerror = tx.onabort = function () { reject(tx.error || new Error('brand-storage')); };
    });
  }
  async function loadFont(file, slot) {
    if (!file) return '';
    var family = 'FrantzBrand-' + slot.replace(/[^a-z0-9-]/gi, '');
    var face = await new FontFace(family, await file.arrayBuffer()).load();
    document.fonts.add(face);
    return '"' + family + '", sans-serif';
  }
  root.FrantzBrand = Object.freeze({ read: read, save: save, loadFont: loadFont });
})(window);
