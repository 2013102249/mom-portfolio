/* ============================================================
 * 井下防爆 PAD 逻辑：任务 / 报工 / 上报 / 巡检 / 同步 + 断网模拟
 * ============================================================ */
(function () {
  'use strict';
  var M = window.MOM;
  var state = {
    view: 'task',
    online: true,
    cache: 0,
    task: { started: false, steps: [false, false, false, false] },
    report: { photo: false },
    hazard: { type: '', photo: false, voice: false },
    inspect: { checked: [false, false, false], abnormal: '' }
  };

  /* ---------- 时钟 ---------- */
  function tick() {
    var d = new Date();
    document.getElementById('padClock').textContent = M.pad2(d.getHours()) + ':' + M.pad2(d.getMinutes());
    setTimeout(tick, 5000);
  }
  tick();

  /* ---------- 导航 ---------- */
  window.go = function (v) {
    state.view = v;
    document.querySelectorAll('.pn').forEach(function (b) { b.classList.toggle('on', b.dataset.v === v); });
    render();
  };

  function render() {
    var el = document.getElementById('padBody');
    el.innerHTML = VIEWS[state.view]();
    el.scrollTop = 0;
  }
  window.rerender = render;

  /* ---------- 登录 ---------- */
  window.login = function () {
    document.getElementById('v-login').classList.remove('show');
    document.getElementById('padMain').classList.remove('hidden');
    render();
    toast('已进入作业系统 · 今日任务 3 项');
  };

  /* ---------- 断网模拟 ---------- */
  window.toggleNet = function () {
    state.online = !state.online;
    var el = document.getElementById('netState');
    el.classList.toggle('off', !state.online);
    el.innerHTML = state.online ? '🛜 井下环网 · 已连接' : '⚠ 离线模式 · 弱网';
    document.getElementById('cacheState').classList.toggle('hidden', state.online);
    if (state.online && state.cache > 0) {
      toast('网络恢复：正在同步 ' + state.cache + ' 条本地缓存数据…');
      setTimeout(function () {
        state.cache = 0;
        document.getElementById('cacheCnt').textContent = 0;
        toast('同步完成：缓存数据已全部上传 MOM，断点续传成功');
        render();
      }, 1800);
    } else {
      toast(state.online ? '已恢复连接' : '已切换为离线模式：任务与报工数据将本地缓存');
    }
  };
  function cache(n) {
    if (state.online) return;
    state.cache += n;
    document.getElementById('cacheCnt').textContent = state.cache;
  }

  /* ---------- 视图 ---------- */
  var VIEWS = {};

  /* M02 任务 */
  VIEWS.task = function () {
    var w = M.workOrders[2]; /* 中班执行中 */
    var steps = ['割煤（目标 4 刀）', '移架（126 架）', '推溜（126 节）', '清理浮煤 & 文明生产'];
    return '' +
    '<div class="pad-head"><h2>我的任务</h2><span class="tiny">综采一班 · 1304 综采工作面 · 中班</span>' +
      '<span class="right"><button class="pad-btn" style="min-height:44px;padding:0 16px;font-size:15px" onclick="go(\'sync\')">📡 ' + (state.online ? '在线' : '离线 ' + state.cache + ' 条待同步') + '</button></span></div>' +
    '<div class="task-card current">' +
      '<div class="task-top"><span class="t">' + w.face + ' · ' + w.type + '</span><span class="badge-lg badge info">执行中</span></div>' +
      '<div class="task-meta"><span>工单 <b>' + w.id + '</b></span><span>任务量 <b>' + fmtNum(w.planTon) + ' 吨</b></span>' +
        '<span>已报 <b>' + fmtNum(w.actTon) + ' 吨</b></span><span>出勤 <b>' + w.crew + ' 人</b></span></div>' +
      '<div class="task-actions">' +
        '<button class="pad-btn primary" onclick="startWork()">' + (state.task.started ? '已开工 16:20 ✓' : '开工确认') + '</button>' +
        '<button class="pad-btn" onclick="go(\'report\')">完工报工</button></div>' +
    '</div>' +
    '<div style="font-size:17px;font-weight:700;margin:18px 0 10px">工序打卡（逐项）</div>' +
    steps.map(function (s, i) {
      var done = state.task.steps[i];
      return '<div class="step-row"><span class="s">' + (i + 1) + '. ' + s + '</span>' +
        (done ? '<span class="done-ic">✓ 已完成</span>' :
        '<button class="pad-btn primary" style="min-height:48px;padding:0 22px;font-size:16px" onclick="doStep(' + i + ')">打卡</button>') + '</div>';
    }).join('') +
    '<div class="task-card" style="margin-top:16px">' +
      '<div class="task-top"><span class="t">3302 掘进面 · 掘进</span><span class="badge-lg badge warn">顶板预警 · 降速</span></div>' +
      '<div class="task-meta"><span>掘进一班 · 日计划 6m</span><span>当前完成 <b>3.2m</b></span></div>' +
      '<div class="task-actions"><button class="pad-btn" onclick="toast(\'已查看降速作业要求（模拟）\')">作业要求</button></div></div>' +
    '<div class="tiny" style="padding:6px 4px">◆ 弱网环境：任务清单已本地缓存，断网可正常查看与打卡，恢复后自动同步。</div>';
  };
  window.startWork = function () {
    if (state.task.started) return;
    state.task.started = true;
    toast(state.online ? '开工确认已上传 MOM · 16:20' : '开工确认已本地缓存（弱网）');
    cache(1); render();
  };
  window.doStep = function (i) {
    state.task.steps[i] = true;
    cache(1);
    toast(state.online ? '工序打卡成功' : '工序打卡已缓存');
    render();
  };

  /* M03 报工 */
  VIEWS.report = function () {
    return '' +
    '<div class="pad-head"><h2>完工报工</h2><span class="tiny">1304 综采工作面 · 皮带秤自动采集，异常时可人工补录</span></div>' +
    '<div class="pad-field"><label>产量（吨）· 皮带秤自动读取 ' + fmtNum(1140) + '，修正值（选填）</label>' +
      '<input class="inp" id="rTon" type="number" value="1140"></div>' +
    '<div class="pad-field"><label>进尺（m，掘进工单填写）</label><input class="inp" type="number" placeholder="0" disabled></div>' +
    '<div class="pad-field"><label>文字说明</label><textarea class="inp" rows="3" style="font-size:16px">中班生产正常，45# 支架已通知机电班处理。</textarea></div>' +
    '<div class="pad-field"><label>现场照片</label>' +
      '<div class="photo-box ' + (state.report.photo ? 'filled' : '') + '" onclick="takePhoto()">' +
      (state.report.photo ? '📷 照片已拍摄（3 张）· 点击重拍' : '📷 点击拍摄现场照片') + '</div></div>' +
    '<button class="pad-btn primary" style="width:100%" onclick="submitReport()">提交报工</button>' +
    '<div class="tiny" style="margin-top:12px;text-align:center">提交后自动生成班报数据，产量与皮带秤自动核验</div>';
  };
  window.takePhoto = function () {
    state.report.photo = !state.report.photo;
    toast(state.report.photo ? '拍照完成（模拟调取防爆 PAD 相机）' : '已清除照片');
    render();
  };
  window.submitReport = function () {
    cache(1);
    toast(state.online ? '报工提交成功 · 班报已更新' : '报工已本地缓存，网络恢复后自动上传');
    go('task');
  };

  /* M04 隐患上报 */
  VIEWS.hazard = function () {
    var types = ['顶板', '机电', '液压', '一通三防', '水害', '其他'];
    return '' +
    '<div class="pad-head"><h2>隐患 / 故障一键上报</h2><span class="tiny">自动定位：1304 工作面 45# 支架（UWB）</span></div>' +
    '<div class="pad-field"><label>类型（单选）</label><div class="type-grid">' +
      types.map(function (t) {
        return '<div class="type-cell ' + (state.hazard.type === t ? 'on' : '') + '" onclick="pickType(\'' + t + '\')">' + t + '</div>';
      }).join('') + '</div></div>' +
    '<div class="pad-field"><label>拍照 / 语音</label>' +
      '<div class="photo-box ' + (state.hazard.photo ? 'filled' : '') + '" onclick="hzPhoto()">' +
      (state.hazard.photo ? '📷 已拍摄 1 张 · 点击重拍' : '📷 点击拍照（必填）') + '</div>' +
      '<button class="pad-btn ' + (state.hazard.voice ? 'ok' : '') + '" style="width:100%;margin-top:10px" onclick="hzVoice()">' +
      (state.hazard.voice ? '🎙 语音已转文字：「45# 支架安全阀处持续滴水，压力表读数 22MPa」' : '🎙 按住说话（语音转文字）') + '</button></div>' +
    '<button class="pad-btn danger" style="width:100%" onclick="submitHazard()">🚨 立即上报</button>' +
    '<div class="tiny" style="margin-top:12px;text-align:center">重大隐患上报后自动推送安全科与调度，同步生成整改单</div>';
  };
  window.pickType = function (t) { state.hazard.type = t; render(); };
  window.hzPhoto = function () { state.hazard.photo = !state.hazard.photo; render(); };
  window.hzVoice = function () {
    state.hazard.voice = true;
    toast('语音识别完成（模拟）');
    render();
  };
  window.submitHazard = function () {
    if (!state.hazard.type) { toast('请先选择隐患类型'); return; }
    if (!state.hazard.photo) { toast('请先拍摄现场照片'); return; }
    cache(1);
    toast(state.online ? '上报成功 · 已生成隐患单 HZ-1026-04 并推送安全科' : '上报已本地缓存，恢复后自动上传');
    state.hazard = { type: '', photo: false, voice: false };
    render();
  };

  /* M05 巡检 */
  VIEWS.inspect = function () {
    var spots = [
      { n: '1# 泵站 · 出口压力表', d: '标准 31.5±1.5 MPa · 读数 31.4 合格' },
      { n: '乳化液箱 · 液位/浓度', d: '液位 72% 合格 · 浓度 2.6% 合格' },
      { n: '45# 支架 · 安全阀与立柱', d: '发现异常：安全阀泄漏滴水' }
    ];
    return '' +
    '<div class="pad-head"><h2>巡检打卡</h2><span class="tiny">泵站日点检 · 12 点位 · 已巡 7</span></div>' +
    spots.map(function (s, i) {
      var done = state.inspect.checked[i];
      return '<div class="inspect-row"><span class="nfc">🏷</span><div class="info"><div class="t">' + (i + 8) + '. ' + s.n + '</div><div class="d">' + s.d + '</div></div>' +
        (done ? '<span class="done-ic" style="color:var(--ok);font-size:18px">✓</span>' :
        '<button class="pad-btn primary" style="min-height:48px;padding:0 18px;font-size:15px" onclick="nfcCheck(' + i + ')">NFC 打卡</button>') + '</div>';
    }).join('') +
    '<div class="pad-field" style="margin-top:16px"><label>异常项勾选（发现异常必须勾选并拍照）</label>' +
      '<div class="type-grid" style="grid-template-columns:repeat(2,1fr)">' +
      ['无异常', '泄漏', '压力异常', '异响/振动'].map(function (t) {
        return '<div class="type-cell ' + (state.inspect.abnormal === t ? 'on' : '') + '" onclick="pickAbn(\'' + t + '\')">' + t + '</div>';
      }).join('') + '</div></div>' +
    '<button class="pad-btn primary" style="width:100%" onclick="finishInspect()">完成本组巡检</button>';
  };
  window.nfcCheck = function (i) {
    state.inspect.checked[i] = true;
    cache(1);
    toast('NFC 标签识别成功 · 位置核验通过');
    render();
  };
  window.pickAbn = function (t) { state.inspect.abnormal = t; render(); };
  window.finishInspect = function () {
    if (state.inspect.checked.some(function (c) { return !c; })) { toast('尚有未打卡点位'); return; }
    if (!state.inspect.abnormal) { toast('请勾选异常判定结果'); return; }
    cache(1);
    toast('巡检完成 · 异常「' + state.inspect.abnormal + '」已关联生成维修工单建议');
    state.inspect = { checked: [false, false, false], abnormal: '' };
    render();
  };

  /* M06 同步 */
  VIEWS.sync = function () {
    return '' +
    '<div class="pad-head"><h2>离线模式与数据同步</h2><span class="tiny">点击右上角网络图标可模拟断网 / 恢复</span></div>' +
    '<div class="sync-panel" style="text-align:center;padding:30px">' +
      '<div class="sync-big" style="color:' + (state.online ? 'var(--ok)' : 'var(--crit)') + '">' + (state.online ? '在线' : '离线') + '</div>' +
      '<div class="tiny" style="font-size:15px;margin-top:6px">' + (state.online ? '井下环网正常 · 数据实时上传' : '弱网/断网 · 数据本地环形缓存，恢复后自动断点续传') + '</div></div>' +
    '<div class="sync-panel"><div class="sync-row"><span>本地待同步条数</span><b>' + state.cache + ' 条</b></div>' +
      '<div class="sync-row"><span>缓存容量（72h 环形）</span><b>' + (state.cache * 0.02).toFixed(2) + ' MB / 512 MB</b></div>' +
      '<div class="sync-row"><span>上次同步时间</span><b>' + (state.online ? '刚刚' : '10:47') + '</b></div>' +
      '<div class="sync-row"><span>离线可用功能</span><b>任务查看 · 打卡 · 报工 · 上报 · 巡检</b></div>' +
      '<div class="sync-row"><span>底层设备控制</span><b style="color:var(--ok)">不依赖 MOM · 恒达电液控独立运行</b></div></div>' +
    (state.cache > 0 ? '<button class="pad-btn primary" style="width:100%" onclick="manualSync()">立即同步 ' + state.cache + ' 条</button>' :
      '<button class="pad-btn" style="width:100%" disabled>无待同步数据</button>');
  };
  window.manualSync = function () {
    if (!state.online) { toast('当前离线：请点击右上角网络图标恢复连接后再同步'); return; }
    var n = state.cache;
    toast('正在同步 ' + n + ' 条…');
    setTimeout(function () {
      state.cache = 0;
      document.getElementById('cacheCnt').textContent = 0;
      toast('同步完成：' + n + ' 条数据已上传');
      render();
    }, 1500);
  };

  /* 初始渲染 */
  document.getElementById('padMain').classList.add('hidden');
})();
