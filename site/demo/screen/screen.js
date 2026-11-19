/* ============================================================
 * 调度大屏逻辑：1920×1080 等比缩放 / 三视图 / 孪生动效 / 回放
 * ============================================================ */
(function () {
  'use strict';
  var M = window.MOM;

  /* ---------- 等比缩放 ---------- */
  function fit() {
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    var stage = document.getElementById('stage');
    stage.style.transform = 'scale(' + s + ')';
    stage.style.position = 'absolute';
    stage.style.left = ((window.innerWidth - 1920 * s) / 2) + 'px';
    stage.style.top = ((window.innerHeight - 1080 * s) / 2) + 'px';
  }
  window.addEventListener('resize', fit);
  fit();

  /* ---------- 时钟 ---------- */
  function tick() {
    var d = new Date();
    var w = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()];
    document.getElementById('clock').textContent =
      M.pad2(d.getHours()) + ':' + M.pad2(d.getMinutes()) + ':' + M.pad2(d.getSeconds());
    document.getElementById('date').textContent =
      d.getFullYear() + '-' + M.pad2(d.getMonth() + 1) + '-' + M.pad2(d.getDate()) + ' ' + w;
    setTimeout(tick, 1000);
  }
  tick();

  /* ---------- Tab 切换 ---------- */
  document.querySelectorAll('.scr-tabs .tab').forEach(function (t) {
    t.addEventListener('click', function () {
      document.querySelectorAll('.scr-tabs .tab').forEach(function (x) { x.classList.remove('on'); });
      document.querySelectorAll('.view').forEach(function (x) { x.classList.remove('show'); });
      t.classList.add('on');
      document.getElementById('v-' + t.dataset.v).classList.add('show');
      disposeCharts();
      renderCurrent(t.dataset.v);
    });
  });

  function renderCurrent(v) {
    if (v === 'd01') { d01(); }
    if (v === 'd02') { d02(); }
    if (v === 'd03') { d03Init(); }
  }

  /* ============ D01 矿级总览 ============ */
  function d01() {
    /* KPI 数字 */
    var ton = 5286;
    setInterval(function () {
      ton += M.rnd(-6, 9);
      var el = document.getElementById('k-ton');
      if (el) el.textContent = fmtNum(ton);
    }, 3000);

    /* 趋势图 */
    var d = M.prod30.slice(-14);
    mkChart(document.getElementById('s-trend'), {
      tooltip: { trigger: 'axis' },
      grid: { left: 50, right: 14, top: 34, bottom: 26 },
      xAxis: { type: 'category', data: d.map(function (x) { return x.date.slice(5); }), axisLabel: { color: '#8B93B8', fontSize: 10 }, axisLine: { lineStyle: { color: 'rgba(139,147,184,.3)' } } },
      yAxis: { type: 'value', axisLabel: { color: '#8B93B8', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(139,147,184,.12)' } } },
      series: [
        { name: '计划', type: 'line', smooth: true, symbol: 'none', lineStyle: { type: 'dashed', color: '#6D769B' }, data: d.map(function (x) { return x.planTon; }) },
        { name: '实际', type: 'bar', barWidth: 10, itemStyle: { borderRadius: [3, 3, 0, 0], color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#A78BFA' }, { offset: 1, color: '#2563EB' }] } }, data: d.map(function (x) { return x.actTon; }) }
      ]
    });

    /* 接续预警 */
    document.getElementById('s-succession').innerHTML = M.succession.map(function (s) {
      return '<div class="succ-item"><span class="f">' + s.face + ' → ' + s.next + '</span>' +
        '<span class="tiny">裕量 ' + s.gap + ' 天</span><span class="badge-d ' + (s.level === '预警' ? 'warn' : 'ok') + '">' + s.level + '</span></div>';
    }).join('');

    /* 告警滚动条 */
    var crit = M.alarms.filter(function (a) { return a.level === '紧急'; })[0];
    document.getElementById('alarmScroll').textContent =
      '【' + crit.time + '】' + crit.spot + ' · ' + crit.detail + ' —— 已联动闭锁指令，调度处置中，处置完成后手动解除（全程留痕）';

    /* 实时告警列表 */
    document.getElementById('s-alarms').innerHTML = M.alarms.map(function (a) {
      var cls = a.level === '紧急' ? 'crit' : a.level === '预警' ? 'warn' : 'info';
      return '<div class="al-item"><span class="al-time">' + a.time + '</span><div class="al-body">' +
        '<div class="al-spot">' + a.spot + ' <span class="lv ' + cls + '">' + a.level + '</span></div>' +
        '<div class="al-detail">' + a.detail + '</div></div></div>';
    }).join('');

    /* 人员分布 */
    mkChart(document.getElementById('s-person'), {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 96, right: 30, top: 8, bottom: 20 },
      xAxis: { type: 'value', axisLabel: { color: '#8B93B8', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(139,147,184,.12)' } } },
      yAxis: { type: 'category', data: M.underground.byArea.map(function (a) { return a.area; }).reverse(), axisLabel: { color: '#8B93B8', fontSize: 10 } },
      series: [{ type: 'bar', barWidth: 10, label: { show: true, position: 'right', color: '#C4B5FD', fontSize: 10, formatter: '{c} 人' },
        itemStyle: { borderRadius: [0, 5, 5, 0], color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#7C3AED' }, { offset: 1, color: '#60A5FA' }] } },
        data: M.underground.byArea.map(function (a) { return a.count; }).reverse() }]
    });

    /* 设备运行率 */
    var devs = [
      { n: '综采电液控（120 支架）', r: 99.2 },
      { n: '智能供液泵站', r: 94.1 },
      { n: '刮板/转载机', r: 97.6 },
      { n: '主运输皮带系统', r: 92.8 },
      { n: '掘进机（EBZ-200）', r: 95.3 }
    ];
    document.getElementById('s-devices').innerHTML = devs.map(function (x) {
      return '<div class="dev-item"><div class="dev-top"><span>' + x.n + '</span><span style="color:#C4B5FD">' + x.r + '%</span></div>' +
        '<div class="pbar-d"><i style="width:' + x.r + '%"></i></div></div>';
    }).join('');

    /* 中央态势图 */
    drawMineMap();
  }

  function drawMineMap() {
    var svg = document.getElementById('mineMap');
    var faces = [
      { x: 90, y: 60, w: 300, h: 110, name: '1304 综采工作面', sub: '生产中 · 早班 32 人', color: '#34D399', bg: 'rgba(52,211,153,.10)' },
      { x: 90, y: 230, w: 300, h: 110, name: '1306 综采工作面', sub: '安装调试 · 86/120 架', color: '#60A5FA', bg: 'rgba(96,165,250,.10)' },
      { x: 560, y: 60, w: 240, h: 110, name: '3302 掘进工作面', sub: '顶板预警 · 降速掘进', color: '#FBBF24', bg: 'rgba(251,191,36,.10)' },
      { x: 560, y: 230, w: 240, h: 110, name: '3304 掘进工作面', sub: '生产中 · 日进尺 8.4m', color: '#34D399', bg: 'rgba(52,211,153,.10)' }
    ];
    var rects = faces.map(function (f) {
      return '<g><rect x="' + f.x + '" y="' + f.y + '" width="' + f.w + '" height="' + f.h + '" rx="14" fill="' + f.bg + '" stroke="' + f.color + '" stroke-opacity=".55" stroke-width="1.5"/>' +
        '<text x="' + (f.x + 22) + '" y="' + (f.y + 40) + '" font-size="20" fill="#E7EAF6" font-weight="700">' + f.name + '</text>' +
        '<text x="' + (f.x + 22) + '" y="' + (f.y + 70) + '" font-size="13" fill="' + f.color + '">' + f.sub + '</text>' +
        '<circle cx="' + (f.x + f.w - 26) + '" cy="' + (f.y + 26) + '" r="5" fill="' + f.color + '"><animate attributeName="opacity" values="1;.2;1" dur="2s" repeatCount="indefinite"/></circle></g>';
    }).join('');
    var belts =
      '<path d="M 390 115 C 480 115 500 115 560 115" stroke="#6D769B" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="16 10"><animate attributeName="stroke-dashoffset" from="26" to="0" dur="1.2s" repeatCount="indefinite"/></path>' +
      '<path d="M 390 285 C 480 285 500 285 560 285" stroke="#6D769B" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="16 10"><animate attributeName="stroke-dashoffset" from="26" to="0" dur="1.4s" repeatCount="indefinite"/></path>' +
      '<text x="432" y="100" font-size="11" fill="#6D769B">运输巷皮带 · 瞬时 820 t/h</text>' +
      '<path d="M 800 115 C 860 115 870 170 870 215 C 870 260 850 285 800 285" stroke="#6D769B" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="16 10"><animate attributeName="stroke-dashoffset" from="26" to="0" dur="1.6s" repeatCount="indefinite"/></path>' +
      '<text x="778" y="196" font-size="11" fill="#6D769B" transform="rotate(90 800 200)">主运大巷 → 主井</text>';
    var infra =
      '<rect x="425" y="140" width="110" height="46" rx="10" fill="rgba(124,58,237,.14)" stroke="rgba(124,58,237,.5)"/>' +
      '<text x="480" y="168" font-size="13" fill="#C4B5FD" text-anchor="middle" font-weight="600">中央变电所</text>' +
      '<rect x="30" y="140" width="96" height="46" rx="10" fill="rgba(139,147,184,.10)" stroke="rgba(139,147,184,.35)"/>' +
      '<text x="78" y="168" font-size="13" fill="#8B93B8" text-anchor="middle">井口/调度楼</text>';
    svg.innerHTML = rects + belts + infra +
      '<text x="30" y="30" font-size="12" fill="#6D769B">● 2 号煤层采区（上） / 3 号煤层采区（下） · 数据每 2s 刷新</text>';
  }
  window.sendLock = function () {
    if (confirm('确认向恒达工作面集控下发 1304 工作面闭锁指令？\n（该操作将记入不可篡改审计日志）')) {
      toast('闭锁指令已下发至恒达集控 · 审计日志 #AUD-' + M.rnd(70000, 79999));
    }
  };

  /* ============ D02 数字孪生 ============ */
  var twinTimer = null;
  function d02() {
    /* 泵站仪表 */
    mkChart(document.getElementById('g-pump'), {
      series: [{
        type: 'gauge', startAngle: 210, endAngle: -30, min: 0, max: 45, radius: '100%', center: ['50%', '62%'],
        progress: { show: true, width: 10, roundCap: true, itemStyle: { color: '#7C3AED' } },
        axisLine: { roundCap: true, lineStyle: { width: 10, color: [[1, 'rgba(139,147,184,.18)']] } },
        pointer: { show: false }, axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false },
        detail: { offsetCenter: [0, '0%'], fontSize: 26, fontWeight: 700, color: '#fff', formatter: function (v) { return v.toFixed(1); } },
        title: { offsetCenter: [0, '38%'], color: '#8B93B8', fontSize: 11 },
        data: [{ value: M.twin.pumpPress, name: '泵站压力 MPa' }]
      }]
    });
    mkChart(document.getElementById('g-flow'), {
      series: [{
        type: 'gauge', startAngle: 210, endAngle: -30, min: 0, max: 800, radius: '100%', center: ['50%', '62%'],
        progress: { show: true, width: 10, roundCap: true, itemStyle: { color: '#2563EB' } },
        axisLine: { roundCap: true, lineStyle: { width: 10, color: [[1, 'rgba(139,147,184,.18)']] } },
        pointer: { show: false }, axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false },
        detail: { offsetCenter: [0, '0%'], fontSize: 26, fontWeight: 700, color: '#fff' },
        title: { offsetCenter: [0, '38%'], color: '#8B93B8', fontSize: 11 },
        data: [{ value: M.twin.pumpFlow, name: '供液流量 L/min' }]
      }]
    });

    /* 环境监测 */
    document.getElementById('s-env').innerHTML = M.env.map(function (e) {
      var c = e.level === '紧急' ? '#F87171' : e.level === '预警' ? '#FBBF24' : '#8B93B8';
      return '<div class="kv-row"><span>' + e.spot + '</span><b style="color:' + c + '">CH4 ' + e.ch4.toFixed(2) + '% · CO ' + e.co + 'ppm · ' + e.level + '</b></div>';
    }).join('');

    /* 工况卡 */
    document.getElementById('s-cond').innerHTML = [
      { v: '4.2 刀/班', k: '割煤刀数（早班）' },
      { v: '126/126', k: '移架完成（支架）' },
      { v: '820 t/h', k: '皮带瞬时煤量' },
      { v: '1.5 h', k: '今日累计停机' }
    ].map(function (x) { return '<div class="cond-card"><div class="v">' + x.v + '</div><div class="k">' + x.k + '</div></div>'; }).join('');

    /* 支架健康 */
    var top = M.supports.slice().sort(function (a, b) { return a.health - b.health; }).slice(0, 6);
    document.getElementById('s-supports').innerHTML = top.map(function (s) {
      var c = s.health < 80 ? '#F87171' : s.health < 90 ? '#FBBF24' : '#34D399';
      return '<div class="sup-item"><span class="no">' + s.no + '</span>' +
        '<div class="bar pbar-d"><i style="width:' + s.health + '%;background:' + c + '"></i></div>' +
        '<span style="color:' + c + ';width:34px;text-align:right">' + s.health + '</span></div>';
    }).join('');

    drawTwin();
    /* 孪生动画：采煤机往返 */
    clearInterval(twinTimer);
    twinTimer = setInterval(function () {
      M.twin.shearerPos += M.twin.shearerDir * 2;
      if (M.twin.shearerPos > 112) { M.twin.shearerDir = -1; }
      if (M.twin.shearerPos < 6) { M.twin.shearerDir = 1; }
      drawTwin();
    }, 600);
  }

  function drawTwin() {
    var svg = document.getElementById('twinSvg');
    if (!svg) return;
    var n = 30, step = 28, x0 = 60, y0 = 200;
    var shown = Math.round(M.twin.shearerPos / 4); /* 采煤机位置映射到展示支架 */
    var parts = [];
    /* 煤壁 */
    parts.push('<path d="M 30 40 L 60 55 L 55 100 L 65 150 L 58 200 L 66 250 L 60 300 L 30 320 Z" fill="rgba(139,147,184,.10)"/>');
    parts.push('<text x="30" y="26" font-size="11" fill="#6D769B">煤壁（截割后）</text>');
    /* 刮板输送机 */
    parts.push('<line x1="60" y1="252" x2="900" y2="252" stroke="#6D769B" stroke-width="7" stroke-linecap="round"/>');
    parts.push('<text x="60" y="276" font-size="11" fill="#6D769B">刮板输送机 SGZ-1000/1400</text>');
    /* 支架阵列 */
    for (var i = 0; i < n; i++) {
      var src = M.twin.statusList[i * 4] || 'ok';
      var col = src === 'fault' ? '#F87171' : src === 'warn' ? '#FBBF24' : 'rgba(52,211,153,.85)';
      var x = x0 + i * step;
      /* 支架顶梁 + 立柱 */
      parts.push('<g><rect x="' + x + '" y="' + (y0 - 120) + '" width="20" height="14" rx="3" fill="' + col + '" opacity=".9"/>' +
        '<line x1="' + (x + 5) + '" y1="' + (y0 - 106) + '" x2="' + (x + 3) + '" y2="' + (y0 - 12) + '" stroke="' + col + '" stroke-width="3.5" opacity=".85"/>' +
        '<line x1="' + (x + 15) + '" y1="' + (y0 - 106) + '" x2="' + (x + 17) + '" y2="' + (y0 - 12) + '" stroke="' + col + '" stroke-width="3.5" opacity=".85"/>' +
        '<rect x="' + (x - 2) + '" y="' + (y0 - 12) + '" width="24" height="7" rx="2" fill="' + col + '" opacity=".55"/></g>');
      if (src !== 'ok') {
        parts.push('<text x="' + (x + 8) + '" y="' + (y0 - 128) + '" font-size="10" fill="' + col + '" text-anchor="middle">' + (src === 'fault' ? '45#' : '预警') + '</text>');
      }
    }
    /* 采煤机 */
    var sx = x0 + shown * step;
    parts.push('<g><rect x="' + (sx - 18) + '" y="262" width="64" height="26" rx="5" fill="#7C3AED"/>' +
      '<rect x="' + (sx - 10) + '" y="252" width="48" height="12" rx="3" fill="#2563EB"/>' +
      '<circle cx="' + (sx + 2) + '" cy="292" r="5" fill="#C4B5FD"/><circle cx="' + (sx + 26) + '" cy="292" r="5" fill="#C4B5FD"/>' +
      '<text x="' + (sx + 14) + '" y="316" font-size="11" fill="#C4B5FD" text-anchor="middle">采煤机 ' + M.twin.shearerPos + '# 架 · 5.8m/min</text></g>');
    /* 泵站侧 */
    parts.push('<rect x="60" y="322" width="200" height="30" rx="8" fill="rgba(37,99,235,.12)" stroke="rgba(37,99,235,.45)"/>' +
      '<text x="160" y="342" font-size="12" fill="#93C5FD" text-anchor="middle">智能供液泵站 · 压力 ' + (M.twin.pumpPress + M.rnd(-5, 5) / 10).toFixed(1) + ' MPa</text>');
    svg.innerHTML = parts.join('');
  }

  /* ============ D03 事件回放 ============ */
  var RP = { i: 0, playing: false, timer: null };
  function d03Init() {
    clearInterval(RP.timer);
    RP.playing = false;
    document.getElementById('rpPlay').textContent = '▶ 播放';
    var evs = M.replayEvents;
    /* 事件列表 */
    document.getElementById('rpEvents').innerHTML = evs.map(function (e, i) {
      return '<div class="rp-ev" data-i="' + i + '" onclick="RPgoto(' + i + ')"><span class="t">' + e.time + '</span>' +
        '<span class="lv ' + (e.level === '紧急' ? 'crit' : e.level === '预警' ? 'warn' : e.level === '解除' || e.level === '处置' ? 'ok' : 'info') + '">' + e.level + '</span>' +
        '<span>' + e.text + '</span></div>';
    }).join('');
    /* 时间轴 */
    var start = 11 * 3600 + 0 * 60, end = 11 * 3600 + 16 * 60;
    var track = document.getElementById('rpTrack');
    track.innerHTML = '<div class="tl-line"></div><div class="tl-prog" id="rpProg"></div>' +
      evs.map(function (e, i) {
        var t = e.time.split(':');
        var sec = (+t[0]) * 3600 + (+t[1]) * 60 + (+t[2]);
        var pct = (sec - start) / (end - start) * 100;
        var cls = e.level === '紧急' ? 'crit' : e.level === '预警' ? 'warn' : e.level === '解除' ? 'ok' : 'info';
        return '<div class="tl-node ' + cls + '" style="left:' + pct + '%" data-i="' + i + '" onclick="RPgoto(' + i + ')"><span class="tt">' + e.time + '</span></div>';
      }).join('') +
      '<div class="tl-label" style="left:0">11:00</div><div class="tl-label" style="left:100%">11:16</div>';
    RPgoto(0);
    drawReplayScene(0);
  }
  window.RPgoto = function (i) {
    RP.i = i;
    var evs = M.replayEvents;
    var start = 11 * 3600, end = 11 * 3600 + 16 * 60;
    var t = evs[i].time.split(':');
    var sec = (+t[0]) * 3600 + (+t[1]) * 60 + (+t[2]);
    var pct = Math.min(100, (sec - start) / (end - start) * 100);
    var prog = document.getElementById('rpProg');
    if (prog) prog.style.width = pct + '%';
    document.querySelectorAll('.rp-ev').forEach(function (el, j) { el.classList.toggle('on', j === i); });
    document.querySelectorAll('.tl-node').forEach(function (el, j) { el.classList.toggle('on', j === i); });
    document.getElementById('rpTime').textContent = evs[i].time;
    drawReplayScene(i);
  };
  window.togglePlay = function () {
    var btn = document.getElementById('rpPlay');
    if (RP.playing) {
      clearInterval(RP.timer); RP.playing = false;
      btn.textContent = '▶ 播放';
    } else {
      RP.playing = true; btn.textContent = '⏸ 暂停';
      RP.timer = setInterval(function () {
        if (RP.i >= M.replayEvents.length - 1) { togglePlay(); return; }
        RPgoto(RP.i + 1);
      }, 2200);
    }
  };
  function drawReplayScene(i) {
    var svg = document.getElementById('replaySvg');
    if (!svg) return;
    var e = M.replayEvents[i];
    var scenes = [
      '监测画面：3302 回风巷 T2 传感器读数爬升 0.83% → 0.91%，曲线越过红色阈值线',
      '联动画面：MOM 告警引擎判定紧急告警，3 号皮带巷 CO 持续监测中',
      '定位画面：3302 区域 25/26 人 · 限员比对通过',
      '设备画面：1# 泵站出口压力波动曲线 ±2.8MPa，超出带宽',
      '闭锁画面：3302 掘进面截割电机停转，工作面闭锁状态指示红色',
      '处置画面：通防班调整风窗，CH4 读数回落 0.91% → 0.62%',
      '解除画面：调度员确认后手动解除闭锁，指示灯恢复绿色，审计留痕'
    ];
    var crit = e.level === '紧急';
    svg.innerHTML =
      '<rect x="0" y="0" width="900" height="300" fill="rgba(7,11,30,.0)"/>' +
      '<text x="24" y="40" font-size="17" fill="' + (crit ? '#FCA5A5' : '#E7EAF6') + '" font-weight="700">[' + e.time + '] ' + e.tag + '事件 · ' + e.level + '</text>' +
      '<text x="24" y="74" font-size="14" fill="#B9C0DE">' + scenes[i] + '</text>' +
      /* 模拟曲线 */
      '<polyline points="' + curvePts(i) + '" fill="none" stroke="' + (crit ? '#EF4444' : '#7C3AED') + '" stroke-width="2.5"/>' +
      '<line x1="40" y1="230" x2="860" y2="230" stroke="rgba(139,147,184,.25)" stroke-dasharray="5 5"/>' +
      '<text x="40" y="250" font-size="11" fill="#6D769B">CH4 %（T2 传感器 · 1s 采样）</text>' +
      '<text x="24" y="290" font-size="11" fill="#6D769B">▶ 回放用于事故复盘：MOM 自动记录事件前后 10min 全量测点切片与操作留痕</text>';
  }
  function curvePts(i) {
    var pts = [];
    var base = i >= 6 ? 0.55 : i >= 5 ? 0.62 : i >= 4 ? 0.90 : 0.75 + i * 0.045;
    for (var x = 40; x <= 860; x += 10) {
      var ph = (x - 40) / 820;
      var v = base + Math.sin(ph * 18 + i) * 0.05 + (i >= 4 && i <= 5 ? 0 : -0.02);
      var y = 230 - v / 1.2 * 160;
      pts.push(x + ',' + Math.max(120, Math.min(230, y)));
    }
    return pts.join(' ');
  }

  /* ---------- 启动 ---------- */
  renderCurrent('d01');
})();
