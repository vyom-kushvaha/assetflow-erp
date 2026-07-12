/* AssetFlow — Page renderers. PAGES[route](sub) -> html string */
const PAGES = {};

/* ============ shared UI helpers ============ */
function badgeFor(status){
  const map={
    'Allocated':['navy','Allocated'],'Available':['success','Available'],'Reserved':['info','Reserved'],
    'Maintenance':['warning','Maintenance'],'Active':['success','Active'],'On Leave':['warning','On Leave'],
    'Archived':['neutral','Archived'],'In Progress':['info','In Progress'],'Completed':['success','Completed'],
    'Upcoming':['info','Upcoming'],'Ongoing':['navy','Ongoing'],'Cancelled':['danger','Cancelled'],'Retired':['neutral','Retired'],
  };
  const [cls,txt]=map[status]||['neutral',status];
  return `<span class="badge badge--${cls}"><span class="bdot"></span>${txt}</span>`;
}
function priorityBadge(p){const m={Critical:'danger',High:'danger',Medium:'warning',Low:'neutral'};return `<span class="badge badge--${m[p]||'neutral'}">${p}</span>`;}
function avatarCell(name,sub){return `<div class="row-avatar"><div class="mini-avatar" style="background:${avatarColor(name)}">${initials(name)}</div><div><div class="cell-primary">${name}</div>${sub?`<div class="cell-sub">${sub}</div>`:''}</div></div>`;}
function miniAv(name){return `<div class="mini-avatar" style="background:${avatarColor(name)}" title="${name}">${initials(name)}</div>`;}
function ckb(id){return `<span class="ckb" onclick="this.classList.toggle('on')">${ICON('check',12)}</span>`;}
function pagination(total,shown){return `<div class="pagination"><div class="pg-info">Showing <b>1–${shown}</b> of <b>${total}</b> records</div>
  <div class="pg-btns"><button class="pg-btn" disabled>${ICON('chevL',15)}</button>
  <button class="pg-btn active">1</button><button class="pg-btn">2</button><button class="pg-btn">3</button>
  <span style="padding:0 4px;color:var(--text-mute)">…</span><button class="pg-btn">9</button>
  <button class="pg-btn">${ICON('chevR',15)}</button></div></div>`;}
function toolbar(placeholder,extra){return `<div class="toolbar">
  <div class="search-box">${ICON('search')}<input placeholder="${placeholder||'Search…'}" oninput="void 0"></div>
  ${extra||''}</div>`;}

/* ============ DASHBOARD ============ */
PAGES.dashboard = function(){
  const role=STATE.role;
  const kpis=[
    {label:'Assets Available',val:'486',icon:'box',c:'success',trend:'+4.2%',dir:'up',spark:[62,64,63,68,70,69,74,78],col:'#2f9e6f'},
    {label:'Allocated',val:'842',icon:'transfer',c:'navy',trend:'+2.1%',dir:'up',spark:[40,42,45,44,48,52,55,58],col:'#1B365D'},
    {label:'Reserved',val:'228',icon:'calendar',c:'info',trend:'+8.0%',dir:'up',spark:[12,14,13,18,20,19,24,28],col:'#3b6fa0'},
    {label:'In Maintenance',val:'124',icon:'wrench',c:'warning',trend:'-1.4%',dir:'dn',spark:[30,28,26,24,25,22,20,18],col:'#B87333'},
    {label:'Pending Transfers',val:'17',icon:'refresh',c:'info',trend:'+3',dir:'up',spark:[8,10,9,12,11,14,15,17],col:'#3b6fa0'},
    {label:'Upcoming Returns',val:'34',icon:'clock',c:'navy',trend:'7 today',dir:'flat',spark:[20,22,25,24,28,30,32,34],col:'#5b6b76'},
    {label:'Overdue Returns',val:'6',icon:'alert',c:'danger',trend:'+2',dir:'dn',spark:[2,3,3,4,4,5,5,6],col:'#d1524e'},
    {label:'Active Bookings',val:'52',icon:'target',c:'navy',trend:'+11%',dir:'up',spark:[30,34,38,42,45,48,50,52],col:'#1B365D'},
  ];
  const iconBg={success:'background:var(--success-bg);color:var(--success)',navy:'background:rgba(27,54,93,.1);color:var(--navy)',info:'background:var(--info-bg);color:var(--info)',warning:'background:var(--warning-bg);color:var(--warning)',danger:'background:var(--danger-bg);color:var(--danger)'};
  const kpiCards=kpis.map((k,i)=>`
    <div class="kpi kpi--hover reveal" style="animation-delay:${i*0.04}s">
      <div class="kpi__top"><div class="kpi__ico" style="${iconBg[k.c]}">${ICON(k.icon)}</div>
      <span class="kpi__trend ${k.dir==='up'?'trend-up':k.dir==='dn'?'trend-dn':'trend-flat'}">${k.dir==='up'?ICON('arrowUp',13):k.dir==='dn'?ICON('arrowDn',13):''}${k.trend}</span></div>
      <div class="kpi__val">${k.val}</div><div class="kpi__label">${k.label}</div>
      ${sparkline(k.spark,k.col)}
    </div>`).join('');

  const quickActions=`<div class="grid g-2" style="gap:12px">
    ${[['Register Asset','plus','navy',"openRegisterAsset()"],['Book Resource','calendar','copper',"openBookingDrawer()"],['Raise Maintenance','wrench','navy',"openMaintenanceDrawer()"],['Start Audit','audit','copper',"openAuditModal()"]]
      .map(([t,ic,c,fn])=>`<button class="btn btn--${c==='navy'?'ghost':'ghost'}" style="justify-content:flex-start;height:52px" onclick="${fn}"><span class="kpi__ico" style="width:32px;height:32px;${c==='navy'?'background:rgba(27,54,93,.1);color:var(--navy)':'background:var(--warning-bg);color:var(--copper)'}">${ICON(ic,17)}</span>${t}</button>`).join('')}
  </div>`;

  return `
  <div class="kpi-grid">${kpiCards}</div>

  <div class="grid g-2-1 mb-24">
    <div class="card card--pad reveal">
      <div class="card-head"><div><h3>Asset Utilization</h3><p>Monthly utilization rate across all categories</p></div>
        <div class="seg"><button class="active">12M</button><button>6M</button><button>30D</button></div></div>
      ${lineChart(CHARTS.utilization,{labels:CHARTS.utilLabels,color:'#1B365D',w:640,h:240})}
    </div>
    <div class="card card--pad reveal" style="animation-delay:.05s">
      <div class="card-head"><div><h3>Asset Status</h3><p>Current distribution</p></div></div>
      <div style="display:flex;justify-content:center;margin:8px 0 20px">${donutChart(CHARTS.statusSplit,{label:'Total Assets'})}</div>
      ${donutLegend(CHARTS.statusSplit)}
    </div>
  </div>

  <div class="grid g-3 mb-24">
    <div class="card card--pad reveal" style="grid-column:span 2">
      <div class="card-head"><div><h3>Recent Activity</h3><p>Latest actions across the workspace</p></div>
        <button class="btn btn--ghost btn--sm" onclick="navigate('notifications')">View all</button></div>
      <div class="timeline">${DB.activities.map(a=>`
        <div class="tl-item"><span class="tl-dot ${a.dot}"></span>
          <h5>${a.who} <span style="font-weight:400;color:var(--text-soft)">${a.action}</span> ${a.target}</h5>
          <time>${a.time} ago</time></div>`).join('')}</div>
    </div>
    <div class="card card--pad reveal" style="animation-delay:.08s">
      <div class="card-head"><h3>Quick Actions</h3></div>
      ${quickActions}
      <div class="divider"></div>
      <div class="card-head" style="margin-bottom:14px"><h3 style="font-size:15px">Pending Approvals</h3><span class="badge badge--warning">${DB.approvals.length}</span></div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${DB.approvals.slice(0,3).map(a=>`<div style="display:flex;align-items:center;gap:11px;padding:11px;border:1px solid var(--border);border-radius:11px">
          <span class="mini-avatar" style="background:${avatarColor(a.by)}">${initials(a.by)}</span>
          <div style="flex:1;min-width:0"><div class="cell-primary" style="font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${a.title}</div><div class="cell-sub">${a.by} · ${a.type}</div></div>
          <button class="btn--icon btn btn--sm btn--copper" data-tip="Approve" onclick="toast('success','Approved','${a.type} request approved')">${ICON('check',15)}</button></div>`).join('')}
      </div>
    </div>
  </div>

  <div class="grid g-2">
    <div class="card card--pad reveal">
      <div class="card-head"><div><h3>Upcoming Bookings</h3><p>Next scheduled resource reservations</p></div>
        <button class="btn btn--ghost btn--sm" onclick="navigate('booking')">Calendar</button></div>
      <div class="table-scroll"><table class="data"><tbody>
        ${DB.bookings.filter(b=>b.status==='Upcoming'||b.status==='Ongoing').map(b=>`<tr onclick="void 0" style="cursor:pointer">
          <td><div class="cell-primary">${b.resource}</div><div class="cell-sub">${b.asset}</div></td>
          <td>${avatarCell(b.by,b.dept)}</td>
          <td><div class="cell-sub">${b.start.split(' ')[1]} – ${b.end.split(' ')[1]}</div><div class="cell-sub">${b.start.split(' ')[0]}</div></td>
          <td style="text-align:right">${badgeFor(b.status)}</td></tr>`).join('')}
      </tbody></table></div>
    </div>
    <div class="card card--pad reveal" style="animation-delay:.05s">
      <div class="card-head"><div><h3>Maintenance by Month</h3><p>Service requests trend</p></div></div>
      ${barChart(CHARTS.maintenance,{color:'#B87333',w:560,h:236})}
    </div>
  </div>`;
};

