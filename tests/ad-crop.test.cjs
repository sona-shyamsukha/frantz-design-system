const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const window={};vm.runInNewContext(fs.readFileSync('components/js/ad-crop.js','utf8'),{window});
test('crop values stay within the usable image range',()=>{
 const c=window.FrantzAdCrop.normalise({x:-40,y:130,zoom:6,fit:'invalid'});
 assert.equal(c.x,0);assert.equal(c.y,100);assert.equal(c.zoom,3);assert.equal(c.fit,'auto');
});
test('an untouched image starts centred without zoom',()=>{
 const c=window.FrantzAdCrop.normalise();assert.equal(c.x,50);assert.equal(c.y,50);assert.equal(c.zoom,1);
});
