/* AYN Inc. website v8 — shared behaviour. Each block runs only when its section is on the page. */
(function(){
"use strict";
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ===== SETTINGS ===== */
/* Hero footage: set to a file path (e.g. "assets/ayn-hero.mp4") to replace the animated map with video. */
const HERO_VIDEO_SRC = "";
/* Contact form: paste the existing Formspree endpoint (https://formspree.io/f/xxxxxxxx). */
const FORMSPREE_URL = "https://formspree.io/f/mlgpwqzd";

/* ===== Geometry from county boundaries (assets/counties.js) ===== */
const C = window.LR_COUNTIES || [];
const LON0=-11.51, LON1=-7.36, LAT0=4.35, LAT1=8.56;
function fitter(w,h,pad){pad=pad||0;const s=Math.min((w-2*pad)/(LON1-LON0),(h-2*pad)/(LAT1-LAT0));
  const ox=(w-(LON1-LON0)*s)/2, oy=(h-(LAT1-LAT0)*s)/2;
  const f=(lon,lat)=>[ox+(lon-LON0)*s, oy+(LAT1-lat)*s]; f.s=s; return f;}
function rings(f){return C.map(c=>c.p.map(r=>r.map(pt=>f(pt[0],pt[1]))));}
function ringD(r){return 'M'+r.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join('L')+'Z';}
function countyD(cr){return cr.map(ringD).join('');}
function inRing(x,y,pts){let c=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const xi=pts[i][0],yi=pts[i][1],xj=pts[j][0],yj=pts[j][1];if(((yi>y)!=(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c;}return c;}
function inCountry(x,y,R){for(const cr of R)for(const r of cr)if(inRing(x,y,r))return true;return false;}
let seed=11;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
function sample(R,n,w,h,rand){rand=rand||Math.random;const out=[];let guard=0;while(out.length<n&&guard<n*80){guard++;const x=rand()*w,y=rand()*h;if(inCountry(x,y,R))out.push([x,y]);}return out;}
const NS='http://www.w3.org/2000/svg';
function el(tag,attrs,parent){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e;}

/* ===== Navigation ===== */
const mb=document.getElementById('menuBtn'), nl=document.getElementById('navLinks');
if(mb&&nl){mb.addEventListener('click',()=>{const o=nl.classList.toggle('open');mb.setAttribute('aria-expanded',o);});
  nl.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nl.classList.remove('open');mb.setAttribute('aria-expanded','false');}));}

/* ===== Home hero: video or animated county map ===== */
const cv=document.getElementById('heroCanvas');
if(cv){
  const hero=cv.parentElement;
  if(HERO_VIDEO_SRC){
    const v=document.createElement('video');Object.assign(v,{src:HERO_VIDEO_SRC,muted:true,loop:true,autoplay:true,playsInline:true});v.setAttribute('aria-hidden','true');
    cv.replaceWith(v);const tag=document.querySelector('.video-tag');if(tag)tag.hidden=true;
  } else if(C.length){
    const ctx=cv.getContext('2d');let W,H,dpr,R,paths,hub,f,pings=[],last=0,narrow,mapW,mapX;const t0=performance.now();
    function size(){dpr=Math.min(devicePixelRatio||1,2);W=hero.clientWidth;H=hero.clientHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
      narrow=W<820; mapW=narrow?W:Math.min(W*0.55,H*1.0); mapX=narrow?0:W-mapW-W*0.03;
      const g=fitter(mapW,H,narrow?20:40); f=(lon,lat)=>{const p=g(lon,lat);return[p[0]+mapX,p[1]];}; f.s=g.s;
      R=rings(f); paths=R.map(cr=>new Path2D(countyD(cr))); hub=f(-10.8,6.31);}
    function randPt(){const x0=mapX,w=mapW;for(let k=0;k<60;k++){const x=x0+Math.random()*w,y=Math.random()*H;if(inCountry(x,y,R))return[x,y];}return hub;}
    function frame(now){
      const t=(now-t0)/1000;
      ctx.fillStyle='#101C33';ctx.fillRect(0,0,W,H);
      ctx.strokeStyle='rgba(154,168,194,0.08)';ctx.lineWidth=1;ctx.font='10px "IBM Plex Mono", monospace';ctx.fillStyle='rgba(154,168,194,0.35)';
      for(let lon=-12;lon<=-7;lon++){const x=f(lon,0)[0];ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();if(!narrow)ctx.fillText(Math.abs(lon)+'°W',x+4,H-28);}
      for(let lat=4;lat<=9;lat++){const y=f(0,lat)[1];ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();if(!narrow)ctx.fillText(lat+'°N',W-44,y-4);}
      ctx.globalAlpha=narrow?0.45:1;
      paths.forEach(p=>{ctx.fillStyle='rgba(0,119,200,0.07)';ctx.fill(p);ctx.strokeStyle='rgba(0,119,200,0.55)';ctx.lineWidth=1;ctx.stroke(p);});
      // sweep inside the country
      ctx.save();const clip=new Path2D();paths.forEach(p=>clip.addPath(p));ctx.clip(clip);
      const top=f(0,LAT1)[1],span=(LAT1-LAT0)*f.s;const sy=top+((t*0.12)%1)*span;const g=ctx.createLinearGradient(0,sy-60,0,sy);g.addColorStop(0,'rgba(245,166,35,0)');g.addColorStop(1,'rgba(245,166,35,0.14)');ctx.fillStyle=g;ctx.fillRect(0,sy-60,W,60);ctx.restore();
      if(!reduce&&now-last>140){last=now;pings.push({p:randPt(),b:now});if(pings.length>70)pings.shift();}
      for(const pg of pings){const a=reduce?2.6:(now-pg.b)/1000;const x=pg.p[0],y=pg.p[1];
        ctx.fillStyle='rgba(232,237,245,0.85)';ctx.beginPath();ctx.arc(x,y,1.6,0,7);ctx.fill();
        if(a<1.2){ctx.strokeStyle='rgba(232,237,245,'+(0.6*(1-a/1.2))+')';ctx.beginPath();ctx.arc(x,y,2+a*14,0,7);ctx.stroke();}
        if(a>0.6&&a<2.4){const k=Math.min(1,(a-0.6)/1.4);const mx=(x+hub[0])/2,my=Math.min(y,hub[1])-40;
          ctx.strokeStyle='rgba(245,166,35,0.18)';ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(mx,my,hub[0],hub[1]);ctx.stroke();
          const q=1-k;ctx.fillStyle='#F5A623';ctx.beginPath();ctx.arc(q*q*x+2*q*k*mx+k*k*hub[0],q*q*y+2*q*k*my+k*k*hub[1],2,0,7);ctx.fill();}}
      const r=6+Math.sin(t*3)*2;ctx.fillStyle='#F5A623';ctx.beginPath();ctx.arc(hub[0],hub[1],4,0,7);ctx.fill();
      ctx.strokeStyle='rgba(245,166,35,0.5)';ctx.beginPath();ctx.arc(hub[0],hub[1],r+4,0,7);ctx.stroke();
      if(!narrow){ctx.fillStyle='rgba(245,166,35,0.9)';ctx.fillText('MONROVIA · AYN HQ',hub[0]+12,hub[1]+4);}
      ctx.globalAlpha=1;
      const sc=ctx.createLinearGradient(0,0,narrow?0:W*0.6,narrow?H:0);sc.addColorStop(0,'rgba(16,28,51,0.92)');sc.addColorStop(1,'rgba(16,28,51,0)');ctx.fillStyle=sc;ctx.fillRect(0,0,W,H);
      if(!reduce)requestAnimationFrame(frame);
    }
    const seedStatic=()=>{pings=[];if(reduce)for(let i=0;i<60;i++)pings.push({p:randPt(),b:0});};
    size();seedStatic();
    let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{size();seedStatic();if(reduce)frame(performance.now());},120);});
    requestAnimationFrame(frame);
  }
}

