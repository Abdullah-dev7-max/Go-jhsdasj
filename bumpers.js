// Load categories dynamically from CMS
function loadCategoriesFromCMS() {
  const stored = localStorage.getItem('bumpers_categories');
  return stored ? JSON.parse(stored) : [];
}

function getCategoriesForPage(page) {
  const cats = loadCategoriesFromCMS();
  return cats.filter(c => c.page === page).map(c => c.name);
}

function getCategoryImages() {
  const cats = loadCategoriesFromCMS();
  const images = {};
  cats.forEach(c => {
    if (c.image) {
      images[c.name] = c.image;
    }
  });
  return images;
}

// Initialize with dynamic categories from CMS
let BROWSE_CATS = getCategoriesForPage('browse');
let SKINS_CATS = getCategoriesForPage('skins');
let CARDS_CATS = getCategoriesForPage('cards');

const BROWSE_CAT_IMAGES = getCategoryImages();
const SKINS_CAT_IMAGES = getCategoryImages();
const CARDS_CAT_IMAGES = getCategoryImages();

// Fallback to defaults if no categories exist in CMS
if (!BROWSE_CATS.length) {
  BROWSE_CATS = ['Babar Azam','Imran Khan','Cricket','Football','Anime','Super Heros','Holographic','Gaming','Car & Bikes','Tech & Coding','Cute','Motivation','DARK HUMOUR','Custom Name','Memes','Islamic','Cartoons','Emojis','Birthday','Text Book','Messages','Sports'];
}
if (!SKINS_CATS.length) {
  SKINS_CATS = ['ATM Cards','KEYBOARD','Mouse','Laptop','PC'];
}
if (!CARDS_CATS.length) {
  CARDS_CATS = ['Islamic Cards','Eidi Cards','Birthday Cards','Valentine Cards','Anniversary Cards','Bro Cards'];
}

const DEF=[];

function getProds(){
  const s=localStorage.getItem('bumpers_products');
  const all=s?JSON.parse(s):DEF;
  return all.filter(p=>p.active!==false);
}
function getPromos(){
  const s=localStorage.getItem('bumpers_promos');
  if(!s)return{'BUMPERS10':0.10,'STICK20':0.20,'LAUNCH15':0.15};
  const arr=JSON.parse(s);
  const map={};arr.filter(p=>p.active).forEach(p=>map[p.code]=p.discount);
  return map;
}

let cart=JSON.parse(localStorage.getItem('bumpers_cart')||'[]');
let wl=JSON.parse(localStorage.getItem('bumpers_wl')||'[]');
let disc=0;

function saveCart(){localStorage.setItem('bumpers_cart',JSON.stringify(cart));updBadges();}
function saveWL(){localStorage.setItem('bumpers_wl',JSON.stringify(wl));updBadges();}

function updBadges(){
  const ct=cart.reduce((s,i)=>s+i.qty,0);
  const cb=document.getElementById('cart-b');
  cb.textContent=ct;
  if(ct>0){cb.style.display='flex';cb.classList.remove('bmp');setTimeout(()=>cb.classList.add('bmp'),10);setTimeout(()=>cb.classList.remove('bmp'),310);}
  else cb.style.display='none';
  const wb=document.getElementById('wl-b');
  wb.textContent=wl.length;wb.style.display=wl.length?'flex':'none';
}

function addToCart(id,size,qty=1){
  const P=getProds();const p=P.find(x=>x.id===id);if(!p)return;
  const ex=cart.find(i=>i.id===id&&i.size===size);
  if(ex)ex.qty+=qty;else cart.push({id,name:p.name,emoji:p.emoji,image:p.image,price:p.price,size,qty,cat:p.cat});
  saveCart();showCartNotify(`${p.name} added!`);
}

function toggleWL(id){
  const P=getProds();const p=P.find(x=>x.id===id);
  const i=wl.indexOf(id);
  if(i>-1){wl.splice(i,1);showToast('Removed from wishlist');}
  else{wl.push(id);showToast(`${p?.name||'Item'} saved ♥`);}
  saveWL();
  document.querySelectorAll(`.wbtn[data-id="${id}"]`).forEach(b=>{b.classList.toggle('liked',wl.includes(id));b.textContent=wl.includes(id)?'♥':'♡';});
}

let tT;
let cNT;
function showToast(msg){const t=document.getElementById('toast');document.getElementById('tmsg').textContent=msg;t.classList.add('show');clearTimeout(tT);tT=setTimeout(()=>t.classList.remove('show'),3000);}

function showCartNotify(msg){const cn=document.getElementById('cart-notify');document.getElementById('cart-msg').textContent=msg;cn.classList.add('show');clearTimeout(cNT);cNT=setTimeout(()=>cn.classList.remove('show'),4000);}

function closeCN(){const cn=document.getElementById('cart-notify');cn.classList.remove('show');clearTimeout(cNT);}

function card(p){
  const inWL=wl.includes(p.id);
  const sl=p.stock>20?`<span style="color:var(--neon);font-family:'JetBrains Mono',monospace;font-size:.58rem;">✓ IN STOCK</span>`:p.stock>0?`<span style="color:#f59e0b;font-family:'JetBrains Mono',monospace;font-size:.58rem;">⚠ LOW (${p.stock})</span>`:`<span style="color:var(--pink);font-family:'JetBrains Mono',monospace;font-size:.58rem;">✕ SOLD OUT</span>`;
  return `<div class="pc" onclick="openMdl('${p.id}')">
    ${p.badge?`<div style="position:absolute;top:.55rem;left:.55rem;z-index:5;font-family:'JetBrains Mono',monospace;font-size:.58rem;letter-spacing:.1em;padding:.2rem .5rem;border:1px solid ${p.badgeColor};color:${p.badgeColor};background:rgba(6,6,14,.85);">${p.badge}</div>`:''}
    <button class="wbtn ${inWL?'liked':''}" data-id="${p.id}" onclick="event.stopPropagation();toggleWL('${p.id}')">${inWL?'♥':'♡'}</button>
    <div class="iw">${p.image?`<img src="${p.image}" alt="${p.name}" loading="lazy"/>`:`<span class="ep">${p.emoji}</span>`}</div>
    <div style="padding:.85rem;">
      <div class="fm" style="font-size:.58rem;letter-spacing:.1em;color:var(--dim);margin-bottom:.2rem;">${(p.tag||'').toUpperCase()}</div>
      <div class="fa" style="font-size:.95rem;letter-spacing:.04em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.name}</div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:.5rem;">
        <div><div class="fm neon" style="font-size:.88rem;">$${p.price.toFixed(2)}</div><div style="margin-top:.15rem;">${sl}</div></div>
        <button onclick="event.stopPropagation();addToCart('${p.id}','${(p.sizes||[])[0]||''}')" class="btn-n" style="padding:.38rem .75rem;font-size:.65rem;${p.stock===0?'opacity:.4;pointer-events:none;':''}">${p.stock===0?'SOLD OUT':'+ ADD'}</button>
      </div>
    </div>
  </div>`;
}

