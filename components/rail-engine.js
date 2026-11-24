// @ts-nocheck
/* Etalase rel gantung SONORA.
   Produk menggantung di kait pada rel baja. Geser horizontal tanpa ujung (loop).
   JS biasa, tanpa dependensi. Pegas dan ayun pendulum diadaptasi dari komponen ClothingRack
   (21st.dev, @keeranj); markup, loop, dan input ditulis ulang untuk SONORA.
   API: mountRail(el,{products,cats,rupiah,esc,fallback,onOpen,navigate}) -> fungsi destroy.
   Dipanggil dari components/Rail.tsx (useEffect). Hanya mengubah isi elemen akar yang diberikan. */
let REDUCED=false;                    // diisi saat mount (modul ini ikut dirender di server)
const DRIFT=24;                       // px/detik, geser otomatis pelan
const SWING={k:85,c:5.2};             // pegas ayun (derajat), nilai dari komponen asli
const HOVER={scale:1.06,push:.22,falloff:.6};
const SCALE={Gitar:1,Ukulele:.66,Keyboard:.9};   // skala tinggi foto tanpa background per kategori
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const mod=(v,m)=>((v%m)+m)%m;
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;

class Spring{
  constructor(v,k,c,eps){this.x=v;this.t=v;this.v=0;this.k=k;this.c=c;this.eps=eps}
  to(t){this.t=t;if(REDUCED){this.x=t;this.v=0}}
  step(dt){
    if(this.x===this.t&&this.v===0)return false;
    this.v+=(-this.k*(this.x-this.t)-this.c*this.v)*dt;
    this.x+=this.v*dt;
    if(Math.abs(this.x-this.t)<this.eps&&Math.abs(this.v)<this.eps*10){this.x=this.t;this.v=0}
    return true;
  }
}

function el(tag,cls,parent,attrs){
  const e=document.createElement(tag);
  if(cls)e.className=cls;
  if(attrs)for(const k in attrs)e.setAttribute(k,attrs[k]);
  if(parent)parent.appendChild(e);
  return e;
}