/* ===== Small county silhouettes in inner-page headers ===== */
document.querySelectorAll('svg.head-map').forEach(svg=>{
  const f=fitter(440,440,10);const R=rings(f);const hl=svg.dataset.highlight;
  R.forEach((cr,i)=>el('path',{d:countyD(cr),fill:(hl&&C[i].n===hl)?'#F5A623':'rgba(0,119,200,0.16)',stroke:'#0077C8','stroke-width':1},svg));
});

/* ===== Story: scene map + switching ===== */
const sm=document.getElementById('sceneMap');
if(sm&&C.length){const f=fitter(440,440,10);const R=rings(f);
  R.forEach(cr=>el('path',{d:countyD(cr),fill:'rgba(0,119,200,0.10)',stroke:'#0077C8','stroke-width':1},sm));
  seed=5;sample(R,140,440,440,rnd).forEach((p,i)=>{const c=el('circle',{cx:p[0].toFixed(1),cy:p[1].toFixed(1),r:2.4,fill:i%9===0?'#F5A623':'#E8EDF5','class':'pt'},sm);c.style.transitionDelay=(i*8)+'ms';});}
const steps=[...document.querySelectorAll('.step')];
if(steps.length){
  const scenes=[...document.querySelectorAll('.scene')],bars=[...document.querySelectorAll('#bars div')];
  const show=i=>{steps.forEach(s=>s.classList.toggle('on',+s.dataset.scene===i));scenes.forEach(s=>s.classList.toggle('on',+s.dataset.i===i));bars.forEach(b=>b.style.height=(i===3?b.dataset.h:0)+'%');};
  const so=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)show(+e.target.dataset.scene);}),{rootMargin:'-45% 0px -45% 0px'});
  steps.forEach(s=>so.observe(s));
}