function renderCategorySelector(cat,contId){
  let categories=[],title='',imageMap={};
  if(cat==='browse'){categories=BROWSE_CATS;imageMap=BROWSE_CAT_IMAGES;title='BROWSE <span style="color:var(--blue)">STICKERS</span>';}
  else if(cat==='skins'){categories=SKINS_CATS;imageMap=SKINS_CAT_IMAGES;title='SKINS <span class="neon">STICKERS</span>';}
  else if(cat==='cards'){categories=CARDS_CATS;imageMap=CARDS_CAT_IMAGES;title='CARDS <span class="neon">&amp; GREETINGS</span>';}
  
  document.getElementById(contId).innerHTML=`
    <div style="padding-top:1rem;padding-bottom:2rem;">
      <div class="st">Select Category</div><h1 class="stitle">${title}</h1>
      <p style="color:var(--neon);margin-top:1rem;font-size:0.85rem;line-height:1.6;text-align:center;max-width:600px;margin-left:auto;margin-right:auto;font-family:'JetBrains Mono',monospace;letter-spacing:0.1em;font-weight:500;">EXPLORE OUR PREMIUM STICKER COLLECTION</p>
    </div>
    <div class="category-grid">
      ${categories.map((subcat,idx)=>`
        <button onclick="renderShopBySubcat('${cat}','${subcat}')" class="cat-card" style="animation-delay:${idx*0.08}s">
          <div class="cat-circle">
            <div class="cat-image">
              <img src="${imageMap[subcat]||'../images/placeholder.jpg'}" alt="${subcat}" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23222%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23666%22 font-family=%22Arial%22%3E📁%3C/text%3E%3C/svg%3E'"/>
            </div>
            <div class="cat-overlay"></div>
          </div>
          <div class="cat-info">
            <h3 class="cat-name">${subcat}</h3>
            <p class="cat-count"><span id="count-${subcat.replace(/ /g,'-')}">${getProds().filter(p=>p.cat===cat&&p.subcat===subcat).length}</span> items</p>
          </div>
        </button>
      `).join('')}
    </div>`;
}

function renderShopBySubcat(cat,subcat){
  const P=getProds();const prods=P.filter(p=>p.cat===cat&&p.subcat===subcat);
  const tags=['all',...new Set(prods.map(p=>p.tag).filter(Boolean))];
  let title='';
  if(cat==='browse')title=`BROWSE <span style="color:var(--blue)">${subcat}</span>`;
  else if(cat==='skins')title=`SKINS <span class="neon">${subcat}</span>`;
  else if(cat==='cards')title=`CARDS <span class="neon">${subcat}</span>`;
  
  const contId=`shop-${cat}`;
  document.getElementById(contId).innerHTML=`
    <div style="padding-top:1rem;padding-bottom:1.5rem;">
      <button onclick="renderCategorySelector('${cat}','${contId}')" style="background:none;border:none;color:var(--neon);cursor:pointer;font-size:.9rem;margin-bottom:.8rem;">← Back to Categories</button>
      <div class="st">Category</div><h1 class="stitle">${title}</h1>
      <p style="color:var(--dim);margin-top:.4rem;font-size:1rem;">${prods.length} stickers available</p>
    </div>
    <div class="flex flex-wrap items-center gap-3 mb-5">
      <div class="flex flex-wrap gap-2" id="ft-${cat}-${subcat}">${tags.map(t=>`<button class="sb ${t==='all'?'on':''}" onclick="filterShop('${cat}','${subcat}','${t}',this)">${t.toUpperCase()}</button>`).join('')}</div>
      <select class="sdrop" style="margin-left:auto;" onchange="sortShop('${cat}','${subcat}',this.value)">
        <option value="default">Sort: Default</option><option value="price-asc">Price Low→High</option>
        <option value="price-desc">Price High→Low</option><option value="name">Name A→Z</option><option value="rating">Top Rated</option>
      </select>
    </div>
    <div style="position:relative;margin-bottom:1.5rem;">
      <svg style="position:absolute;left:.9rem;top:50%;transform:translateY(-50%);opacity:.3;" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input type="text" class="si" placeholder="Search in ${subcat}..." oninput="searchCat('${cat}','${subcat}',this.value)"/>
    </div>
    <div id="grid-${cat}-${subcat}" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      ${prods.length?prods.map(card).join(''):`<div style="grid-column:1/-1;text-align:center;padding:4rem;color:var(--dim);font-family:'JetBrains Mono',monospace;font-size:.8rem;">NO PRODUCTS IN THIS CATEGORY YET.<br><br><a href="bumpers-cms.html" style="color:var(--neon);">Open CMS to add products →</a></div>`}
    </div>`;
}

