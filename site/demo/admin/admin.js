/* ============================================================
 * PC 后台路由与初始化
 * ============================================================ */
(function () {
  'use strict';
  var M = window.MOM;
  var MENU = [
    { group: '总览', items: [{ id: 'p01', name: '工作台首页', icon: '▣' }] },
    { group: '采掘生产运营', items: [
      { id: 'p02', name: '采掘计划管理', icon: '▤' },
      { id: 'p03', name: '工作面工单列表', icon: '▥' },
      { id: 'p05', name: '产量与进尺看板', icon: '▨' }
    ] },
    { group: '安全运营（最高优先级）', items: [
      { id: 'p06', name: '告警中心', icon: '◈' },
      { id: 'p07', name: '告警规则配置', icon: '◇' },
      { id: 'p08', name: '隐患闭环管理', icon: '◉' },
      { id: 'p09', name: '人员定位与入井', icon: '◎' }
    ] },
    { group: '设备运维 EAM', items: [
      { id: 'p10', name: '设备台账', icon: '◲' },
      { id: 'p11', name: '点巡检任务', icon: '☑' },
      { id: 'p12', name: '维修工单中心', icon: '🔧' },
      { id: 'p13', name: '健康度 / OEE', icon: '☗' }
    ] },
    { group: '井下物资 WMS', items: [
      { id: 'p14', name: '物资库存管理', icon: '▦' },
      { id: 'p15', name: '领料 / 退料审批', icon: '⇄' }
    ] },
    { group: '煤质 QMS', items: [{ id: 'p16', name: '煤质采样与化验', icon: '⚗' }] },
    { group: '报表中心', items: [{ id: 'p17', name: '报表与绩效', icon: '▨' }] },
    { group: '系统管理', items: [
      { id: 'p18', name: '主数据管理', icon: '≣' },
      { id: 'p19', name: '权限与角色', icon: '⛨' },
      { id: 'p20', name: '点位组态 / 网关', icon: '⋔' }
    ] }
  ];
  /* ---------- 登录 ---------- */
  var loginBtn = document.getElementById('loginBtn');
  loginBtn.addEventListener('click', function () {
    var v = document.getElementById('loginRole').value.split('|');
    var user = v[0], role = v[1];
    sessionStorage.setItem('mom_user', user);
    sessionStorage.setItem('mom_role', role);
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    document.getElementById('userChip').textContent = user;
    buildMenu();
    tick();
    if (!location.hash) location.hash = '#/p01';
    else route();
    toast('欢迎，' + user + '（' + role + '）· 全部数据为演示模拟数据');
  });
  document.getElementById('loginRole').addEventListener('change', function () {
    var n = this.value.split('|')[0];
    document.getElementById('loginUser').value = 'demo_' + n;
  });
  document.getElementById('topAlarm').addEventListener('click', function () { location.hash = '#/p06'; });

  /* ---------- 移动端侧边栏抽屉 ---------- */
  var sideEl = document.querySelector('.side');
  var maskEl = document.getElementById('sideMask');
  function closeSide() {
    sideEl.classList.remove('open');
    maskEl.classList.remove('show');
  }
  document.getElementById('mbToggle').addEventListener('click', function () {
    sideEl.classList.toggle('open');
    maskEl.classList.toggle('show', sideEl.classList.contains('open'));
  });
  maskEl.addEventListener('click', closeSide);
  document.getElementById('menu').addEventListener('click', function (e) {
    if (e.target.closest('a')) closeSide();
  });

  /* ---------- 菜单 ---------- */
  function buildMenu() {
    var html = '';
    MENU.forEach(function (g) {
      html += '<div class="group">' + g.group + '</div>';
      g.items.forEach(function (it) {
        html += '<a href="#/' + it.id + '" data-id="' + it.id + '"><span>' + it.icon + '</span>' + it.name +
          '<span class="pno">' + it.id.toUpperCase() + '</span></a>';
      });
    });
    document.getElementById('menu').innerHTML = html;
  }

  /* ---------- 路由 ---------- */
  var ORDER = ['p01', 'p02', 'p03', 'p04', 'p05', 'p06', 'p07', 'p08', 'p09', 'p10',
               'p11', 'p12', 'p13', 'p14', 'p15', 'p16', 'p17', 'p18', 'p19', 'p20'];
  window.route = function () {
    if (!sessionStorage.getItem('mom_user')) return;
    var hash = location.hash.replace('#/', '');
    var parts = hash.split('?');
    var id = parts[0] || 'p01';
    if (ORDER.indexOf(id) < 0) id = 'p01';
    var query = {};
    if (parts[1]) {
      parts[1].split('&').forEach(function (kv) {
        var a = kv.split('=');
        query[decodeURIComponent(a[0])] = decodeURIComponent(a[1] || '');
      });
    }
    var page = window.PAGES[id];
    if (!page) return;
    disposeCharts();
    var view = document.getElementById('view');
    view.innerHTML = page.render(view, query);
    view.scrollTop = 0;
    try { page.init(view, query); } catch (e) { console.warn('init', id, e); }
    document.querySelectorAll('#menu a').forEach(function (a) {
      a.classList.toggle('on', a.dataset.id === id);
    });
    var crumbMap = {};
    ORDER.forEach(function (pid) {
      crumbMap[pid] = (window.PAGES[pid] && window.PAGES[pid].title) || pid;
    });
    document.getElementById('crumb').textContent = crumbMap[id] || '工作台';
    window.__current = id;
  };
  window.addEventListener('hashchange', route);

  /* ---------- 时钟 ---------- */
  function tick() {
    var el = document.getElementById('clock');
    if (!el) return;
    var d = new Date();
    var week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()];
    el.textContent = d.getFullYear() + '-' + M.pad2(d.getMonth() + 1) + '-' + M.pad2(d.getDate()) +
      ' ' + week + ' ' + M.pad2(d.getHours()) + ':' + M.pad2(d.getMinutes()) + ':' + M.pad2(d.getSeconds());
    setTimeout(tick, 1000);
  }
})();