/* ============ ORGANIZATION SETUP ============ */
PAGES.organization = function(sub){ return orgPage(sub||'departments'); };
PAGES.departments = ()=>orgPage('departments');
PAGES.categories = ()=>orgPage('categories');
PAGES.employees = ()=>orgPage('employees');

function orgPage(tab){
  const tabs=[['departments','Departments',DB.departments.length],['categories','Categories',DB.categories.length],['employees','Employees',DB.employees.length]];
  const tabHtml=tabs.map(([id,label,n])=>`<div class="tab ${tab===id?'active':''}" onclick="navigate('${id}')">${label}<span class="tcount">${n}</span></div>`).join('');
  let body='';
  if(tab==='departments') body=orgDepartments();
  else if(tab==='categories') body=orgCategories();
  else body=orgEmployees();
  return `<div class="tabs">${tabHtml}</div><div class="page-enter">${body}</div>`;
}

function orgDepartments(){
  const rows=DB.departments.map(d=>`<tr>
    <td>${ckb()}</td>
    <td><div class="cell-primary">${d.name}</div><div class="cell-sub cell-tag">${d.id}</div></td>
    <td>${avatarCell(d.head)}</td>
    <td><div class="cell-primary">${d.employees}</div><div class="cell-sub">members</div></td>
    <td><div class="cell-primary">${d.assets}</div><div class="cell-sub">assets</div></td>
    <td><div class="cell-sub">${d.location}</div></td>
    <td class="cell-primary">${money(d.budget)}</td>
    <td>${badgeFor(d.status)}</td>
    <td style="text-align:right"><button class="btn btn--icon btn--sm btn--ghost" onclick="openDeptDrawer('${d.id}')" data-tip="Edit">${ICON('edit',15)}</button></td>
  </tr>`).join('');
  return `${toolbar('Search departments…',
    `<button class="chip">${ICON('filter')}Status</button><button class="chip">${ICON('location',15)}Location</button><div class="spacer"></div>
     <button class="btn btn--ghost btn--sm">${ICON('download',15)}Export</button>
     <button class="btn btn--primary" onclick="openDeptDrawer()">${ICON('plus')}Add Department</button>`)}
    <div class="table-wrap"><div class="table-scroll"><table class="data">
      <thead><tr><th style="width:44px"></th><th>Department</th><th>Head</th><th>Members</th><th>Assets</th><th>Location</th><th>Annual Budget</th><th>Status</th><th></th></tr></thead>
      <tbody>${rows}</tbody></table></div>${pagination(8,8)}</div>`;
}

function orgCategories(){
  const cards=DB.categories.map((c,i)=>`<div class="card card--pad card--hover reveal" style="animation-delay:${i*0.03}s">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px">
      <div class="kpi__ico" style="width:48px;height:48px;background:var(--copper-tint);color:var(--copper)">${ICON(c.icon,24)}</div>
      <button class="btn btn--icon btn--sm btn--ghost" onclick="openCategoryDrawer('${c.id}')">${ICON('more',15)}</button></div>
    <h3 style="font-size:16px;font-weight:600;margin-bottom:4px">${c.name}</h3>
    <div class="cell-sub cell-tag" style="margin-bottom:16px">${c.id}</div>
    <div style="display:flex;gap:20px">
      <div><div class="kpi__val" style="font-size:22px">${c.assets}</div><div class="cell-sub">Assets</div></div>
      <div style="border-left:1px solid var(--border);padding-left:20px"><div class="fw6" style="font-size:14px">${c.depreciation}</div><div class="cell-sub">Depreciation</div></div>
    </div>
    <div class="divider" style="margin:16px 0"></div>
    <div style="display:flex;justify-content:space-between;align-items:center"><span class="cell-sub">Lifespan · ${c.lifespan}</span>${badgeFor(c.status)}</div>
  </div>`).join('');
  return `${toolbar('Search categories…',
    `<div class="spacer"></div><button class="btn btn--primary" onclick="openCategoryDrawer()">${ICON('plus')}Add Category</button>`)}
    <div class="grid g-3">${cards}</div>`;
}

function orgEmployees(){
  const rows=DB.employees.map(e=>`<tr>
    <td>${ckb()}</td>
    <td>${avatarCell(e.name,e.email)}</td>
    <td><div class="cell-sub cell-tag">${e.id}</div></td>
    <td class="cell-primary">${e.role}</td>
    <td><span class="badge badge--neutral">${e.dept}</span></td>
    <td style="text-align:center"><div class="cell-primary">${e.assets}</div></td>
    <td><div class="cell-sub">${e.joined}</div></td>
    <td>${badgeFor(e.status)}</td>
    <td style="text-align:right"><button class="btn btn--icon btn--sm btn--ghost" onclick="openEmployeeDrawer('${e.id}')" data-tip="Edit">${ICON('edit',15)}</button></td>
  </tr>`).join('');
  return `${toolbar('Search employees…',
    `<button class="chip">${ICON('dept',15)}Department</button><button class="chip">${ICON('filter')}Status</button><div class="spacer"></div>
     <button class="btn btn--ghost btn--sm">${ICON('upload',15)}Import</button>
     <button class="btn btn--primary" onclick="openEmployeeDrawer()">${ICON('plus')}Add Employee</button>`)}
    <div class="table-wrap"><div class="table-scroll"><table class="data">
      <thead><tr><th style="width:44px"></th><th>Name</th><th>ID</th><th>Role</th><th>Department</th><th style="text-align:center">Assets</th><th>Joined</th><th>Status</th><th></th></tr></thead>
      <tbody>${rows}</tbody></table></div>${pagination(154,12)}</div>`;
}

/* ============ ASSETS ============ */
let ASSET_VIEW='list';
PAGES.assets = function(sub){
  if(sub && sub!=='register'){ const a=DB.assets.find(x=>x.id===sub); if(a) return assetDetails(a); }
  if(sub==='register') return registerAsset();
  return assetDirectory();
};

function statusIcon(s){return {Allocated:'transfer',Available:'check2',Reserved:'clock',Maintenance:'wrench'}[s]||'box';}
function assetDirectory(){
  const filters=`<button class="chip">${ICON('tag',15)}Category</button><button class="chip">${ICON('filter')}Status</button>
    <button class="chip">${ICON('dept',15)}Department</button><button class="chip">${ICON('location',15)}Location</button>`;
  const listView=`<div class="table-wrap"><div class="table-scroll"><table class="data">
    <thead><tr><th style="width:44px"></th><th>Asset</th><th>Tag</th><th>Category</th><th>Status</th><th>Department</th><th>Holder</th><th>Value</th><th></th></tr></thead>
    <tbody>${DB.assets.map(a=>`<tr style="cursor:pointer" onclick="navigate('assets','${a.id}')">
      <td onclick="event.stopPropagation()">${ckb()}</td>
      <td><div class="cell-primary">${a.name}</div><div class="cell-sub">SN · ${a.serial}</div></td>
      <td><span class="cell-tag">${a.tag}</span></td>
      <td><div class="cell-sub">${a.cat}</div></td>
      <td>${badgeFor(a.status)}</td>
      <td><span class="badge badge--neutral">${a.dept}</span></td>
      <td>${a.holder==='—'?'<span class="cell-sub">Unassigned</span>':avatarCell(a.holder)}</td>
      <td class="cell-primary">${money(a.value)}</td>
      <td style="text-align:right" onclick="event.stopPropagation()"><button class="btn btn--icon btn--sm btn--ghost" onclick="navigate('assets','${a.id}')" data-tip="View">${ICON('eye',15)}</button></td>
    </tr>`).join('')}</tbody></table></div>${pagination(1284,15)}</div>`;

  const cardView=`<div class="grid g-3">${DB.assets.map((a,i)=>`
    <div class="card card--pad card--hover reveal" style="animation-delay:${i*0.02}s;cursor:pointer" onclick="navigate('assets','${a.id}')">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px">
        <div class="kpi__ico" style="width:46px;height:46px;background:var(--bg);border:1px solid var(--border);color:var(--slate)">${ICON('box',22)}</div>
        ${badgeFor(a.status)}</div>
      <h3 style="font-size:15px;font-weight:600;margin-bottom:4px;line-height:1.35">${a.name}</h3>
      <div class="cell-tag" style="margin-bottom:14px">${a.tag}</div>
      <div class="dl" style="grid-template-columns:1fr 1fr;gap:12px">
        <div class="dl__item"><div class="dl-label">Category</div><div class="dl-val" style="font-size:13px">${a.cat.split(' ')[0]}</div></div>
        <div class="dl__item"><div class="dl-label">Value</div><div class="dl-val" style="font-size:13px">${money(a.value)}</div></div>
      </div>
      <div class="divider" style="margin:14px 0"></div>
      <div style="display:flex;align-items:center;justify-content:space-between">
        ${a.holder==='—'?'<span class="cell-sub">Unassigned</span>':avatarCell(a.holder)}
        <span class="cell-sub">${a.dept}</span></div>
    </div>`).join('')}</div>`;

  return `<div class="toolbar">
    <div class="search-box">${ICON('search')}<input placeholder="Search by name, tag or serial…"></div>
    <button class="chip" onclick="openQRModal()">${ICON('qr',15)}QR Scan</button>
    ${filters}
    <div class="spacer"></div>
    <div class="seg"><button class="${ASSET_VIEW==='list'?'active':''}" onclick="ASSET_VIEW='list';renderContent()">${ICON('list',15)}</button>
    <button class="${ASSET_VIEW==='card'?'active':''}" onclick="ASSET_VIEW='card';renderContent()">${ICON('grid',15)}</button></div>
    <button class="btn btn--primary" onclick="navigate('assets','register')">${ICON('plus')}Register Asset</button>
  </div>
  ${ASSET_VIEW==='list'?listView:cardView}`;
}