/* ===== Breakdown: exploded map layers ===== */
const stack=document.getElementById('stack');
if(stack&&C.length){
  const f=fitter(440,440,6);const R=rings(f);const all=R.map(countyD);
  seed=11;const FIELD=sample(R,150,440,440,rnd);
  const defs=[
    svg=>{all.forEach(d=>el('path',{d:d,fill:'none',stroke:'#F5A623','stroke-width':4,'stroke-linejoin':'round'},svg));all.forEach(d=>el('path',{d:d,fill:'#1A2B4A',stroke:'#1A2B4A','stroke-width':1.2},svg));},
    svg=>{all.forEach(d=>el('path',{d:d,fill:'rgba(255,255,255,0.95)',stroke:'#1A2B4A','stroke-width':1.2},svg));
          C.forEach(c=>{const p=f(c.ll[0],c.ll[1]);el('circle',{cx:p[0],cy:p[1],r:4,fill:'#0077C8'},svg);});},
    svg=>{const d=el('defs',{},svg);const cp=el('clipPath',{id:'lrclip'},d);all.forEach(x=>el('path',{d:x},cp));
          all.forEach(x=>el('path',{d:x,fill:'rgba(0,119,200,0.14)',stroke:'none'},svg));
          const g=el('g',{'clip-path':'url(#lrclip)',stroke:'#0077C8','stroke-width':0.8,fill:'none',opacity:0.75},svg);
          const r=11,h=r*Math.sqrt(3);let dd='';for(let row=0;row*h*0.5<450;row++){for(let col=0;col*r*3<470;col++){const cx=col*r*3+(row%2?r*1.5:0),cy=row*h*0.5;
            dd+='M'+[0,1,2,3,4,5].map(k=>{const a=Math.PI/3*k;return (cx+r*Math.cos(a)).toFixed(1)+','+(cy+r*Math.sin(a)).toFixed(1);}).join('L')+'Z';}}
          el('path',{d:dd},g);},
    svg=>{all.forEach(d=>el('path',{d:d,fill:'none',stroke:'rgba(26,43,74,0.3)','stroke-width':1,'stroke-dasharray':'3 4'},svg));
          FIELD.forEach((p,i)=>el('circle',{cx:p[0].toFixed(1),cy:p[1].toFixed(1),r:3,fill:i%9===0?'#F5A623':'#1A2B4A'},svg));}
  ];
  const layers=defs.map(fn=>{const d=document.createElement('div');d.className='layer';const svg=el('svg',{viewBox:'0 0 440 440','aria-hidden':'true'});fn(svg);d.appendChild(svg);stack.appendChild(d);return d;});
  const lis=[...document.querySelectorAll('#layerList li')],bd=document.getElementById('breakdown');
  const upd=()=>{const r=bd.getBoundingClientRect();const total=r.height-innerHeight;const p=total>0?Math.min(1,Math.max(0,-r.top/total)):0.5;
    const small=innerWidth<860;const gap=(small?22:34)+p*(small?55:100);
    layers.forEach((l,i)=>{l.style.transform='translateZ('+((i-1.5)*gap)+'px)';});
    const active=Math.min(3,Math.floor(p*4.2));lis.forEach((li,i)=>li.classList.toggle('on',i===active));
    stack.style.transform='rotateX('+(50-p*6)+'deg) rotateZ('+(-28+p*10)+'deg)';};
  let tk=false;addEventListener('scroll',()=>{if(!tk){tk=true;requestAnimationFrame(()=>{upd();tk=false;});}},{passive:true});
  addEventListener('resize',upd);upd();
}

