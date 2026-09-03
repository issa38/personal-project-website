/**
 * dcf-chart.js: FCF bar chart for the DCF widget
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

    Chart.defaults.color = "rgba(226, 227, 224, 0.55)";
    Chart.defaults.font.family = "'Manrope', system-ui, sans-serif";

    charts[uid] = new Chart(canvas, {
      type: "bar",
      data: {
        labels: ["Y1", "Y2", "Y3", "Y4", "Y5", "Terminal PV"],
        datasets: [
          {
            label: "FCF (Nominal)",
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: "rgba(140, 155, 115, 0.72)",
            borderColor: "rgba(189, 204, 161, 0.92)",
            borderWidth: 1,
            borderRadius: 3,
            order: 1
          },
          {
            label: "PV of FCF",
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: "rgba(190, 201, 196, 0.34)",
            borderColor: "rgba(190, 201, 196, 0.62)",
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
              color: "rgba(226, 227, 224, 0.65)",
              boxWidth: 10,
              boxHeight: 10,
              padding: 16,
              font: { size: 11 }
            }
          },
          tooltip: {
            backgroundColor: "rgba(26, 28, 27, 0.96)",
            borderColor: "rgba(140, 155, 115, 0.32)",
            borderWidth: 1,
            titleColor: "rgba(226, 227, 224, 0.92)",
            bodyColor: "rgba(195, 200, 197, 0.78)",
            padding: 10,
            callbacks: {
              label: function (ctx) {
                var val = ctx.raw;
                if (!isFinite(val)) return ctx.dataset.label + ": n/a";
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
            grid: { color: "rgba(226, 227, 224, 0.06)" },
            ticks: { color: "rgba(226, 227, 224, 0.55)", font: { size: 11 } },
            border: { color: "transparent" }
          },
          y: {
            grid: { color: "rgba(226, 227, 224, 0.06)" },
            ticks: {
              color: "rgba(226, 227, 224, 0.55)",
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