function assetDetails(a){
  const tabs=['Overview','Documents','Allocation History','Maintenance History','Audit History','Timeline'];
  return `<button class="btn btn--ghost btn--sm mb-24" onclick="navigate('assets')">${ICON('chevL',15)}Back to Directory</button>
  <div class="grid g-2-1">
    <div>
      <div class="card card--pad mb-24">
        <div style="display:flex;gap:20px;align-items:flex-start">
          <div class="kpi__ico" style="width:72px;height:72px;border-radius:16px;background:var(--bg);border:1px solid var(--border);color:var(--slate)">${ICON('box',34)}</div>
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><h2 style="font-size:22px;font-weight:700;letter-spacing:-.02em">${a.name}</h2>${badgeFor(a.status)}</div>
            <div style="display:flex;gap:16px;margin-top:8px;flex-wrap:wrap">
              <span class="cell-tag">${a.tag}</span>
              <span class="cell-sub" style="display:inline-flex;align-items:center;gap:5px">${ICON('shield',13)}Serial · ${a.serial}</span>
              <span class="cell-sub">Condition · <b style="color:var(--text)">${a.condition}</b></span></div>
          </div>
          <button class="btn btn--icon btn--ghost" onclick="openQRModal('${a.tag}')" data-tip="Show QR">${ICON('qr',18)}</button>
        </div>
        <div class="tabs" style="margin-top:24px;margin-bottom:0">${tabs.map((t,i)=>`<div class="tab ${i===0?'active':''}" onclick="switchAssetTab(this,${i})">${t}</div>`).join('')}</div>
      </div>
      <div id="assetTabBody">${assetOverview(a)}</div>
    </div>
    <div>
      <div class="card card--pad mb-24">
        <div class="card-head"><h3>Quick Actions</h3></div>
        <div style="display:flex;flex-direction:column;gap:10px">
          <button class="btn btn--primary btn--block" onclick="openTransferModal('${a.id}')">${ICON('transfer',16)}Transfer Asset</button>
          <button class="btn btn--ghost btn--block" onclick="openMaintenanceDrawer('${a.id}')">${ICON('wrench',16)}Raise Maintenance</button>
          <button class="btn btn--ghost btn--block" onclick="openBookingDrawer('${a.id}')">${ICON('calendar',16)}Book Resource</button>
          <button class="btn btn--danger btn--block" onclick="confirmDialog('Retire Asset','Are you sure you want to retire this asset? It will be removed from active inventory.',()=>toast('success','Asset retired','${a.name} has been retired'),'Retire Asset',true)">${ICON('trash',16)}Retire Asset</button>
        </div>
      </div>
      <div class="card card--pad">
        <div class="card-head"><h3>Financials</h3></div>
        <div class="dl">
          <div class="dl__item"><div class="dl-label">Purchase Value</div><div class="dl-val">${money(a.value)}</div></div>
          <div class="dl__item"><div class="dl-label">Current Value</div><div class="dl-val">${money(Math.round(a.value*0.72))}</div></div>
          <div class="dl__item"><div class="dl-label">Purchased</div><div class="dl-val">${a.purchased}</div></div>
          <div class="dl__item"><div class="dl-label">Warranty Until</div><div class="dl-val">${a.warranty}</div></div>
        </div>
        <div class="divider"></div>
        <div class="dl-label" style="margin-bottom:8px">Depreciation · 72% of value</div>
        <div class="progress"><div class="progress__bar navy" data-w="72%" style="--tw:72%;animation:grow .8s var(--ease) forwards;width:0"></div></div>
      </div>
    </div>
  </div>`;
}
function assetOverview(a){
  return `<div class="card card--pad">
    <div class="card-head"><h3>Asset Details</h3><button class="btn btn--ghost btn--sm">${ICON('edit',15)}Edit</button></div>
    <div class="dl">
      <div class="dl__item"><div class="dl-label">Category</div><div class="dl-val">${a.cat}</div></div>
      <div class="dl__item"><div class="dl-label">Department</div><div class="dl-val">${a.dept}</div></div>
      <div class="dl__item"><div class="dl-label">Current Holder</div><div class="dl-val">${a.holder==='—'?'Unassigned':a.holder}</div></div>
      <div class="dl__item"><div class="dl-label">Location</div><div class="dl-val">${a.location}</div></div>
      <div class="dl__item"><div class="dl-label">Serial Number</div><div class="dl-val">${a.serial}</div></div>
      <div class="dl__item"><div class="dl-label">Condition</div><div class="dl-val">${a.condition}</div></div>
    </div>
    <div class="divider"></div>
    <div class="card-head" style="margin-bottom:14px"><h3 style="font-size:15px">Recent Timeline</h3></div>
    ${assetTimeline(a)}
  </div>`;
}
function assetTimeline(a){
  const ev=[
    {t:'Allocated to '+(a.holder==='—'?'inventory pool':a.holder),d:'2024-03-02 · 14:22',dot:'navy'},
    {t:'Maintenance completed — routine inspection',d:'2024-01-18 · 09:10',dot:'success'},
    {t:'Transferred from IT Operations',d:'2023-11-05 · 16:45',dot:'copper'},
    {t:'Registered into inventory',d:a.purchased+' · 10:00',dot:'navy'},
  ];
  return `<div class="timeline">${ev.map(e=>`<div class="tl-item"><span class="tl-dot ${e.dot}"></span><h5>${e.t}</h5><time>${e.d}</time></div>`).join('')}</div>`;
}
function assetDocsTab(a){const docs=[['Purchase Invoice.pdf','248 KB','file'],['Warranty Certificate.pdf','1.2 MB','shield'],['User Manual.pdf','4.8 MB','file'],['Insurance Policy.pdf','320 KB','file']];
  return `<div class="card card--pad"><div class="card-head"><h3>Documents</h3><button class="btn btn--primary btn--sm">${ICON('upload',15)}Upload</button></div>
  <div style="display:flex;flex-direction:column;gap:10px">${docs.map(([n,s,ic])=>`<div style="display:flex;align-items:center;gap:14px;padding:14px;border:1px solid var(--border);border-radius:12px">
    <div class="kpi__ico" style="width:42px;height:42px;background:var(--danger-bg);color:var(--danger)">${ICON(ic,20)}</div>
    <div style="flex:1"><div class="cell-primary">${n}</div><div class="cell-sub">${s} · uploaded 2024-03-02</div></div>
    <button class="btn btn--icon btn--sm btn--ghost">${ICON('download',15)}</button></div>`).join('')}</div></div>`;}
function assetHistoryTab(a,type){
  const data={alloc:[['Hannah Cole','Engineering','2024-03-02','Active'],['IT Pool','IT Operations','2023-11-05','Returned'],['Ravi Kapoor','IT Operations','2023-06-10','Returned']],
    maint:[['Routine inspection','Tom Fischer','2024-01-18','Resolved'],['Screen calibration','Priya Sharma','2023-08-22','Resolved']],
    audit:[['Q3 2026 Full Audit','Priya Sharma','2026-07-08','Verified'],['Engineering Spot Check','Aarav Mehta','2026-06-15','Verified']]};
  const cols={alloc:['Holder','Department','From','Status'],maint:['Issue','Technician','Date','Status'],audit:['Cycle','Auditor','Date','Result']};
  const rows=data[type], c=cols[type];
  return `<div class="table-wrap"><table class="data"><thead><tr>${c.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(r=>`<tr><td class="cell-primary">${r[0]}</td><td>${r[1]}</td><td class="cell-sub">${r[2]}</td><td>${badgeFor(r[3])||`<span class="badge badge--success">${r[3]}</span>`}</td></tr>`).join('')}</tbody></table></div>`;}

