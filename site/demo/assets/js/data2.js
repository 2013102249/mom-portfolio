/* ============================================================
 * MOM 模拟数据 第二部分：设备 EAM / 物资 WMS / 煤质 QMS / OEE / 报表 / 组态
 * 依赖 data.js（先加载），扩展 window.MOM
 * ============================================================ */
(function (M) {
  'use strict';
  if (!M) return;
  var rnd = M.rnd;

  /* ---------- 设备台账 ---------- */
  M.devices = [
    { id: 'EQ-ZJ-1304', name: '液压支架（成套）', model: 'ZY12000/28/60D', face: 'WF-1304', vendor: '恒达智控', count: 120, status: '运行', health: 92, install: '2024-06', runHours: 9860, mtbf: 412, parts: '安全阀 FAD200/40、立柱密封件、推移油缸' },
    { id: 'EQ-CMJ-1304', name: '滚筒采煤机', model: 'MG-650/1720-WD', face: 'WF-1304', vendor: '恒达智控（配套）', count: 1, status: '运行', health: 88, install: '2024-06', runHours: 8720, mtbf: 356, parts: '截齿、摇臂齿轮油、喷雾嘴' },
    { id: 'EQ-BP-1304', name: '智能供液泵站', model: 'BPW-630/35X4', face: 'WF-1304', vendor: '恒达智控', count: 2, status: '1# 波动预警', health: 79, install: '2024-06', runHours: 9310, mtbf: 288, parts: '蓄能器胶囊、柱塞密封、乳化液滤芯' },
    { id: 'EQ-GB-1304', name: '刮板输送机', model: 'SGZ-1000/1400', face: 'WF-1304', vendor: '恒达智控（配套）', count: 1, status: '运行', health: 85, install: '2024-06', runHours: 9860, mtbf: 330, parts: '刮板、链条、连接环' },
    { id: 'EQ-DSJ-3', name: '带式输送机', model: 'DSJ-140/200/2×400', face: '3 号皮带巷', vendor: '第三方（集控接入）', count: 3, status: '运行', health: 81, install: '2023-11', runHours: 14200, mtbf: 245, parts: '托辊、缓冲床、输送带接头' },
    { id: 'EQ-JJ-3302', name: '掘进机', model: 'EBZ-200', face: 'WF-3302', vendor: '第三方（矿鸿接入）', count: 1, status: '运行', health: 86, install: '2023-03', runHours: 6980, mtbf: 302, parts: '截齿、履带板、油缸密封' },
    { id: 'EQ-ZZ-1304', name: '转载机', model: 'SZZ-1000/400', face: 'WF-1304', vendor: '恒达智控（配套）', count: 1, status: '运行', health: 90, install: '2024-06', runHours: 9860, mtbf: 380, parts: '刮板链条、机尾滚筒' },
    { id: 'EQ-YP-1306', name: '乳化液泵（1306 新装）', model: 'BRW-400/31.5', face: 'WF-1306', vendor: '恒达智控', count: 2, status: '调试', health: 100, install: '2026-10', runHours: 120, mtbf: '—', parts: '柱塞密封、吸排液阀' }
  ];

  /* ---------- 1304 面支架明细 120 台 ---------- */
  M.supports = (function () {
    var arr = [];
    for (var i = 1; i <= 120; i++) {
      var id = i < 10 ? '00' + i : i < 100 ? '0' + i : '' + i;
      var h = rnd(85, 99), st = '正常';
      if (i === 45) { h = 71; st = '故障'; }
      else if (i === 78 || i === 103) { h = 76; st = '预警'; }
      arr.push({
        no: 'ZJ-1304-' + id, health: h, status: st, cycles: rnd(8200, 9600),
        press: i === 45 ? 22.4 : rnd(26.5, 33.5, 1),
        leak: i === 45 ? 3.2 : rnd(0, 0.8, 1)
      });
    }
    return arr;
  })();

  /* ---------- 点巡检 ---------- */
  M.inspections = [
    { id: 'IP-1026-01', plan: '综采面支架测压周巡', face: 'WF-1304', cycle: '每周三', owner: '机电班·刘志刚', due: '10-09', status: '待执行', points: 24, done: 0, abnormal: 0 },
    { id: 'IP-1026-02', plan: '泵站日点检', face: 'WF-1304', cycle: '每日', owner: '机电班·王栓柱', due: '10-09', status: '执行中', points: 12, done: 7, abnormal: 1 },
    { id: 'IP-1026-03', plan: '皮带机全线日巡', face: '3 号皮带巷', cycle: '每日', owner: '综采二班·冯进宝', due: '10-09', status: '已完成', points: 30, done: 30, abnormal: 2 },
    { id: 'IP-1026-04', plan: '掘进机班前点检', face: 'WF-3302', cycle: '每班', owner: '掘进一班·赵永强', due: '10-09', status: '已完成', points: 10, done: 10, abnormal: 0 },
    { id: 'IP-1025-09', plan: '乳化液浓度抽检', face: 'WF-1304', cycle: '每两天', owner: '通防班', due: '10-08', status: '已完成', points: 4, done: 4, abnormal: 0 }
  ];

  /* ---------- 维修工单 ---------- */
  M.repairs = [
    { id: 'EM-2286', device: '45# 液压支架（ZY12000）', fault: '安全阀泄漏导致初撑力 22.4MPa', level: '高', source: '告警联动 AL-98411', status: '维修中', by: '机电班·王栓柱', planH: 4, parts: '安全阀 FAD200/40 ×1', start: '10:55', report: '—' },
    { id: 'EM-2285', device: '智能供液 1# 泵站', fault: '出口压力波动 ±2.8MPa，疑似蓄能器氮压不足', level: '高', source: '告警联动 AL-98408', status: '待备件', by: '机电班·李国锋', planH: 3, parts: '蓄能器胶囊 NXQ-40 ×1（库存不足→采购申请）', start: '—', report: '—' },
    { id: 'EM-2284', device: '3 号皮带机头托辊', fault: '机头段托辊卡滞异响，伴生 CO 上升', level: '中', source: '隐患联动 HZ-1026-02', status: '已闭环', by: '机电班·胡建', planH: 2.5, parts: '托辊 Φ108×159 ×6', start: '昨天 07:10', report: '08:55 更换完成验收' },
    { id: 'EM-2283', device: '2 号皮带机', fault: '电机绕组温度偏高（68℃）', level: '中', source: '巡检上报', status: '已闭环', by: '机电班·胡建', planH: 2, parts: '—（清理散热风道）', start: '10-08 14:00', report: '温度回落至 52℃' },
    { id: 'EM-2282', device: '掘进机（EBZ-200）', fault: '截齿磨损超标，截割效率下降', level: '低', source: '巡检上报', status: '已闭环', by: '掘进一班·钱二虎', planH: 1.5, parts: '截齿 U95 ×12', start: '10-07 13:30', report: '更换后截割电流恢复正常' }
  ];

  /* ---------- 物资 WMS ---------- */
  M.materials = [
    { id: 'M-01', name: 'L-HM68 抗磨液压油', cat: '油脂', spec: '170kg/桶', stock: 26, unit: '桶', min: 30, expiry: '2027-08', store: '井下 1# 库房 A-01', warn: '低库存' },
    { id: 'M-02', name: '乳化油 M-10', cat: '油脂', spec: '200kg/桶', stock: 44, unit: '桶', min: 30, expiry: '2027-03', store: '井下 1# 库房 A-02', warn: '—' },
    { id: 'M-03', name: '安全阀 FAD200/40', cat: '备件', spec: '40MPa', stock: 6, unit: '件', min: 8, expiry: '—', store: '井下 1# 库房 B-03', warn: '低库存' },
    { id: 'M-04', name: '蓄能器胶囊 NXQ-40', cat: '备件', spec: '40L', stock: 1, unit: '件', min: 3, expiry: '—', store: '地面库·转井下', warn: '低库存（EM-2285 待件）' },
    { id: 'M-05', name: 'O 形密封圈', cat: '密封件', spec: 'Φ90×3.5（氟橡胶）', stock: 320, unit: '件', min: 150, expiry: '2028-01', store: '井下 1# 库房 C-01', warn: '—' },
    { id: 'M-06', name: '左旋无纵筋锚杆', cat: '支护材料', spec: 'M22×2400', stock: 1450, unit: '套', min: 800, expiry: '—', store: '3302 移动料场', warn: '—' },
    { id: 'M-07', name: '锚索', cat: '支护材料', spec: 'Φ17.8×6300', stock: 260, unit: '套', min: 200, expiry: '—', store: '3302 移动料场', warn: '—' },
    { id: 'M-08', name: 'W 钢带', cat: '支护材料', spec: '280×3×3600', stock: 85, unit: '根', min: 100, expiry: '—', store: '3302 移动料场', warn: '低库存' },
    { id: 'M-09', name: '刮板', cat: '备件', spec: 'SGZ-1000 配件', stock: 48, unit: '件', min: 30, expiry: '—', store: '井下 2# 库房 B-01', warn: '—' },
    { id: 'M-10', name: '托辊', cat: '备件', spec: 'Φ108×159', stock: 96, unit: '件', min: 60, expiry: '—', store: '井下 2# 库房 B-02', warn: '—' },
    { id: 'M-11', name: '截齿 U95', cat: '备件', spec: 'EBZ 配套', stock: 130, unit: '件', min: 80, expiry: '—', store: '井下 2# 库房 B-04', warn: '—' },
    { id: 'M-12', name: '风筒', cat: '一通三防', spec: 'Φ800×10m', stock: 22, unit: '节', min: 15, expiry: '—', store: '井下 2# 库房 C-02', warn: '—' },
    { id: 'M-13', name: '阻燃输送带接头料', cat: '备件', spec: '1400S', stock: 4, unit: '套', min: 5, expiry: '—', store: '井下 2# 库房 B-05', warn: '低库存' },
    { id: 'M-14', name: '注液枪', cat: '工具', spec: 'DWF-2', stock: 14, unit: '把', min: 10, expiry: '—', store: '井下 1# 库房 D-01', warn: '—' },
    { id: 'M-15', name: '齿轮油 320', cat: '油脂', spec: '170kg/桶', stock: 9, unit: '桶', min: 8, expiry: '2026-11', store: '井下 1# 库房 A-03', warn: '效期预警' }
  ];
  M.reflows = [
    { id: 'LL-1026-08', type: '领料', applyBy: '机电班·王栓柱', link: 'EM-2286', item: '安全阀 FAD200/40 ×1', status: '已批准', time: '10:58' },
    { id: 'LL-1026-07', type: '领料', applyBy: '机电班·李国锋', link: 'EM-2285', item: '蓄能器胶囊 NXQ-40 ×1', status: '驳回（库存不足）', time: '10:50' },
    { id: 'LL-1026-06', type: '领料', applyBy: '掘进一班·赵永强', link: 'WO-1026-004', item: '锚杆 M22×2400 ×36、锚索 ×8', status: '已批准', time: '08:15' },
    { id: 'LL-1026-05', type: '退料', applyBy: '综采二班', link: '搬家倒面', item: '注液枪 ×1（完好退回）', status: '已入库', time: '昨天 17:40' },
    { id: 'LL-1026-04', type: '领料', applyBy: '机电班·胡建', link: 'EM-2284', item: '托辊 Φ108×159 ×6', status: '已批准', time: '昨天 07:05' },
    { id: 'LL-1025-21', type: '领料', applyBy: '掘进二班', link: 'WO-1025-019', item: '锚杆 ×48、W 钢带 ×12', status: '已批准', time: '10-05 08:20' }
  ];

  /* ---------- 煤质 QMS ---------- */
  M.coalQ30 = (function () {
    var arr = [], today = new Date(M.NOW);
    for (var i = 29; i >= 0; i--) {
      var d = new Date(today.getTime() - i * 86400000);
      arr.push({
        date: M.fmtDate(d),
        ad: +(18 + Math.sin(i / 5) * 2.2 + rnd(-0.8, 0.8, 1)).toFixed(1),
        std: +(0.85 + Math.sin(i / 7) * 0.12 + rnd(-0.05, 0.05, 2)).toFixed(2),
        qnet: Math.round(5100 + Math.sin(i / 6) * -180 + rnd(-90, 90)),
        mad: +(7 + Math.cos(i / 8) * 1.1 + rnd(-0.4, 0.4, 1)).toFixed(1)
      });
    }
    return arr;
  })();
  M.coalSamples = [
    { id: 'SP-1026-06', point: '1304 皮带采样头', type: '生产样', time: '10:30', sampler: '郑小燕', status: '已化验' },
    { id: 'SP-1026-05', point: '3302 出煤皮带', type: '生产样', time: '09:40', sampler: '郑小燕', status: '化验中' },
    { id: 'SP-1026-04', point: '1304 工作面人工样', type: '工作面样', time: '08:20', sampler: '郑小燕', status: '已化验' },
    { id: 'SP-1026-03', point: '地销装车点', type: '商检样', time: '昨天 15:00', sampler: '外委', status: '已上报' }
  ];
  M.coalCriteria = { adMax: 24, stdMax: 1.0, qnetMin: 4800, madMax: 9 };

  /* ---------- OEE / 健康 ---------- */
  M.oee = {
    face: 'WF-1304', availability: 91.2, performance: 84.6, quality: 98.2,
    oee: 75.8, mttr: 3.2, mtbf: 356, stopHoursMonth: 21.6,
    stopReasons: [
      { name: '支架故障', hours: 7.5 },
      { name: '泵站波动', hours: 5.0 },
      { name: '皮带托辊', hours: 4.2 },
      { name: '电气检修', hours: 3.1 },
      { name: '组织等待', hours: 1.8 }
    ]
  };

  /* ---------- 报表模板 ---------- */
  M.reports = [
    { id: 'R1', name: '生产班报', freq: '每班', owner: '调度室', note: '自动生成，替代纸质班报' },
    { id: 'R2', name: '生产日报', freq: '每日 07:30', owner: '调度室', note: '自动生成 + 飞书推送' },
    { id: 'R3', name: '生产月报', freq: '每月 1 日', owner: '生产科', note: '含计划-实际对比' },
    { id: 'R4', name: '采掘接续报表', freq: '每周一', owner: '生产科', note: '含接续裕量预警' },
    { id: 'R5', name: '设备绩效月报', freq: '每月', owner: '机电科', note: 'OEE / MTTR / MTBF' },
    { id: 'R6', name: '安全隐患统计月报', freq: '每月', owner: '安全科', note: '含三违统计' },
    { id: 'R7', name: '告警统计月报', freq: '每月', owner: '调度室', note: '分级/分类统计' },
    { id: 'R8', name: '煤质报表', freq: '每月', owner: '煤质化验室', note: '对外上报版式' },
    { id: 'R9', name: '物资消耗成本月报', freq: '每月', owner: '物资科', note: '按工作面归集' },
    { id: 'R10', name: '智能化验收材料包', freq: '按需', owner: '企管科', note: '标准化报表导出 Excel/PDF' }
  ];

  /* ---------- 主数据维护日志 / 操作审计 ---------- */
  M.auditLogs = [
    { time: '11:02', user: '陈调度（矿总调度员）', action: '告警处置', target: 'AL-98412 下发闭锁指令', ip: '10.10.1.9', result: '成功' },
    { time: '10:47', user: '系统（规则 AR-04）', action: '自动派单', target: '生成 EM-2286', ip: '—', result: '成功' },
    { time: '10:31', user: '马安平（安全科长）', action: '隐患分派', target: 'HZ-1026-03 → 掘进一班', ip: '10.10.3.21', result: '成功' },
    { time: '10:12', user: '吴丽（物资管理员）', action: '领料审批', target: 'LL-1026-07 驳回', ip: '10.10.5.12', result: '成功' },
    { time: '09:05', user: '系统（规则 AR-08）', action: '入井拦截', target: 'U1008 证书过期', ip: '—', result: '拦截成功' },
    { time: '08:22', user: '高矿长（矿领导）', action: '登录', target: '移动 APP', ip: '10.10.9.3', result: '成功' },
    { time: '08:01', user: '恒达·实施（实施工程师）', action: '测点映射变更', target: 'EQ-BP-1304 出口压力量程 0~40→0~45MPa', ip: '10.10.7.88', result: '待复核' }
  ];

  /* ---------- 协议网关 / 测点组态 ---------- */
  M.gateways = [
    { id: 'GW-01', name: '恒达综采电液控网关', proto: '恒达私有协议', addr: '10.20.1.10', status: '在线', points: 2680, desc: '支架姿态/压力/动作、采煤机位置' },
    { id: 'GW-02', name: '智能供液网关', proto: 'Modbus-TCP', addr: '10.20.1.12', status: '在线', points: 320, desc: '泵站压力/流量/油温/液位' },
    { id: 'GW-03', name: '皮带集控网关', proto: 'Modbus-TCP', addr: '10.20.1.15', status: '在线', points: 540, desc: '皮带启停/称重产量/电机温度' },
    { id: 'GW-04', name: '矿鸿边缘网关（3302）', proto: '矿鸿 Matrikort / MQTT', addr: '10.20.2.21', status: '在线', points: 410, desc: '掘进机、局扇、传感器' },
    { id: 'GW-05', name: '安全监控接入网关', proto: 'MQTT（第三方 KJ 系列）', addr: '10.20.3.8', status: '在线', points: 760, desc: '瓦斯/CO/风速/温度/水位' },
    { id: 'GW-06', name: '人员定位接入网关', proto: 'TCP 透传（UWB 定位）', addr: '10.20.3.11', status: '在线', points: 96, desc: '分站级定位/电子围栏' }
  ];
  M.pointMaps = [
    { tag: 'HYD1304.PRESS.045', device: '45# 支架', item: '初撑力', unit: 'MPa', gw: 'GW-01', cycle: '2s', store: '时序库·180 天' },
    { tag: 'PUMP1304.OUT.PRESS', device: '1# 供液泵站', item: '出口压力', unit: 'MPa', gw: 'GW-02', cycle: '2s', store: '时序库·180 天' },
    { tag: 'PUMP1304.OUT.FLOW', device: '1# 供液泵站', item: '出口流量', unit: 'L/min', gw: 'GW-02', cycle: '2s', store: '时序库·180 天' },
    { tag: 'BELT3.WEIGHT.RATE', device: '3 号皮带', item: '瞬时煤量', unit: 't/h', gw: 'GW-03', cycle: '5s', store: '时序库·365 天' },
    { tag: 'KJ.CH4.3302.T2', device: '3302 回风巷 T2', item: 'CH4 浓度', unit: '%', gw: 'GW-05', cycle: '1s', store: '时序库·730 天' },
    { tag: 'POS.AREA.3302.CNT', device: '3302 区域', item: '区域人数', unit: '人', gw: 'GW-06', cycle: '3s', store: '时序库·365 天' }
  ];

  /* ---------- 数字孪生（大屏用） ---------- */
  M.twin = {
    face: 'WF-1304', total: 120,
    shearerPos: 18,          // 采煤机所在支架序号
    shearerDir: 1,           // 方向
    pumpPress: 31.4,         // MPa
    pumpFlow: 520,           // L/min
    emulsion: 2.6,           // 乳化液浓度 %
    oilTemp: 52,             // 油温 ℃
    statusList: (function () {
      var a = [];
      for (var i = 0; i < 120; i++) {
        var s = 'ok';
        if (i === 44) s = 'fault';
        else if (i === 77 || i === 102) s = 'warn';
        a.push(s);
      }
      return a;
    })()
  };

  /* ---------- 事件回放（大屏 D03） ---------- */
  M.replayEvents = [
    { time: '10:47:18', level: '预警', text: '45# 支架初撑力连续 3 循环偏低', tag: '设备' },
    { time: '10:31:55', level: '预警', text: '3 号皮带巷机头 CO 达 24ppm', tag: '环境' },
    { time: '10:12:40', level: '提示', text: '3302 工作面人数核对（25/26）', tag: '人员' },
    { time: '09:58:02', level: '预警', text: '1# 泵站出口压力波动 ±2.8MPa', tag: '设备' },
    { time: '11:02:31', level: '紧急', text: '3302 回风巷 CH4 0.91% → 下发闭锁', tag: '安全' },
    { time: '11:07:40', level: '处置', text: '调度确认：通风调整后 CH4 回落至 0.62%', tag: '安全' },
    { time: '11:15:05', level: '解除', text: '调度员手动解除 3302 工作面闭锁（留痕 #AUD-77321）', tag: '安全' }
  ];
})(window.MOM);