function renderShop(cat,contId){
  const P=getProds();const prods=P.filter(p=>p.cat===cat);
  if(cat==='trendy'){
    const tags=['all',...new Set(prods.map(p=>p.tag).filter(Boolean))];
    let title='TRENDY <span class="pink">STICKERS</span>';
    document.getElementById(contId).innerHTML=`
      <div style="padding-top:1rem;padding-bottom:1.5rem;">
        <div class="st">Category</div><h1 class="stitle">${title}</h1>
        <p style="color:var(--dim);margin-top:.4rem;font-size:1rem;">${prods.length} stickers available</p>
      </div>
      <div class="flex flex-wrap items-center gap-3 mb-5">
        <div class="flex flex-wrap gap-2" id="ft-${cat}">${tags.map(t=>`<button class="sb ${t==='all'?'on':''}" onclick="filterShop('${cat}','all','${t}',this)">${t.toUpperCase()}</button>`).join('')}</div>
        <select class="sdrop" style="margin-left:auto;" onchange="sortShop('${cat}','all',this.value)">
          <option value="default">Sort: Default</option><option value="price-asc">Price Low→High</option>
          <option value="price-desc">Price High→Low</option><option value="name">Name A→Z</option><option value="rating">Top Rated</option>
        </select>
      </div>
      <div style="position:relative;margin-bottom:1.5rem;">
        <svg style="position:absolute;left:.9rem;top:50%;transform:translateY(-50%);opacity:.3;" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="text" class="si" placeholder="Search in ${cat}..." oninput="searchCat('${cat}','all',this.value)"/>
      </div>
      <div id="grid-${cat}" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        ${prods.length?prods.map(card).join(''):`<div style="grid-column:1/-1;text-align:center;padding:4rem;color:var(--dim);font-family:'JetBrains Mono',monospace;font-size:.8rem;">NO PRODUCTS IN THIS CATEGORY YET.<br><br><a href="bumpers-cms.html" style="color:var(--neon);">Open CMS to add products →</a></div>`}
      </div>`;
  }else{
    renderCategorySelector(cat,contId);
  }
}

function filterShop(cat,subcat,tag,btn){
  const P=getProds();
  const selector=subcat==='all'?`#ft-${cat}`:`#ft-${cat}-${subcat}`;
  document.querySelectorAll(`${selector} .sb`).forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  const gridId=subcat==='all'?`grid-${cat}`:`grid-${cat}-${subcat}`;
  const l=tag==='all'?P.filter(p=>subcat==='all'?p.cat===cat:p.cat===cat&&p.subcat===subcat):P.filter(p=>subcat==='all'?p.cat===cat&&p.tag===tag:p.cat===cat&&p.subcat===subcat&&p.tag===tag);
  document.getElementById(gridId).innerHTML=l.length?l.map(card).join(''):`<div style="grid-column:1/-1;text-align:center;padding:4rem;color:var(--dim);font-family:'JetBrains Mono',monospace;font-size:.78rem;">NO RESULTS</div>`;
}

function sortShop(cat,subcat,v){
  const P=getProds();
  let l=subcat==='all'?P.filter(p=>p.cat===cat):P.filter(p=>p.cat===cat&&p.subcat===subcat);
  if(v==='price-asc')l.sort((a,b)=>a.price-b.price);
  if(v==='price-desc')l.sort((a,b)=>b.price-a.price);
  if(v==='name')l.sort((a,b)=>a.name.localeCompare(b.name));
  if(v==='rating')l.sort((a,b)=>(b.rating||0)-(a.rating||0));
  const gridId=subcat==='all'?`grid-${cat}`:`grid-${cat}-${subcat}`;
  document.getElementById(gridId).innerHTML=l.map(card).join('');
}

function searchCat(cat,subcat,q){
  const P=getProds();
  const l=q?subcat==='all'?P.filter(p=>p.cat===cat&&(p.name.toLowerCase().includes(q.toLowerCase())||(p.tag||'').toLowerCase().includes(q.toLowerCase()))):P.filter(p=>p.cat===cat&&p.subcat===subcat&&(p.name.toLowerCase().includes(q.toLowerCase())||(p.tag||'').toLowerCase().includes(q.toLowerCase()))):subcat==='all'?P.filter(p=>p.cat===cat):P.filter(p=>p.cat===cat&&p.subcat===subcat);
  const gridId=subcat==='all'?`grid-${cat}`:`grid-${cat}-${subcat}`;
  document.getElementById(gridId).innerHTML=l.length?l.map(card).join(''):`<div style="grid-column:1/-1;text-align:center;padding:4rem;color:var(--dim);font-family:'JetBrains Mono',monospace;font-size:.78rem;">NO RESULTS FOR "${q.toUpperCase()}"</div>`;
}

function toggleSB(){const sb=document.getElementById('sb');const open=sb.style.display!=='none';sb.style.display=open?'none':'block';if(!open)setTimeout(()=>document.getElementById('gs').focus(),50);}
function globalSearch(q){const P=getProds();const res=document.getElementById('sr');if(!q){res.innerHTML='';return;}const m=P.filter(p=>p.name.toLowerCase().includes(q.toLowerCase())||(p.tag||'').toLowerCase().includes(q.toLowerCase()));if(!m.length){res.innerHTML=`<div class="fm" style="font-size:.72rem;color:var(--dim);padding:.5rem 0;">No results.</div>`;return;}res.innerHTML=`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:.5rem;">${m.slice(0,8).map(p=>`<div onclick="openMdl('${p.id}');toggleSB()" style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);padding:.6rem;cursor:none;display:flex;align-items:center;gap:.6rem;" onmouseover="this.style.borderColor='rgba(200,255,0,.25)'" onmouseout="this.style.borderColor='rgba(255,255,255,.07)'"><span style="font-size:1.5rem;">${p.emoji}</span><div><div style="font-size:.82rem;font-family:'Anton',sans-serif;">${p.name}</div><div class="neon" style="font-family:'JetBrains Mono',monospace;font-size:.72rem;">$${p.price.toFixed(2)}</div></div></div>`).join('')}</div>`;}

function renderFeatured(){const P=getProds();const f=P.filter(p=>p.featured).slice(0,4);const el=document.getElementById('home-feat');if(el)el.innerHTML=f.length?f.map(card).join(''):P.slice(0,4).map(card).join('');}