function registerAsset(){
  return `<button class="btn btn--ghost btn--sm mb-24" onclick="navigate('assets')">${ICON('chevL',15)}Back to Directory</button>
  <div class="grid g-2-1">
    <div class="card card--pad">
      <div class="card-head"><div><h3>Register New Asset</h3><p>Add a new asset to the organization inventory</p></div></div>
      <div class="grid g-2">
        <div class="field"><label>Asset Name <span class="req">*</span></label><input class="input" placeholder="e.g. MacBook Pro 16″ M3"></div>
        <div class="field"><label>Asset Tag <span class="req">*</span></label><input class="input" placeholder="NW-LT-0000"></div>
        <div class="field"><label>Category <span class="req">*</span></label><select class="select">${DB.categories.map(c=>`<option>${c.name}</option>`).join('')}</select></div>
        <div class="field"><label>Department</label><select class="select">${DB.departments.map(d=>`<option>${d.name}</option>`).join('')}</select></div>
        <div class="field"><label>Serial Number</label><input class="input" placeholder="Manufacturer serial"></div>
        <div class="field"><label>Location</label><input class="input" placeholder="Building · Floor"></div>
        <div class="field"><label>Purchase Value ($)</label><input class="input" type="number" placeholder="0.00"></div>
        <div class="field"><label>Purchase Date</label><input class="input" type="date"></div>
        <div class="field"><label>Warranty Expiry</label><input class="input" type="date"></div>
        <div class="field"><label>Condition</label><select class="select"><option>Excellent</option><option>Good</option><option>Fair</option><option>Poor</option></select></div>
      </div>
      <div class="field"><label>Notes</label><textarea class="textarea" placeholder="Additional details about this asset…"></textarea></div>
      <div class="flex gap-12 mt-8"><button class="btn btn--primary" onclick="fakeSubmit('New asset registered successfully')">${ICON('check',16)}Register Asset</button>
        <button class="btn btn--ghost" onclick="navigate('assets')">Cancel</button></div>
    </div>
    <div>
      <div class="card card--pad mb-24" style="text-align:center">
        <div class="card-head" style="justify-content:center"><h3>QR / Barcode</h3></div>
        <div style="width:180px;height:180px;margin:0 auto;border:1px solid var(--border);border-radius:16px;display:grid;place-items:center;background:var(--bg);color:var(--slate)">${ICON('qrLarge',110)}</div>
        <p class="cell-sub mt-16">A unique QR code is generated automatically on registration for physical tagging.</p>
      </div>
      <div class="card card--pad">
        <div class="card-head"><h3>Asset Image</h3></div>
        <div style="border:2px dashed var(--border);border-radius:14px;padding:36px;text-align:center;cursor:pointer" onclick="toast('info','Upload','File picker (demo)')">
          <div class="empty__ico" style="margin-bottom:12px">${ICON('camera',28)}</div>
          <p class="cell-primary" style="font-size:14px">Drop an image or click to upload</p><p class="cell-sub">PNG, JPG up to 10MB</p></div>
      </div>
    </div>
  </div>`;
}

/* ============ ALLOCATION & TRANSFER ============ */
PAGES.allocation = function(){
  const a=DB.assets.find(x=>x.status==='Allocated');
  const pending=[
    {asset:'Cisco Catalyst 9300 Switch',from:'IT Pool',to:'Ravi Kapoor',dept:'IT Operations',date:'2026-07-11',status:'Pending'},
    {asset:'Dell Precision 7680 WS',from:'Engineering Pool',to:'Hannah Cole',dept:'Engineering',date:'2026-07-10',status:'Approved'},
    {asset:'iPad Pro 12.9″ M2',from:'Lena Vargas',to:'Elena Rossi',dept:'Design',date:'2026-07-09',status:'Pending'},
  ];
  return `<div class="grid g-2-1 mb-24">
    <div class="card card--pad">
      <div class="card-head"><div><h3>Asset Allocation</h3><p>Selected asset details & current custody</p></div>${badgeFor(a.status)}</div>
      <div style="display:flex;gap:18px;align-items:center;padding:18px;background:var(--bg);border-radius:14px;margin-bottom:20px">
        <div class="kpi__ico" style="width:56px;height:56px;background:var(--card);border:1px solid var(--border);color:var(--slate)">${ICON('box',26)}</div>
        <div style="flex:1"><h3 style="font-size:17px">${a.name}</h3><div class="cell-tag">${a.tag}</div></div>
      </div>
      <div class="dl mb-24">
        <div class="dl__item"><div class="dl-label">Current Holder</div><div class="dl-val">${avatarCell(a.holder,a.dept)}</div></div>
        <div class="dl__item"><div class="dl-label">Location</div><div class="dl-val">${a.location}</div></div>
        <div class="dl__item"><div class="dl-label">Allocated On</div><div class="dl-val">2024-03-02</div></div>
        <div class="dl__item"><div class="dl-label">Expected Return</div><div class="dl-val">2026-09-01</div></div>
      </div>
      <div class="flex gap-12">
        <button class="btn btn--primary" onclick="openTransferModal('${a.id}')">${ICON('transfer',16)}Transfer</button>
        <button class="btn btn--copper" onclick="openModal('Allocate Asset','Assign this asset to a new custodian',allocFormBody(),allocFooter())">${ICON('plus')}Allocate</button>
        <button class="btn btn--ghost" onclick="confirmDialog('Return Asset','Return this asset to the department pool?',()=>toast('success','Asset returned','${a.name} returned to pool'),'Return')">${ICON('refresh',16)}Return</button>
      </div>
    </div>
    <div class="card card--pad">
      <div class="card-head"><h3>Allocation Timeline</h3></div>
      <div class="timeline">
        <div class="tl-item"><span class="tl-dot navy"></span><h5>Allocated to Hannah Cole</h5><p class="cell-sub">Engineering · Building A Floor 3</p><time>2024-03-02</time></div>
        <div class="tl-item"><span class="tl-dot copper"></span><h5>Transfer approved</h5><p class="cell-sub">By Daniel Okafor</p><time>2024-03-01</time></div>
        <div class="tl-item"><span class="tl-dot success"></span><h5>Returned to pool</h5><p class="cell-sub">From Ravi Kapoor</p><time>2023-11-05</time></div>
        <div class="tl-item"><span class="tl-dot navy"></span><h5>Initial allocation</h5><p class="cell-sub">IT Operations</p><time>2023-06-10</time></div>
      </div>
    </div>
  </div>
  <div class="card card--pad">
    <div class="card-head"><div><h3>Transfer Requests</h3><p>Pending & recent allocation changes</p></div>
      <button class="btn btn--primary btn--sm" onclick="openTransferModal()">${ICON('plus')}New Transfer</button></div>
    <div class="table-wrap"><table class="data">
      <thead><tr><th>Asset</th><th>From</th><th>To</th><th>Department</th><th>Requested</th><th>Status</th><th></th></tr></thead>
      <tbody>${pending.map(p=>`<tr>
        <td class="cell-primary">${p.asset}</td>
        <td><span class="cell-sub">${p.from}</span></td>
        <td>${avatarCell(p.to)}</td>
        <td><span class="badge badge--neutral">${p.dept}</span></td>
        <td class="cell-sub">${p.date}</td>
        <td>${p.status==='Approved'?'<span class="badge badge--success"><span class="bdot"></span>Approved</span>':'<span class="badge badge--warning"><span class="bdot"></span>Pending</span>'}</td>
        <td style="text-align:right">${p.status==='Pending'?`<div class="flex gap-8" style="justify-content:flex-end"><button class="btn btn--icon btn--sm btn--copper" data-tip="Approve" onclick="toast('success','Approved','Transfer approved')">${ICON('check',15)}</button><button class="btn btn--icon btn--sm btn--danger" data-tip="Reject" onclick="toast('danger','Rejected','Transfer rejected')">${ICON('x',15)}</button></div>`:`<button class="btn btn--icon btn--sm btn--ghost">${ICON('eye',15)}</button>`}</td>
      </tr>`).join('')}</tbody></table></div>
  </div>`;
};
function allocFormBody(){return `<div class="field"><label>Assign To <span class="req">*</span></label><select class="select">${DB.employees.map(e=>`<option>${e.name} — ${e.dept}</option>`).join('')}</select></div>
  <div class="field"><label>Expected Return Date</label><input class="input" type="date"></div>
  <div class="field"><label>Purpose / Notes</label><textarea class="textarea" placeholder="Reason for allocation…"></textarea></div>`;}
function allocFooter(){return `<button class="btn btn--ghost" onclick="closeLayer()">Cancel</button><button class="btn btn--primary" onclick="fakeSubmit('Asset allocated successfully')">Confirm Allocation</button>`;}