export function mountRail(root,o){
  REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cleanups=[];
  const on=(t,type,fn,opts)=>{t.addEventListener(type,fn,opts);cleanups.push(()=>t.removeEventListener(type,fn,opts))};
  const esc=o.esc,rupiah=o.rupiah;

  /* ---------- data: tanda kategori + produk, urut per kategori ---------- */
  const entries=[];
  o.cats.forEach(c=>{
    const list=o.products.filter(p=>p.category===c);
    if(!list.length)return;
    entries.push({kind:'sign',cat:c,n:list.length});
    list.forEach(p=>entries.push({kind:'p',p}));
  });
  root.replaceChildren();
  root.classList.add('rail');
  if(!entries.length){el('p','rail-empty',root).textContent='Belum ada produk.';return()=>{}}

  /* ---------- struktur ---------- */
  const view=el('div','rail-view',root,{role:'region','aria-label':'Etalase produk. Geser ke kiri atau kanan, daftar berulang tanpa ujung.'});
  const bar=el('div','rail-bar',view,{'aria-hidden':'true'});
  el('div','rail-tube',bar);
  const track=el('div','rail-track',view);
  const probeP=el('span','rail-probe rail-probe-p',view,{'aria-hidden':'true'});
  const probeS=el('span','rail-probe rail-probe-s',view,{'aria-hidden':'true'});
  const ctl=el('div','rail-ctl',root);
  const playBtn=el('button','rail-btn rail-play',ctl,{type:'button'});
  const nav=el('div','rail-nav',ctl);
  const prevBtn=el('button','rail-btn',nav,{type:'button','aria-label':'Geser ke kiri'});
  const nextBtn=el('button','rail-btn',nav,{type:'button','aria-label':'Geser ke kanan'});
  prevBtn.innerHTML='<i class="ph ph-arrow-left" aria-hidden="true"></i>';
  nextBtn.innerHTML='<i class="ph ph-arrow-right" aria-hidden="true"></i>';

  /* ---------- isi satu slot ---------- */
  function fillItem(item,en,clone){
    const push=el('div','rail-push',item);
    const swing=el('div','rail-swing',push);
    el('span','rail-hook',swing,{'aria-hidden':'true'});
    if(en.kind==='sign'){
      el('span','rail-v rail-v-sign',swing,{'aria-hidden':'true'});
      const a=el('a','rail-body rail-tag',swing,{href:'/produk?kategori='+encodeURIComponent(en.cat),'aria-label':`Lihat semua ${en.cat}, ${en.n} produk`});
      a.innerHTML=`<b>${esc(en.cat)}</b><span>${en.n} produk <i class="ph ph-arrow-up-right" aria-hidden="true"></i></span>`;
      return {push,swing};
    }
    const p=en.p,out=p.stock<=0;
    const label=`${p.name}, ${rupiah(p.price)}${out?', stok habis':''}`;
    let body;
    if(p.cutout&&p.image){
      item.classList.add('is-cut');
      item.style.setProperty('--h',String(SCALE[p.category]??.7));
      el('span','rail-string',swing,{'aria-hidden':'true'});
      body=el('button','rail-body rail-cut',swing,{type:'button','aria-label':label,'data-pid':String(p.id)});
      const img=el('img','',body,{src:p.image,alt:'',draggable:'false',decoding:'async'});
      img.onerror=()=>{img.onerror=null;img.src=o.fallback};
    }else{
      el('span','rail-v',swing,{'aria-hidden':'true'});
      body=el('button','rail-body rail-card',swing,{type:'button','aria-label':label,'data-pid':String(p.id)});
      const ph=el('span','rail-photo',body);
      const img=el('img','',ph,{src:p.image||o.fallback,alt:'',draggable:'false',loading:'lazy',decoding:'async'});
      img.onerror=()=>{img.onerror=null;img.src=o.fallback};
    }
    if(out)item.classList.add('is-out');
    if(clone)body.tabIndex=-1;
    const cap=el('div','rail-cap',push,{'aria-hidden':'true'});
    el('b','',cap).textContent=p.name;
    el('span','',cap).textContent=out?'Habis':rupiah(p.price);
    return {push,swing};
  }

  /* ---------- tata letak: slot tetap, daftar digandakan agar loop mulus ---------- */
  let vw=0,S=0,sets=0,slotP=0,slotS=0;
  let pos=[],els=[];
  let p=0,vel=0;                       // posisi (px) dan kecepatan (px/detik)
  function layout(){
    vw=view.clientWidth;
    slotP=probeP.offsetWidth;slotS=probeS.offsetWidth;
    if(!vw||!slotP)return;
    pos=[];let x=0;
    entries.forEach(en=>{const w=en.kind==='sign'?slotS:slotP;pos.push({x,w});x+=w});
    S=x;
    const need=1+Math.ceil(vw/S);
    if(need!==sets||!els.length){
      sets=need;hot=-1;
      track.replaceChildren();els=[];
      for(let c=0;c<sets;c++)entries.forEach((en,i)=>{
        const item=el('div','rail-item',track);
        if(c>0){item.setAttribute('aria-hidden','true');item.inert=true}
        const parts=fillItem(item,en,c>0);
        const k=70+((i*37+c*11)%31);              // tiap gantungan sedikit beda, supaya ayun terasa organik
        els.push({item,en,i,c,push:parts.push,swing:parts.swing,
          sp:new Spring(0,160,21,.05),sc:new Spring(1,200,20,.0005),ang:new Spring(0,k,SWING.c,.02),
          lastS:'',lastP:''});
      });
    }
    els.forEach(e=>{e.item.style.left=(pos[e.i].x+e.c*S)+'px';e.item.style.width=pos[e.i].w+'px'});
    render(true);
  }

  /* ---------- gambar ulang ---------- */
  function render(force){
    if(!S)return;
    track.style.transform=`translate3d(${-mod(p,S)}px,0,0)`;
    for(const e of els){
      const s=`rotate(${e.ang.x.toFixed(2)}deg) scale(${e.sc.x.toFixed(3)})`;
      if(force||s!==e.lastS){e.swing.style.transform=s;e.lastS=s}
      const q=`translateX(${e.sp.x.toFixed(1)}px)`;
      if(force||q!==e.lastP){e.push.style.transform=q;e.lastP=q}
    }
  }

  /* ---------- loop animasi: berhenti sendiri kalau tidak ada gerak ---------- */
  let raf=0,last=0,visible=true,playing=!REDUCED,dragging=false,hoverIn=false,focusIn=false,tw=null;
  const holding=()=>dragging||hoverIn||focusIn;
  function frame(now){
    raf=0;
    const dt=Math.min(.032,(now-last)/1000||0);last=now;
    let busy=false;
    if(tw){
      const t=clamp((now-tw.t0)/tw.ms,0,1);
      p=tw.from+(tw.to-tw.from)*ease(t);vel=0;
      if(t>=1)tw=null;else busy=true;
    }else if(!dragging){
      const want=(playing&&!holding()&&visible)?DRIFT:0;
      if(!REDUCED)vel+=(want-vel)*(1-Math.exp(-2.2*dt));else vel=want;
      if(Math.abs(vel)<.5&&!want)vel=0;
      p+=vel*dt;
      if(vel)busy=true;
    }else busy=true;
    const target=REDUCED?0:clamp(-vel*.012,-9,9);
    for(const e of els){
      e.ang.to(target);
      const a=e.ang.step(dt),b=e.sp.step(dt),c=e.sc.step(dt);
      if(a||b||c)busy=true;
    }
    render(false);
    if(busy&&visible&&!document.hidden)raf=requestAnimationFrame(frame);
  }
  function wake(){if(!raf&&visible&&!document.hidden){last=performance.now();raf=requestAnimationFrame(frame)}}

  /* ---------- gerak terprogram: tombol, fokus keyboard ---------- */
  function glide(to){
    if(REDUCED){p=to;vel=0;render(true);return}
    tw={from:p,to,t0:performance.now(),ms:520};wake();
  }
  function by(dir){const step=Math.max(slotP,Math.round(vw*.7/slotP)*slotP);glide(p+dir*step)}
  function reveal(i){
    const T=pos[i].x+pos[i].w/2-vw/2,k=Math.round((p-T)/S),to=T+k*S;
    if(Math.abs(p-to)>vw*.3-pos[i].w/2)glide(to);
  }

  /* ---------- hover: item membesar, tetangga memberi ruang, gantungan berayun ---------- */
  let hot=-1,pushDir=1;
  function setHot(j){
    if(j===hot)return;
    if(hot>=0){const h=els[hot];h.sc.to(1);h.item.classList.remove('hot')}
    hot=j;
    els.forEach((e,n)=>{
      const d=j<0?0:n-j;
      e.sp.to(d===0||Math.abs(d)>3?0:HOVER.push*slotP*Math.sign(d)*Math.pow(HOVER.falloff,Math.abs(d)-1));
    });
    if(j>=0){const h=els[j];h.sc.to(HOVER.scale);h.item.classList.add('hot');if(!REDUCED)h.ang.v+=-pushDir*24}
    wake();
  }
  const idxOf=t=>{const it=t.closest&&t.closest('.rail-item');return it?els.findIndex(e=>e.item===it):-1};
  on(track,'pointermove',e=>{
    if(e.pointerType!=='mouse'||dragging)return;
    if(e.movementX)pushDir=Math.sign(e.movementX);
    setHot(idxOf(e.target));
  });
  on(view,'pointerenter',e=>{if(e.pointerType==='mouse'){hoverIn=true;wake()}});
  on(view,'pointerleave',()=>{hoverIn=false;setHot(-1);wake()});

  /* ---------- seret / swipe: geser dengan momentum ---------- */
  let down=null,suppress=false,suppressT=0;
  on(view,'pointerdown',e=>{
    if(e.pointerType==='mouse'&&e.button!==0)return;
    tw=null;down={id:e.pointerId,x:e.clientX,p,lx:e.clientX,lt:performance.now(),moved:false};
  });
  on(view,'pointermove',e=>{
    if(!down||e.pointerId!==down.id)return;
    const dx=e.clientX-down.x;
    if(!down.moved){
      if(Math.abs(dx)<6)return;
      down.moved=true;dragging=true;setHot(-1);
      try{view.setPointerCapture(e.pointerId)}catch(_){}
      view.classList.add('is-drag');
    }
    const now=performance.now(),dt=Math.max(1,now-down.lt)/1000;
    const inst=-(e.clientX-down.lx)/dt;
    vel=vel*.6+clamp(inst,-3000,3000)*.4;
    p=down.p-dx;down.lx=e.clientX;down.lt=now;
    render(false);wake();
  });
  function endDrag(e){
    if(!down||e.pointerId!==down.id)return;
    if(down.moved){
      suppress=true;clearTimeout(suppressT);suppressT=setTimeout(()=>{suppress=false},60);
      if(performance.now()-down.lt>90)vel=0;      // berhenti dulu sebelum dilepas: tidak meluncur
      if(REDUCED)vel=0;
    }
    dragging=false;down=null;view.classList.remove('is-drag');wake();
  }
  on(view,'pointerup',endDrag);
  on(view,'pointercancel',endDrag);
  on(view,'click',e=>{if(suppress){e.preventDefault();e.stopPropagation()}},true);
  on(view,'dragstart',e=>e.preventDefault());

  /* ---------- trackpad horizontal / Shift + roda; roda vertikal tetap menggulung halaman ---------- */
  on(view,'wheel',e=>{
    let dx=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:(e.shiftKey?e.deltaY:0);
    if(!dx)return;
    if(e.deltaMode===1)dx*=16;
    e.preventDefault();tw=null;
    p+=dx;vel=clamp(dx*10,-1500,1500);render(false);wake();
  },{passive:false});

  /* ---------- klik produk (event delegation, juga untuk salinan) ---------- */
  on(track,'click',e=>{
    const a=e.target.closest&&e.target.closest('a.rail-tag');
    if(a&&o.navigate){e.preventDefault();o.navigate(a.getAttribute('href'));return}
    const b=e.target.closest&&e.target.closest('[data-pid]');
    if(b)o.onOpen(Number(b.dataset.pid));
  });

  /* ---------- keyboard ---------- */
  on(view,'keydown',e=>{
    if(e.key==='ArrowRight'){e.preventDefault();by(1)}
    else if(e.key==='ArrowLeft'){e.preventDefault();by(-1)}
  });
  on(view,'focusin',e=>{
    focusIn=true;
    const j=idxOf(e.target);
    if(j>=0&&els[j].c===0)reveal(els[j].i);
    wake();
  });
  on(view,'focusout',e=>{if(!view.contains(e.relatedTarget)){focusIn=false;wake()}});
  on(prevBtn,'click',()=>by(-1));
  on(nextBtn,'click',()=>by(1));

  function paintPlay(){
    playBtn.setAttribute('aria-pressed',String(!playing));
    playBtn.innerHTML=playing?'<i class="ph ph-pause" aria-hidden="true"></i><span>Jeda gerak</span>':'<i class="ph ph-play" aria-hidden="true"></i><span>Putar gerak</span>';
  }
  paintPlay();
  on(playBtn,'click',()=>{playing=!playing;paintPlay();wake()});

  /* ---------- hemat tenaga: berhenti saat di luar layar atau tab tersembunyi ---------- */
  const io=new IntersectionObserver(es=>{visible=es[es.length-1].isIntersecting;if(visible)wake()},{threshold:0});
  io.observe(root);
  on(document,'visibilitychange',()=>{if(!document.hidden)wake()});
  const ro=new ResizeObserver(()=>{layout();wake()});
  ro.observe(view);
  layout();
  wake();

  return function destroy(){
    cancelAnimationFrame(raf);clearTimeout(suppressT);io.disconnect();ro.disconnect();
    cleanups.forEach(c=>c());root.replaceChildren();root.classList.remove('rail');
  };
}

