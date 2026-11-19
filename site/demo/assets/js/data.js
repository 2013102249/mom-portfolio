/* ============================================================
 * 恒达智控 · 中型煤矿智能化 MOM 平台 —— 统一模拟数据模型
 * 全端共用：PC 后台 / 调度大屏 / 井下 PAD / 移动 APP
 * 数据口径：年产能 150 万吨中型井工矿（PRD 适用区间 30~300 万吨）
 * ============================================================ */
window.MOM = (function () {
  'use strict';

  function rnd(min, max, fixed) {
    var v = Math.random() * (max - min) + min;
    return fixed === undefined ? Math.round(v) : +v.toFixed(fixed);
  }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function pad2(n) { return n < 10 ? '0' + n : '' + n; }
  function fmtDate(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function fmtDT(d) { return fmtDate(d) + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()); }

  var NOW = new Date();

  /* ---------- 矿井主数据 ---------- */
  var mine = {
    name: '金沙河煤业 2 号井（示范矿）',
    shortName: '金沙河煤矿',
    capacityWanTon: 150,
    owner: '恒达智控智能化示范项目',
    level: '中级智能化示范矿井（验收等级 Ⅱ 类中档）'
  };

  /* ---------- 工作面 ---------- */
  var workfaces = [
    { id: 'WF-1304', name: '1304 综采工作面', type: '综采', team: '综采一班', status: '生产中',
      length: 220, advanceDone: 682, advanceTotal: 1450, planMonth: 15.0, doneMonth: 11.62,
      machine: 'MG-650/1720 滚筒采煤机', risk: '正常', lastStopHours: 1.5 },
    { id: 'WF-1306', name: '1306 综采工作面', type: '综采（准备）', team: '综采二班', status: '安装调试',
      length: 210, advanceDone: 0, advanceTotal: 1380, planMonth: 0, doneMonth: 0,
      machine: 'MG-650/1720 滚筒采煤机', risk: '正常', lastStopHours: 0 },
    { id: 'WF-3302', name: '3302 掘进工作面', type: '掘进', team: '掘进一班', status: '生产中',
      length: 0, advanceDone: 862, advanceTotal: 2100, planMonth: 0.24, doneMonth: 0.19,
      machine: 'EBZ-200 掘进机', risk: '预警（顶板）', lastStopHours: 0.4 },
    { id: 'WF-3304', name: '3304 掘进工作面', type: '掘进', team: '掘进二班', status: '生产中',
      length: 0, advanceDone: 315, advanceTotal: 1880, planMonth: 0.22, doneMonth: 0.17,
      machine: 'EBZ-160 掘进机', risk: '正常', lastStopHours: 0.2 }
  ];

  /* ---------- 班组 / 角色 / 人员 ---------- */
  var teams = [
    { id: 'T1', name: '综采一班', leader: '王建军', members: 38, face: 'WF-1304' },
    { id: 'T2', name: '综采二班', leader: '刘卫东', members: 36, face: 'WF-1306' },
    { id: 'T3', name: '掘进一班', leader: '赵永强', members: 26, face: 'WF-3302' },
    { id: 'T4', name: '掘进二班', leader: '孙志远', members: 24, face: 'WF-3304' },
    { id: 'T5', name: '机电班', leader: '李国锋', members: 18, face: '全矿' },
    { id: 'T6', name: '通防班', leader: '周建国', members: 15, face: '全矿' }
  ];
  var roles = [
    { id: 'R1', name: '矿总调度员', user: '陈调度', home: '工作台' },
    { id: 'R2', name: '综采队长', user: '王建军', home: '工作台' },
    { id: 'R3', name: '机电工程师', user: '李国锋', home: '设备台账' },
    { id: 'R4', name: '安全科长', user: '马安平', home: '告警中心' },
    { id: 'R5', name: '物资管理员', user: '吴丽', home: '物资库存' },
    { id: 'R6', name: '煤质化验员', user: '郑小燕', home: '煤质管理' },
    { id: 'R7', name: '矿领导', user: '高矿长', home: '调度大屏' },
    { id: 'R8', name: '恒达实施工程师', user: '恒达·实施', home: '点位组态' }
  ];
  var personnel = [
    { id: 'U1001', name: '王建军', team: '综采一班', job: '队长', cert: '特种作业·采煤机司机', certExpire: '2027-03', underground: true, pos: '1304 工作面' },
    { id: 'U1002', name: '刘志刚', team: '综采一班', job: '支架工', cert: '液压支架工', certExpire: '2026-11', underground: true, pos: '1304 工作面' },
    { id: 'U1003', name: '张海涛', team: '综采一班', job: '采煤机司机', cert: '特种作业·采煤机司机', certExpire: '2027-01', underground: true, pos: '1304 工作面' },
    { id: 'U1004', name: '赵永强', team: '掘进一班', job: '队长', cert: '特种作业·掘进机司机', certExpire: '2026-12', underground: true, pos: '3302 工作面' },
    { id: 'U1005', name: '钱二虎', team: '掘进一班', job: '锚杆支护工', cert: '锚杆支护工', certExpire: '2026-10', underground: true, pos: '3302 工作面' },
    { id: 'U1006', name: '李国锋', team: '机电班', job: '机电工程师', cert: '特种作业·电钳工', certExpire: '2027-06', underground: true, pos: '中央变电所' },
    { id: 'U1007', name: '马安平', team: '通防班', job: '安全科长', cert: '安全检查工', certExpire: '2027-08', underground: false, pos: '地面调度楼' },
    { id: 'U1008', name: '吴天佑', team: '通防班', job: '瓦检员', cert: '特种作业·瓦斯检查工', certExpire: '2026-09', underground: true, pos: '3302 回风巷' },
    { id: 'U1009', name: '郑小燕', team: '—', job: '煤质化验员', cert: '煤质化验工', certExpire: '2027-05', underground: false, pos: '地面化验室' },
    { id: 'U1010', name: '冯进宝', team: '综采二班', job: '皮带工', cert: '带式输送机操作工', certExpire: '2027-02', underground: true, pos: '3 号皮带巷' },
    { id: 'U1011', name: '吕安', team: '掘进二班', job: '掘进工', cert: '（无特种作业证）', certExpire: '—', underground: false, pos: '井口待入（无证拦截演示）' },
    { id: 'U1012', name: '高矿长', team: '—', job: '矿领导', cert: '安全生产管理人员', certExpire: '2028-01', underground: false, pos: '地面调度楼' }
  ];

  /* ---------- 近 30 天产量 / 进尺 ---------- */
  var prod30 = [];
  (function () {
    var today = new Date(NOW);
    for (var i = 29; i >= 0; i--) {
      var d = new Date(today.getTime() - i * 86400000);
      var plan = 5200, act = plan + rnd(-420, 480), footPlan = 9, footAct = footPlan + rnd(-1.6, 1.4, 1);
      if (i === 4) { act = 3520; footAct = 5.5; }   // 全矿停电检修日
      prod30.push({
        date: fmtDate(d), planTon: plan, actTon: act, planFoot: footPlan, actFoot: footAct,
        shiftA: Math.round(act * 0.38), shiftB: Math.round(act * 0.36), shiftC: Math.round(act * 0.26)
      });
    }
  })();

  /* ---------- 月度采掘计划（ERP 下发） ---------- */
  var plans = [
    { id: 'PL-202610', month: '2026-10', source: 'ERP 下发', face: 'WF-1304', type: '综采回采',
      tonPlan: 150000, footPlan: 0, ver: 'V2.1', status: '已拆解', adjust: '因 1306 安装调试，10 月上旬放缓推进' },
    { id: 'PL-202610-2', month: '2026-10', source: 'ERP 下发', face: 'WF-3302', type: '掘进',
      tonPlan: 0, footPlan: 280, ver: 'V1.3', status: '已拆解', adjust: '顶板预警段临时降速至 6m/天' },
    { id: 'PL-202610-3', month: '2026-10', source: 'ERP 下发', face: 'WF-3304', type: '掘进',
      tonPlan: 0, footPlan: 260, ver: 'V1.1', status: '已拆解', adjust: '—' },
    { id: 'PL-202611', month: '2026-11', source: 'ERP 下发', face: 'WF-1304', type: '综采回采',
      tonPlan: 155000, footPlan: 0, ver: 'V1.0', status: '待拆解', adjust: '—' },
    { id: 'PL-202611-2', month: '2026-11', source: 'ERP 下发', face: 'WF-1306', type: '综采回采（初采）',
      tonPlan: 60000, footPlan: 0, ver: 'V1.0', status: '待拆解', adjust: '11 月 1306 完成安装后初采' }
  ];

  /* ---------- 生产工单 ---------- */
  var workOrders = [
    { id: 'WO-1026-001', face: 'WF-1304', type: '综采回采', shift: '早班 8:00-16:00', team: '综采一班', status: '报工完成', planTon: 2100, actTon: 2186, planFoot: 0, actFoot: 0, start: '08:12', end: '15:40', crew: 32, steps: ['割煤 4.2 刀', '移架 126 架', '推溜 126 节', '支护正常'] },
    { id: 'WO-1026-002', face: 'WF-3302', type: '掘进', shift: '早班 8:00-16:00', team: '掘进一班', status: '报工完成', planTon: 0, actTon: 640, planFoot: 8, actFoot: 7.6, start: '08:30', end: '16:05', crew: 22, steps: ['掘进截割 7.6m', '永久支护 5 排', '皮带出煤 640 吨'] },
    { id: 'WO-1026-003', face: 'WF-1304', type: '综采回采', shift: '中班 16:00-24:00', team: '综采一班', status: '执行中', planTon: 2000, actTon: 1140, planFoot: 0, actFoot: 0, start: '16:20', end: '—', crew: 31, steps: ['割煤 2.1 刀（进行中）', '移架 63 架'] },
    { id: 'WO-1026-004', face: 'WF-3302', type: '掘进', shift: '中班 16:00-24:00', team: '掘进一班', status: '执行中', planTon: 0, actTon: 0, planFoot: 6, actFoot: 3.2, start: '16:35', end: '—', crew: 20, steps: ['掘进截割 3.2m（顶板预警段，降速）'] },
    { id: 'WO-1026-005', face: 'WF-1304', type: '检修', shift: '夜班 0:00-8:00', team: '机电班', status: '待开工', planTon: 0, actTon: 0, planFoot: 0, actFoot: 0, start: '—', end: '—', crew: 9, steps: ['泵站例行保养', '皮带托辊更换 12 组', '支架测压普查'] },
    { id: 'WO-1026-006', face: 'WF-1306', type: '搬家倒面', shift: '全天', team: '综采二班', status: '执行中', planTon: 0, actTon: 0, planFoot: 0, actFoot: 0, start: '06:00', end: '—', crew: 28, steps: ['支架装车运输 86/120 架', '乳化液泵站安装'] },
    { id: 'WO-1025-018', face: 'WF-1304', type: '综采回采', shift: '早班 8:00-16:00', team: '综采一班', status: '报工完成', planTon: 2100, actTon: 2043, planFoot: 0, actFoot: 0, start: '08:05', end: '15:52', crew: 32, steps: ['割煤 4.0 刀', '移架 124 架'] },
    { id: 'WO-1025-019', face: 'WF-3304', type: '掘进', shift: '早班 8:00-16:00', team: '掘进二班', status: '报工完成', planTon: 0, actTon: 710, planFoot: 8, actFoot: 8.4, start: '08:22', end: '15:48', crew: 19, steps: ['掘进截割 8.4m', '永久支护 6 排'] },
    { id: 'WO-1025-020', face: 'WF-1304', type: '综采回采', shift: '中班 16:00-24:00', team: '综采一班', status: '已取消', planTon: 1800, actTon: 0, planFoot: 0, actFoot: 0, start: '—', end: '—', crew: 0, steps: ['因 45# 支架故障停机，取消'] }
  ];

  /* ---------- 采掘接续 ---------- */
  var succession = [
    { face: 'WF-1304', current: '回采中', remainDays: 96, next: 'WF-1306', ready: '安装中（86/120 架）', gap: 12, level: '预警', note: '1306 按当前安装进度，接续窗口仅余 12 天裕量' },
    { face: 'WF-3302', current: '掘进中', remainDays: 174, next: '3306 回风巷', ready: '设计已批复', gap: 41, level: '正常', note: '—' },
    { face: 'WF-3304', current: '掘进中', remainDays: 208, next: '3306 运输巷', ready: '设计中', gap: 55, level: '正常', note: '—' }
  ];

  /* ---------- 环境监测实时值与阈值 ---------- */
  var env = [
    { spot: '1304 回风隅角', ch4: 0.42, co: 6, wind: 1.8, temp: 24.5, level: '正常' },
    { spot: '1304 上隅角', ch4: 0.68, co: 9, wind: 2.1, temp: 25.0, level: '正常' },
    { spot: '3302 掘进面', ch4: 0.31, co: 4, wind: 0.9, temp: 23.2, level: '正常' },
    { spot: '3302 回风巷', ch4: 0.91, co: 12, wind: 1.4, temp: 24.1, level: '紧急' },
    { spot: '3304 掘进面', ch4: 0.28, co: 3, wind: 1.0, temp: 22.8, level: '正常' },
    { spot: '总回风巷', ch4: 0.35, co: 8, wind: 6.2, temp: 23.0, level: '正常' },
    { spot: '3 号皮带巷机头', ch4: 0.22, co: 24, wind: 2.6, temp: 27.4, level: '预警' },
    { spot: '中央水泵房', ch4: 0.12, co: 2, wind: 0.6, temp: 21.5, level: '正常' }
  ];
  var envThreshold = { ch4Warn: 0.75, ch4Crit: 0.90, coWarn: 24, coCrit: 50 };

  /* ---------- 告警 ---------- */
  var alarms = [
    { id: 'AL-98412', time: '11:02:31', level: '紧急', type: '瓦斯', spot: '3302 回风巷 T2 传感器', detail: 'CH4 浓度 0.91% 超紧急阈值（0.90%）', source: '安全监控系统', status: '处置中', action: '已联动闭锁指令', rule: 'CH4 ≥ 0.90% → 紧急' },
    { id: 'AL-98411', time: '10:47:18', level: '预警', type: '设备', spot: '1304 工作面 45# 支架', detail: '初撑力 22.4MPa，连续 3 循环低于预警值 24MPa', source: '电液控', status: '已派单', action: '生成维修工单 EM-2286', rule: '初撑力 < 24MPa 持续 3 循环 → 预警' },
    { id: 'AL-98410', time: '10:31:55', level: '预警', type: 'CO', spot: '3 号皮带巷机头', detail: 'CO 浓度 24ppm 达预警阈值，疑似托辊摩擦', source: '安全监控系统', status: '处置中', action: '通知机电班核查', rule: 'CO ≥ 24ppm → 预警' },
    { id: 'AL-98409', time: '10:12:40', level: '提示', type: '人员', spot: '3302 工作面', detail: '当班限员 26 人，当前 25 人（正常）', source: '人员定位', status: '已闭环', action: '—', rule: '限员比对 → 提示' },
    { id: 'AL-98408', time: '09:58:02', level: '预警', type: '设备', spot: '智能供液 1# 泵站', detail: '出口压力波动 ±2.8MPa，疑似蓄能器氮压不足', source: '智能供液', status: '已派单', action: '生成维修工单 EM-2285', rule: '压力波动 > ±2.5MPa 持续 5min → 预警' },
    { id: 'AL-98407', time: '09:41:33', level: '提示', type: '生产', spot: '1304 工作面', detail: '采煤机割煤速度 5.8m/min，超出建议区间上限', source: '电液控', status: '已闭环', action: '调度语音提醒', rule: '割煤速度 > 5.5m/min → 提示' },
    { id: 'AL-98406', time: '09:05:19', level: '紧急', type: '人员', spot: '3304 掘进面', detail: '瓦检员证书 2026-09-30 已过期，入井申请被拦截', source: '资质联动', status: '已闭环', action: '井口闸机拒绝放行，通知安培科', rule: '证书过期 → 禁止入井' },
    { id: 'AL-98405', time: '08:47:51', level: '提示', type: '环境', spot: '中央水泵房', detail: '水位 2.6m，接近季节性高位', source: '排水集控', status: '已闭环', action: '加密监测', rule: '水位 > 2.5m → 提示' },
    { id: 'AL-98404', time: '08:22:09', level: '预警', type: '生产', spot: '1304 工作面', detail: '昨日产量 3520 吨，为计划的 67%，触发产量偏差预警', source: 'MOM 运算', status: '已闭环', action: '班前会通报', rule: '日产量 < 计划 70% → 预警' },
    { id: 'AL-98403', time: '07:58:44', level: '提示', type: '设备', spot: '2 号皮带机', detail: '电机绕组温度 68℃，趋于上行', source: '皮带集控', status: '已闭环', action: '持续观察', rule: '电机温度 > 65℃ → 提示' }
  ];

  /* ---------- 告警规则 ---------- */
  var alarmRules = [
    { id: 'AR-01', name: '回风瓦斯超限（紧急闭锁）', metric: 'CH4 浓度', cond: '≥ 0.90%', level: '紧急', action: '闭锁联动：调用恒达集控接口下发工作面闭锁 + 通知调度/矿领导', enabled: true, fired: 2 },
    { id: 'AR-02', name: '瓦斯预警', metric: 'CH4 浓度', cond: '≥ 0.75% 且 < 0.90%', level: '预警', action: '大屏弹窗 + 通知通防班', enabled: true, fired: 14 },
    { id: 'AR-03', name: '皮带巷 CO 预警', metric: 'CO 浓度', cond: '≥ 24ppm', level: '预警', action: '通知机电班 + APP 推送', enabled: true, fired: 6 },
    { id: 'AR-04', name: '支架初撑力低', metric: '支架初撑力', cond: '< 24MPa 连续 3 循环', level: '预警', action: '自动生成维修工单', enabled: true, fired: 9 },
    { id: 'AR-05', name: '泵站压力波动', metric: '供液压力波动', cond: '> ±2.5MPa 持续 5min', level: '预警', action: '自动生成维修工单', enabled: true, fired: 3 },
    { id: 'AR-06', name: '工作面限员', metric: '区域人数', cond: '> 核定人数', level: '紧急', action: '闭锁联动（掘进面停机）+ 通知调度', enabled: true, fired: 0 },
    { id: 'AR-07', name: '人员超时滞留', metric: '连续在井时长', cond: '> 12h', level: '预警', action: '通知调度核实', enabled: true, fired: 1 },
    { id: 'AR-08', name: '特种作业证书过期', metric: '证书有效期', cond: '过期后申请入井', level: '提示', action: '井口闸机拦截 + 通知安培科', enabled: true, fired: 4 },
    { id: 'AR-09', name: '日产量偏差', metric: '日实际/日计划', cond: '< 70%', level: '预警', action: 'APP 推送生产矿长', enabled: false, fired: 2 },
    { id: 'AR-10', name: '重复告警抑制', metric: '同源告警', cond: '10min 内同点位同类型', level: '—', action: '根因合并，仅推送 1 次', enabled: true, fired: 0 }
  ];

  /* ---------- 隐患 ---------- */
  var hazards = [
    { id: 'HZ-1026-03', spot: '3302 回风巷 58m 处', type: '顶板', level: '重大', reportBy: '钱二虎', reportTime: '10-08 09:35', status: '整改中', assign: '掘进一班·赵永强', check: '待复查', due: '10-10', desc: '锚索托盘空贴，预紧力不足，顶板离层仪读数上升' },
    { id: 'HZ-1026-02', spot: '3 号皮带巷机头段', type: '机电', level: '一般', reportBy: '冯进宝', reportTime: '10-08 07:50', status: '待复查', assign: '机电班·李国锋', check: '整改完成待复核', due: '10-09', desc: '机头段 6 组托辊卡滞异响，伴生 CO 上升' },
    { id: 'HZ-1026-01', spot: '1304 工作面 45# 支架', type: '液压', level: '一般', reportBy: '刘志刚', reportTime: '10-07 14:20', status: '已销号', assign: '机电班·王栓柱', check: '复查合格 10-08', due: '10-08', desc: '安全阀泄漏，初撑力持续偏低' },
    { id: 'HZ-1025-12', spot: '井口入井大厅', type: '其他', level: '一般', reportBy: '马安平', reportTime: '10-05 16:02', status: '已销号', assign: '机电班', check: '复查合格 10-06', due: '10-06', desc: '自救器发放台账与实际数量差 2 台' },
    { id: 'HZ-1025-11', spot: '3304 掘进面后路', type: '一通三防', level: '一般', reportBy: '周建国', reportTime: '10-04 11:40', status: '已销号', assign: '通防班', check: '复查合格 10-05', due: '10-05', desc: '风筒距迎头超距 2m，有效射程不足' },
    { id: 'HZ-1025-10', spot: '1304 运输巷低洼点', type: '水害', level: '一般', reportBy: '李国锋', reportTime: '10-03 08:15', status: '整改中', assign: '机电班', check: '—', due: '10-11', desc: '排水泵备用泵故障，排水能力不足' }
  ];

  /* ---------- 入井人员 ---------- */
  var underground = {
    total: 86, limit: 120,
    byArea: [
      { area: '1304 工作面', count: 32, limit: 40 },
      { area: '3302 工作面', count: 25, limit: 26 },
      { area: '3304 工作面', count: 19, limit: 24 },
      { area: '1306 安装面', count: 6, limit: 12 },
      { area: '运输大巷/皮带巷', count: 4, limit: 18 }
    ],
    fenceEvents: 1, stayOver12h: 1, certBlocked: 1
  };

  return {
    rnd: rnd, pick: pick, pad2: pad2, fmtDate: fmtDate, fmtDT: fmtDT,
    NOW: NOW, mine: mine, workfaces: workfaces, teams: teams, roles: roles,
    personnel: personnel, prod30: prod30, plans: plans, workOrders: workOrders,
    succession: succession, env: env, envThreshold: envThreshold, alarms: alarms,
    alarmRules: alarmRules, hazards: hazards, underground: underground
  };
})();