/* ============ BOOKING ============ */
PAGES.booking = function(){
  const tabs=[['Upcoming',3],['Ongoing',1],['Completed',1],['Cancelled',1]];
  return `<div class="toolbar">
    <div class="seg"><button class="active">${ICON('calendar',15)} Calendar</button><button onclick="toast('info','View','Timeline view (demo)')">${ICON('list',15)} Timeline</button></div>
    <div class="spacer"></div>
    <button class="btn btn--ghost btn--sm">${ICON('chevL',15)}</button><span class="fw6" style="min-width:120px;text-align:center">July 2026</span><button class="btn btn--ghost btn--sm">${ICON('chevR',15)}</button>
    <button class="btn btn--primary" onclick="openBookingDrawer()">${ICON('plus')}Book Slot</button>
  </div>
  <div class="grid g-2-1">
    <div class="card" style="padding:0;overflow:hidden">${bookingCalendar()}</div>
    <div class="card card--pad">
      <div class="card-head"><h3>Reservations</h3></div>
      <div class="tabs" style="margin-bottom:18px">${tabs.map((t,i)=>`<div class="tab ${i===0?'active':''}" style="padding:8px 12px;font-size:13px" onclick="filterBookings(this,'${t[0]}')">${t[0]}<span class="tcount">${t[1]}</span></div>`).join('')}</div>
      <div id="bookingList" style="display:flex;flex-direction:column;gap:12px">${bookingCards('Upcoming')}</div>
    </div>
  </div>`;
};
function bookingCards(status){
  const items=DB.bookings.filter(b=>status==='All'?true:b.status===status);
  if(!items.length) return `<div class="empty"><div class="empty__ico">${ICON('calendar',30)}</div><h4>No ${status.toLowerCase()} bookings</h4><p>Reservations will appear here once scheduled.</p></div>`;
  return items.map(b=>`<div class="card card--pad card--hover" style="padding:16px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px"><span class="cell-tag">${b.id}</span>${badgeFor(b.status)}</div>
    <h5 style="font-size:15px;font-weight:600;margin-bottom:3px">${b.resource}</h5>
    <p class="cell-sub" style="margin-bottom:12px">${b.asset}</p>
    <div style="display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px solid var(--border-soft)">
      ${avatarCell(b.by)}<div style="text-align:right"><div class="fw6" style="font-size:13px">${b.start.split(' ')[1]}–${b.end.split(' ')[1]}</div><div class="cell-sub">${b.start.split(' ')[0]}</div></div></div>
  </div>`).join('');
}
function bookingCalendar(){
  const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const events={12:[['Sales Sync','navy']],13:[['Lab Booking','teal']],14:[['Design Studio','navy'],['Van Pickup','copper']],18:[['Fleet Service','copper']],22:[['Audit Review','teal']],25:[['Team Offsite','navy']]};
  let cells='';
  const startPad=3; // July 1 2026 is Wednesday
  for(let i=0;i<startPad;i++)cells+=`<div class="cal-cell dim"><div class="cal-date">${28+i}</div></div>`;
  for(let d=1;d<=31;d++){const ev=events[d]||[];const today=d===12;
    cells+=`<div class="cal-cell ${today?'today':''}"><div class="cal-date">${d}</div>${ev.map(([t,c])=>`<div class="cal-ev ${c}" onclick="toast('info','${t}','Booking on July ${d}')">${t}</div>`).join('')}</div>`;}
  return `<div class="cal"><div class="cal__head">${days.map(d=>`<div>${d}</div>`).join('')}</div><div class="cal__grid">${cells}</div></div>`;
}

/* ============ MAINTENANCE ============ */
const MAINT_STAGES=[['pending','Pending','#8b95a1'],['approved','Approved','#3b6fa0'],['assigned','Technician Assigned','#B87333'],['in-progress','In Progress','#1B365D'],['resolved','Resolved','#2f9e6f']];
PAGES.maintenance = function(){
  return `<div class="toolbar">
    <div class="search-box">${ICON('search')}<input placeholder="Search maintenance requests…"></div>
    <button class="chip">${ICON('filter')}Priority</button><button class="chip">${ICON('dept',15)}Department</button>
    <div class="spacer"></div>
    <div class="seg"><button class="active">${ICON('columns',15)} Board</button><button onclick="toast('info','View','List view (demo)')">${ICON('list',15)} List</button></div>
    <button class="btn btn--primary" onclick="openMaintenanceDrawer()">${ICON('plus')}New Request</button>
  </div>
  <div class="kanban">${MAINT_STAGES.map(([id,label,color])=>{
    const cards=DB.maintenance.filter(m=>m.stage===id);
    return `<div class="kcol" ondragover="event.preventDefault();this.classList.add('drop-target')" ondragleave="this.classList.remove('drop-target')" ondrop="dropCard(event,'${id}','${label}')">
      <div class="kcol__head"><span class="kcol__dot" style="background:${color}"></span><b>${label}</b><span class="kc-count">${cards.length}</span></div>
      <div class="kcol__body">${cards.map(m=>maintCard(m)).join('')||`<div style="padding:24px 8px;text-align:center" class="cell-sub">No requests</div>`}</div>
    </div>`;}).join('')}</div>`;
};
function maintCard(m){
  return `<div class="kcard" draggable="true" ondragstart="dragCard(event,'${m.id}')" onclick="openMaintDetail('${m.id}')">
    <div class="kcard__top"><span class="cell-tag">${m.id}</span>${priorityBadge(m.priority)}</div>
    <h5>${m.asset}</h5><p>${m.issue}</p>
    <div class="kcard__foot">
      <div class="kc-tech">${m.tech==='—'?`<span class="cell-sub">Unassigned</span>`:`${miniAv(m.tech)}<span>${m.tech.split(' ')[0]}</span>`}</div>
      <span class="cell-sub" style="display:inline-flex;align-items:center;gap:4px">${ICON('clock',12)}${m.created.slice(5)}</span>
    </div></div>`;
}

/* ============ AUDIT ============ */
PAGES.audit = function(){
  const active=DB.audits.find(a=>a.status==='In Progress');
  return `<div class="grid g-3 mb-24">
    ${[['Active Cycles','2','audit','navy'],['Assets Verified','1,313','check2','success'],['Discrepancies','43','alert','danger']].map(([l,v,ic,c])=>`
      <div class="card card--pad kpi--hover reveal">
        <div class="kpi__top"><div class="kpi__ico" style="${c==='navy'?'background:rgba(27,54,93,.1);color:var(--navy)':c==='success'?'background:var(--success-bg);color:var(--success)':'background:var(--danger-bg);color:var(--danger)'}">${ICON(ic)}</div></div>
        <div class="kpi__val">${v}</div><div class="kpi__label">${l}</div></div>`).join('')}
  </div>
  <div class="card card--pad mb-24">
    <div class="card-head"><div><h3>${active.name}</h3><p>Auditor · ${active.auditor} · Due ${active.due}</p></div>
      <div class="flex gap-12">${badgeFor(active.status)}<button class="btn btn--primary btn--sm" onclick="openAuditModal()">${ICON('plus')}New Cycle</button></div></div>
    <div style="display:flex;gap:24px;align-items:center;margin-bottom:20px">
      <div style="flex:1"><div style="display:flex;justify-content:space-between;margin-bottom:8px"><span class="fw6">Verification Progress</span><span class="fw6" style="color:var(--copper)">${active.progress}%</span></div>
        <div class="progress" style="height:12px"><div class="progress__bar" data-w="${active.progress}%" style="--tw:${active.progress}%;width:0;animation:grow 1s var(--ease) forwards"></div></div></div>
    </div>
    <div class="grid g-3">
      <div style="padding:16px;background:var(--success-bg);border-radius:12px"><div class="flex items-center gap-8" style="color:var(--success)">${ICON('check2',18)}<span class="fw6">Verified</span></div><div class="kpi__val" style="margin-top:8px;color:var(--success)">${active.verified}</div></div>
      <div style="padding:16px;background:var(--warning-bg);border-radius:12px"><div class="flex items-center gap-8" style="color:var(--warning)">${ICON('alert',18)}<span class="fw6">Missing</span></div><div class="kpi__val" style="margin-top:8px;color:var(--warning)">${active.missing}</div></div>
      <div style="padding:16px;background:var(--danger-bg);border-radius:12px"><div class="flex items-center gap-8" style="color:var(--danger)">${ICON('x',18)}<span class="fw6">Damaged</span></div><div class="kpi__val" style="margin-top:8px;color:var(--danger)">${active.damaged}</div></div>
    </div>
  </div>
  <div class="card card--pad">
    <div class="card-head"><div><h3>Audit Cycles</h3><p>All verification cycles</p></div></div>
    <div class="table-wrap"><table class="data">
      <thead><tr><th>Cycle</th><th>Auditor</th><th>Scope</th><th>Progress</th><th>Verified</th><th>Discrepancies</th><th>Status</th><th></th></tr></thead>
      <tbody>${DB.audits.map(a=>`<tr>
        <td><div class="cell-primary">${a.name}</div><div class="cell-sub cell-tag">${a.id}</div></td>
        <td>${avatarCell(a.auditor)}</td>
        <td><span class="badge badge--neutral">${a.scope}</span></td>
        <td style="min-width:140px"><div class="flex items-center gap-8"><div class="progress" style="flex:1"><div class="progress__bar" style="width:${a.progress}%"></div></div><span class="cell-sub fw6">${a.progress}%</span></div></td>
        <td class="cell-primary">${a.verified}/${a.total}</td>
        <td><span class="badge badge--danger">${a.missing+a.damaged}</span></td>
        <td>${badgeFor(a.status)}</td>
        <td style="text-align:right"><button class="btn btn--icon btn--sm btn--ghost" onclick="openAuditReport('${a.id}')" data-tip="Report">${ICON('eye',15)}</button></td>
      </tr>`).join('')}</tbody></table></div>
  </div>`;
};