let mSz='',mQty=1;
function openMdl(id){
  const P=getProds();const p=P.find(x=>x.id===id);if(!p)return;
  mSz=(p.sizes||[])[0]||'';mQty=1;
  const rel=P.filter(x=>x.cat===p.cat&&(p.subcat?x.subcat===p.subcat:true)&&x.id!==p.id).slice(0,3);
  const inWL=wl.includes(id);
  document.getElementById('mdl-c').innerHTML=`
    <div class="grid md:grid-cols-2 gap-6">
      <div style="background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.06);aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:9rem;position:relative;overflow:hidden;">
        ${p.image?`<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:contain;padding:1.5rem;"/>`:p.emoji}
        ${p.badge?`<div style="position:absolute;top:.7rem;left:.7rem;font-family:'JetBrains Mono',monospace;font-size:.6rem;padding:.25rem .6rem;border:1px solid ${p.badgeColor};color:${p.badgeColor};background:rgba(6,6,14,.9);">${p.badge}</div>`:''}
      </div>
      <div>
        <div class="fm" style="font-size:.65rem;letter-spacing:.16em;color:var(--dim);margin-bottom:.4rem;">${p.cat} · ${p.tag||''}</div>
        <h2 class="fa" style="font-size:2rem;letter-spacing:.04em;line-height:1;">${p.name}</h2>
        <div style="display:flex;align-items:center;gap:.8rem;margin-top:.5rem;margin-bottom:.8rem;">
          <div class="fm neon" style="font-size:1.4rem;">$${p.price.toFixed(2)}</div>
          <div style="color:#f59e0b;font-size:.8rem;">${'★'.repeat(Math.floor(p.rating||4))}${'☆'.repeat(5-Math.floor(p.rating||4))}</div>
          <div class="fm" style="font-size:.68rem;color:var(--dim);">${p.rating||4.5}</div>
        </div>
        <p style="color:var(--dim);font-size:.95rem;line-height:1.7;margin-bottom:1rem;">${p.desc||''}</p>
        ${p.stock>0?`<div style="margin-bottom:.8rem;"><div class="pbar"><div class="pbar-f" style="width:${Math.min(100,p.stock)}%;"></div></div><div class="fm" style="font-size:.63rem;color:var(--dim);margin-top:.25rem;">Only ${p.stock} left</div></div>`:''}
        <div class="fm" style="font-size:.65rem;letter-spacing:.14em;color:var(--neon);margin-bottom:.5rem;">SIZE</div>
        <div class="flex flex-wrap gap-2 mb-4" id="m-sz">${(p.sizes||[]).map(s=>`<button class="sb ${s===(p.sizes[0]||'')?'on':''}" onclick="mSz='${s}';document.querySelectorAll('#m-sz .sb').forEach(b=>b.classList.remove('on'));this.classList.add('on')">${s}"</button>`).join('')}</div>
        <div class="fm" style="font-size:.65rem;letter-spacing:.14em;color:var(--neon);margin-bottom:.5rem;">QUANTITY</div>
        <div class="flex items-center gap-3 mb-4">
          <button class="qb" onclick="mQty=Math.max(1,mQty-1);document.getElementById('m-qty').textContent=mQty;document.getElementById('m-tot').textContent=(${p.price}*mQty).toFixed(2)">−</button>
          <span id="m-qty" class="fa" style="font-size:1.2rem;min-width:2rem;text-align:center;">1</span>
          <button class="qb" onclick="mQty++;document.getElementById('m-qty').textContent=mQty;document.getElementById('m-tot').textContent=(${p.price}*mQty).toFixed(2)">+</button>
        </div>
        <div class="flex gap-3 mb-4">
          <button onclick="addToCart('${p.id}',mSz,mQty);closeMdl();" class="btn-n" style="flex:2;${p.stock===0?'opacity:.4;pointer-events:none;':''}">
            ${p.stock===0?'OUT OF STOCK':'ADD — $<span id="m-tot">'+p.price.toFixed(2)+'</span>'}
          </button>
          <button onclick="toggleWL('${p.id}')" class="btn-g wbtn ${inWL?'liked':''}" data-id="${p.id}" style="position:relative;flex:1;">${inWL?'♥':'♡'}</button>
        </div>
        <div class="flex flex-wrap gap-3"><span style="font-size:.78rem;color:var(--dim);">💧 Waterproof</span><span style="font-size:.78rem;color:var(--dim);">☀️ UV Safe</span><span style="font-size:.78rem;color:var(--dim);">✂️ Die-Cut</span><span style="font-size:.78rem;color:var(--dim);">🚀 48hr</span></div>
      </div>
    </div>
    ${rel.length?`<div style="margin-top:1.8rem;border-top:1px solid rgba(255,255,255,.06);padding-top:1.4rem;"><div class="fm" style="font-size:.65rem;letter-spacing:.16em;color:var(--neon);margin-bottom:.8rem;">YOU MAY ALSO LIKE</div><div class="grid grid-cols-3 gap-3">${rel.map(r=>`<div class="rl" onclick="openMdl('${r.id}')"><span style="font-size:1.6rem;">${r.emoji}</span><div><div class="fa" style="font-size:.85rem;">${r.name}</div><div class="neon fm" style="font-size:.72rem;">$${r.price.toFixed(2)}</div></div></div>`).join('')}</div></div>`:''}`;
  document.getElementById('mdl').classList.add('open');document.body.style.overflow='hidden';
}
function closeMdl(){document.getElementById('mdl').classList.remove('open');document.body.style.overflow='';}

function renderWL(){
  const P=getProds();const el=document.getElementById('wl-grid');
  const items=P.filter(p=>wl.includes(p.id));
  el.innerHTML=items.length?items.map(card).join(''):`<div style="grid-column:1/-1;text-align:center;padding:5rem;color:var(--dim);font-family:'JetBrains Mono',monospace;font-size:.8rem;"><div style="font-size:3rem;margin-bottom:1rem;opacity:.3;">♡</div>YOUR WISHLIST IS EMPTY</div>`;
}

function renderCart(){
  const el=document.getElementById('cart-items');if(!el)return;
  if(!cart.length){el.innerHTML=`<div style="text-align:center;padding:5rem 2rem;"><div style="font-size:4rem;opacity:.25;margin-bottom:1rem;">🛒</div><div class="fa" style="font-size:1.4rem;letter-spacing:.06em;margin-bottom:.5rem;">CART IS EMPTY</div><div style="color:var(--dim);margin-bottom:1.5rem;font-size:.92rem;">Add some stickers!</div><button onclick="navTo('browse')" class="btn-n">Browse Stickers</button></div>`;updTotals();return;}
  el.innerHTML=cart.map((item,i)=>`
    <div style="border-bottom:1px solid rgba(255,255,255,.05);padding:1rem 0;display:flex;align-items:center;gap:.8rem;">
      <div style="width:65px;height:65px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;font-size:2rem;flex-shrink:0;">${item.image?`<img src="${item.image}" style="width:100%;height:100%;object-fit:contain;padding:.2rem;"/>`:item.emoji}</div>
      <div style="flex:1;min-width:0;">
        <div class="fa" style="font-size:.95rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${item.name}</div>
        <div class="fm" style="font-size:.68rem;color:var(--dim);">Size: ${item.size||'—'}</div>
        <div class="neon fm" style="font-size:.82rem;">$${item.price.toFixed(2)}</div>
      </div>
      <div style="display:flex;align-items:center;gap:.5rem;">
        <button class="qb" onclick="crtQ(${i},-1)">−</button>
        <span class="fm" style="font-size:.88rem;min-width:1.5rem;text-align:center;">${item.qty}</span>
        <button class="qb" onclick="crtQ(${i},1)">+</button>
      </div>
      <div class="fa" style="font-size:1rem;min-width:55px;text-align:right;">$${(item.price*item.qty).toFixed(2)}</div>
      <button onclick="rmCart(${i})" style="background:none;border:none;color:var(--dim);cursor:pointer;font-size:1rem;padding:.3rem;transition:color .2s;" onmouseover="this.style.color='var(--pink)'" onmouseout="this.style.color='var(--dim)'">✕</button>
    </div>`).join('');
  updTotals();
}
function crtQ(i,d){cart[i].qty=Math.max(1,cart[i].qty+d);saveCart();renderCart();}
function rmCart(i){const n=cart[i].name;cart.splice(i,1);saveCart();renderCart();showToast(`${n} removed.`);}
function updTotals(){
  const sub=cart.reduce((s,i)=>s+i.price*i.qty,0);const d=sub*disc;const tot=sub-d;
  const s1=document.getElementById('c-sub'),s2=document.getElementById('c-disc'),s3=document.getElementById('c-tot');
  if(s1)s1.textContent=`$${sub.toFixed(2)}`;if(s2)s2.textContent=`-$${d.toFixed(2)}`;if(s3)s3.textContent=`$${tot.toFixed(2)}`;
}

function applyPromo(){const c=document.getElementById('promo-in').value.trim().toUpperCase();const m=document.getElementById('promo-msg');const PROMOS=getPromos();if(PROMOS[c]){disc=PROMOS[c];m.style.color='var(--neon)';m.textContent='✓ '+(disc*100)+'% OFF!';updTotals();}else{m.style.color='var(--pink)';m.textContent='✕ Invalid code.';}}

let coStep=1,coData={};
function openCO(){if(!cart.length){showToast('Cart is empty!');return;}coStep=1;renderCO();document.getElementById('co').classList.add('open');document.body.style.overflow='hidden';}
function closeCO(){document.getElementById('co').classList.remove('open');document.body.style.overflow='';}
function updSteps(){[1,2,3].forEach(i=>{const d=document.getElementById(`s${i}`);d.className='sdot';if(i<coStep)d.classList.add('done');if(i===coStep)d.classList.add('act');});}
function renderCO(){
  updSteps();const b=document.getElementById('co-c');
  if(coStep===1){b.innerHTML=`<h3 class="fa" style="font-size:1.1rem;letter-spacing:.06em;margin-bottom:1rem;">DELIVERY INFO</h3>
    <div class="grid grid-cols-2 gap-3 mb-3"><div><label class="fl">FIRST NAME</label><input id="fn" class="fi" placeholder="Ali" required/></div><div><label class="fl">LAST NAME</label><input id="ln" class="fi" placeholder="Khan"/></div></div>
    <div class="mb-3"><label class="fl">PHONE / WHATSAPP</label><input id="ph" class="fi" placeholder="+92 300 0000000" type="tel" required/></div>
    <div class="mb-3"><label class="fl">EMAIL</label><input id="em" class="fi" placeholder="you@email.com" type="email"/></div>
    <div class="mb-3"><label class="fl">ADDRESS</label><input id="ad" class="fi" placeholder="Street, Area"/></div>
    <div class="grid grid-cols-2 gap-3 mb-5"><div><label class="fl">CITY</label><input id="cy" class="fi" placeholder="Faisalabad"/></div><div><label class="fl">PROVINCE</label><select id="pr" class="fi" style="background:rgba(255,255,255,.04);"><option style="background:#0d0d1c;">Punjab</option><option style="background:#0d0d1c;">Sindh</option><option style="background:#0d0d1c;">KPK</option><option style="background:#0d0d1c;">Balochistan</option></select></div></div>
    <button onclick="goS2()" class="btn-n w-full" style="text-align:center;padding:.9rem;">Continue →</button>`;}
  if(coStep===2){
    const sub=cart.reduce((s,i)=>s+i.price*i.qty,0);const tot=(sub*(1-disc)).toFixed(2);
    b.innerHTML=`<h3 class="fa" style="font-size:1.1rem;letter-spacing:.06em;margin-bottom:1rem;">PAYMENT</h3>
      <div class="hb p-4 mb-4">${cart.map(i=>`<div style="display:flex;justify-content:space-between;font-size:.85rem;margin-bottom:.3rem;"><span style="color:var(--dim);">${i.emoji} ${i.name} ×${i.qty}</span><span>$${(i.price*i.qty).toFixed(2)}</span></div>`).join('')}<div style="height:1px;background:rgba(255,255,255,.07);margin:.6rem 0;"></div><div style="display:flex;justify-content:space-between;" class="fa"><span>TOTAL</span><span class="neon">$${tot}</span></div></div>
      <div class="flex flex-col gap-3 mb-5">
        <label style="display:flex;align-items:center;gap:.8rem;border:1px solid rgba(255,255,255,.1);padding:.85rem;cursor:pointer;" onmouseover="this.style.borderColor='rgba(200,255,0,.3)'" onmouseout="this.style.borderColor='rgba(255,255,255,.1)'"><input type="radio" name="pay" value="cod" checked style="accent-color:var(--neon);"/><span>💵</span><div><div style="font-size:.92rem;">Cash on Delivery</div><div style="color:var(--dim);font-size:.78rem;">Pay when you receive</div></div></label>
        <label style="display:flex;align-items:center;gap:.8rem;border:1px solid rgba(255,255,255,.1);padding:.85rem;cursor:pointer;" onmouseover="this.style.borderColor='rgba(200,255,0,.3)'" onmouseout="this.style.borderColor='rgba(255,255,255,.1)'"><input type="radio" name="pay" value="easypaisa" style="accent-color:var(--neon);"/><span>📱</span><div><div style="font-size:.92rem;">Easypaisa / JazzCash</div><div style="color:var(--dim);font-size:.78rem;">Mobile wallet</div></div></label>
        <label style="display:flex;align-items:center;gap:.8rem;border:1px solid rgba(255,255,255,.1);padding:.85rem;cursor:pointer;" onmouseover="this.style.borderColor='rgba(200,255,0,.3)'" onmouseout="this.style.borderColor='rgba(255,255,255,.1)'"><input type="radio" name="pay" value="bank" style="accent-color:var(--neon);"/><span>🏦</span><div><div style="font-size:.92rem;">Bank Transfer</div><div style="color:var(--dim);font-size:.78rem;">Direct deposit</div></div></label>
      </div>
      <div class="flex gap-3"><button onclick="coStep=1;renderCO()" class="btn-o" style="flex:1;">← Back</button><button onclick="placeOrd()" class="btn-n" style="flex:2;text-align:center;padding:.9rem;">Place Order 🎉</button></div>`;}
  if(coStep===3){
    const num='BMP-'+Math.random().toString(36).substr(2,8).toUpperCase();
    const sub=cart.reduce((s,i)=>s+i.price*i.qty,0);
    const total=(sub*(1-disc)).toFixed(2);
    const itemsHtml=cart.map(i=>`<div style="display:flex;justify-content:space-between;align-items:center;border:1px solid rgba(200,255,0,.15);padding:.6rem;margin-bottom:.5rem;"><div><div class="fm" style="font-size:.68rem;color:var(--dim);margin-bottom:.2rem;">${i.emoji} ${i.name}</div><div style="font-size:.78rem;color:var(--dim);">Size: <span class="neon">${i.size}</span> | Qty: <span class="neon">${i.qty}</span></div></div><div class="neon" style="font-size:.92rem;font-weight:bold;">$${(i.price*i.qty).toFixed(2)}</div></div>`).join('');
    b.innerHTML=`<div style="text-align:center;padding:.5rem 0;">
      <div style="font-size:3.5rem;margin-bottom:.8rem;animation:successPop .5s cubic-bezier(.34,1.56,.64,1);">🎉</div>
      <h3 class="fa" style="font-size:1.3rem;letter-spacing:.08em;margin-bottom:.2rem;">ORDER CONFIRMED!</h3>
      <div class="neon fm" style="font-size:.85rem;margin-bottom:1.2rem;padding:.5rem;background:rgba(200,255,0,.08);border-radius:4px;">Order #${num}</div>
      <div class="hb p-4 mb-4">
        <div style="text-align:left;">
          <h4 class="fm" style="font-size:.75rem;color:var(--neon);letter-spacing:.1em;margin-bottom:.8rem;">📦 ORDER ITEMS</h4>
          ${itemsHtml}
          <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid rgba(255,255,255,.07);">
            <div style="display:flex;justify-content:space-between;font-size:.85rem;margin-bottom:.4rem;"><span style="color:var(--dim);">Subtotal</span><span>$${sub.toFixed(2)}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:.85rem;margin-bottom:.4rem;"><span style="color:var(--dim);">Discount</span><span class="neon">-$${(sub*disc).toFixed(2)}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:1rem;margin-bottom:.6rem;padding-top:.6rem;border-top:1px solid rgba(255,255,255,.07);"><span class="fa">TOTAL</span><span class="fa neon">$${total}</span></div>
          </div>
        </div>
      </div>
      <div class="hb p-4 mb-4">
        <div style="text-align:left;">
          <h4 class="fm" style="font-size:.75rem;color:var(--neon);letter-spacing:.1em;margin-bottom:.8rem;">📍 DELIVERY DETAILS</h4>
          <div style="font-size:.88rem;line-height:1.8;color:var(--dim);">
            <div><span class="fa" style="color:var(--white);">${coData.fname} ${coData.lname||''}</span></div>
            <div>${coData.phone}</div>
            <div>${coData.email}</div>
            <div style="margin-top:.5rem;">${document.getElementById('ad')?.value||'N/A'}</div>
            <div>${document.getElementById('cy')?.value||''}, ${document.getElementById('pr')?.value||''}</div>
          </div>
        </div>
      </div>
      <div class="hb p-4 mb-4">
        <div style="text-align:left;">
          <h4 class="fm" style="font-size:.75rem;color:var(--neon);letter-spacing:.1em;margin-bottom:.6rem;">💳 PAYMENT</h4>
          <div style="font-size:.88rem;color:var(--dim);">Payment Method: <span class="fa" style="color:var(--white);">${document.querySelector('input[name="pay"]:checked')?.closest('label')?.querySelector('div').textContent.split('\\n')[0] || 'Cash on Delivery'}</span></div>
        </div>
      </div>
      <p style="color:var(--dim);font-size:.8rem;line-height:1.6;max-width:360px;margin:0 auto 1.5rem;">✅ Confirmation sent to your WhatsApp (${coData.phone})<br>📧 Order details also sent to your email<br>⏱️ We'll confirm within 2 hours!</p>
      <button onclick="closeCO();cart=[];saveCart();renderCart();disc=0;navTo('hero')" class="btn-n" style="padding:.9rem 2.5rem;">← Back Home</button></div>`;}
}
function goS2(){const fn=document.getElementById('fn')?.value;const ph=document.getElementById('ph')?.value;if(!fn||!ph){showToast('Fill name & phone!');return;}coData={fname:fn,lname:document.getElementById('ln')?.value,phone:ph,email:document.getElementById('em')?.value};coStep=2;renderCO();}
function placeOrd(){
  const m=document.querySelector('input[name="pay"]:checked')?.value||'cod';
  coData.payment=m;
  const sub=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const total=(sub*(1-disc)).toFixed(2);
  const orderID='BMP-'+Math.random().toString(36).substr(2,8).toUpperCase();
  const newOrder={
    id:orderID,
    customer:(coData.fname||'')+(coData.lname?' '+coData.lname:''),
    phone:coData.phone||'',
    email:coData.email||'',
    address:document.getElementById('ad')?.value||'',
    city:document.getElementById('cy')?.value||'',
    province:document.getElementById('pr')?.value||'',
    items:cart.map(i=>({name:i.name,emoji:i.emoji,price:i.price,qty:i.qty,size:i.size,cat:i.cat})),
    subtotal:sub.toFixed(2),
    discount:(sub*disc).toFixed(2),
    total:parseFloat(total),
    payment:m,
    status:'new',
    date:new Date().toLocaleDateString('en-GB'),
    time:new Date().toLocaleTimeString('en-GB'),
    note:''
  };
  const existingOrders=JSON.parse(localStorage.getItem('bumpers_cms_orders')||'[]');
  existingOrders.unshift(newOrder);
  localStorage.setItem('bumpers_cms_orders',JSON.stringify(existingOrders));
  sendOrderEmail(newOrder);
  coStep=3;renderCO();
}

function initEmailJS(){
  if(typeof emailjs!=='undefined'){
    emailjs.init('rS7vU8uXK4z0pJ2qM-Z9L');
  }
}

function sendOrderEmail(ord){
  if(typeof emailjs==='undefined'){console.log('EmailJS not loaded');return;}
  
  const itemsList=ord.items.map(i=>`${i.emoji} ${i.name} (Size: ${i.size}) × ${i.qty} = $${(i.price*i.qty).toFixed(2)}`).join('\n');
  const paymentText=ord.payment===('cod')?'💵 Cash on Delivery':ord.payment===('easypaisa')?'📱 Easypaisa/JazzCash':'🏦 Bank Transfer';
  
  const templateParams={
    to_email:'bumpersgo@gmail.com',
    customer_name:ord.customer,
    customer_email:ord.email,
    customer_phone:ord.phone,
    order_id:ord.id,
    address:`${ord.address}, ${ord.city}, ${ord.province}`,
    items:itemsList,
    subtotal:ord.subtotal,
    discount:ord.discount,
    total:ord.total.toFixed(2),
    payment_method:paymentText,
    order_date:ord.date,
    order_time:ord.time
  };
  
  emailjs.send('service_bumpers','template_order_confirmation',templateParams).then((response)=>{
    console.log('Order email sent to admin',response);
    sendCustomerEmail(ord);
  }).catch((error)=>{
    console.error('Failed to send admin email:',error);
    sendCustomerEmail(ord);
  });
}

function sendCustomerEmail(ord){
  if(typeof emailjs==='undefined'){console.log('EmailJS not loaded');return;}
  
  const itemsList=ord.items.map(i=>`${i.emoji} ${i.name} (Size: ${i.size}) × ${i.qty} = $${(i.price*i.qty).toFixed(2)}`).join('\n');
  const paymentText=ord.payment===('cod')?'💵 Cash on Delivery':ord.payment===('easypaisa')?'📱 Easypaisa/JazzCash':'🏦 Bank Transfer';
  
  const templateParams={
    to_email:ord.email,
    customer_name:ord.customer,
    customer_email:ord.email,
    customer_phone:ord.phone,
    order_id:ord.id,
    address:`${ord.address}, ${ord.city}, ${ord.province}`,
    items:itemsList,
    subtotal:ord.subtotal,
    discount:ord.discount,
    total:ord.total.toFixed(2),
    payment_method:paymentText,
    order_date:ord.date,
    order_time:ord.time
  };
  
  emailjs.send('service_bumpers','template_customer_confirmation',templateParams).then((response)=>{
    console.log('Customer confirmation email sent',response);
    showToast('✓ Email sent successfully!');
  }).catch((error)=>{
    console.error('Failed to send customer email:',error);
  });
}

let cPr=4.99,cQv=1,cSv='Small 2×2"',cFin='Matte',cImg=null;
function setCS(btn,sz,pr){document.querySelectorAll('#cs-btns .sb').forEach(b=>b.classList.remove('on'));btn.classList.add('on');cSv=sz;cPr=parseFloat(pr);updCPr();}
function setCF(btn,f){document.querySelectorAll('#cf-btns .sb').forEach(b=>b.classList.remove('on'));btn.classList.add('on');cFin=f;}
function cQty(d){cQv=Math.max(1,cQv+d);document.getElementById('c-qty').textContent=cQv;updCPr();}
function updCPr(){document.getElementById('c-price').textContent=`$${(cPr*cQv).toFixed(2)}`;}
function handleUpload(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{cImg=ev.target.result;document.getElementById('c-img').src=cImg;document.getElementById('c-stk').style.display='block';document.getElementById('c-ph').style.display='none';showToast('Uploaded! Preview live 🎨');};r.readAsDataURL(f);}
function setMk(e,id){document.getElementById('c-bg').textContent=e;['laptop','bottle','board','bag'].forEach(x=>document.getElementById('m-'+x)?.classList.remove('on'));document.getElementById('m-'+id)?.classList.add('on');}
function addCustom(){if(!cImg){showToast('Upload image first! 📤');return;}cart.push({id:'c-'+Date.now(),name:`Custom (${cSv})`,emoji:'🖼️',image:cImg,price:cPr,size:cSv,qty:cQv,cat:'custom',finish:cFin});saveCart();showCartNotify('Custom sticker added!');}
const upz=document.getElementById('upz');if(upz){upz.addEventListener('dragover',e=>{e.preventDefault();upz.classList.add('drag');});upz.addEventListener('dragleave',()=>upz.classList.remove('drag'));upz.addEventListener('drop',e=>{e.preventDefault();upz.classList.remove('drag');const f=e.dataTransfer.files[0];if(f&&f.type.startsWith('image/')){const r=new FileReader();r.onload=ev=>{cImg=ev.target.result;document.getElementById('c-img').src=cImg;document.getElementById('c-stk').style.display='block';document.getElementById('c-ph').style.display='none';showToast('Dropped! Live preview 🎨');};r.readAsDataURL(f);}});}

function toggleFAQ(idx){
  const button=document.querySelectorAll('.faq-btn')[idx];
  const content=document.getElementById(`faq-${idx}`);
  const isOpen=button.classList.contains('active');
  document.querySelectorAll('.faq-btn').forEach((btn,i)=>{btn.classList.remove('active');const con=document.getElementById(`faq-${i}`);con.style.display='none';con.style.maxHeight='0px';con.style.opacity='0';con.classList.remove('show');});
  if(!isOpen){button.classList.add('active');content.style.display='block';content.classList.add('show');setTimeout(()=>{content.style.maxHeight=content.scrollHeight+'px';content.style.opacity='1';},10);}
}

function submitContact(e){e.preventDefault();showToast('Message sent! 24hr reply 📩');e.target.reset();}
function toggleMob(){const mob=document.getElementById('mob');const hamBtn=document.getElementById('ham-btn');if(mob.classList.contains('open')){closeMob();}else{openMob();}}
function openMob(){document.getElementById('mob').classList.add('open');document.getElementById('ham-btn').classList.add('ham-open');document.body.style.overflow='hidden';}
function closeMob(){document.getElementById('mob').classList.remove('open');document.getElementById('ham-btn').classList.remove('ham-open');document.body.style.overflow='';}

function navTo(pg){
  document.querySelectorAll('.pg').forEach(p=>p.classList.remove('on'));
  document.getElementById(`page-${pg}`).classList.add('on');
  window.scrollTo({top:0,behavior:'smooth'});
  history.pushState({page:pg},pg,`#${pg}`);
  if(pg==='cart')renderCart();
  if(pg==='browse')renderShop('browse','shop-browse');
  if(pg==='skins')renderShop('skins','shop-skins');
  if(pg==='trendy')renderShop('trendy','shop-trendy');
  if(pg==='cards')renderShop('cards','shop-cards');
  if(pg==='wishlist')renderWL();
}
window.addEventListener('popstate',e=>{if(e.state?.page)navTo(e.state.page);});

