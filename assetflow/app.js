/* AssetFlow — App shell: state, router, sidebar, header, theme, toast, drawer/modal */
const STATE = {
  role: localStorage.getItem('af_role') || 'admin',
  theme: localStorage.getItem('af_theme') || 'light',
  route: 'dashboard',
  sub: null,
};

/* ---- Navigation config ---- */
const NAV = [
  {id:'dashboard', label:'Dashboard', icon:'dashboard'},
  {id:'organization', label:'Organization Setup', icon:'org', roles:['admin'], children:[
    {id:'departments', label:'Departments'},
    {id:'categories', label:'Categories'},
    {id:'employees', label:'Employees'},
  ]},
  {id:'assets', label:'Assets', icon:'box'},
  {id:'allocation', label:'Allocation & Transfer', icon:'transfer'},
  {id:'booking', label:'Resource Booking', icon:'calendar'},
  {id:'maintenance', label:'Maintenance', icon:'wrench'},
  {id:'audit', label:'Audit', icon:'audit', roles:['admin','manager']},
  {id:'reports', label:'Reports', icon:'chart', roles:['admin','manager','head']},
  {id:'notifications', label:'Notifications', icon:'bell', badge:3},
  {id:'profile', label:'Profile', icon:'user'},
];
/* Role-based allowed routes */
const ROLE_ACCESS = {
  admin:   ['dashboard','organization','departments','categories','employees','assets','allocation','booking','maintenance','audit','reports','notifications','profile'],
  manager: ['dashboard','assets','allocation','maintenance','audit','reports','notifications','profile'],
  head:    ['dashboard','assets','allocation','booking','maintenance','reports','notifications','profile'],
  employee:['dashboard','assets','booking','maintenance','notifications','profile'],
};
const ROLE_LABELS = {admin:'Admin', manager:'Asset Manager', head:'Department Head', employee:'Employee'};
const PAGE_META = {
  dashboard:{t:'Dashboard',s:'Operational overview of your asset estate'},
  organization:{t:'Organization Setup',s:'Departments, categories & people'},
  departments:{t:'Departments',s:'Organizational units & cost centers'},
  categories:{t:'Categories',s:'Asset classification & depreciation'},
  employees:{t:'Employees',s:'People & asset custodians'},
  assets:{t:'Asset Directory',s:'Complete inventory across the organization'},
  allocation:{t:'Allocation & Transfer',s:'Assign, transfer and reclaim assets'},
  booking:{t:'Resource Booking',s:'Schedule shared resources & rooms'},
  maintenance:{t:'Maintenance',s:'Service requests & technician workflow'},
  audit:{t:'Audit',s:'Verification cycles & discrepancy tracking'},
  reports:{t:'Reports & Analytics',s:'Insights across utilization and cost'},
  notifications:{t:'Notifications',s:'Alerts, approvals & activity'},
  profile:{t:'Profile & Settings',s:'Manage your account and preferences'},
};

/* ---- Theme ---- */
function applyTheme(){document.documentElement.setAttribute('data-theme',STATE.theme);localStorage.setItem('af_theme',STATE.theme);}
function toggleTheme(){STATE.theme=STATE.theme==='light'?'dark':'light';applyTheme();renderHeader();toast('info','Theme updated','Switched to '+STATE.theme+' mode');}

/* ---- Role ---- */
function setRole(r){STATE.role=r;localStorage.setItem('af_role',r);
  if(!ROLE_ACCESS[r].includes(STATE.route)){STATE.route='dashboard';STATE.sub=null;location.hash='#/dashboard';}
  renderAll();toast('success','Role switched','Now viewing as '+ROLE_LABELS[r]);}