/* ============ REPORTS ============ */
PAGES.reports = function(){
  return `<div class="toolbar">
    <div class="seg"><button class="active">Overview</button><button onclick="toast('info','Report','Custom report builder (demo)')">Utilization</button><button onclick="toast('info','Report','Cost analysis (demo)')">Cost</button></div>
    <div class="spacer"></div>
    <button class="chip">${ICON('calendar',15)}Last 12 months</button>
    <button class="btn btn--ghost btn--sm" onclick="toast('success','Exported','Report exported to Excel')">${ICON('download',15)}Excel</button>
    <button class="btn btn--primary btn--sm" onclick="toast('success','Exported','Report exported to PDF')">${ICON('file',15)}Export PDF</button>
  </div>
  <div class="grid g-2 mb-24">
    <div class="card card--pad"><div class="card-head"><div><h3>Asset Utilization Trend</h3><p>Rolling 12-month utilization %</p></div><span class="badge badge--success">${ICON('trendUp',13)}+28% YoY</span></div>${lineChart(CHARTS.utilization,{labels:CHARTS.utilLabels,color:'#B87333',w:600,h:240})}</div>
    <div class="card card--pad"><div class="card-head"><div><h3>Maintenance Trends</h3><p>Monthly service volume</p></div></div>${barChart(CHARTS.maintenance,{color:'#1B365D',w:600,h:240})}</div>
  </div>
  <div class="grid g-3 mb-24">
    <div class="card card--pad"><div class="card-head"><h3>Allocation by Category</h3></div><div style="display:flex;justify-content:center;margin:8px 0 18px">${donutChart(CHARTS.allocByCat,{label:'Allocated'})}</div>${donutLegend(CHARTS.allocByCat)}</div>
    <div class="card card--pad" style="grid-column:span 2"><div class="card-head"><div><h3>Department Summary</h3><p>Assets managed per department</p></div></div>${hbarChart(CHARTS.deptAssets,{color:'#1B365D'})}</div>
  </div>
  <div class="grid g-2-1">
    <div class="card card--pad"><div class="card-head"><div><h3>Booking Activity Heatmap</h3><p>Reservation density · last 12 weeks</p></div></div>${heatmap({color:'#B87333'})}
      <div class="flex items-center gap-8 mt-16" style="justify-content:flex-end"><span class="cell-sub">Less</span>${[0.15,0.35,0.55,0.78,1].map(o=>`<span style="width:14px;height:14px;border-radius:4px;background:var(--copper);opacity:${o}"></span>`).join('')}<span class="cell-sub">More</span></div>
    </div>
    <div class="card card--pad"><div class="card-head"><div><h3>Booking Trend</h3><p>Monthly reservations</p></div></div>${lineChart(CHARTS.bookingTrend,{labels:CHARTS.utilLabels,color:'#3d8a80',w:360,h:200})}
      <div class="divider"></div>
      <div class="dl"><div class="dl__item"><div class="dl-label">Avg / month</div><div class="dl-val">46</div></div><div class="dl__item"><div class="dl-label">Peak month</div><div class="dl-val">Jul · 67</div></div></div>
    </div>
  </div>`;
};

/* ============ NOTIFICATIONS ============ */
let NOTIF_FILTER='all';
PAGES.notifications = function(){
  const items=DB.notifications.filter(n=>NOTIF_FILTER==='all'?true:NOTIF_FILTER==='unread'?n.unread:!n.unread);
  const unread=DB.notifications.filter(n=>n.unread).length;
  const iconBg={warning:'background:var(--warning-bg);color:var(--warning)',info:'background:var(--info-bg);color:var(--info)',success:'background:var(--success-bg);color:var(--success)',danger:'background:var(--danger-bg);color:var(--danger)'};
  return `<div class="grid g-1-2" style="grid-template-columns:280px 1fr">
    <div>
      <div class="card card--pad mb-24">
        <div class="card-head"><h3>Inbox</h3><span class="badge badge--copper" style="background:var(--copper-soft);color:var(--copper)">${unread} new</span></div>
        <div style="display:flex;flex-direction:column;gap:4px">
          ${[['all','All',DB.notifications.length,'bell'],['unread','Unread',unread,'mail'],['read','Read',DB.notifications.length-unread,'check2']].map(([id,l,n,ic])=>`
            <div class="nav-subitem" style="color:var(--text-soft);${NOTIF_FILTER===id?'background:var(--hover);color:var(--copper);font-weight:600':''}" onclick="NOTIF_FILTER='${id}';renderContent()"><span style="width:auto;height:auto;background:none">${ICON(ic,16)}</span>${l}<span style="margin-left:auto" class="badge badge--neutral">${n}</span></div>`).join('')}
        </div>
        <div class="divider"></div>
        <div class="menu-label" style="padding-left:0">Priority</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${[['High','danger'],['Medium','warning'],['Low','neutral']].map(([p,c])=>`<div class="flex items-center gap-8"><span class="badge badge--${c}">${p}</span><span class="cell-sub" style="margin-left:auto">${DB.notifications.filter(n=>n.priority===p).length}</span></div>`).join('')}
        </div>
      </div>
      <button class="btn btn--ghost btn--block" onclick="toast('success','Done','All notifications marked as read')">${ICON('check2',16)}Mark all read</button>
    </div>
    <div class="card card--pad">
      <div class="card-head"><div><h3>Notifications</h3><p>${items.length} messages</p></div>
        <div class="search-box" style="max-width:220px;min-width:180px">${ICON('search')}<input placeholder="Search…"></div></div>
      <div style="display:flex;flex-direction:column">
        ${items.map((n,i)=>`<div class="reveal" style="animation-delay:${i*0.03}s;display:flex;gap:14px;padding:16px;border-radius:12px;transition:background .15s;cursor:pointer;${n.unread?'background:var(--hover)':''}" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background='${n.unread?'var(--hover)':'transparent'}'" onclick="toast('info','Opened','${n.title}')">
          <div class="kpi__ico" style="${iconBg[n.type]};flex-shrink:0">${ICON(n.icon,20)}</div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:10px"><b style="font-size:14.5px">${n.title}</b>${n.unread?'<span style="width:8px;height:8px;border-radius:50%;background:var(--copper)"></span>':''}<span class="badge badge--${n.priority==='High'?'danger':n.priority==='Medium'?'warning':'neutral'}" style="margin-left:auto">${n.priority}</span></div>
            <p class="cell-sub" style="margin:5px 0 6px;line-height:1.5">${n.body}</p>
            <time class="cell-sub" style="display:inline-flex;align-items:center;gap:4px">${ICON('clock',12)}${n.time}</time>
          </div></div>${i<items.length-1?'<div style="height:1px;background:var(--border-soft);margin:0 16px"></div>':''}`).join('')}
      </div>
    </div>
  </div>`;
};

/* ============ PROFILE ============ */
PAGES.profile = function(){
  const u=DB.users[STATE.role];
  return `<div class="grid g-1-2" style="grid-template-columns:340px 1fr">
    <div>
      <div class="card card--pad mb-24" style="text-align:center">
        <div class="avatar" style="width:96px;height:96px;border-radius:24px;font-size:34px;margin:0 auto 16px;background:${avatarColor(u.name)}">${initials(u.name)}</div>
        <h2 style="font-size:20px;font-weight:700">${u.name}</h2>
        <div class="flex items-center gap-8" style="justify-content:center;margin:8px 0 4px"><span class="badge badge--navy">${ICON('shield',13)}${u.role}</span></div>
        <p class="cell-sub">${u.dept} · ${DB.company.name}</p>
        <div class="divider"></div>
        <div style="display:flex;flex-direction:column;gap:12px;text-align:left">
          <div class="flex items-center gap-12"><span class="kpi__ico" style="width:36px;height:36px;background:var(--bg);color:var(--slate)">${ICON('mail',17)}</span><div><div class="cell-sub">Email</div><div class="fw6" style="font-size:13.5px">${u.email}</div></div></div>
          <div class="flex items-center gap-12"><span class="kpi__ico" style="width:36px;height:36px;background:var(--bg);color:var(--slate)">${ICON('phone',17)}</span><div><div class="cell-sub">Phone</div><div class="fw6" style="font-size:13.5px">${u.phone}</div></div></div>
          <div class="flex items-center gap-12"><span class="kpi__ico" style="width:36px;height:36px;background:var(--bg);color:var(--slate)">${ICON('building',17)}</span><div><div class="cell-sub">Department</div><div class="fw6" style="font-size:13.5px">${u.dept}</div></div></div>
        </div>
      </div>
    </div>
    <div>
      <div class="tabs">${['Account','Password','Preferences'].map((t,i)=>`<div class="tab ${i===0?'active':''}" onclick="switchProfileTab(this,${i})">${t}</div>`).join('')}</div>
      <div id="profileBody">${profileAccount(u)}</div>
    </div>
  </div>`;
};
function profileAccount(u){const [f,l]=u.name.split(' ');
  return `<div class="card card--pad">
    <div class="card-head"><div><h3>Account Information</h3><p>Update your personal details</p></div></div>
    <div class="grid g-2">
      <div class="field"><label>First Name</label><input class="input" value="${f}"></div>
      <div class="field"><label>Last Name</label><input class="input" value="${l||''}"></div>
      <div class="field"><label>Email</label><input class="input" value="${u.email}"></div>
      <div class="field"><label>Phone</label><input class="input" value="${u.phone}"></div>
      <div class="field"><label>Department</label><input class="input" value="${u.dept}" disabled style="opacity:.6"></div>
      <div class="field"><label>Role</label><input class="input" value="${u.role}" disabled style="opacity:.6"></div>
    </div>
    <div class="flex gap-12 mt-8"><button class="btn btn--primary" onclick="toast('success','Saved','Profile updated')">Save Changes</button><button class="btn btn--ghost">Cancel</button></div>
  </div>`;}
