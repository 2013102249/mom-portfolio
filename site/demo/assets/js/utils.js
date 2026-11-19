/* ============================================================
 * MOM 平台公共工具：toast / 弹窗 / 图表初始化 / 格式化
 * ============================================================ */
(function () {
  'use strict';

  /* ---------- toast ---------- */
  window.toast = function (msg) {
    var t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._tm);
    t._tm = setTimeout(function () { t.classList.remove('show'); }, 2200);
  };

  /* ---------- 弹窗 ---------- */
  window.openModal = function (title, bodyHTML, footHTML) {
    var mask = document.getElementById('modalMask');
    if (!mask) {
      mask = document.createElement('div');
      mask.id = 'modalMask';
      mask.className = 'modal-mask';
      mask.innerHTML = '<div class="modal"><div class="m-head"><span id="mTitle"></span>' +
        '<button class="m-close" onclick="closeModal()">✕</button></div>' +
        '<div class="m-body" id="mBody"></div><div class="m-foot" id="mFoot"></div></div>';
      document.body.appendChild(mask);
      mask.addEventListener('click', function (e) { if (e.target === mask) closeModal(); });
    }
    document.getElementById('mTitle').textContent = title;
    document.getElementById('mBody').innerHTML = bodyHTML;
    document.getElementById('mFoot').innerHTML = footHTML ||
      '<button class="btn" onclick="closeModal()">关闭</button>';
    mask.classList.add('show');
  };
  window.closeModal = function () {
    var mask = document.getElementById('modalMask');
    if (mask) mask.classList.remove('show');
  };

  /* ---------- ECharts 主题封装 ---------- */
  var BRAND = '#7C3AED', BRAND2 = '#2563EB';
  var PALETTE = ['#7C3AED', '#2563EB', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6', '#64748B'];
  window.mkChart = function (el, option) {
    if (!el || !window.echarts) return null;
    var inst = window.echarts.init(el, null, { renderer: 'canvas' });
    var base = {
      color: PALETTE,
      textStyle: { fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif' },
      tooltip: { borderWidth: 0, backgroundColor: 'rgba(31,36,48,.92)', textStyle: { color: '#fff', fontSize: 12 } },
      grid: { left: 46, right: 20, top: 38, bottom: 30 },
      legend: { textStyle: { color: '#5A6478', fontSize: 12 }, itemWidth: 14, itemHeight: 8, icon: 'roundRect' }
    };
    var merged = deepMerge(deepMerge({}, base), option || {});
    inst.setOption(merged);
    if (window.__charts) window.__charts.push(inst); else window.__charts = [inst];
    return inst;
  };
  function deepMerge(a, b) {
    for (var k in b) {
      if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object' && !Array.isArray(a[k])) {
        deepMerge(a[k], b[k]);
      } else {
        a[k] = b[k];
      }
    }
    return a;
  }
  window.disposeCharts = function () {
    if (!window.__charts) return;
    window.__charts.forEach(function (c) { try { c.dispose(); } catch (e) {} });
    window.__charts = [];
  };

  /* ---------- 全局图表自适应（窗口尺寸变化时 resize 所有实例） ---------- */
  (function () {
    if (window.__chartResizeBound) return;
    window.__chartResizeBound = true;
    var tm = null;
    window.addEventListener('resize', function () {
      clearTimeout(tm);
      tm = setTimeout(function () {
        if (!window.__charts) return;
        window.__charts.forEach(function (c) {
          try {
            var el = c.getDom();
            if (el && el.offsetParent !== null) c.resize();
          } catch (e) {}
        });
      }, 180);
    });
    window.addEventListener('orientationchange', function () {
      setTimeout(function () {
        if (!window.__charts) return;
        window.__charts.forEach(function (c) { try { c.resize(); } catch (e) {} });
      }, 350);
    });
  })();

  /* ---------- 格式化 ---------- */
  window.fmtNum = function (n) {
    if (n === undefined || n === null || isNaN(n)) return '—';
    return Number(n).toLocaleString('zh-CN');
  };
  window.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };

  /* ---------- 表格行生成 ---------- */
  window.tblRows = function (rows, render) {
    return rows.map(render).join('');
  };

  /* ---------- 深色仪表环 ---------- */
  window.gaugeOption = function (value, title, color) {
    return {
      series: [{
        type: 'gauge', startAngle: 210, endAngle: -30, min: 0, max: 100,
        radius: '95%', center: ['50%', '58%'],
        progress: { show: true, width: 12, roundCap: true, itemStyle: { color: color || BRAND } },
        axisLine: { roundCap: true, lineStyle: { width: 12, color: [[1, '#EEF1F7']] } },
        pointer: { show: false }, axisTick: { show: false }, splitLine: { show: false },
        axisLabel: { show: false },
        detail: {
          valueAnimation: true, offsetCenter: [0, '2%'],
          fontSize: 24, fontWeight: 700, color: '#1F2430',
          formatter: '{value}%'
        },
        data: [{ value: value, name: '' }],
        title: { show: title !== false, offsetCenter: [0, '30%'], color: '#98A1B3', fontSize: 12 }
      }]
    };
  };
})();
