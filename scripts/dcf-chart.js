/**
 * dcf-chart.js — Phase 2 FCF bar chart for the DCF widget
 * Requires Chart.js v4 (loaded before this script)
 * Provides window.initDCFWidgetChart(uid, canvas) and window.updateDCFWidgetChart(uid, result)
 */
(function () {
  "use strict";

  var charts = {}; // uid → Chart instance

  window.initDCFWidgetChart = function (uid, canvas) {
    if (typeof Chart === "undefined" || !canvas) return;

    // Destroy any existing instance on this canvas
    if (charts[uid]) {
      charts[uid].destroy();
    }

    Chart.defaults.color = "rgba(197, 186, 165, 0.55)";
    Chart.defaults.font.family = "'Manrope', system-ui, sans-serif";

    charts[uid] = new Chart(canvas, {
      type: "bar",
      data: {
        labels: ["Y1", "Y2", "Y3", "Y4", "Y5", "Terminal PV"],
        datasets: [
          {
            label: "FCF (Nominal)",
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: "rgba(147, 121, 89, 0.60)",
            borderColor: "rgba(147, 121, 89, 0.88)",
            borderWidth: 1,
            borderRadius: 3,
            order: 1
          },
          {
            label: "PV of FCF",
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: "rgba(133, 144, 144, 0.38)",
            borderColor: "rgba(133, 144, 144, 0.65)",
            borderWidth: 1,
            borderRadius: 3,
            order: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 380,
          easing: "easeOutQuart"
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "rgba(197, 186, 165, 0.65)",
              boxWidth: 10,
              boxHeight: 10,
              padding: 16,
              font: { size: 11 }
            }
          },
          tooltip: {
            backgroundColor: "rgba(35, 18, 8, 0.96)",
            borderColor: "rgba(147, 121, 89, 0.22)",
            borderWidth: 1,
            titleColor: "rgba(237, 229, 216, 0.9)",
            bodyColor: "rgba(197, 186, 165, 0.75)",
            padding: 10,
            callbacks: {
              label: function (ctx) {
                var val = ctx.raw;
                if (!isFinite(val)) return ctx.dataset.label + ": —";
                var formatted = val >= 1e12
                  ? "$" + (val / 1e12).toFixed(2) + "T"
                  : "$" + (val / 1e9).toFixed(1) + "B";
                return ctx.dataset.label + ": " + formatted;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: "rgba(197, 186, 165, 0.055)" },
            ticks: { color: "rgba(197, 186, 165, 0.55)", font: { size: 11 } },
            border: { color: "transparent" }
          },
          y: {
            grid: { color: "rgba(197, 186, 165, 0.055)" },
            ticks: {
              color: "rgba(197, 186, 165, 0.55)",
              font: { size: 11 },
              callback: function (v) {
                if (Math.abs(v) >= 1e12) return "$" + (v / 1e12).toFixed(1) + "T";
                return "$" + (v / 1e9).toFixed(0) + "B";
              }
            },
            border: { color: "transparent" }
          }
        }
      }
    });
  };

  window.updateDCFWidgetChart = function (uid, result) {
    var chart = charts[uid];
    if (!chart) return;

    var fcfByYear  = result.fcfByYear  || [];
    var pvByYear   = result.pvByYear   || [];
    var pvTerminal = result.pvTerminal || 0;

    chart.data.datasets[0].data = fcfByYear.concat([pvTerminal]);
    chart.data.datasets[1].data = pvByYear.concat([pvTerminal]);
    chart.update("active");
  };
})();