function profilePassword(){return `<div class="card card--pad">
  <div class="card-head"><div><h3>Change Password</h3><p>Keep your account secure</p></div></div>
  <div class="field"><label>Current Password</label><div class="input-icon">${ICON('key',16)}<input class="input" type="password" value="password"></div></div>
  <div class="field"><label>New Password</label><div class="input-icon">${ICON('key',16)}<input class="input" type="password" placeholder="Enter new password"></div><div class="hint">Minimum 8 characters, one number & one symbol.</div></div>
  <div class="field"><label>Confirm New Password</label><div class="input-icon">${ICON('key',16)}<input class="input" type="password" placeholder="Re-enter new password"></div></div>
  <div class="card--pad" style="background:var(--info-bg);border-radius:12px;display:flex;gap:12px;padding:16px"><span style="color:var(--info)">${ICON('shield',20)}</span><div><b style="font-size:13.5px">Two-factor authentication</b><p class="cell-sub">Add an extra layer of security to your account.</p></div><button class="btn btn--ghost btn--sm" style="margin-left:auto" onclick="toast('info','2FA','Setup flow (demo)')">Enable</button></div>
  <div class="flex gap-12 mt-24"><button class="btn btn--primary" onclick="toast('success','Updated','Password changed successfully')">Update Password</button></div>
</div>`;}
function profilePreferences(){
  const rows=[['Dark Mode','Switch between light and dark themes',STATE.theme==='dark','toggleTheme();renderContent()'],
    ['Email Notifications','Receive updates about your assets via email',true,"toast('info','Preference','Setting updated')"],
    ['Maintenance Alerts','Get notified when your assets need service',true,"toast('info','Preference','Setting updated')"],
    ['Booking Reminders','Reminders before your scheduled bookings',false,"toast('info','Preference','Setting updated')"],
    ['Weekly Digest','A summary of activity every Monday',true,"toast('info','Preference','Setting updated')"]];
  return `<div class="card card--pad"><div class="card-head"><div><h3>Preferences</h3><p>Customize your AssetFlow experience</p></div></div>
    <div style="display:flex;flex-direction:column">
    ${rows.map((r,i)=>`<div style="display:flex;align-items:center;gap:16px;padding:16px 0;${i<rows.length-1?'border-bottom:1px solid var(--border-soft)':''}">
      <div style="flex:1"><b style="font-size:14.5px">${r[0]}</b><p class="cell-sub">${r[1]}</p></div>
      <button class="af-toggle ${r[2]?'on':''}" onclick="this.classList.toggle('on');${r[3]}"><span></span></button></div>`).join('')}
    </div></div>
  <style>.af-toggle{width:46px;height:26px;border-radius:20px;background:var(--bg-alt);position:relative;transition:background .2s;flex-shrink:0}.af-toggle.on{background:var(--copper)}.af-toggle span{position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:var(--sh-sm);transition:transform .2s}.af-toggle.on span{transform:translateX(20px)}</style>`;
}

/* ============ INTERACTION HANDLERS ============ */

/* Tab switchers */
function switchAssetTab(el,i){
  el.parentElement.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));el.classList.add('active');
  const a=DB.assets.find(x=>x.id===STATE.sub);
  const bodies=[assetOverview(a),assetDocsTab(a),assetHistoryTab(a,'alloc'),assetHistoryTab(a,'maint'),assetHistoryTab(a,'audit'),`<div class="card card--pad"><div class="card-head"><h3>Full Timeline</h3></div>${assetTimeline(a)}</div>`];
  const b=document.getElementById('assetTabBody');b.innerHTML=bodies[i];activateBars(b);
}
function switchProfileTab(el,i){
  el.parentElement.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));el.classList.add('active');
  const u=DB.users[STATE.role];
  document.getElementById('profileBody').innerHTML=[profileAccount(u),profilePassword(),profilePreferences()][i];
}
function filterBookings(el,status){el.parentElement.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));el.classList.add('active');
  const b=document.getElementById('bookingList');b.innerHTML=bookingCards(status);activateBars(b);}