/* ---- Router ---- */
function parseHash(){const h=location.hash.replace(/^#\/?/,'');const [r,s]=h.split('/');return {r:r||'dashboard',s:s||null};}
function navigate(route,sub){location.hash='#/'+route+(sub?'/'+sub:'');}
function onRoute(){
  const {r,s}=parseHash();
  const allowed=ROLE_ACCESS[STATE.role];
  let route=r;
  if(!allowed.includes(route)){route='dashboard';}
  STATE.route=route;STATE.sub=s;
  renderSidebar();renderHeader();renderContent();
  document.getElementById('content').scrollTo?.(0,0);
  closeSidebar();
}

/* ---- Sidebar ---- */
function renderSidebar(){
  const allowed=ROLE_ACCESS[STATE.role];
  const u=DB.users[STATE.role];
  let nav='';
  NAV.forEach(item=>{
    if(!allowed.includes(item.id)) return;
    if(item.children){
      const kids=item.children.filter(c=>allowed.includes(c.id));
      if(!kids.length) return;
      const open=item.children.some(c=>c.id===STATE.route)||STATE.route===item.id;
      nav+=`<div class="nav-group ${open?'open':''}" data-group="${item.id}">
        <div class="nav-item ${STATE.route===item.id?'active':''}" onclick="toggleGroup('${item.id}')">
          ${ICON(item.icon)}<span>${item.label}</span><span class="chev">${ICON('chevR',16)}</span></div>
        <div class="nav-subitems">${kids.map(c=>`<div class="nav-subitem ${STATE.route===c.id?'active':''}" onclick="navigate('${c.id}')">${c.label}</div>`).join('')}</div></div>`;
    } else {
      nav+=`<div class="nav-item ${STATE.route===item.id?'active':''}" onclick="navigate('${item.id}')">
        ${ICON(item.icon)}<span>${item.label}</span>${item.badge?`<span class="nav-badge">${item.badge}</span>`:''}</div>`;
    }
  });
  document.getElementById('sidebar').innerHTML=`
    <div class="sidebar__brand">
      <div class="brand-logo">${ICON('layers',22)}</div>
      <div class="brand-name">AssetFlow<small>Enterprise ERP</small></div>
    </div>
    <nav class="sidebar__nav">
      <div class="nav-section-label">Workspace</div>
      ${nav}
    </nav>
    <div class="sidebar__foot">
      <div class="side-user" onclick="navigate('profile')">
        <div class="avatar" style="background:${avatarColor(u.name)}">${initials(u.name)}</div>
        <div class="side-user__meta"><b>${u.name}</b><span>${u.role}</span></div>
        <span style="margin-left:auto;color:#8fa2bd" onclick="event.stopPropagation();navigate('profile')">${ICON('logout',18)}</span>
      </div>
    </div>`;
  // fix duplicate chev injection
  document.querySelectorAll('.nav-item svg + svg').forEach(s=>{ if(!s.parentElement.classList.contains('chev')) {} });
}
function toggleGroup(id){const g=document.querySelector(`[data-group="${id}"]`);if(g)g.classList.toggle('open');}

/* ---- Header ---- */
function renderHeader(){
  const meta=PAGE_META[STATE.route]||{t:'AssetFlow',s:''};
  const u=DB.users[STATE.role];
  document.getElementById('header').innerHTML=`
    <button class="icon-btn menu-toggle" onclick="openSidebar()">${ICON('menu')}</button>
    <div class="header__title"><h1>${meta.t}</h1><p>${meta.s}</p></div>
    <div class="header__search">
      ${ICON('search')}<input placeholder="Search assets, people, bookings…" onkeydown="if(event.key==='Enter')globalSearch(this.value)"><kbd>⌘K</kbd>
    </div>
    <button class="icon-btn" data-tip="Notifications" onclick="navigate('notifications')">${ICON('bell')}<span class="dot"></span></button>
    <button class="icon-btn" data-tip="Toggle theme" onclick="toggleTheme()">${ICON(STATE.theme==='light'?'moon':'sun')}</button>
    <div style="width:1px;height:32px;background:var(--border);margin:0 2px"></div>
    <div class="header__user" onclick="toggleUserMenu(event)" id="userTrigger">
      <div class="avatar" style="background:${avatarColor(u.name)}">${initials(u.name)}</div>
      <div class="hu-meta"><b>${u.name}</b><span>${u.role}</span></div>
      ${ICON('chevD',16)}
    </div>`;
}

function toggleUserMenu(e){
  e.stopPropagation();
  let m=document.getElementById('userMenu');
  if(m){m.remove();return;}
  const roles=Object.keys(ROLE_LABELS);
  const html=`<div class="menu open" id="userMenu" style="top:64px;right:24px;min-width:250px">
    <div class="menu-label">Switch role (demo)</div>
    ${roles.map(r=>`<div class="menu-item" onclick="setRole('${r}');closeUserMenu()">${ICON(r==='admin'?'shield':r==='manager'?'briefcase':r==='head'?'users':'user')}<span>${ROLE_LABELS[r]}</span>${STATE.role===r?`<span style="margin-left:auto;color:var(--copper)">${ICON('check',16)}</span>`:''}</div>`).join('')}
    <div class="menu-sep"></div>
    <div class="menu-item" onclick="navigate('profile');closeUserMenu()">${ICON('user')}<span>My Profile</span></div>
    <div class="menu-item" onclick="navigate('profile');closeUserMenu()">${ICON('settings')}<span>Settings</span></div>
    <div class="menu-sep"></div>
    <div class="menu-item danger" onclick="closeUserMenu();toast('info','Signed out','You have been logged out (demo)')">${ICON('logout')}<span>Log out</span></div>
  </div>`;
  document.getElementById('layer').insertAdjacentHTML('beforeend',html);
  setTimeout(()=>document.addEventListener('click',closeUserMenuOutside),0);
}
function closeUserMenu(){const m=document.getElementById('userMenu');if(m)m.remove();document.removeEventListener('click',closeUserMenuOutside);}
function closeUserMenuOutside(e){if(!e.target.closest('#userMenu')&&!e.target.closest('#userTrigger'))closeUserMenu();}

/* ---- Sidebar mobile ---- */
function openSidebar(){document.getElementById('sidebar').classList.add('open');document.getElementById('overlay').classList.add('open');}
function closeSidebar(){document.getElementById('sidebar').classList.remove('open');if(!document.querySelector('.drawer.open'))document.getElementById('overlay').classList.remove('open');}

/* ---- Content ---- */
function renderContent(){
  const el=document.getElementById('content');
  const fn=PAGES[STATE.route];
  el.innerHTML=`<div class="page-enter">${fn?fn(STATE.sub):PAGES.dashboard()}</div>`;
  activateBars(el);
  if(window._afterRender)window._afterRender();
}
function renderAll(){renderSidebar();renderHeader();renderContent();}

/* ---- Toast ---- */
function toast(type,title,msg){
  const icons={success:'check2',danger:'alert',info:'info',warning:'bell'};
  const el=document.createElement('div');
  el.className='toast toast--'+type;
  el.innerHTML=`<div class="toast__ico">${ICON(icons[type]||'info',18)}</div><div><b>${title}</b><span>${msg||''}</span></div>`;
  document.getElementById('toastWrap').appendChild(el);
  setTimeout(()=>{el.classList.add('out');setTimeout(()=>el.remove(),300);},3600);
}

/* ---- Drawer ---- */
function openDrawer(title,subtitle,body,footer){
  closeLayer();
  const html=`<div class="drawer" id="drawer">
    <div class="drawer__head"><div><h3>${title}</h3><p>${subtitle||''}</p></div>
      <button class="icon-btn" onclick="closeLayer()">${ICON('x')}</button></div>
    <div class="drawer__body">${body}</div>
    ${footer?`<div class="drawer__foot">${footer}</div>`:''}</div>`;
  document.getElementById('layer').innerHTML=html;
  document.getElementById('overlay').classList.add('open');
  requestAnimationFrame(()=>{document.getElementById('drawer').classList.add('open');activateBars(document.getElementById('drawer'));});
  document.getElementById('overlay').onclick=closeLayer;
}
/* ---- Modal ---- */
function openModal(title,subtitle,body,footer){
  closeLayer();
  const html=`<div class="modal" id="modal">
    <div class="modal__head"><h3>${title}</h3>${subtitle?`<p>${subtitle}</p>`:''}</div>
    <div class="modal__body">${body}</div>
    ${footer?`<div class="modal__foot">${footer}</div>`:''}</div>`;
  document.getElementById('layer').innerHTML=html;
  document.getElementById('overlay').classList.add('open');
  requestAnimationFrame(()=>{document.getElementById('modal').classList.add('open');activateBars(document.getElementById('modal'));});
  document.getElementById('overlay').onclick=closeLayer;
}
function closeLayer(){
  const d=document.getElementById('drawer'),m=document.getElementById('modal');
  if(d)d.classList.remove('open'); if(m)m.classList.remove('open');
  document.getElementById('overlay').classList.remove('open');
  document.getElementById('overlay').onclick=null;
  setTimeout(()=>{document.getElementById('layer').innerHTML='';},320);
}
function confirmDialog(title,msg,onOk,okLabel,danger){
  openModal(title,msg,
    `<div style="display:flex;gap:14px;align-items:flex-start"><div class="toast__ico" style="width:44px;height:44px;background:${danger?'var(--danger-bg)':'var(--info-bg)'};color:${danger?'var(--danger)':'var(--info)'}">${ICON(danger?'alert':'info',22)}</div>
     <p style="font-size:14px;color:var(--text-soft);padding-top:2px">${msg}</p></div>`,
    `<button class="btn btn--ghost" onclick="closeLayer()">Cancel</button>
     <button class="btn ${danger?'btn--danger':'btn--primary'}" onclick="(${onOk})();closeLayer()">${okLabel||'Confirm'}</button>`);
}
function globalSearch(q){if(q&&q.trim()){navigate('assets');setTimeout(()=>toast('info','Search',`Showing results for "${q}"`),300);}}

/* form submit helper */
function fakeSubmit(msg){closeLayer();toast('success','Saved',msg||'Changes saved successfully');}

/* keyboard */
document.addEventListener('keydown',e=>{
  if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();document.querySelector('.header__search input')?.focus();}
  if(e.key==='Escape'){closeLayer();closeUserMenu();}
});

/* boot */
window.addEventListener('hashchange',onRoute);
window.addEventListener('DOMContentLoaded',()=>{
  applyTheme();
  if(!location.hash)location.hash='#/dashboard';
  onRoute();
});
