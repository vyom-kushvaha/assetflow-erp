/* AssetFlow — Hand-built animated SVG charts. No external libraries. */

/* Smooth line/area chart */
function lineChart(data, opts){
  opts=opts||{}; const w=opts.w||560,h=opts.h||220,pad=opts.pad||{t:16,r:16,b:28,l:34};
  const labels=opts.labels||[]; const color=opts.color||'#1B365D'; const fill=opts.fill!==false;
  const max=Math.max.apply(null,data)*1.12, min=opts.min!=null?opts.min:0;
  const iw=w-pad.l-pad.r, ih=h-pad.t-pad.b;
  const X=i=>pad.l+(i/(data.length-1))*iw;
  const Y=v=>pad.t+ih-((v-min)/(max-min))*ih;
  let d='',area='';
  data.forEach((v,i)=>{ const x=X(i),y=Y(v); if(i===0){d=`M ${x} ${y}`;area=`M ${x} ${pad.t+ih} L ${x} ${y}`;}
    else{ const px=X(i-1),py=Y(data[i-1]); const cx=(px+x)/2; d+=` C ${cx} ${py} ${cx} ${y} ${x} ${y}`; area+=` C ${cx} ${py} ${cx} ${y} ${x} ${y}`; }});
  area+=` L ${X(data.length-1)} ${pad.t+ih} Z`;
  const gid='lg'+Math.abs(hashStr(color+data.join()));
  let grid='';
  for(let g=0;g<=3;g++){const gy=pad.t+(ih/3)*g; grid+=`<line x1="${pad.l}" y1="${gy}" x2="${w-pad.r}" y2="${gy}" stroke="var(--border-soft)" stroke-width="1"/>`;
    grid+=`<text x="${pad.l-8}" y="${gy+4}" text-anchor="end" font-size="10" fill="var(--text-mute)">${Math.round(max-(max-min)/3*g)}</text>`;}
  let xl='';labels.forEach((l,i)=>{xl+=`<text x="${X(i)}" y="${h-8}" text-anchor="middle" font-size="10" fill="var(--text-mute)">${l}</text>`;});
  let dots='';data.forEach((v,i)=>{dots+=`<circle cx="${X(i)}" cy="${Y(v)}" r="3.5" fill="var(--card)" stroke="${color}" stroke-width="2" class="lc-dot"><title>${labels[i]||''}: ${v}</title></circle>`;});
  const len=1600;
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" preserveAspectRatio="xMidYMid meet" style="overflow:visible">
    <defs><linearGradient id="${gid}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".22"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
    ${grid}${fill?`<path d="${area}" fill="url(#${gid})"/>`:''}
    <path d="${d}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${len}" stroke-dashoffset="${len}"><animate attributeName="stroke-dashoffset" from="${len}" to="0" dur="1.1s" fill="freeze" calcMode="spline" keySplines="0.4 0 0.2 1" keyTimes="0;1"/></path>
    ${dots}${xl}</svg>`;
}

/* Vertical bar chart */
function barChart(data, opts){
  opts=opts||{}; const w=opts.w||560,h=opts.h||220,pad={t:16,r:12,b:30,l:34};
  const vals=data.map(d=>d.v), max=Math.max.apply(null,vals)*1.15;
  const iw=w-pad.l-pad.r, ih=h-pad.t-pad.b;
  const bw=iw/data.length*0.55, gap=iw/data.length;
  let grid='';for(let g=0;g<=3;g++){const gy=pad.t+(ih/3)*g;grid+=`<line x1="${pad.l}" y1="${gy}" x2="${w-pad.r}" y2="${gy}" stroke="var(--border-soft)"/><text x="${pad.l-8}" y="${gy+4}" text-anchor="end" font-size="10" fill="var(--text-mute)">${Math.round(max-max/3*g)}</text>`;}
  let bars='';data.forEach((d,i)=>{const x=pad.l+gap*i+(gap-bw)/2; const bh=(d.v/max)*ih; const y=pad.t+ih-bh; const c=d.c||opts.color||'#1B365D';
    bars+=`<rect x="${x}" y="${pad.t+ih}" width="${bw}" height="0" rx="5" fill="${c}"><title>${d.l||d.m}: ${d.v}</title><animate attributeName="height" from="0" to="${bh}" dur=".8s" begin="${i*0.06}s" fill="freeze" calcMode="spline" keySplines="0.4 0 0.2 1" keyTimes="0;1"/><animate attributeName="y" from="${pad.t+ih}" to="${y}" dur=".8s" begin="${i*0.06}s" fill="freeze" calcMode="spline" keySplines="0.4 0 0.2 1" keyTimes="0;1"/></rect>`;
    bars+=`<text x="${x+bw/2}" y="${h-9}" text-anchor="middle" font-size="10" fill="var(--text-mute)">${d.l||d.m}</text>`;});
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" preserveAspectRatio="xMidYMid meet">${grid}${bars}</svg>`;
}