/* Drawers & Modals */
function openDeptDrawer(id){
  const d=id?DB.departments.find(x=>x.id===id):null;
  openDrawer(d?'Edit Department':'New Department', d?d.id:'Create a new organizational unit',
    `<div class="field"><label>Department Name <span class="req">*</span></label><input class="input" value="${d?d.name:''}" placeholder="e.g. Engineering"></div>
     <div class="field"><label>Department Head</label><select class="select">${DB.employees.map(e=>`<option ${d&&d.head===e.name?'selected':''}>${e.name}</option>`).join('')}</select></div>
     <div class="field"><label>Location</label><input class="input" value="${d?d.location:''}" placeholder="Building · Floor"></div>
     <div class="field"><label>Annual Budget ($)</label><input class="input" type="number" value="${d?d.budget:''}" placeholder="0"></div>
     <div class="field"><label>Status</label><select class="select"><option>Active</option><option>Archived</option></select></div>`,
    `<button class="btn btn--ghost" onclick="closeLayer()">Cancel</button><button class="btn btn--primary btn--block" onclick="fakeSubmit('Department ${d?'updated':'created'} successfully')">${d?'Save Changes':'Create Department'}</button>`);
}
function openCategoryDrawer(id){
  const c=id?DB.categories.find(x=>x.id===id):null;
  openDrawer(c?'Edit Category':'New Category',c?c.id:'Define an asset classification',
    `<div class="field"><label>Category Name <span class="req">*</span></label><input class="input" value="${c?c.name:''}" placeholder="e.g. Laptops & Computers"></div>
     <div class="field"><label>Depreciation Rate</label><input class="input" value="${c?c.depreciation:''}" placeholder="e.g. 25% / yr"></div>
     <div class="field"><label>Expected Lifespan</label><input class="input" value="${c?c.lifespan:''}" placeholder="e.g. 4 years"></div>
     <div class="field"><label>Status</label><select class="select"><option>Active</option><option>Inactive</option></select></div>`,
    `<button class="btn btn--ghost" onclick="closeLayer()">Cancel</button><button class="btn btn--primary btn--block" onclick="fakeSubmit('Category ${c?'updated':'created'} successfully')">${c?'Save Changes':'Create Category'}</button>`);
}
function openEmployeeDrawer(id){
  const e=id?DB.employees.find(x=>x.id===id):null;
  openDrawer(e?'Edit Employee':'New Employee',e?e.id:'Add a person to the organization',
    `<div class="field"><label>Full Name <span class="req">*</span></label><input class="input" value="${e?e.name:''}" placeholder="Full name"></div>
     <div class="field"><label>Email <span class="req">*</span></label><input class="input" value="${e?e.email:''}" placeholder="name@northwind.io"></div>
     <div class="field"><label>Role</label><input class="input" value="${e?e.role:''}" placeholder="Job title"></div>
     <div class="field"><label>Department</label><select class="select">${DB.departments.map(d=>`<option ${e&&e.dept===d.name?'selected':''}>${d.name}</option>`).join('')}</select></div>
     <div class="field"><label>Status</label><select class="select"><option>Active</option><option>On Leave</option><option>Inactive</option></select></div>`,
    `<button class="btn btn--ghost" onclick="closeLayer()">Cancel</button><button class="btn btn--primary btn--block" onclick="fakeSubmit('Employee ${e?'updated':'added'} successfully')">${e?'Save Changes':'Add Employee'}</button>`);
}
function openRegisterAsset(){navigate('assets','register');}
function openBookingDrawer(assetId){
  openDrawer('Book a Resource','Reserve an asset or room for a time slot',
    `<div class="field"><label>Resource / Asset <span class="req">*</span></label><select class="select">${DB.assets.map(a=>`<option ${a.id===assetId?'selected':''}>${a.name}</option>`).join('')}</select></div>
     <div class="grid g-2"><div class="field"><label>Date <span class="req">*</span></label><input class="input" type="date"></div>
     <div class="field"><label>Repeat</label><select class="select"><option>Does not repeat</option><option>Daily</option><option>Weekly</option></select></div></div>
     <div class="grid g-2"><div class="field"><label>Start Time</label><input class="input" type="time" value="09:00"></div>
     <div class="field"><label>End Time</label><input class="input" type="time" value="10:30"></div></div>
     <div class="field"><label>Purpose</label><textarea class="textarea" placeholder="Meeting / usage description…"></textarea></div>
     <div class="card--pad" style="background:var(--success-bg);border-radius:12px;display:flex;gap:10px;padding:14px;align-items:center"><span style="color:var(--success)">${ICON('check2',18)}</span><span class="f13" style="color:var(--success)">No conflicts detected for this slot.</span></div>`,
    `<button class="btn btn--ghost" onclick="closeLayer()">Cancel</button><button class="btn btn--copper btn--block" onclick="fakeSubmit('Booking confirmed')">${ICON('calendar',16)}Confirm Booking</button>`);
}
function openMaintenanceDrawer(assetId){
  const a=assetId?DB.assets.find(x=>x.id===assetId):null;
  openDrawer('Raise Maintenance Request','Report an issue for servicing',
    `<div class="field"><label>Asset <span class="req">*</span></label><select class="select">${DB.assets.map(x=>`<option ${a&&x.id===a.id?'selected':''}>${x.name} (${x.tag})</option>`).join('')}</select></div>
     <div class="field"><label>Issue Description <span class="req">*</span></label><textarea class="textarea" placeholder="Describe the problem in detail…"></textarea></div>
     <div class="grid g-2"><div class="field"><label>Priority</label><select class="select"><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></div>
     <div class="field"><label>Preferred Date</label><input class="input" type="date"></div></div>
     <div class="field"><label>Assign Technician</label><select class="select"><option>Auto-assign</option><option>Tom Fischer</option><option>Ravi Kapoor</option><option>Priya Sharma</option></select></div>`,
    `<button class="btn btn--ghost" onclick="closeLayer()">Cancel</button><button class="btn btn--primary btn--block" onclick="fakeSubmit('Maintenance request created')">${ICON('wrench',16)}Submit Request</button>`);
}
function openTransferModal(assetId){
  const a=assetId?DB.assets.find(x=>x.id===assetId):DB.assets[0];
  openModal('Transfer Asset','Move this asset to a new custodian or department',
    `<div style="display:flex;gap:14px;align-items:center;padding:14px;background:var(--bg);border-radius:12px;margin-bottom:20px">
      <div class="kpi__ico" style="background:var(--card);border:1px solid var(--border);color:var(--slate)">${ICON('box',20)}</div>
      <div><div class="cell-primary">${a.name}</div><div class="cell-tag">${a.tag}</div></div></div>
     <div class="grid g-2"><div class="field"><label>From</label><input class="input" value="${a.holder==='—'?'Pool':a.holder}" disabled style="opacity:.6"></div>
     <div class="field"><label>To <span class="req">*</span></label><select class="select">${DB.employees.map(e=>`<option>${e.name}</option>`).join('')}</select></div></div>
     <div class="field"><label>Target Department</label><select class="select">${DB.departments.map(d=>`<option>${d.name}</option>`).join('')}</select></div>
     <div class="field"><label>Reason for Transfer</label><textarea class="textarea" placeholder="Justification…"></textarea></div>`,
    `<button class="btn btn--ghost" onclick="closeLayer()">Cancel</button><button class="btn btn--primary" onclick="fakeSubmit('Transfer request submitted for approval')">${ICON('transfer',16)}Submit Transfer</button>`);
}
function openAuditModal(){
  openModal('Create Audit Cycle','Start a new verification cycle',
    `<div class="field"><label>Cycle Name <span class="req">*</span></label><input class="input" placeholder="e.g. Q4 2026 Full Inventory Audit"></div>
     <div class="grid g-2"><div class="field"><label>Scope</label><select class="select"><option>All Departments</option>${DB.departments.map(d=>`<option>${d.name}</option>`).join('')}</select></div>
     <div class="field"><label>Assign Auditor</label><select class="select">${DB.employees.map(e=>`<option>${e.name}</option>`).join('')}</select></div></div>
     <div class="field"><label>Due Date</label><input class="input" type="date"></div>`,
    `<button class="btn btn--ghost" onclick="closeLayer()">Cancel</button><button class="btn btn--copper" onclick="fakeSubmit('Audit cycle created')">${ICON('audit',16)}Create Cycle</button>`);
}
function openAuditReport(id){
  const a=DB.audits.find(x=>x.id===id);
  openDrawer('Discrepancy Report',a.name,
    `<div class="grid g-3" style="gap:12px;margin-bottom:22px">
      <div style="padding:14px;background:var(--success-bg);border-radius:12px;text-align:center"><div class="kpi__val" style="font-size:24px;color:var(--success)">${a.verified}</div><div class="cell-sub">Verified</div></div>
      <div style="padding:14px;background:var(--warning-bg);border-radius:12px;text-align:center"><div class="kpi__val" style="font-size:24px;color:var(--warning)">${a.missing}</div><div class="cell-sub">Missing</div></div>
      <div style="padding:14px;background:var(--danger-bg);border-radius:12px;text-align:center"><div class="kpi__val" style="font-size:24px;color:var(--danger)">${a.damaged}</div><div class="cell-sub">Damaged</div></div></div>
     <div class="card-head"><h3 style="font-size:15px">Discrepancy Timeline</h3></div>
     <div class="timeline">
       <div class="tl-item"><span class="tl-dot danger"></span><h5>MacBook Pro 16″ — reported missing</h5><p class="cell-sub">Last seen · Building A Floor 3</p><time>2026-07-09</time></div>
       <div class="tl-item"><span class="tl-dot danger"></span><h5>Aeron Chair — damaged frame</h5><p class="cell-sub">Flagged by Tom Fischer</p><time>2026-07-08</time></div>
       <div class="tl-item"><span class="tl-dot success"></span><h5>132 assets verified — Engineering</h5><p class="cell-sub">Batch scan complete</p><time>2026-07-07</time></div>
     </div>`,
    `<button class="btn btn--ghost" onclick="closeLayer()">Close</button><button class="btn btn--primary btn--block" onclick="toast('success','Exported','Discrepancy report exported')">${ICON('download',16)}Export Report</button>`);
}
function openMaintDetail(id){
  const m=DB.maintenance.find(x=>x.id===id);
  openDrawer(m.asset, m.id+' · '+m.dept,
    `<div class="flex gap-12 mb-24">${priorityBadge(m.priority)}<span class="badge badge--neutral">${MAINT_STAGES.find(s=>s[0]===m.stage)[1]}</span></div>
     <div class="field"><label>Issue</label><div class="card--pad" style="background:var(--bg);border-radius:12px;padding:14px;font-size:14px">${m.issue}</div></div>
     <div class="dl mb-24"><div class="dl__item"><div class="dl-label">Asset Tag</div><div class="dl-val cell-tag">${m.tag}</div></div>
       <div class="dl__item"><div class="dl-label">Technician</div><div class="dl-val">${m.tech}</div></div>
       <div class="dl__item"><div class="dl-label">Created</div><div class="dl-val">${m.created}</div></div>
       <div class="dl__item"><div class="dl-label">Department</div><div class="dl-val">${m.dept}</div></div></div>
     <div class="field"><label>Add Update</label><textarea class="textarea" placeholder="Log a progress note…"></textarea></div>`,
    `<button class="btn btn--ghost" onclick="closeLayer()">Close</button><button class="btn btn--primary btn--block" onclick="fakeSubmit('Maintenance updated')">Save Update</button>`);
}
function openQRModal(tag){
  openModal('Asset QR Code', tag?('Tag · '+tag):'Scan to locate & verify assets',
    `<div style="text-align:center"><div style="width:220px;height:220px;margin:0 auto 16px;border:1px solid var(--border);border-radius:20px;display:grid;place-items:center;background:var(--bg);color:var(--slate)">${ICON('qrLarge',150)}</div>
     ${tag?`<div class="cell-tag" style="font-size:15px">${tag}</div>`:'<p class="cell-sub">Point a scanner at a printed asset tag to instantly pull up its record.</p>'}</div>`,
    `<button class="btn btn--ghost" onclick="closeLayer()">Close</button><button class="btn btn--primary" onclick="toast('success','Printed','QR label sent to printer')">${ICON('download',16)}Download Label</button>`);
}

/* Kanban drag & drop */
let DRAG_ID=null;
function dragCard(e,id){DRAG_ID=id;e.target.classList.add('dragging');e.dataTransfer.effectAllowed='move';}
function dropCard(e,stage,label){
  e.preventDefault();
  document.querySelectorAll('.kcol').forEach(c=>c.classList.remove('drop-target'));
  const m=DB.maintenance.find(x=>x.id===DRAG_ID);
  if(m&&m.stage!==stage){m.stage=stage;renderContent();toast('success','Status updated',m.id+' moved to '+label);}
  DRAG_ID=null;
}
document.addEventListener('dragend',()=>document.querySelectorAll('.dragging').forEach(c=>c.classList.remove('dragging')));