/* ===== County explorer (About page): hover or tap a county ===== */
const ex=document.getElementById('explorerMap');
if(ex&&C.length){
  const f=fitter(440,440,8);const R=rings(f);const card=document.getElementById('countyCard');
  const set=i=>{const c=C[i];ex.querySelectorAll('.county').forEach((p,j)=>p.classList.toggle('on',j===i));
    card.querySelector('.code').textContent='COUNTY CODE '+c.c;card.querySelector('h3').textContent=c.n;
    card.querySelector('[data-k=cap]').textContent=c.cap;
    card.querySelector('[data-k=ll]').textContent=c.ll[1].toFixed(2)+'° N, '+Math.abs(c.ll[0]).toFixed(2)+'° W';};
  R.forEach((cr,i)=>{const p=el('path',{d:countyD(cr),'class':'county',tabindex:'0',role:'button','aria-label':C[i].n+' County'},ex);
    p.addEventListener('mouseenter',()=>set(i));p.addEventListener('focus',()=>set(i));p.addEventListener('click',()=>set(i));});
  const m=C.findIndex(c=>c.n==='Montserrado');set(m<0?0:m);
}

/* ===== Spotlight on service cards ===== */
document.querySelectorAll('.svc').forEach(c=>c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px');}));

/* ===== Reveal on scroll, starting from a visible state ===== */
if(!reduce&&'IntersectionObserver' in window){
  const ro=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('pending');ro.unobserve(e.target);}}),{threshold:.12});
  document.querySelectorAll('.rv').forEach(n=>{if(n.getBoundingClientRect().top>innerHeight){n.classList.add('pending');const idx=[...n.parentElement.children].indexOf(n);n.style.transitionDelay=(n.parentElement.classList.contains('team-grid')?(idx%4)*70:0)+'ms';ro.observe(n);}});
}

/* ===== Copy buttons ===== */
document.querySelectorAll('[data-copy]').forEach(b=>b.addEventListener('click',()=>{const txt=b.dataset.copy;
  const done=()=>{const o=b.textContent;b.textContent='Copied';setTimeout(()=>b.textContent=o,1400);};
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(done).catch(()=>sel(b));}else sel(b);
  function sel(btn){const t=btn.previousElementSibling;if(!t)return;const r=document.createRange();r.selectNodeContents(t);const s=getSelection();s.removeAllRanges();s.addRange(r);}
}));

/* ===== Contact form ===== */
const form=document.getElementById('contactForm');
if(form){const msg=document.getElementById('formMsg');
  form.addEventListener('submit',async e=>{e.preventDefault();
    if(!form.elements.name.value.trim()||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.elements.email.value)){msg.textContent='Add your name and a valid email address.';return;}
    if(!FORMSPREE_URL){msg.textContent='The form is not connected yet. Please email info@aynlr.com.';return;}
    msg.textContent='Sending…';
    try{const r=await fetch(FORMSPREE_URL,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}});
      if(r.ok){form.reset();msg.textContent='Thank you. Your message has been sent to our team.';}else msg.textContent='The message did not send. Please email info@aynlr.com directly.';}
    catch(err){msg.textContent='The message did not send. Check your connection or email info@aynlr.com directly.';}
  });}
})();