const cur=document.getElementById('cur');
document.addEventListener('mousemove',e=>{cur.style.left=e.clientX+'px';cur.style.top=e.clientY+'px';});
document.addEventListener('mousedown',()=>cur.classList.add('c'));
document.addEventListener('mouseup',()=>cur.classList.remove('c'));
function addCH(){document.querySelectorAll('a,button,.pc,.sb,.qb,.upz,.rl,.wbtn').forEach(el=>{if(!el.dataset.ch){el.dataset.ch='1';el.addEventListener('mouseenter',()=>cur.classList.add('h'));el.addEventListener('mouseleave',()=>cur.classList.remove('h'));}});}

window.addEventListener('scroll',()=>{if(window.scrollY>40)document.getElementById('nav').classList.add('s');else document.getElementById('nav').classList.remove('s');});
const rvO=new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting)x.target.classList.add('vis');}),{threshold:.1});
document.querySelectorAll('.rv').forEach(el=>rvO.observe(el));

(function(){const c=document.getElementById('cvs'),ctx=c.getContext('2d');let W,H,ps=[];function resize(){W=c.width=innerWidth;H=c.height=innerHeight;}resize();window.addEventListener('resize',resize);class P{reset(){this.x=Math.random()*W;this.y=Math.random()*H;this.r=Math.random()*.9+.2;this.vx=(Math.random()-.5)*.25;this.vy=-Math.random()*.4-.1;this.a=Math.random()*.45+.05;this.col=Math.random()>.65?'#c8ff00':'#00d4ff';}constructor(){this.reset();}tick(){this.x+=this.vx;this.y+=this.vy;this.a-=.0005;if(this.a<=0||this.y<-5)this.reset();}draw(){ctx.save();ctx.globalAlpha=this.a;ctx.fillStyle=ctx.shadowColor=this.col;ctx.shadowBlur=4;ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();ctx.restore();}}for(let i=0;i<120;i++)ps.push(new P());function loop(){ctx.clearRect(0,0,W,H);ctx.strokeStyle='rgba(200,255,0,.018)';ctx.lineWidth=1;for(let x=0;x<W;x+=60){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}for(let y=0;y<H;y+=60){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}ps.forEach(p=>{p.tick();p.draw();});requestAnimationFrame(loop);}loop();})();

window.addEventListener('load',()=>{setTimeout(()=>{initEmailJS();document.getElementById('loader').classList.add('out');const hash=window.location.hash.slice(1);if(hash&&hash!=='')navTo(hash);else{renderFeatured();document.getElementById('page-home').classList.add('on');}updBadges();addCH();setInterval(addCH,800);},1600);});