/* Donut chart */
function donutChart(data, opts){
  opts=opts||{}; const size=opts.size||200, r=size/2, sw=opts.sw||26, rad=r-sw/2-4;
  const total=data.reduce((a,d)=>a+d.v,0); let off=0; const C=2*Math.PI*rad;
  let arcs='';data.forEach((d,i)=>{const frac=d.v/total; const dash=frac*C;
    arcs+=`<circle cx="${r}" cy="${r}" r="${rad}" fill="none" stroke="${d.c}" stroke-width="${sw}" stroke-dasharray="${dash} ${C-dash}" stroke-dashoffset="${-off}" transform="rotate(-90 ${r} ${r})" stroke-linecap="butt"><title>${d.l}: ${d.v} (${Math.round(frac*100)}%)</title><animate attributeName="stroke-dasharray" from="0 ${C}" to="${dash} ${C-dash}" dur=".9s" begin="${i*0.12}s" fill="freeze" calcMode="spline" keySplines="0.4 0 0.2 1" keyTimes="0;1"/></circle>`; off+=dash;});
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${arcs}
    <text x="${r}" y="${r-4}" text-anchor="middle" font-size="26" font-weight="700" fill="var(--text)">${total.toLocaleString()}</text>
    <text x="${r}" y="${r+16}" text-anchor="middle" font-size="11" fill="var(--text-mute)">${opts.label||'Total'}</text></svg>`;
}
function donutLegend(data){const total=data.reduce((a,d)=>a+d.v,0);
  return `<div style="display:flex;flex-direction:column;gap:11px">`+data.map(d=>`<div style="display:flex;align-items:center;gap:10px"><span style="width:10px;height:10px;border-radius:3px;background:${d.c};flex-shrink:0"></span><span style="font-size:13.5px;font-weight:500;flex:1">${d.l}</span><span style="font-size:13.5px;font-weight:700">${d.v.toLocaleString()}</span><span style="font-size:12px;color:var(--text-mute);width:38px;text-align:right">${Math.round(d.v/total*100)}%</span></div>`).join('')+`</div>`;
}

/* Horizontal bars */
function hbarChart(data, opts){opts=opts||{};const max=Math.max.apply(null,data.map(d=>d.v))*1.05;
  return `<div style="display:flex;flex-direction:column;gap:14px">`+data.map((d,i)=>`
    <div><div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-size:13px;font-weight:500">${d.l}</span><span style="font-size:13px;font-weight:700;color:var(--text-soft)">${d.v}</span></div>
    <div style="height:10px;border-radius:20px;background:var(--bg-alt);overflow:hidden"><div style="height:100%;border-radius:20px;background:${d.c||opts.color||'#1B365D'};width:0;animation:grow .9s ${i*0.08}s var(--ease) forwards" data-w="${(d.v/max*100).toFixed(1)}%"></div></div></div>`).join('')+
    `</div><style>@keyframes grow{to{width:var(--tw)}}</style>`;
}

/* Sparkline */
function sparkline(data,color){const w=100,h=44,max=Math.max.apply(null,data),min=Math.min.apply(null,data);
  const X=i=>(i/(data.length-1))*w, Y=v=>h-4-((v-min)/(max-min||1))*(h-8);
  let d='';data.forEach((v,i)=>{d+=(i?'L':'M')+X(i).toFixed(1)+' '+Y(v).toFixed(1)+' ';});
  return `<svg class="kpi__spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/></svg>`;
}

/* Heatmap (weeks x days) */
function heatmap(opts){opts=opts||{};const cols=opts.cols||12,rows=7;const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const base=opts.color||'#B87333'; let cells='';
  const seed=[3,1,2,4,0,1,3,2,4,1,0,2,3,4,2,1,3,0,2,4,3,1,2,0,4,3,1,2,0,3,4,2,1,3,0,2];
  for(let r=0;r<rows;r++){for(let c=0;c<cols;c++){const lvl=(seed[(r*cols+c)%seed.length]+((r+c)%3))%5;const op=[0.08,0.28,0.5,0.72,1][lvl];
    cells+=`<div title="${days[r]} · wk ${c+1}: ${lvl*4} events" style="aspect-ratio:1;border-radius:4px;background:${base};opacity:${op};transition:transform .15s" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'"></div>`;}}
  let dl='';days.forEach(d=>dl+=`<div style="font-size:10px;color:var(--text-mute);height:100%;display:flex;align-items:center">${d}</div>`);
  return `<div style="display:flex;gap:8px"><div style="display:grid;grid-template-rows:repeat(7,1fr);gap:4px;padding-top:0">${dl}</div>
    <div style="flex:1;display:grid;grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(7,1fr);gap:4px">${cells}</div></div>`;
}

function hashStr(s){let h=0;for(let i=0;i<s.length;i++)h=s.charCodeAt(i)+((h<<5)-h);return h;}
/* Activate hbar widths after insertion */
function activateBars(root){(root||document).querySelectorAll('[data-w]').forEach(el=>{el.style.setProperty('--tw',el.dataset.w);});}
