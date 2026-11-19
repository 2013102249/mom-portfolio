/* ============================================================
 * PC 后台页面 P11-P20
 * ============================================================ */
window.PAGES = window.PAGES || {};
(function (P) {
  var M = window.MOM;
  function statusBadge(s) {
    var map = { '报工完成': 'ok', '执行中': 'info', '待开工': 'gray', '已取消': 'gray', '生产中': 'ok', '安装调试': 'info',
      '处置中': 'crit', '已派单': 'warn', '已闭环': 'ok', '整改中': 'warn', '待复查': 'info', '已销号': 'ok',
      '维修中': 'warn', '待备件': 'crit', '运行': 'ok', '调试': 'info', '待拆解': 'gray', '已拆解': 'ok',
      '待执行': 'gray', '已完成': 'ok', '已批准': 'ok', '已入库': 'ok', '化验中': 'info', '已化验': 'ok', '已上报': 'ok', '在线': 'ok' };
    return '<span class="badge ' + (map[s] || 'gray') + '">' + s + '</span>';
  }
  function levelBadge(l) {
    var map = { '紧急': 'crit', '预警': 'warn', '提示': 'info', '重大': 'crit', '一般': 'gray', '高': 'crit', '中': 'warn', '低': 'info' };
    return '<span class="badge ' + (map[l] || 'gray') + '">' + l + '</span>';
  }

  /* ================= P11 点巡检 ================= */
  P.p11 = { title: '点巡检任务', render: function () {
    return '' +
    '<div class="page-head"><h2>点巡检任务</h2><span class="tiny">按工作面批量生成计划 · 井下 PAD 巡检打卡（NFC/二维码）· 拍照留证</span>' +
      '<button class="btn primary sm right" onclick="toast(\'巡检计划已按工作面批量生成（模拟）\')">批量生成计划</button></div>' +
    '<div class="row">' +
      '<div class="card col" style="flex:1"><h3>本周巡检日历</h3><div class="cal">' +
        ['一', '二', '三', '四', '五', '六', '日'].map(function (d, i) {
          var n = 6 + i, active = n === 9;
          return '<div class="cal-day' + (active ? ' today' : '') + '"><div class="d">' + n + '</div><div class="tiny">' + [3, 2, 4, 2, 3, 1, 1][i] + ' 项</div></div>';
        }).join('') + '</div>' +
        '<div class="tiny mt12">今日 9 项巡检 · 已完成 4 · 执行中 1 · 待执行 4</div></div>' +
      '<div class="card col" style="flex:3"><h3>巡检任务列表</h3><table class="tbl"><tr><th>任务号</th><th>计划名称</th><th>位置</th><th>周期</th><th>责任人</th><th>点位进度</th><th>异常</th><th>状态</th><th>操作</th></tr>' +
        M.inspections.map(function (t) {
          var pct = Math.round(t.done / t.points * 100);
          return '<tr><td class="mono">' + t.id + '</td><td class="strong">' + t.plan + '</td><td>' + t.face + '</td><td>' + t.cycle + '</td><td>' + t.owner + '</td>' +
            '<td style="min-width:130px"><div class="flex"><div class="pbar" style="flex:1"><i style="width:' + pct + '%"></i></div><span class="tiny" style="margin-left:8px">' + t.done + '/' + t.points + '</span></div></td>' +
            '<td>' + (t.abnormal ? '<span class="badge warn">' + t.abnormal + ' 项</span>' : '<span class="badge ok">0</span>') + '</td>' +
            '<td>' + statusBadge(t.status) + '</td>' +
            '<td><button class="btn sm ghost" onclick="PAGES.p11.detail(\'' + t.id + '\')">明细</button></td></tr>';
        }).join('') + '</table></div>' +
    '</div>';
  }, init: function () {}, detail: function (id) {
    var t = M.inspections.find(function (x) { return x.id === id; });
    openModal('巡检明细 · ' + t.plan,
      '<div class="detail-grid">' +
      '<span class="k">位置 / 周期</span><span>' + t.face + ' · ' + t.cycle + '</span>' +
      '<span class="k">责任人</span><span>' + t.owner + '</span>' +
      '<span class="k">进度</span><span>' + t.done + ' / ' + t.points + ' 点位</span></div>' +
      '<h3 class="mt16" style="font-size:14px">点位清单（示例）</h3>' +
      '<table class="tbl mt8"><tr><th>点位</th><th>标准</th><th>结果</th></tr>' +
      '<tr><td>泵站出口压力</td><td class="mono">31.5±1.5 MPa</td><td><span class="badge ok">31.4 合格</span></td></tr>' +
      '<tr><td>乳化液浓度</td><td class="mono">2.5~3.5 %</td><td><span class="badge warn">2.2 偏低</span></td></tr>' +
      '<tr><td>液箱液位</td><td class="mono">≥ 60%</td><td><span class="badge ok">72% 合格</span></td></tr>' +
      '<tr><td>电机温度</td><td class="mono">≤ 70℃</td><td><span class="badge ok">52℃ 合格</span></td></tr>' +
      '</table>' +
      '<div class="tiny mt12">📷 异常点位已拍照上传，自动关联生成维修工单建议</div>',
      '<button class="btn" onclick="closeModal()">关闭</button><button class="btn primary" onclick="closeModal();toast(\'已派发复查任务（模拟）\')">派发复查</button>');
  } };

  /* ================= P12 维修工单 ================= */
  P.p12 = { title: '维修工单中心', render: function () {
    return '' +
    '<div class="page-head"><h2>维修工单中心</h2><span class="tiny">故障上报 → 工单派发 → 备件领用 → 维修记录 → 验收闭环</span>' +
      '<button class="btn primary sm right" onclick="PAGES.p12.create()">＋ 故障报修</button></div>' +
    '<div class="grid4 mb16">' +
      '<div class="card kpi"><div class="k-label">进行中工单</div><div class="k-value" style="color:var(--warn)">2</div><div class="k-trend">维修中 1 · 待备件 1</div></div>' +
      '<div class="card kpi"><div class="k-label">本月闭环</div><div class="k-value" style="color:var(--ok)">18</div><div class="k-trend">平均修复 MTTR 3.2h</div></div>' +
      '<div class="card kpi"><div class="k-label">告警自动派单占比</div><div class="k-value">67<span class="k-unit">%</span></div><div class="k-trend">告警 → 工单自动联动</div></div>' +
      '<div class="card kpi"><div class="k-label">备件联动领用</div><div class="k-value">12<span class="k-unit">单</span></div><div class="k-trend">工单自动带出领用申请</div></div>' +
    '</div>' +
    '<div class="card"><table class="tbl"><tr><th>工单号</th><th>设备</th><th>故障描述</th><th>级别</th><th>来源</th><th>备件需求</th><th>责任人</th><th>状态</th><th>操作</th></tr>' +
    M.repairs.map(function (r) {
      return '<tr><td class="mono">' + r.id + '</td><td class="strong">' + r.device + '</td><td style="max-width:240px">' + r.fault + '</td><td>' + levelBadge(r.level) + '</td>' +
        '<td class="tiny">' + r.source + '</td><td class="tiny" style="max-width:170px">' + r.parts + '</td><td>' + r.by + '</td><td>' + statusBadge(r.status) + '</td>' +
        '<td><button class="btn sm ghost" onclick="PAGES.p12.detail(\'' + r.id + '\')">详情</button></td></tr>';
    }).join('') + '</table></div>';
  }, init: function () {}, create: function () {
    openModal('故障报修',
      '<div class="field"><label>设备</label><select class="inp">' + M.devices.map(function (d) { return '<option>' + d.name + '（' + d.face + '）</option>'; }).join('') + '</select></div>' +
      '<div class="grid2"><div class="field"><label>级别</label><select class="inp"><option>高</option><option>中</option><option>低</option></select></div>' +
      '<div class="field"><label>期望完成</label><input class="inp" value="2026-10-10"></div></div>' +
      '<div class="field"><label>故障描述</label><textarea class="inp" rows="3" placeholder="描述故障现象、发生时间、影响范围…"></textarea></div>' +
      '<div class="tiny">📷 支持 PAD 拍照 / 语音转文字上报 · 报修后自动关联设备绑定备件清单</div>',
      '<button class="btn" onclick="closeModal()">取消</button><button class="btn primary" onclick="closeModal();toast(\'报修工单 EM-2287 已创建并派发（模拟）\')">提交</button>');
  }, detail: function (id) {
    var r = M.repairs.find(function (x) { return x.id === id; });
    var step = r.status === '已闭环' ? 5 : r.status === '维修中' ? 4 : r.status === '待备件' ? 3 : 2;
    openModal('维修工单 · ' + r.id,
      '<div class="detail-grid">' +
      '<span class="k">设备</span><span>' + r.device + '</span>' +
      '<span class="k">故障</span><span>' + r.fault + '</span>' +
      '<span class="k">来源 / 级别</span><span>' + r.source + ' · ' + levelBadge(r.level) + '</span>' +
      '<span class="k">责任人</span><span>' + r.by + ' · 计划工时 ' + r.planH + 'h</span>' +
      '<span class="k">备件</span><span>' + r.parts + '</span></div>' +
      '<div class="timeline mt16">' +
      ['故障上报', '工单派发', '备件领用', '维修中', '验收闭环'].map(function (s, i) {
        return '<div class="tl-item ' + (i < step ? 'done' : 'gray') + '"><div class="t">' + s + '</div>' +
          '<div class="d">' + (i < step ? (['' + r.start || '—', '自动派发', 'LL-1026-08 已批准', '10:55 开工', '—'][i] || '已完成') : '待执行') + '</div></div>';
      }).join('') + '</div>',
      '<button class="btn" onclick="closeModal()">关闭</button>' + (r.status !== '已闭环' ? '<button class="btn primary" onclick="closeModal();toast(\'维修记录已更新（模拟）\')">填写维修记录</button>' : ''));
  } };

  /* ================= P13 健康度 / OEE ================= */
  P.p13 = { title: '设备健康度 / OEE', render: function () {
    return '' +
    '<div class="page-head"><h2>设备健康度 / OEE 看板</h2><span class="tiny">基于恒达电液控原始数据（压力 / 动作频次 / 阀组泄漏）建模 · 1304 综采工作面</span></div>' +
    '<div class="grid4">' +
      '<div class="card" style="text-align:center"><h3>OEE 综合效率</h3><div class="chart-sm" id="c-p13-oee"></div></div>' +
      '<div class="card"><h3>OEE 三因子</h3><div class="detail-grid mt8">' +
        '<span class="k">时间开动率</span><span class="strong">' + M.oee.availability + '%</span><span class="k">性能开动率</span><span class="strong">' + M.oee.performance + '%</span>' +
        '<span class="k">合格品率</span><span class="strong">' + M.oee.quality + '%</span><span class="k">月停机</span><span class="strong">' + M.oee.stopHoursMonth + ' h</span></div>' +
        '<div class="tiny mt12">OEE = ' + M.oee.availability + '% × ' + M.oee.performance + '% × ' + M.oee.quality + '% = ' + M.oee.oee + '%</div>' +
        '<div class="tiny mt8">MTTR ' + M.oee.mttr + ' h · MTBF ' + M.oee.mtbf + ' h</div></div>' +
      '<div class="card"><h3>停机原因构成（本月）</h3><div class="chart-sm" id="c-p13-stop"></div></div>' +
      '<div class="card"><h3>健康预警 TOP</h3>' +
        '<div class="timeline mt8">' +
          '<div class="tl-item"><div class="t">45# 支架 健康分 71</div><div class="d">初撑力 22.4MPa · 阀组泄漏 3.2L/min · 已生成 EM-2286</div></div>' +
          '<div class="tl-item"><div class="t">1# 供液泵站 健康分 79</div><div class="d">出口压力波动 ±2.8MPa · 疑似蓄能器氮压不足</div></div>' +
          '<div class="tl-item gray"><div class="t">78# / 103# 支架 健康分 76</div><div class="d">动作频次异常升高 · 建议列入周巡重点</div></div>' +
        '</div></div>' +
    '</div>' +
    '<div class="row mt16">' +
      '<div class="card col" style="flex:3"><h3>支架健康分分布（1304 面 · 120 台）</h3><div class="chart" id="c-p13-dist"></div></div>' +
      '<div class="card col"><h3>故障趋势（近 30 日）</h3><div class="chart" id="c-p13-trend"></div></div>' +
    '</div>';
  }, init: function () {
    mkChart(document.getElementById('c-p13-oee'), gaugeOption(M.oee.oee, 'OEE'));
    mkChart(document.getElementById('c-p13-stop'), {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: { type: 'value', name: 'h' },
      yAxis: { type: 'category', data: M.oee.stopReasons.map(function (x) { return x.name; }).reverse() },
      series: [{ type: 'bar', barWidth: 14, itemStyle: { borderRadius: [0, 6, 6, 0], color: '#7C3AED' },
        data: M.oee.stopReasons.map(function (x) { return x.hours; }).reverse(), label: { show: true, position: 'right', formatter: '{c}h' } }]
    });
    var buckets = { '70-79': 0, '80-89': 0, '90-100': 0 };
    M.supports.forEach(function (s) {
      if (s.health < 80) buckets['70-79']++;
      else if (s.health < 90) buckets['80-89']++;
      else buckets['90-100']++;
    });
    mkChart(document.getElementById('c-p13-dist'), {
      tooltip: {},
      xAxis: { type: 'category', data: Object.keys(buckets) }, yAxis: { type: 'value', name: '台' },
      series: [{ type: 'bar', barWidth: 46, label: { show: true, position: 'top' }, itemStyle: { borderRadius: [6, 6, 0, 0] },
        data: [
          { value: buckets['70-79'], itemStyle: { color: '#EF4444' } },
          { value: buckets['80-89'], itemStyle: { color: '#F59E0B' } },
          { value: buckets['90-100'], itemStyle: { color: '#10B981' } }
        ] }]
    });
    var days = [], vals = [];
    for (var i = 29; i >= 0; i--) {
      var d = new Date(M.NOW.getTime() - i * 86400000);
      days.push(M.fmtDate(d).slice(5));
      vals.push(i % 6 === 0 ? 2 : (i % 5 === 0 ? 1 : 0));
    }
    mkChart(document.getElementById('c-p13-trend'), {
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: days }, yAxis: { type: 'value', name: '起', minInterval: 1 },
      series: [{ name: '设备故障', type: 'bar', barWidth: 10, itemStyle: { color: '#2563EB', borderRadius: [3, 3, 0, 0] }, data: vals }]
    });
  } };

  /* ================= P14 物资库存 ================= */
  P.p14 = { cat: '全部', title: '物资库存管理（井下库）', render: function () {
    var cats = ['全部', '备件', '支护材料', '油脂', '密封件', '一通三防', '工具'];
    var warns = M.materials.filter(function (m) { return m.warn !== '—'; });
    var list = M.materials.filter(function (m) { return P.p14.cat === '全部' || m.cat === P.p14.cat; });
    return '' +
    '<div class="page-head"><h2>物资库存管理（井下库）</h2><span class="tiny">井下库房库位 · 批次 · 油脂效期管理 · 低库存 / 超期预警</span></div>' +
    '<div class="grid3">' +
      '<div class="card kpi"><div class="k-label">库存品类</div><div class="k-value">' + M.materials.length + '<span class="k-unit">种</span></div><div class="k-trend">井下 2 个库房 + 2 个移动料场</div></div>' +
      '<div class="card kpi"><div class="k-label">低库存预警</div><div class="k-value" style="color:var(--crit)">' + warns.filter(function (m) { return m.warn.indexOf('低库存') > -1; }).length + '</div><div class="k-trend">安全阀 / 蓄能器胶囊 / W 钢带等</div></div>' +
      '<div class="card kpi"><div class="k-label">效期预警</div><div class="k-value" style="color:var(--warn)">1</div><div class="k-trend">齿轮油 320 · 2026-11 到期</div></div>' +
    '</div>' +
    '<div class="card mt16"><div class="filters mb12">' + cats.map(function (c) {
      return '<span class="chip-f ' + (P.p14.cat === c ? 'on' : '') + '" onclick="PAGES.p14.setCat(\'' + c + '\')">' + c + '</span>';
    }).join('') + '</div>' +
    '<table class="tbl"><tr><th>编码</th><th>名称</th><th>类别</th><th>规格</th><th>库存</th><th>安全库存</th><th>效期</th><th>库位</th><th>预警</th></tr>' +
    list.map(function (m) {
      var low = m.stock < m.min;
      return '<tr><td class="mono">' + m.id + '</td><td class="strong">' + m.name + '</td><td>' + m.cat + '</td><td class="tiny">' + m.spec + '</td>' +
        '<td class="strong" style="color:' + (low ? 'var(--crit)' : 'inherit') + '">' + fmtNum(m.stock) + ' ' + m.unit + '</td><td>' + m.min + '</td>' +
        '<td class="tiny">' + m.expiry + '</td><td class="tiny">' + m.store + '</td><td>' + (m.warn !== '—' ? '<span class="badge warn">' + m.warn + '</span>' : '<span class="badge ok">正常</span>') + '</td></tr>';
    }).join('') + '</table></div>';
  }, init: function () {}, setCat: function (c) { P.p14.cat = c; route(); } };

  /* ================= P15 领料退料 ================= */
  P.p15 = { title: '领料 / 退料审批', render: function () {
    return '' +
    '<div class="page-head"><h2>领料 / 退料审批</h2><span class="tiny">与维修工单、生产工单联动 · 审批流全程留痕</span></div>' +
    '<div class="card"><table class="tbl"><tr><th>单号</th><th>类型</th><th>申请班组</th><th>关联单据</th><th>物料明细</th><th>时间</th><th>状态</th><th>操作</th></tr>' +
    M.reflows.map(function (r) {
      var st = r.status.indexOf('批准') > -1 ? 'ok' : r.status.indexOf('驳回') > -1 ? 'crit' : 'info';
      return '<tr><td class="mono">' + r.id + '</td><td><span class="badge ' + (r.type === '领料' ? 'brand' : 'info') + '">' + r.type + '</span></td>' +
        '<td>' + r.applyBy + '</td><td class="mono tiny">' + r.link + '</td><td>' + r.item + '</td><td class="tiny">' + r.time + '</td>' +
        '<td><span class="badge ' + st + '">' + r.status + '</span></td>' +
        '<td>' + (r.status === '已批准' ? '<button class="btn sm ghost" onclick="toast(\'出库完成，台账已更新（模拟）\')">出库</button>' : '<button class="btn sm ghost" onclick="toast(\'查看审批流（模拟）\')">流程</button>') + '</td></tr>';
    }).join('') + '</table></div>' +
    '<div class="card mt16"><h3>工单联动记录</h3><div class="detail-grid mt8">' +
      '<span class="k">EM-2286</span><span>维修工单自动带出「安全阀 FAD200/40 ×1」领用申请 → 已批准出库 → 备件追溯到支架 ZJ-1304-045</span>' +
      '<span class="k">EM-2285</span><span>蓄能器胶囊领用被驳回（库存 1 < 需求 2）→ 自动生成采购申请 PR-1026-03 → 待矿长审批</span>' +
      '<span class="k">WO-1026-004</span><span>掘进生产工单联动领用锚杆 36 套 · 锚索 8 套 → 消耗计入 3302 工作面用料成本</span></div></div>';
  }, init: function () {} };

  /* ================= P16 煤质管理 ================= */
  P.p16 = { title: '煤质采样与化验', render: function () {
    var last = M.coalQ30[M.coalQ30.length - 1];
    var bad = last.ad > M.coalCriteria.adMax ? 'crit' : 'ok';
    return '' +
    '<div class="page-head"><h2>煤质采样与化验录入</h2><span class="tiny">工作面采样 + 皮带采样 · 灰分 / 硫分 / 发热量 / 水分 · 分采分运管控</span>' +
      '<button class="btn primary sm right" onclick="PAGES.p16.entry()">＋ 化验录入</button></div>' +
    '<div class="grid4">' +
      '<div class="card kpi"><div class="k-label">最新灰分 Ad</div><div class="k-value" style="color:var(--' + (bad === 'crit' ? 'crit' : 'ink') + ')">' + last.ad + '<span class="k-unit">%</span></div><div class="k-trend">考核上限 ' + M.coalCriteria.adMax + '%</div></div>' +
      '<div class="card kpi"><div class="k-label">最新硫分 St.d</div><div class="k-value">' + last.std + '<span class="k-unit">%</span></div><div class="k-trend">考核上限 ' + M.coalCriteria.stdMax + '%</div></div>' +
      '<div class="card kpi"><div class="k-label">最新发热量 Qnet</div><div class="k-value">' + fmtNum(last.qnet) + '<span class="k-unit">kcal</span></div><div class="k-trend">下限 ' + fmtNum(M.coalCriteria.qnetMin) + ' kcal</div></div>' +
      '<div class="card kpi"><div class="k-label">最新水分 Mad</div><div class="k-value">' + last.mad + '<span class="k-unit">%</span></div><div class="k-trend">上限 ' + M.coalCriteria.madMax + '%</div></div>' +
    '</div>' +
    '<div class="card mt16"><h3>煤质趋势（近 30 日）</h3><div class="chart" id="c-p16"></div></div>' +
    '<div class="row mt16">' +
      '<div class="card col" style="flex:2"><h3>采样任务</h3><table class="tbl"><tr><th>样号</th><th>采样点</th><th>类型</th><th>时间</th><th>采样人</th><th>状态</th></tr>' +
        M.coalSamples.map(function (s) {
          return '<tr><td class="mono">' + s.id + '</td><td>' + s.point + '</td><td>' + s.type + '</td><td class="tiny">' + s.time + '</td><td>' + s.sampler + '</td><td>' + statusBadge(s.status) + '</td></tr>';
        }).join('') + '</table></div>' +
      '<div class="card col"><h3>分采分运管控</h3>' +
        '<div class="detail-grid mt8">' +
          '<span class="k">1304 面</span><span>灰分 19.2% · 正常煤流 → 1 号皮带 → 主井</span>' +
          '<span class="k">3302 面</span><span>灰分 23.6% 偏高（过断层）→ 建议 2 号皮带分流至储煤场 B</span>' +
          '<span class="k">预警</span><span class="badge warn">3302 过断层段灰分连续 3 日 > 23%，触发分运预案</span></div>' +
        '<div class="tiny mt12">◆ 分运指令由调度确认后下发皮带集控执行，MOM 记录全过程</div></div>' +
    '</div>';
  }, init: function () {
    var d = M.coalQ30;
    mkChart(document.getElementById('c-p16'), {
      tooltip: { trigger: 'axis' },
      legend: { data: ['灰分%', '硫分%', '发热量 kcal', '水分%'] },
      xAxis: { type: 'category', data: d.map(function (x) { return x.date.slice(5); }) },
      yAxis: [{ type: 'value', name: '%' }, { type: 'value', name: 'kcal', splitLine: { show: false } }],
      series: [
        { name: '灰分%', type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#7C3AED' }, data: d.map(function (x) { return x.ad; }),
          markLine: { silent: true, symbol: 'none', lineStyle: { color: '#EF4444', type: 'dashed' }, data: [{ yAxis: M.coalCriteria.adMax, label: { formatter: '灰分上限 24%' } }] } },
        { name: '硫分%', type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#F59E0B' }, data: d.map(function (x) { return x.std; }) },
        { name: '发热量 kcal', type: 'line', yAxisIndex: 1, smooth: true, symbol: 'none', lineStyle: { color: '#2563EB' }, data: d.map(function (x) { return x.qnet; }) },
        { name: '水分%', type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#10B981', type: 'dotted' }, data: d.map(function (x) { return x.mad; }) }
      ]
    });
  }, entry: function () {
    openModal('化验数据录入',
      '<div class="grid2">' +
      '<div class="field"><label>样品</label><select class="inp"><option>SP-1026-05（3302 出煤皮带）</option><option>SP-1026-06（1304 皮带采样头）</option></select></div>' +
      '<div class="field"><label>采样时间</label><input class="inp" value="2026-10-09 09:40"></div>' +
      '<div class="field"><label>灰分 Ad（%）</label><input class="inp" value="21.3"></div>' +
      '<div class="field"><label>硫分 St.d（%）</label><input class="inp" value="0.92"></div>' +
      '<div class="field"><label>发热量 Qnet（kcal）</label><input class="inp" value="5180"></div>' +
      '<div class="field"><label>水分 Mad（%）</label><input class="inp" value="7.4"></div></div>' +
      '<div class="tiny">提交后自动入库煤质台账，超考核指标自动触发煤质预警并推送调度。</div>',
      '<button class="btn" onclick="closeModal()">取消</button><button class="btn primary" onclick="closeModal();toast(\'化验数据已入库并生成煤质预警 1 条（模拟）\')">提交</button>');
  } };

  /* ================= P17 报表中心 ================= */
  P.p17 = { title: '报表中心', render: function () {
    return '' +
    '<div class="page-head"><h2>报表中心</h2><span class="tiny">班报 / 日报 / 月报自动生成 · 导出 Excel / PDF · 适配智能化验收材料</span></div>' +
    '<div class="grid3">' +
    M.reports.map(function (r) {
      return '<div class="card" style="padding:16px"><div class="flex between"><h3 style="margin:0">' + r.name + '</h3><span class="badge brand">' + r.freq + '</span></div>' +
        '<div class="tiny" style="margin:10px 0 14px">' + r.note + ' · 责任：' + r.owner + '</div>' +
        '<div class="flex"><button class="btn sm" onclick="toast(\'已导出《' + r.name + '》Excel（模拟）\')">Excel</button>' +
        '<button class="btn sm" onclick="toast(\'已导出《' + r.name + '》PDF（模拟）\')">PDF</button>' +
        '<button class="btn sm ghost" onclick="toast(\'预览（模拟）\')">预览</button></div></div>';
    }).join('') + '</div>' +
    '<div class="card mt16"><h3>智能化验收材料包（R10）</h3>' +
      '<div class="tiny mt8">按《煤矿智能化建设指南》验收要求自动汇总：智能化开采数据、生产报表、安全监测、设备绩效、人员定位等 12 类报表一键打包导出，附数据来源与时间戳。</div>' +
      '<button class="btn primary sm mt12" onclick="toast(\'验收材料包已生成（模拟）: 12 类报表 · 38 份文件\')">一键打包导出</button></div>';
  }, init: function () {} };

  /* ================= P18 主数据 ================= */
  P.p18 = { tab: '工作面', title: '主数据管理', render: function () {
    var tabs = ['工作面', '班组', '人员', '物资字典', '矿井'];
    var body = '';
    if (P.p18.tab === '工作面') {
      body = '<table class="tbl"><tr><th>编号</th><th>名称</th><th>类型</th><th>采煤设备</th><th>责任班组</th><th>状态</th><th>操作</th></tr>' +
        M.workfaces.map(function (f) {
          return '<tr><td class="mono">' + f.id + '</td><td class="strong">' + f.name + '</td><td>' + f.type + '</td><td>' + f.machine + '</td><td>' + f.team + '</td><td>' + statusBadge(f.status) + '</td>' +
            '<td><button class="btn sm ghost" onclick="toast(\'编辑工作面（模拟）\')">编辑</button></td></tr>';
        }).join('') + '</table>';
    } else if (P.p18.tab === '班组') {
      body = '<table class="tbl"><tr><th>班组</th><th>队长</th><th>人数</th><th>负责区域</th></tr>' +
        M.teams.map(function (t) { return '<tr><td class="strong">' + t.name + '</td><td>' + t.leader + '</td><td>' + t.members + '</td><td>' + t.face + '</td></tr>'; }).join('') + '</table>';
    } else if (P.p18.tab === '人员') {
      body = '<table class="tbl"><tr><th>工号</th><th>姓名</th><th>班组</th><th>岗位</th><th>特种作业资质</th><th>有效期</th><th>状态</th></tr>' +
        M.personnel.map(function (p) {
          var expired = p.certExpire !== '—' && p.certExpire < '2026-10';
          return '<tr><td class="mono">' + p.id + '</td><td class="strong">' + p.name + '</td><td>' + p.team + '</td><td>' + p.job + '</td><td>' + p.cert + '</td>' +
            '<td class="mono" style="color:' + (expired ? 'var(--crit)' : 'inherit') + '">' + p.certExpire + (expired ? '（已过期→禁止入井）' : '') + '</td><td>' + (p.underground ? '<span class="badge ok">在井</span>' : '<span class="badge gray">地面</span>') + '</td></tr>';
        }).join('') + '</table>';
    } else if (P.p18.tab === '物资字典') {
      body = '<table class="tbl"><tr><th>编码</th><th>名称</th><th>类别</th><th>规格</th><th>单位</th></tr>' +
        M.materials.slice(0, 8).map(function (m) { return '<tr><td class="mono">' + m.id + '</td><td>' + m.name + '</td><td>' + m.cat + '</td><td class="tiny">' + m.spec + '</td><td>' + m.unit + '</td></tr>'; }).join('') + '</table>' +
        '<div class="tiny mt8">共 ' + M.materials.length + ' 条，完整字典支持导入 / 导出</div>';
    } else {
      body = '<div class="detail-grid" style="max-width:560px">' +
        '<span class="k">矿井名称</span><span>' + M.mine.name + '</span>' +
        '<span class="k">设计产能</span><span>' + M.mine.capacityWanTon + ' 万吨/年</span>' +
        '<span class="k">所属方案</span><span>' + M.mine.owner + '</span>' +
        '<span class="k">智能化等级</span><span>' + M.mine.level + '</span></div>';
    }
    return '' +
    '<div class="page-head"><h2>主数据管理</h2><span class="tiny">矿井 / 工作面 / 班组 / 人员 / 物资 基础数据统一维护，变更留痕</span></div>' +
    '<div class="card"><div class="tabs">' + tabs.map(function (t) {
      return '<div class="tab ' + (P.p18.tab === t ? 'on' : '') + '" onclick="PAGES.p18.setTab(\'' + t + '\')">' + t + '</div>';
    }).join('') + '</div>' + body + '</div>';
  }, init: function () {}, setTab: function (t) { P.p18.tab = t; route(); } };

  /* ================= P19 权限与审计 ================= */
  P.p19 = { title: '权限与角色管理', render: function () {
    var perms = ['工作台', '计划', '工单', '告警', '隐患', '设备', '物资', '煤质', '报表', '组态'];
    var matrix = [
      { r: '矿领导', v: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0] },
      { r: '矿总调度员', v: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0] },
      { r: '综采队长', v: [1, 1, 1, 0, 1, 1, 1, 0, 1, 0] },
      { r: '机电工程师', v: [1, 0, 1, 0, 1, 1, 1, 0, 1, 0] },
      { r: '安全科长', v: [1, 1, 1, 1, 1, 0, 0, 0, 1, 0] },
      { r: '物资管理员', v: [1, 0, 0, 0, 0, 0, 1, 0, 1, 0] },
      { r: '煤质化验员', v: [1, 0, 0, 0, 0, 0, 0, 1, 1, 0] },
      { r: '实施工程师', v: [1, 0, 0, 0, 0, 1, 0, 0, 0, 1] }
    ];
    return '' +
    '<div class="page-head"><h2>权限与角色管理</h2><span class="tiny">矿级 / 队级 / 岗位级三级权限 · 井下终端权限隔离 · 全量操作审计</span></div>' +
    '<div class="row">' +
      '<div class="card col" style="flex:2"><h3>权限矩阵</h3>' +
        '<table class="tbl"><tr><th>角色</th>' + perms.map(function (p) { return '<th style="text-align:center">' + p + '</th>'; }).join('') + '</tr>' +
        matrix.map(function (row) {
          return '<tr><td class="strong">' + row.r + '</td>' + row.v.map(function (v) {
            return '<td style="text-align:center">' + (v ? '<span style="color:var(--ok)">✔</span>' : '<span style="color:#D3D9E5">—</span>') + '</td>';
          }).join('') + '</tr>';
        }).join('') + '</table></div>' +
      '<div class="card col"><h3>角色列表</h3>' +
        M.roles.map(function (r) {
          return '<div class="flex between" style="padding:8px 0;border-bottom:1px solid #F0F2F7"><span><span class="strong">' + r.name + '</span> <span class="tiny">默认首页：' + r.home + '</span></span>' +
            '<span class="tiny">' + r.user + '</span></div>';
        }).join('') +
        '<div class="tiny mt12">◆ 井下防爆 PAD 权限与地面后台隔离：PAD 仅开放任务 / 报工 / 隐患 / 巡检 / 领料五类操作，且绑定设备指纹。</div></div>' +
    '</div>' +
    '<div class="card mt16"><h3>操作日志审计<span class="sub">不可篡改 · 满足安监追溯</span></h3>' +
      '<table class="tbl"><tr><th>时间</th><th>操作人（角色）</th><th>动作</th><th>对象</th><th>终端 IP</th><th>结果</th></tr>' +
      M.auditLogs.map(function (l) {
        return '<tr><td class="mono">' + l.time + '</td><td>' + l.user + '</td><td>' + l.action + '</td><td>' + l.target + '</td><td class="mono tiny">' + l.ip + '</td>' +
          '<td><span class="badge ' + (l.result === '成功' ? 'ok' : 'warn') + '">' + l.result + '</span></td></tr>';
      }).join('') + '</table>' +
      '<div class="tiny mt12">◆ 控制类操作（闭锁下发 / 解除）单独审计流：操作人 + 时间 + 依据告警 + 影响范围，写入只增日志表。</div></div>';
  }, init: function () {} };

  /* ================= P20 点位组态 ================= */
  P.p20 = { gw: '全部', title: '点位组态 / 协议网关', render: function () {
    return '' +
    '<div class="page-head"><h2>点位组态 / 协议网关配置</h2><span class="tiny">恒达实施工程师专用 · 设备接入 / 测点映射 / 边缘节点管理</span>' +
      '<button class="btn primary sm right" onclick="toast(\'新建接入配置（模拟）\')">＋ 新增接入</button></div>' +
    '<div class="row">' +
      '<div class="card col" style="flex:1"><h3>协议网关（6 台在线）</h3>' +
        '<div class="tree mt8">' + M.gateways.map(function (g) {
          return '<div class="node' + (P.p20.gw === g.id ? ' on' : '') + '" onclick="PAGES.p20.setGw(\'' + g.id + '\')">' +
            '<span class="dot ok"></span><span style="flex:1"><b>' + g.name + '</b><br><span class="tiny">' + g.proto + '</span></span><span class="tiny mono">' + g.points + ' 点</span></div>';
        }).join('') + '</div></div>' +
      '<div class="card col" style="flex:3"><h3>网关详情与测点映射</h3>' +
        (P.p20.gw === '全部' ? '<div class="tiny mt8">← 左侧选择网关查看测点映射</div>' +
          '<table class="tbl mt8"><tr><th>测点 Tag</th><th>设备</th><th>指标</th><th>单位</th><th>网关</th><th>采集周期</th><th>存储</th></tr>' +
          M.pointMaps.map(function (p) {
            return '<tr><td class="mono">' + p.tag + '</td><td>' + p.device + '</td><td>' + p.item + '</td><td>' + p.unit + '</td><td class="mono tiny">' + p.gw + '</td><td>' + p.cycle + '</td><td class="tiny">' + p.store + '</td></tr>';
          }).join('') + '</table>'
        : (function () {
            var g = M.gateways.find(function (x) { return x.id === P.p20.gw; });
            return '<div class="detail-grid mt8">' +
              '<span class="k">协议</span><span>' + g.proto + '</span>' +
              '<span class="k">地址</span><span class="mono">' + g.addr + '</span>' +
              '<span class="k">状态</span><span>' + statusBadge(g.status) + ' · 测点 ' + g.points + ' 个</span>' +
              '<span class="k">说明</span><span>' + g.desc + '</span></div>' +
              '<table class="tbl mt12"><tr><th>测点 Tag</th><th>设备</th><th>指标</th><th>单位</th><th>周期</th><th>存储</th></tr>' +
              M.pointMaps.filter(function (p) { return p.gw === g.id; }).map(function (p) {
                return '<tr><td class="mono">' + p.tag + '</td><td>' + p.device + '</td><td>' + p.item + '</td><td>' + p.unit + '</td><td>' + p.cycle + '</td><td class="tiny">' + p.store + '</td></tr>';
              }).join('') + '</table>' +
              '<div class="tiny mt12">◆ 时序库：设备测点长期存储，趋势查询 ≤2s 响应；边缘节点断网时本地环形缓存 72h，恢复后断点续传。</div>';
          })()) + '</div>' +
    '</div>' +
    '<div class="card mt16"><h3>井下终端状态</h3><div class="grid4 mt8">' +
      [{ n: '井下防爆 PAD ×12', s: '在线 10 · 离线 2', c: 'warn' }, { n: '边缘缓存节点', s: '在线 · 缓存 0 条待同步', c: 'ok' }, { n: '调度大屏信号', s: '正常（双机热备）', c: 'ok' }, { n: '视频 AI 接入', s: '12 路 · 正常', c: 'ok' }].map(function (t) {
        return '<div class="card" style="box-shadow:none;border:1px solid var(--line)"><div class="strong">' + t.n + '</div><div class="tiny mt8"><span class="dot ' + t.c + '"></span> ' + t.s + '</div></div>';
      }).join('') + '</div></div>';
  }, init: function () {}, setGw: function (g) { P.p20.gw = g; route(); } };
})(window.PAGES);
