/* ============================================================
 * PC 后台页面 P01-P10
 * ============================================================ */
window.PAGES = window.PAGES || {};
(function (P) {
  var M = window.MOM;
  function statusBadge(s) {
    var map = { '报工完成': 'ok', '执行中': 'info', '待开工': 'gray', '已取消': 'gray', '生产中': 'ok', '安装调试': 'info',
      '处置中': 'crit', '已派单': 'warn', '已闭环': 'ok', '整改中': 'warn', '待复查': 'info', '已销号': 'ok',
      '维修中': 'warn', '待备件': 'crit', '运行': 'ok', '调试': 'info', '待拆解': 'gray', '已拆解': 'ok' };
    return '<span class="badge ' + (map[s] || 'gray') + '">' + s + '</span>';
  }
  function levelBadge(l) {
    var map = { '紧急': 'crit', '预警': 'warn', '提示': 'info', '重大': 'crit', '一般': 'gray' };
    return '<span class="badge ' + (map[l] || 'gray') + '">' + l + '</span>';
  }

  /* ================= P01 工作台 ================= */
  P.p01 = { title: '工作台首页', render: function () {
    var done = M.prod30[29], y = M.prod30[28];
    return '' +
    '<div class="page-head"><h2>早上好，' + M.roles[0].user + '</h2><span class="tiny">今天是 2026-10-09 周五 · 早班（8:00-16:00）· 当前角色：矿总调度员</span></div>' +
    '<div class="grid4">' +
      '<div class="card kpi"><div class="k-label">今日产量（早班累计）</div><div class="k-value">' + fmtNum(2186) + '<span class="k-unit">吨</span></div><div class="k-trend trend up">▲ 日计划 5,200 吨 · 完成 42%</div></div>' +
      '<div class="card kpi"><div class="k-label">今日进尺（掘进累计）</div><div class="k-value">10.8<span class="k-unit">m</span></div><div class="k-trend trend up">▲ 日计划 9 m · 完成 120%</div></div>' +
      '<div class="card kpi"><div class="k-label">未闭环告警</div><div class="k-value" style="color:var(--crit)">3<span class="k-unit">条</span></div><div class="k-trend">紧急 1 · 预警 2 · 已派单 2</div></div>' +
      '<div class="card kpi"><div class="k-label">当前在井人数</div><div class="k-value">' + M.underground.total + '<span class="k-unit">/ ' + M.underground.limit + ' 人</span></div><div class="k-trend trend up">电子围栏事件 1 · 滞留 1</div></div>' +
    '</div>' +
    '<div class="row mt16">' +
      '<div class="card col" style="flex:2"><h3>近 14 日产量与计划对比<span class="sub">吨</span></h3><div class="chart" id="c-p01-trend"></div></div>' +
      '<div class="card col"><h3>我的待办<span class="sub">' + 5 + ' 项</span></h3>' +
        '<div class="timeline" style="margin-top:14px">' +
          '<div class="tl-item"><div class="t">🔴 紧急告警 AL-98412 待处置确认</div><div class="d">3302 回风巷 CH4 超限 · 已下发闭锁 · 11:02</div></div>' +
          '<div class="tl-item done"><div class="t">审批维修工单 EM-2285 备件采购</div><div class="d">蓄能器胶囊库存不足 · 待矿长审批</div></div>' +
          '<div class="tl-item gray"><div class="t">10 月采掘接续裕量确认</div><div class="d">1306 安装进度影响接续窗口 · 剩余 12 天</div></div>' +
          '<div class="tl-item gray"><div class="t">隐患 HZ-1026-03 重大隐患复查</div><div class="d">3302 回风巷锚索空贴 · 整改期限 10-10</div></div>' +
          '<div class="tl-item gray"><div class="t">本周安全例会材料</div><div class="d">告警/隐患/三违统计已自动汇总</div></div>' +
        '</div></div>' +
    '</div>' +
    '<div class="row mt16">' +
      '<div class="card col" style="flex:2"><h3>实时告警流<span class="sub">最近 24h</span></h3><table class="tbl" id="p01-alarms"></table></div>' +
      '<div class="card col"><h3>工作面快况</h3><div id="p01-faces"></div></div>' +
    '</div>';
  }, init: function () {
    var d = M.prod30.slice(-14);
    mkChart(document.getElementById('c-p01-trend'), {
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: d.map(function (x) { return x.date.slice(5); }) },
      yAxis: { type: 'value', name: '吨' },
      series: [
        { name: '计划产量', type: 'line', smooth: true, symbol: 'none', lineStyle: { type: 'dashed', color: '#98A1B3' }, data: d.map(function (x) { return x.planTon; }) },
        { name: '实际产量', type: 'bar', barWidth: 14, itemStyle: { borderRadius: [4, 4, 0, 0], color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#7C3AED' }, { offset: 1, color: '#2563EB' }] } }, data: d.map(function (x) { return x.actTon; }) }
      ]
    });
    document.getElementById('p01-alarms').innerHTML =
      '<tr><th>时间</th><th>级别</th><th>内容</th><th>状态</th></tr>' +
      M.alarms.slice(0, 6).map(function (a) {
        return '<tr><td class="mono">' + a.time + '</td><td>' + levelBadge(a.level) + '</td>' +
          '<td>' + a.spot + ' · ' + a.detail + '</td><td>' + statusBadge(a.status) + '</td></tr>';
      }).join('');
    document.getElementById('p01-faces').innerHTML = M.workfaces.map(function (f) {
      var pct = f.advanceTotal ? Math.round(f.advanceDone / f.advanceTotal * 100) : 0;
      return '<div style="margin-bottom:14px"><div class="flex between" style="margin-bottom:6px">' +
        '<span class="strong">' + f.name + '</span>' + statusBadge(f.status) + '</div>' +
        '<div class="pbar"><i style="width:' + pct + '%"></i></div>' +
        '<div class="tiny" style="margin-top:5px">' + (f.type.indexOf('掘进') === 0 ? '进尺 ' + f.advanceDone + '/' + f.advanceTotal + ' m · 本月 ' + f.doneMonth + ' 万吨' : '推进 ' + f.advanceDone + '/' + f.advanceTotal + ' m · 本月 ' + f.doneMonth + '/' + f.planMonth + ' 万吨') + (f.risk !== '正常' ? ' · <span style="color:var(--warn)">' + f.risk + '</span>' : '') + '</div></div>';
    }).join('');
  } };

  /* ================= P02 采掘计划 ================= */
  P.p02 = { title: '采掘计划管理', render: function () {
    return '' +
    '<div class="page-head"><h2>采掘计划管理</h2><span class="tiny">接收 ERP 月度计划 → 人工调整 → 按工作面拆解为日计划与班组任务</span>' +
      '<button class="btn primary sm right" onclick="toast(\'已向 ERP 请求同步最新月度计划（模拟）\')">同步 ERP 计划</button></div>' +
    '<div class="row">' +
      '<div class="card col" style="flex:3"><h3>月度计划列表<span class="sub">版本管理中</span></h3>' +
        '<table class="tbl"><tr><th>计划号</th><th>月份</th><th>来源</th><th>工作面</th><th>类型</th><th>月计划</th><th>版本</th><th>状态</th><th>操作</th></tr>' +
        M.plans.map(function (p) {
          return '<tr><td class="mono">' + p.id + '</td><td>' + p.month + '</td><td>' + p.source + '</td><td>' + p.face + '</td><td>' + p.type + '</td>' +
            '<td>' + (p.tonPlan ? fmtNum(p.tonPlan) + ' 吨' : fmtNum(p.footPlan) + ' m') + '</td><td class="mono">' + p.ver + '</td><td>' + statusBadge(p.status) + '</td>' +
            '<td><button class="btn sm ghost" onclick="PAGES.p02.breakdown(\'' + p.id + '\')">拆解</button> <button class="btn sm ghost" onclick="toast(\'打开计划-实际对比（见下图）\')">对比</button></td></tr>';
        }).join('') + '</table></div>' +
      '<div class="card col"><h3>10 月计划拆解概况</h3>' +
        '<div class="detail-grid" style="margin-top:8px">' +
          '<span class="k">1304 综采</span><span>月计划 15.0 万吨 → 日计划 5,200 吨 → 班任务 早 2,100 / 中 2,000 / 夜 1,100</span>' +
          '<span class="k">3302 掘进</span><span>月计划 280m → 日计划 9m → 班任务 早 8 / 中 6（预警段降速）</span>' +
          '<span class="k">3304 掘进</span><span>月计划 260m → 日计划 8m</span>' +
          '<span class="k">调整说明</span><span>1306 安装调试占用综采二班，10 月上旬 1304 放缓推进</span>' +
        '</div>' +
        '<div class="tiny mt12">◆ 计划版本：V1.0（ERP 原始）→ V2.1（MOM 调整），版本差异自动留痕</div></div>' +
    '</div>' +
    '<div class="card mt16"><h3>计划-实际对比（1304 综采工作面 · 月度）</h3><div class="chart" id="c-p02"></div></div>';
  }, init: function () {
    var months = ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'];
    var plan = [14.8, 15.0, 15.2, 15.0, 14.6, 15.0], act = [14.3, 15.4, 14.8, 15.6, 13.9, 11.62];
    mkChart(document.getElementById('c-p02'), {
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: months },
      yAxis: { type: 'value', name: '万吨' },
      series: [
        { name: '计划产量', type: 'bar', barWidth: 22, itemStyle: { color: '#C4B5FD', borderRadius: [4, 4, 0, 0] }, data: plan },
        { name: '实际产量', type: 'bar', barWidth: 22, itemStyle: { color: '#2563EB', borderRadius: [4, 4, 0, 0] }, data: act },
        { name: '完成率', type: 'line', yAxisIndex: 0, smooth: true, symbolSize: 6, lineStyle: { color: '#F59E0B' }, data: act.map(function (v, i) { return +(v / plan[i] * 100).toFixed(1); }) }
      ]
    });
  }, breakdown: function (id) {
    var p = M.plans.find(function (x) { return x.id === id; });
    openModal('计划拆解 · ' + p.id,
      '<div class="detail-grid">' +
      '<span class="k">工作面</span><span>' + p.face + '（' + p.type + '）</span>' +
      '<span class="k">月计划</span><span>' + (p.tonPlan ? fmtNum(p.tonPlan) + ' 吨' : fmtNum(p.footPlan) + ' m') + '</span>' +
      '<span class="k">拆解方式</span><span>按生产天数均分 → 生成日计划 → 按班次生成班组任务（工单）</span></div>' +
      '<div class="field mt12"><label>日均拆解（可调）</label><input class="inp" value="' + (p.tonPlan ? '5,200 吨/天 × 26 个生产日' : '9 m/天 × 26 个生产日') + '"></div>' +
      '<div class="field"><label>班次分配</label><input class="inp" value="' + (p.tonPlan ? '早班 40% / 中班 38% / 夜班 22%' : '早班 55% / 中班 45%') + '"></div>' +
      '<div class="field"><label>调整说明（留痕）</label><textarea class="inp" rows="2">' + (p.adjust === '—' ? '' : p.adjust) + '</textarea></div>',
      '<button class="btn" onclick="closeModal()">取消</button><button class="btn primary" onclick="closeModal();toast(\'拆解完成：已生成 26 个日计划与班组工单（模拟）\')">确认拆解</button>');
  } };

  /* ================= P03 工单列表 ================= */
  P.p03 = { filter: '全部', title: '工作面工单列表', render: function () {
    var types = ['全部', '综采回采', '掘进', '检修', '搬家倒面'];
    var list = M.workOrders.filter(function (w) { return P.p03.filter === '全部' || w.type === P.p03.filter; });
    return '' +
    '<div class="page-head"><h2>工作面工单列表</h2><span class="tiny">工单类型覆盖综采回采 / 掘进 / 搬家倒面 / 检修</span>' +
      '<button class="btn primary sm right" onclick="PAGES.p03.dispatch()">＋ 新建工单 / 派工</button></div>' +
    '<div class="card"><div class="filters mb12">' + types.map(function (t) {
      return '<span class="chip-f ' + (P.p03.filter === t ? 'on' : '') + '" onclick="PAGES.p03.setFilter(\'' + t + '\')">' + t + '</span>';
    }).join('') + '</div>' +
    '<table class="tbl"><tr><th>工单号</th><th>工作面</th><th>类型</th><th>班次</th><th>班组</th><th>任务量</th><th>完成</th><th>状态</th><th>操作</th></tr>' +
    list.map(function (w) {
      var task = w.planTon ? fmtNum(w.planTon) + ' 吨' : (w.planFoot ? w.planFoot + ' m' : '—');
      var done = w.actTon ? fmtNum(w.actTon) + ' 吨' : (w.actFoot ? w.actFoot + ' m' : '—');
      return '<tr><td class="mono">' + w.id + '</td><td>' + w.face + '</td><td>' + w.type + '</td><td>' + w.shift + '</td><td>' + w.team + '</td>' +
        '<td>' + task + '</td><td>' + done + '</td><td>' + statusBadge(w.status) + '</td>' +
        '<td><button class="btn sm ghost" onclick="location.hash=\'#/p04?wo=' + w.id + '\'">详情</button>' +
        (w.status === '待开工' ? ' <button class="btn sm ghost" onclick="toast(\'已派工到 ' + w.team + '（模拟井下 PAD 推送）\')">派工</button>' : '') + '</td></tr>';
    }).join('') + '</table></div>';
  }, init: function () {}, setFilter: function (t) { P.p03.filter = t; route(); }, dispatch: function () {
    openModal('新建工单 / 派工',
      '<div class="grid2"><div class="field"><label>工作面</label><select class="inp">' + M.workfaces.map(function (f) { return '<option>' + f.name + '</option>'; }).join('') + '</select></div>' +
      '<div class="field"><label>工单类型</label><select class="inp"><option>综采回采</option><option>掘进</option><option>检修</option><option>搬家倒面</option></select></div>' +
      '<div class="field"><label>班次</label><select class="inp"><option>早班 8:00-16:00</option><option>中班 16:00-24:00</option><option>夜班 0:00-8:00</option></select></div>' +
      '<div class="field"><label>班组</label><select class="inp">' + M.teams.map(function (t) { return '<option>' + t.name + '</option>'; }).join('') + '</select></div></div>' +
      '<div class="field"><label>任务量</label><input class="inp" placeholder="如：2100 吨 / 8m / 检修项清单"></div>' +
      '<div class="tiny">派工后将实时推送至班组井下防爆 PAD，弱网环境本地缓存、恢复后自动同步。</div>',
      '<button class="btn" onclick="closeModal()">取消</button><button class="btn primary" onclick="closeModal();toast(\'工单已下发至班组 PAD（模拟）\')">确认派工</button>');
  } };

  /* ================= P04 工单详情 ================= */
  P.p04 = { wo: 'WO-1026-001', title: '工单详情 / 报工记录', render: function (el, query) {
    if (query && query.wo) P.p04.wo = query.wo;
    var w = M.workOrders.find(function (x) { return x.id === P.p04.wo; }) || M.workOrders[0];
    return '' +
    '<div class="page-head"><h2>工单详情 <span class="mono" style="color:var(--brand)">' + w.id + '</span></h2>' +
      statusBadge(w.status) + '<button class="btn sm right" onclick="location.hash=\'#/p03\'">← 返回列表</button></div>' +
    '<div class="row">' +
      '<div class="card col" style="flex:2"><h3>工单信息</h3><div class="detail-grid mt8">' +
        '<span class="k">工作面</span><span>' + w.face + '</span>' +
        '<span class="k">类型 / 班次</span><span>' + w.type + ' · ' + w.shift + '</span>' +
        '<span class="k">班组 / 出勤</span><span>' + w.team + ' · ' + w.crew + ' 人</span>' +
        '<span class="k">任务量</span><span>' + (w.planTon ? fmtNum(w.planTon) + ' 吨' : (w.planFoot ? w.planFoot + ' m' : '检修作业')) + '</span>' +
        '<span class="k">实际完成</span><span class="strong">' + (w.actTon ? fmtNum(w.actTon) + ' 吨' : (w.actFoot ? w.actFoot + ' m' : '—')) + '</span>' +
        '<span class="k">作业时间</span><span>' + w.start + ' ~ ' + w.end + '</span></div>' +
        '<h3 class="mt16">工序节点</h3><div class="flex wrap mt8">' +
        w.steps.map(function (s) { return '<span class="badge brand">' + s + '</span>'; }).join(' ') + '</div></div>' +
      '<div class="card col"><h3>报工时间线</h3><div class="timeline mt12">' +
        '<div class="tl-item done"><div class="t">任务下发至 PAD</div><div class="d">' + (w.start === '—' ? '待推送' : '08:02 · 弱网自动重试 1 次') + '</div></div>' +
        '<div class="tl-item done"><div class="t">开工确认</div><div class="d">' + (w.start === '—' ? '待开工' : w.start + ' · 班组长 PAD 确认') + '</div></div>' +
        '<div class="tl-item ' + (w.status === '报工完成' ? 'done' : 'gray') + '"><div class="t">过程工序打卡</div><div class="d">' + (w.steps.length) + ' 项工序 · ' + (w.status === '报工完成' ? '全部完成' : '进行中') + '</div></div>' +
        '<div class="tl-item ' + (w.status === '报工完成' ? 'done' : 'gray') + '"><div class="t">完工报工</div><div class="d">' + (w.end === '—' ? '待完工' : w.end + ' · 产量自动采集皮带秤核验通过') + '</div></div>' +
      '</div>' +
      '<div class="tiny mt8">📎 报工附件：现场照片 3 张 · 语音说明 1 段（PAD 上传）</div></div>' +
    '</div>';
  }, init: function () {} };

  /* ================= P05 产量与进尺 ================= */
  P.p05 = { title: '产量与进尺看板', render: function () {
    var month = M.prod30.reduce(function (s, x) { return s + x.actTon; }, 0);
    return '' +
    '<div class="page-head"><h2>产量与进尺看板</h2><span class="tiny">皮带称重 + 割煤进度自动采集，支持人工补录</span></div>' +
    '<div class="grid4">' +
      '<div class="card kpi"><div class="k-label">本月累计产量</div><div class="k-value">' + fmtNum(Math.round(month)) + '<span class="k-unit">吨</span></div><div class="k-trend">月计划 15.0 万吨 · 完成 77.5%</div></div>' +
      '<div class="card kpi"><div class="k-label">本月累计进尺</div><div class="k-value">262<span class="k-unit">m</span></div><div class="k-trend">月计划 280m · 完成 93.6%</div></div>' +
      '<div class="card kpi"><div class="k-label">回采推进度（1304）</div><div class="k-value">47<span class="k-unit">%</span></div><div class="k-trend">682 / 1450 m · 剩余约 96 天</div></div>' +
      '<div class="card kpi"><div class="k-label">自动采集占比</div><div class="k-value">96<span class="k-unit">%</span></div><div class="k-trend">其余为 PAD 人工补录</div></div>' +
    '</div>' +
    '<div class="card mt16"><h3>近 30 日产量 / 进尺趋势</h3><div class="chart" id="c-p05a"></div></div>' +
    '<div class="row mt16">' +
      '<div class="card col"><h3>班次产量构成（近 30 日均值）</h3><div class="chart-sm" id="c-p05b"></div></div>' +
      '<div class="card col"><h3>工作面本月完成对比</h3><div class="chart-sm" id="c-p05c"></div></div>' +
      '<div class="card col"><h3>采掘接续预警</h3><table class="tbl mt8"><tr><th>工作面</th><th>状态</th><th>剩余天数</th><th>接续面</th><th>裕量</th></tr>' +
        M.succession.map(function (s) {
          return '<tr><td>' + s.face + '</td><td>' + s.current + '</td><td>' + s.remainDays + ' 天</td><td>' + s.next + '</td>' +
            '<td>' + levelBadge(s.level) + ' ' + s.gap + ' 天</td></tr>';
        }).join('') + '</table>' +
        '<div class="tiny mt8">◆ 1304 → 1306 接续裕量仅 12 天：建议 10 月底前完成 1306 安装收尾并组织初采预验收</div></div>' +
    '</div>';
  }, init: function () {
    var d = M.prod30;
    mkChart(document.getElementById('c-p05a'), {
      tooltip: { trigger: 'axis' },
      legend: { data: ['产量(吨)', '计划(吨)', '进尺(m)'] },
      xAxis: { type: 'category', data: d.map(function (x) { return x.date.slice(5); }) },
      yAxis: [{ type: 'value', name: '吨' }, { type: 'value', name: 'm', max: 15, splitLine: { show: false } }],
      series: [
        { name: '产量(吨)', type: 'bar', barWidth: 12, itemStyle: { color: '#2563EB', borderRadius: [3, 3, 0, 0] }, data: d.map(function (x) { return x.actTon; }) },
        { name: '计划(吨)', type: 'line', smooth: true, symbol: 'none', lineStyle: { type: 'dashed', color: '#98A1B3' }, data: d.map(function (x) { return x.planTon; }) },
        { name: '进尺(m)', type: 'line', yAxisIndex: 1, smooth: true, symbolSize: 5, lineStyle: { color: '#7C3AED' }, data: d.map(function (x) { return x.actFoot; }) }
      ]
    });
    var avg = [0, 0, 0]; d.forEach(function (x) { avg[0] += x.shiftA; avg[1] += x.shiftB; avg[2] += x.shiftC; });
    mkChart(document.getElementById('c-p05b'), {
      tooltip: {},
      xAxis: { type: 'category', data: ['早班', '中班', '夜班'] }, yAxis: { type: 'value', name: '吨/班' },
      series: [{ type: 'bar', barWidth: 40, itemStyle: { borderRadius: [6, 6, 0, 0], color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#7C3AED' }, { offset: 1, color: '#2563EB' }] } },
        label: { show: true, position: 'top', formatter: function (p) { return fmtNum(Math.round(avg[p.dataIndex] / 30)); } },
        data: avg.map(function (v) { return Math.round(v / 30); }) }]
    });
    mkChart(document.getElementById('c-p05c'), {
      tooltip: {},
      xAxis: { type: 'category', data: ['1304 综采', '3302 掘进', '3304 掘进'] }, yAxis: { type: 'value', name: '%' },
      series: [{ type: 'bar', barWidth: 36, itemStyle: { borderRadius: [6, 6, 0, 0] },
        label: { show: true, position: 'top', formatter: '{c}%' },
        data: [
          { value: 77.5, itemStyle: { color: '#2563EB' } },
          { value: 79.2, itemStyle: { color: '#7C3AED' } },
          { value: 77.3, itemStyle: { color: '#10B981' } }
        ] }]
    });
  } };

  /* ================= P06 告警中心 ================= */
  P.p06 = { level: '全部', title: '告警中心总览', render: function () {
    var lv = ['全部', '紧急', '预警', '提示'];
    var list = M.alarms.filter(function (a) { return P.p06.level === '全部' || a.level === P.p06.level; });
    var cnt = { 紧急: 0, 预警: 0, 提示: 0 };
    M.alarms.forEach(function (a) { cnt[a.level]++; });
    return '' +
    '<div class="page-head"><h2>告警中心</h2><span class="tiny">统一告警引擎 · 分级推送（大屏 / APP / 短信）· 紧急告警可联动闭锁</span></div>' +
    '<div class="grid3">' +
      '<div class="card kpi" style="border-top:3px solid var(--crit)"><div class="k-label">紧急告警（未闭环）</div><div class="k-value" style="color:var(--crit)">1</div><div class="k-trend">3302 回风巷瓦斯超限 · 已闭锁联动</div></div>' +
      '<div class="card kpi" style="border-top:3px solid var(--warn)"><div class="k-label">预警告警（未闭环）</div><div class="k-value" style="color:var(--warn)">2</div><div class="k-trend">支架初撑力 · 皮带巷 CO</div></div>' +
      '<div class="card kpi" style="border-top:3px solid var(--info)"><div class="k-label">今日提示级</div><div class="k-value">' + cnt['提示'] + '</div><div class="k-trend">重复告警抑制生效 4 次</div></div>' +
    '</div>' +
    '<div class="card mt16"><div class="filters mb12">' + lv.map(function (l) {
      return '<span class="chip-f ' + (P.p06.level === l ? 'on' : '') + '" onclick="PAGES.p06.setLevel(\'' + l + '\')">' + l + '告警</span>';
    }).join('') + '<span class="tiny right">实时刷新中 · 断网时边缘侧缓存告警，恢复后补报</span></div>' +
    '<table class="tbl"><tr><th>时间</th><th>级别</th><th>类型</th><th>点位</th><th>内容</th><th>来源</th><th>处置</th><th>状态</th><th>操作</th></tr>' +
    list.map(function (a) {
      return '<tr><td class="mono">' + a.time + '</td><td>' + levelBadge(a.level) + '</td><td>' + a.type + '</td><td>' + a.spot + '</td>' +
        '<td style="max-width:280px">' + a.detail + '</td><td class="tiny">' + a.source + '</td><td class="tiny">' + a.action + '</td><td>' + statusBadge(a.status) + '</td>' +
        '<td><button class="btn sm ghost" onclick="PAGES.p06.handle(\'' + a.id + '\')">处置</button></td></tr>';
    }).join('') + '</table></div>';
  }, init: function () {}, setLevel: function (l) { P.p06.level = l; route(); }, handle: function (id) {
    var a = M.alarms.find(function (x) { return x.id === id; });
    openModal('告警处置 · ' + a.id,
      '<div class="detail-grid">' +
      '<span class="k">级别 / 类型</span><span>' + levelBadge(a.level) + ' ' + a.type + '</span>' +
      '<span class="k">点位</span><span>' + a.spot + '</span>' +
      '<span class="k">内容</span><span>' + a.detail + '</span>' +
      '<span class="k">触发规则</span><span>' + a.rule + '</span>' +
      '<span class="k">已执行动作</span><span>' + a.action + '</span></div>' +
      (a.level === '紧急' ? '<div class="badge crit mt12" style="display:inline-flex">⚠ 安全红线：闭锁指令已下发至恒达工作面集控，硬控制逻辑保留在底层控制器，MOM 仅做管理与指令下发，全程留痕</div>' : '') +
      '<div class="field mt12"><label>处置意见</label><textarea class="inp" rows="3" placeholder="填写处置措施与结果…">' + (a.level === '紧急' ? '已通知通防班调整风量，CH4 回落中，持续监测。' : '') + '</textarea></div>',
      '<button class="btn" onclick="closeModal()">取消</button><button class="btn primary" onclick="closeModal();toast(\'处置记录已保存并留痕审计（模拟）\')">提交处置</button>');
  } };

  /* ================= P07 告警规则 ================= */
  P.p07 = { title: '告警规则配置', render: function () {
    return '' +
    '<div class="page-head"><h2>告警规则配置</h2><span class="tiny">阈值 → 分级 → 联动动作（闭锁 / 通知 / 派单）</span>' +
      '<button class="btn primary sm right" onclick="toast(\'新建规则（模拟）\')">＋ 新建规则</button></div>' +
    '<div class="card"><table class="tbl"><tr><th>规则号</th><th>规则名称</th><th>监测指标</th><th>触发条件</th><th>级别</th><th>联动动作</th><th>本月触发</th><th>启用</th><th>操作</th></tr>' +
    M.alarmRules.map(function (r) {
      return '<tr><td class="mono">' + r.id + '</td><td class="strong">' + r.name + '</td><td>' + r.metric + '</td><td class="mono">' + r.cond + '</td>' +
        '<td>' + (r.level === '—' ? '<span class="badge gray">策略</span>' : levelBadge(r.level)) + '</td>' +
        '<td style="max-width:320px" class="tiny">' + r.action + '</td><td>' + r.fired + ' 次</td>' +
        '<td><span class="switch' + (r.enabled ? ' on' : '') + '" onclick="toast(\'规则 ' + r.id + (r.enabled ? ' 已停用' : ' 已启用') + '（模拟），变更留痕\')"><i></i></span></td>' +
        '<td><button class="btn sm ghost" onclick="PAGES.p07.edit(\'' + r.id + '\')">编辑</button></td></tr>';
    }).join('') + '</table></div>' +
    '<div class="card mt16"><h3>紧急闭锁联动链路（AR-01）</h3>' +
    '<div class="flex wrap mt8" style="gap:8px">' +
      ['传感器越限', '告警引擎判定', '调用恒达集控接口', '下发工作面闭锁', '调度/矿长 1s 内推送', '处置确认后手动解锁（留痕）'].map(function (s, i) {
        return '<span class="badge brand">' + (i + 1) + '. ' + s + '</span>';
      }).join('<span style="color:#98A1B3">→</span>') + '</div>' +
    '<div class="tiny mt12">◆ 合规红线：MOM 不直接接管底层设备硬控制，闭锁逻辑与安全联锁保留在恒达电液控底层控制器；MOM 断网不影响工作面基础运行。</div></div>';
  }, init: function () {}, edit: function (id) {
    var r = M.alarmRules.find(function (x) { return x.id === id; });
    openModal('编辑规则 · ' + r.id,
      '<div class="field"><label>规则名称</label><input class="inp" value="' + r.name + '"></div>' +
      '<div class="grid2"><div class="field"><label>监测指标</label><input class="inp" value="' + r.metric + '"></div>' +
      '<div class="field"><label>触发条件</label><input class="inp" value="' + r.cond + '"></div></div>' +
      '<div class="grid2"><div class="field"><label>告警级别</label><select class="inp"><option' + (r.level === '紧急' ? ' selected' : '') + '>紧急</option><option' + (r.level === '预警' ? ' selected' : '') + '>预警</option><option' + (r.level === '提示' ? ' selected' : '') + '>提示</option></select></div>' +
      '<div class="field"><label>联动动作</label><select class="inp"><option' + (r.action.indexOf('闭锁') > -1 ? ' selected' : '') + '>闭锁联动</option><option>通知（大屏/APP/短信）</option><option>自动生成维修工单</option></select></div></div>' +
      '<div class="tiny">规则变更将记入操作审计（谁改的、改了什么、何时生效）。</div>',
      '<button class="btn" onclick="closeModal()">取消</button><button class="btn primary" onclick="closeModal();toast(\'规则已保存并留痕（模拟）\')">保存</button>');
  } };

  /* ================= P08 隐患闭环 ================= */
  P.p08 = { title: '隐患闭环管理', render: function () {
    var open = M.hazards.filter(function (h) { return h.status !== '已销号'; }).length;
    return '' +
    '<div class="page-head"><h2>隐患闭环管理</h2><span class="tiny">PAD 拍照上报 → 分派 → 整改 → 复查 → 销号，分级（一般 / 重大）</span>' +
      '<button class="btn primary sm right" onclick="PAGES.p08.report()">＋ 隐患上报</button></div>' +
    '<div class="grid4">' +
      '<div class="card kpi"><div class="k-label">未销号隐患</div><div class="k-value" style="color:var(--warn)">' + open + '</div><div class="k-trend">重大 1 · 一般 ' + (open - 1) + '</div></div>' +
      '<div class="card kpi"><div class="k-label">本月已销号</div><div class="k-value" style="color:var(--ok)">3</div><div class="k-trend">平均闭环 1.8 天</div></div>' +
      '<div class="card kpi"><div class="k-label">超期未整改</div><div class="k-value" style="color:var(--ok)">0</div><div class="k-trend">全部在期限内</div></div>' +
      '<div class="card kpi"><div class="k-label">本月三违</div><div class="k-value">2</div><div class="k-trend">已按制度处理并培训</div></div>' +
    '</div>' +
    '<div class="card mt16"><h3>隐患台账</h3><table class="tbl"><tr><th>隐患号</th><th>位置</th><th>类型</th><th>级别</th><th>上报</th><th>责任单位</th><th>期限</th><th>状态</th><th>流程</th></tr>' +
    M.hazards.map(function (h) {
      var step = h.status === '已销号' ? 5 : h.status === '待复查' ? 4 : h.status === '整改中' ? 3 : 2;
      return '<tr><td class="mono">' + h.id + '</td><td>' + h.spot + '</td><td>' + h.type + '</td><td>' + levelBadge(h.level) + '</td>' +
        '<td class="tiny">' + h.reportBy + ' · ' + h.reportTime + '</td><td>' + h.assign + '</td><td>' + h.due + '</td><td>' + statusBadge(h.status) + '</td>' +
        '<td><div class="flex" style="gap:4px">' + ['上报', '分派', '整改', '复查', '销号'].map(function (s, i) {
          return '<span class="hstep' + (i < step ? ' done' : '') + '">' + s + '</span>';
        }).join('') + '</div></td></tr>';
    }).join('') + '</table></div>';
  }, init: function () {}, report: function () {
    openModal('隐患上报',
      '<div class="grid2"><div class="field"><label>位置</label><input class="inp" value="3302 回风巷 58m 处"></div>' +
      '<div class="field"><label>类型</label><select class="inp"><option>顶板</option><option>机电</option><option>液压</option><option>一通三防</option><option>水害</option><option>其他</option></select></div>' +
      '<div class="field"><label>级别</label><select class="inp"><option>一般</option><option>重大</option></select></div>' +
      '<div class="field"><label>整改期限</label><input class="inp" value="2026-10-10"></div></div>' +
      '<div class="field"><label>描述</label><textarea class="inp" rows="3">锚索托盘空贴，预紧力不足，顶板离层仪读数上升。</textarea></div>' +
      '<div class="tiny">📎 已附现场照片 1 张（PAD 拍摄 · 自动定位 3302 回风巷 58m）</div>',
      '<button class="btn" onclick="closeModal()">取消</button><button class="btn primary" onclick="closeModal();toast(\'隐患已登记并分派至责任单位（模拟）\')">提交</button>');
  } };

  /* ================= P09 人员定位 ================= */
  P.p09 = { title: '人员定位与入井管理', render: function () {
    return '' +
    '<div class="page-head"><h2>人员定位与入井管理</h2><span class="tiny">UWB 定位分站接入 · 电子围栏 · 超员/滞留告警 · 无证入井联动拦截</span></div>' +
    '<div class="grid4">' +
      '<div class="card kpi"><div class="k-label">当前在井</div><div class="k-value">' + M.underground.total + '<span class="k-unit">/ ' + M.underground.limit + ' 人</span></div><div class="k-trend trend up">核定 120 人 · 正常</div></div>' +
      '<div class="card kpi"><div class="k-label">电子围栏事件（今日）</div><div class="k-value" style="color:var(--warn)">1</div><div class="k-trend">3304 掘进面警示区 1 人闯入提醒</div></div>' +
      '<div class="card kpi"><div class="k-label">超时滞留（>12h）</div><div class="k-value">1</div><div class="k-trend">已通知调度核实</div></div>' +
      '<div class="card kpi"><div class="k-label">无证入井拦截</div><div class="k-value" style="color:var(--crit)">1</div><div class="k-trend">证书过期 · 井口闸机联动</div></div>' +
    '</div>' +
    '<div class="row mt16">' +
      '<div class="card col" style="flex:3"><h3>井下人员分布示意<span class="sub">分站级定位</span></h3>' +
        '<svg class="mine-map" id="p09map" viewBox="0 0 860 320" style="width:100%"></svg>' +
        '<div class="tiny">● 人数 = 区域当前人数 / 核定限员；红色为接近限员区域</div></div>' +
      '<div class="card col"><h3>区域限员监控</h3><table class="tbl mt8"><tr><th>区域</th><th>当前/限员</th><th>占用率</th></tr>' +
        M.underground.byArea.map(function (a) {
          var pct = Math.round(a.count / a.limit * 100);
          return '<tr><td>' + a.area + '</td><td>' + a.count + ' / ' + a.limit + '</td><td style="min-width:110px"><div class="pbar' + (pct > 90 ? ' crit' : '') + '"><i style="width:' + pct + '%"></i></div></td></tr>';
        }).join('') + '</table>' +
        '<h3 class="mt16">入井登记（今日）</h3><div class="tiny mt8">累计入井 128 人次 · 升井 42 人次 · 入井时长实时计算</div>' +
        '<table class="tbl mt8"><tr><th>人员</th><th>入井时间</th><th>当前位置</th></tr>' +
        M.personnel.filter(function (p) { return p.underground; }).slice(0, 5).map(function (p) {
          return '<tr><td>' + p.name + '（' + p.job + '）</td><td class="mono">07:' + (10 + p.name.length * 3) + '</td><td>' + p.pos + '</td></tr>';
        }).join('') + '</table></div>' +
    '</div>';
  }, init: function () {
    var svg = document.getElementById('p09map');
    var areas = [
      { x: 60, y: 40, w: 300, h: 90, name: '1304 综采工作面', c: '#ECFDF5', tc: '#059669' },
      { x: 60, y: 160, w: 240, h: 90, name: '1306 安装面', c: '#EFF6FF', tc: '#2563EB' },
      { x: 430, y: 40, w: 220, h: 90, name: '3302 掘进面', c: '#FFF7ED', tc: '#D97706' },
      { x: 430, y: 160, w: 220, h: 90, name: '3304 掘进面', c: '#F1F3F8', tc: '#64748B' },
      { x: 700, y: 100, w: 120, h: 150, name: '运输大巷', c: '#F8FAFD', tc: '#64748B' }
    ];
    var rects = areas.map(function (a, i) {
      var cnt = M.underground.byArea[i] || { count: 4, limit: 18 };
      var warn = cnt.count / cnt.limit > 0.9;
      return '<g><rect x="' + a.x + '" y="' + a.y + '" width="' + a.w + '" height="' + a.h + '" rx="10" fill="' + a.c + '" stroke="' + (warn ? '#EF4444' : '#E5E9F2') + '" stroke-width="' + (warn ? 2.5 : 1.5) + '"/>' +
        '<text x="' + (a.x + 14) + '" y="' + (a.y + 28) + '" font-size="13" fill="#1F2430" font-weight="600">' + a.name + '</text>' +
        '<text x="' + (a.x + 14) + '" y="' + (a.y + 54) + '" font-size="12" fill="' + a.tc + '">' + cnt.count + ' / ' + cnt.limit + ' 人' + (warn ? ' ⚠接近限员' : '') + '</text>' +
        '<text x="' + (a.x + 14) + '" y="' + (a.y + 74) + '" font-size="10" fill="#98A1B3">' + (i % 2 ? 'UWB 分站 · 信号正常' : 'UWB 分站 ×2 · 信号正常') + '</text></g>';
    }).join('');
    var dots = [130, 200, 480, 500, 530, 750, 760, 770].map(function (cx, i) {
      var cy = 70 + (i % 4) * 45 + M.rnd(-8, 8);
      return '<circle cx="' + cx + '" cy="' + cy + '" r="5" fill="#7C3AED" opacity=".75"><animate attributeName="opacity" values=".75;.3;.75" dur="' + (2 + i * 0.4) + 's" repeatCount="indefinite"/></circle>';
    }).join('');
    svg.innerHTML = rects + dots +
      '<line x1="60" y1="130" x2="820" y2="130" stroke="#D8DEEA" stroke-dasharray="6 4"/>' +
      '<text x="62" y="126" font-size="10" fill="#98A1B3">2 号煤层采区</text>' +
      '<text x="62" y="250" font-size="10" fill="#98A1B3">3 号煤层采区</text>';
  } };

  /* ================= P10 设备台账 ================= */
  P.p10 = { tab: '成套设备', title: '设备台账', render: function () {
    var tabs = ['成套设备', '支架明细（1304）'];
    var body = '';
    if (P.p10.tab === '成套设备') {
      body = '<table class="tbl"><tr><th>设备编号</th><th>名称</th><th>型号</th><th>位置</th><th>厂商</th><th>数量</th><th>健康分</th><th>状态</th><th>操作</th></tr>' +
        M.devices.map(function (d) {
          return '<tr><td class="mono">' + d.id + '</td><td class="strong">' + d.name + '</td><td class="mono">' + d.model + '</td><td>' + d.face + '</td>' +
            '<td>' + d.vendor + '</td><td>' + d.count + '</td>' +
            '<td style="min-width:120px"><div class="flex"><div class="pbar' + (d.health < 80 ? ' warn' : '') + '" style="flex:1"><i style="width:' + d.health + '%"></i></div><span class="tiny" style="margin-left:8px">' + d.health + '</span></div></td>' +
            '<td>' + statusBadge(d.status) + '</td>' +
            '<td><button class="btn sm ghost" onclick="PAGES.p10.detail(\'' + d.id + '\')">档案</button></td></tr>';
        }).join('') + '</table>';
    } else {
      body = '<div class="tiny mb12">1304 综采工作面液压支架 120 台 · 按健康分排序展示（红色为故障预警）</div>' +
        '<div class="sup-grid">' + M.supports.slice().sort(function (a, b) { return a.health - b.health; }).slice(0, 40).map(function (s) {
          var cls = s.status === '故障' ? 'crit' : s.status === '预警' ? 'warn' : 'ok';
          return '<div class="sup-card ' + cls + '"><div class="no">' + s.no.slice(-3) + '#</div><div class="h">' + s.health + '</div><div class="tiny">' + s.press + 'MPa</div></div>';
        }).join('') + '</div>' +
        '<div class="tiny mt12">仅展示健康分最低 40 台 · 完整 120 台支持导出</div>';
    }
    return '' +
    '<div class="page-head"><h2>设备台账</h2><span class="tiny">恒达自有设备模型：成套设备 → 部件 → 传感器 → 备件清单 → 全生命周期履历</span></div>' +
    '<div class="card"><div class="tabs">' + tabs.map(function (t) {
      return '<div class="tab ' + (P.p10.tab === t ? 'on' : '') + '" onclick="PAGES.p10.setTab(\'' + t + '\')">' + t + '</div>';
    }).join('') + '</div>' + body + '</div>';
  }, init: function () {}, setTab: function (t) { P.p10.tab = t; route(); }, detail: function (id) {
    var d = M.devices.find(function (x) { return x.id === id; });
    openModal('设备档案 · ' + d.name,
      '<div class="detail-grid">' +
      '<span class="k">型号</span><span class="mono">' + d.model + '</span>' +
      '<span class="k">位置</span><span>' + d.face + '</span>' +
      '<span class="k">厂商</span><span>' + d.vendor + '</span>' +
      '<span class="k">投运</span><span>' + d.install + ' · 累计运行 ' + fmtNum(d.runHours) + ' h</span>' +
      '<span class="k">健康分</span><span>' + d.health + ' / 100（基于电液控运行数据测算）</span>' +
      '<span class="k">MTBF</span><span>' + (typeof d.mtbf === 'number' ? d.mtbf + ' h' : d.mtbf) + '</span>' +
      '<span class="k">绑定备件</span><span>' + d.parts + '</span></div>' +
      '<h3 class="mt16" style="font-size:14px">生命周期履历（最近）</h3>' +
      '<div class="timeline mt8">' +
        '<div class="tl-item done"><div class="t">维修完成 · 更换安全阀</div><div class="d">2026-10-08 · EM-2284 关联</div></div>' +
        '<div class="tl-item done"><div class="t">季度点检</div><div class="d">2026-09-28 · 24 点位全部正常</div></div>' +
        '<div class="tl-item gray"><div class="t">大修计划</div><div class="d">预计 2027-01 · 按健康模型建议</div></div>' +
      '</div>',
      '<button class="btn" onclick="closeModal()">关闭</button><button class="btn primary" onclick="closeModal();toast(\'已导出设备档案 PDF（模拟）\')">导出档案</button>');
  } };
})(window.PAGES);
