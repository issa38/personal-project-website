/*
 * Interactive DCF engine for the dcf-model.html case study.
 *
 * The numbers, scenario logic, and bridge formulas mirror the
 * "DCF Model Showcase" workbook (DCF / Model Inputs / WACC tabs) so the
 * Base case rendered in the browser reproduces the workbook's cached
 * outputs. Calculation logic is kept as pure functions; DOM wiring lives
 * in the init section at the bottom.
 */
(function () {
  "use strict";

  // ---- Base inputs (workbook "Model Inputs" controlled outputs, AAPL FY2025) ----
  var BASE = {
    ticker: "AAPL",
    valuationDate: "2026-04-29",
    baseFiscalYear: 2025,
    baseRevenue: 416161000000, // Model Inputs B28 (Total Revenue)
    baseEbit: 133050000000, // Model Inputs B29 (Operating Income)
    taxRate: 0.15610002335586043, // Model Inputs B31 (normalized cash tax)
    dnaPctRev: 0.028109313462818475, // Model Inputs B32
    capexPctRev: 0.030553079216937677, // Model Inputs B33
    nwcPctChgRev: 0.03, // Model Inputs B37
    terminalGrowth: 0.03, // Model Inputs B38 (manual base g)
    terminalTiming: "Year-End", // Model Inputs B22
    riskFreeRate: 0.04354, // WACC B4 (10Y Treasury)
    equityRiskPremium: 0.05, // WACC B5
    beta: 1.11, // WACC B6
    preTaxCostOfDebt: 0, // WACC B10 (query failed -> manual fallback 0)
    cash: 35934000000, // Model Inputs B34
    grossDebt: 90678000000, // Model Inputs B35
    currentSharesOutstanding: 14776353000, // Model Inputs B40 (market-cap weight)
    dilutedShares: 15004697000, // Model Inputs B26
    currentPrice: 270.71 // Model Inputs B25
  };

  BASE.baseMargin = BASE.baseEbit / BASE.baseRevenue; // ~0.319708 (Model Inputs B30)

  // ---- Scenario presets (workbook "Model Inputs" rows 45-72) ----
  // Revenue growth is a per-year path; EBIT margin is the base operating
  // margin plus a per-year shift, clamped to [0, 0.55] like the workbook.
  var SCENARIOS = {
    bear: {
      label: "Bear",
      growth: [0.03, 0.02, 0.02, 0.02, 0.02],
      marginShift: [-0.02, -0.01, 0, 0.01, 0.02],
      terminalGrowth: function (g) {
        return Math.max(g - 0.01, 0);
      },
      wacc: function (baseWacc, effTermG) {
        return baseWacc + 0.01;
      }
    },
    base: {
      label: "Base",
      growth: [0.08, 0.1, 0.08, 0.06, 0.04],
      marginShift: [0.02, 0.04, 0.06, 0.07, 0.08],
      terminalGrowth: function (g) {
        return g;
      },
      wacc: function (baseWacc) {
        return baseWacc;
      }
    },
    bull: {
      label: "Bull",
      growth: [0.13, 0.15, 0.12, 0.1, 0.08],
      marginShift: [0.06, 0.09, 0.12, 0.14, 0.16],
      terminalGrowth: function (g, baseWacc) {
        return Math.min(g + 0.005, baseWacc - 0.005);
      },
      wacc: function (baseWacc, effTermG) {
        return Math.max(baseWacc - 0.01, effTermG + 0.005);
      }
    }
  };

  var DISCOUNT_PERIODS = [0.5, 1.5, 2.5, 3.5, 4.5]; // mid-year convention (DCF C56:G56)

  function clamp(value, low, high) {
    return Math.min(Math.max(value, low), high);
  }

  // ---- WACC build (workbook "WACC" tab) ----
  function computeWacc(inp) {
    var costOfEquity = inp.riskFreeRate + inp.beta * inp.equityRiskPremium;
    var afterTaxCostOfDebt = inp.preTaxCostOfDebt * (1 - inp.taxRate);
    var marketCap = inp.currentPrice * BASE.currentSharesOutstanding;
    var capitalBase = marketCap + inp.grossDebt;
    var equityWeight = capitalBase > 0 ? marketCap / capitalBase : 0;
    var debtWeight = capitalBase > 0 ? inp.grossDebt / capitalBase : 0;
    var wacc = costOfEquity * equityWeight + afterTaxCostOfDebt * debtWeight;
    return {
      costOfEquity: costOfEquity,
      afterTaxCostOfDebt: afterTaxCostOfDebt,
      marketCap: marketCap,
      capitalBase: capitalBase,
      equityWeight: equityWeight,
      debtWeight: debtWeight,
      wacc: wacc
    };
  }

  // ---- Five-year unlevered FCF projection + valuation bridge ----
  // inp: editable assumption set. scenarioKey: "bear" | "base" | "bull".
  function runModel(inp, scenarioKey) {
    var scenario = SCENARIOS[scenarioKey] || SCENARIOS.base;
    var waccBuild = computeWacc(inp);
    var baseWacc = waccBuild.wacc;

    // Scenario transforms applied on top of the editable base assumptions.
    var effTermGrowth = scenario.terminalGrowth(inp.terminalGrowth, baseWacc);
    var effWacc = scenario.wacc(baseWacc, effTermGrowth);

    var netDebtCash = inp.grossDebt - inp.cash; // workbook Model Inputs B36

    var years = [];
    var prevRevenue = BASE.baseRevenue;
    for (var i = 0; i < 5; i += 1) {
      var growth = scenario.growth[i] + inp.revenueGrowthShift;
      var margin = clamp(
        BASE.baseMargin + scenario.marginShift[i] + inp.ebitMarginShift,
        0,
        0.55
      );
      var revenue = prevRevenue * (1 + growth);
      var ebit = revenue * margin;
      var tax = -ebit * inp.taxRate;
      var nopat = ebit + tax;
      var dna = revenue * inp.dnaPctRev;
      var capex = -revenue * inp.capexPctRev;
      var changeNwc = -(revenue - prevRevenue) * inp.nwcPctChgRev;
      var fcf = nopat + dna + capex + changeNwc;
      var period = DISCOUNT_PERIODS[i];
      var discountFactor = 1 / Math.pow(1 + effWacc, period);
      years.push({
        year: i + 1,
        growth: growth,
        margin: margin,
        revenue: revenue,
        ebit: ebit,
        tax: tax,
        nopat: nopat,
        dna: dna,
        capex: capex,
        changeNwc: changeNwc,
        fcf: fcf,
        period: period,
        discountFactor: discountFactor,
        pvFcf: fcf * discountFactor
      });
      prevRevenue = revenue;
    }

    var sumPvFcf = years.reduce(function (acc, y) {
      return acc + y.pvFcf;
    }, 0);

    var lastFcf = years[years.length - 1].fcf;
    var lastDf = years[years.length - 1].discountFactor;
    var terminalFcf = lastFcf * (1 + effTermGrowth);
    var terminalValid = effWacc > effTermGrowth;
    var terminalValue = terminalValid
      ? terminalFcf / (effWacc - effTermGrowth)
      : NaN;
    var pvTerminalValue = !terminalValid
      ? NaN
      : inp.terminalTiming === "Year-End"
        ? terminalValue / Math.pow(1 + effWacc, 5)
        : terminalValue * lastDf;

    var enterpriseValue = sumPvFcf + pvTerminalValue;
    // Workbook equity bridge: Equity = EV + "(-) Net Debt / (Cash)" line
    // (DCF B12 = B10 + B11). Reproduced as-is so Base matches the cached
    // $173.76; see the README/audit note on the bridge sign convention.
    var equityValue = enterpriseValue + netDebtCash;
    var impliedPrice = inp.dilutedShares > 0 ? equityValue / inp.dilutedShares : 0;
    var upside = inp.currentPrice > 0 ? impliedPrice / inp.currentPrice - 1 : 0;

    return {
      scenario: scenarioKey,
      waccBuild: waccBuild,
      baseWacc: baseWacc,
      effWacc: effWacc,
      effTermGrowth: effTermGrowth,
      netDebtCash: netDebtCash,
      years: years,
      sumPvFcf: sumPvFcf,
      terminalFcf: terminalFcf,
      terminalValue: terminalValue,
      pvTerminalValue: pvTerminalValue,
      terminalValid: terminalValid,
      enterpriseValue: enterpriseValue,
      equityValue: equityValue,
      impliedPrice: impliedPrice,
      upside: upside
    };
  }

  // ---- WACC vs terminal-growth sensitivity (workbook DCF B67:F72) ----
  // Re-prices the fixed FCF stream at trial discount rates. The grid uses
  // the workbook's bridge (EV minus net debt) which intentionally differs
  // from the headline bridge, so the centre cell will not tie out - this
  // is surfaced as a failing model check, not hidden.
  function buildSensitivity(inp, result) {
    var center = result.effWacc;
    var centerG = result.effTermGrowth;
    var waccAxis = [-0.01, -0.005, 0, 0.005, 0.01].map(function (d) {
      return center + d;
    });
    var growthAxis = [-0.01, -0.005, 0, 0.005, 0.01].map(function (d) {
      return centerG + d;
    });
    var fcfs = result.years.map(function (y) {
      return y.fcf;
    });
    var lastFcf = fcfs[fcfs.length - 1];
    var rows = waccAxis.map(function (wacc) {
      var cells = growthAxis.map(function (g) {
        if (wacc <= g) return NaN;
        var pv = 0;
        for (var i = 0; i < fcfs.length; i += 1) {
          pv += fcfs[i] / Math.pow(1 + wacc, DISCOUNT_PERIODS[i]);
        }
        var tv = (lastFcf * (1 + g)) / (wacc - g);
        var pvTv =
          inp.terminalTiming === "Year-End"
            ? tv / Math.pow(1 + wacc, 5)
            : tv / Math.pow(1 + wacc, DISCOUNT_PERIODS[fcfs.length - 1]);
        var equity = pv + pvTv - result.netDebtCash;
        return inp.dilutedShares > 0 ? equity / inp.dilutedShares : NaN;
      });
      return { wacc: wacc, cells: cells };
    });
    return { waccAxis: waccAxis, growthAxis: growthAxis, rows: rows };
  }

  // ---- Integrity checks (workbook "Model Checks" tab, recomputed live) ----
  function runChecks(inp, result, sensitivity) {
    var checks = [];
    function add(label, status, detail) {
      checks.push({ label: label, status: status, detail: detail });
    }
    var fy1Margin = result.years[0].margin;
    var sensitivityCenter = sensitivity.rows[2].cells[2];

    add(
      "Scenario selector valid",
      SCENARIOS[result.scenario] ? "PASS" : "FAIL",
      "Bear / Base / Bull only"
    );
    add(
      "Current share price available",
      inp.currentPrice > 0 ? "PASS" : "FAIL",
      fmtMoney(inp.currentPrice)
    );
    add(
      "Diluted shares positive",
      inp.dilutedShares > 0 ? "PASS" : "FAIL",
      fmtShares(inp.dilutedShares)
    );
    add(
      "WACC in sane range",
      result.effWacc > 0 && result.effWacc < 0.3 ? "PASS" : "FAIL",
      fmtPct(result.effWacc, 2)
    );
    add(
      "WACC > terminal growth",
      result.effWacc > result.effTermGrowth ? "PASS" : "FAIL",
      fmtPct(result.effWacc - result.effTermGrowth, 2) + " spread"
    );
    add(
      "EBIT margin sane",
      fy1Margin > 0 && fy1Margin < 0.75 ? "PASS" : "WARN",
      fmtPct(fy1Margin, 1) + " FY1"
    );
    add(
      "Tax rate sane",
      inp.taxRate > 0 && inp.taxRate < 0.4 ? "PASS" : "WARN",
      fmtPct(inp.taxRate, 1)
    );
    add(
      "D&A % revenue sane",
      inp.dnaPctRev > 0 && inp.dnaPctRev < 0.3 ? "PASS" : "WARN",
      fmtPct(inp.dnaPctRev, 1)
    );
    add(
      "CapEx % revenue sane",
      inp.capexPctRev > 0 && inp.capexPctRev < 0.5 ? "PASS" : "WARN",
      fmtPct(inp.capexPctRev, 1)
    );
    add(
      "Terminal timing valid",
      inp.terminalTiming === "Year-End" || inp.terminalTiming === "Mid-Year"
        ? "PASS"
        : "FAIL",
      inp.terminalTiming
    );
    add(
      "Cost of debt used sane",
      result.waccBuild.afterTaxCostOfDebt > 0 ? "PASS" : "FAIL",
      inp.preTaxCostOfDebt > 0
        ? fmtPct(inp.preTaxCostOfDebt, 2) + " pre-tax"
        : "0% manual fallback"
    );
    add(
      "WACC/g sensitivity centre ties",
      isFinite(sensitivityCenter) &&
        Math.abs(result.impliedPrice - sensitivityCenter) < 0.01
        ? "PASS"
        : "FAIL",
      "Δ " + fmtMoney(result.impliedPrice - sensitivityCenter)
    );
    add(
      "Implied share price positive",
      result.impliedPrice > 0 ? "PASS" : "FAIL",
      fmtMoney(result.impliedPrice)
    );

    var aggressive =
      inp.revenueGrowthShift > 0.03 ||
      inp.ebitMarginShift > 0.05 ||
      result.years.some(function (y) {
        return y.growth > 0.2;
      }) ||
      result.effTermGrowth > 0.04 ||
      result.years.some(function (y) {
        return y.margin >= 0.55;
      });
    add(
      "Assumptions within conservative bounds",
      aggressive ? "WARN" : "PASS",
      aggressive ? "Inputs pushed past restrained ranges" : "Within ranges"
    );

    var overall = checks.some(function (c) {
      return c.status === "FAIL";
    })
      ? "FAIL"
      : checks.some(function (c) {
          return c.status === "WARN";
        })
        ? "WARN"
        : "PASS";

    return { checks: checks, overall: overall };
  }

  // ---- Formatting helpers ----
  function fmtBigDollars(value) {
    if (!isFinite(value)) return "n/a";
    var abs = Math.abs(value);
    var sign = value < 0 ? "-" : "";
    if (abs >= 1e12) return sign + "$" + (abs / 1e12).toFixed(2) + "T";
    if (abs >= 1e9) return sign + "$" + (abs / 1e9).toFixed(1) + "B";
    if (abs >= 1e6) return sign + "$" + (abs / 1e6).toFixed(1) + "M";
    return sign + "$" + abs.toFixed(0);
  }

  function fmtMoney(value) {
    if (!isFinite(value)) return "n/a";
    var sign = value < 0 ? "-" : "";
    return sign + "$" + Math.abs(value).toFixed(2);
  }

  function fmtPct(value, decimals) {
    if (!isFinite(value)) return "n/a";
    return (value * 100).toFixed(decimals == null ? 1 : decimals) + "%";
  }

  function fmtSignedPct(value, decimals) {
    if (!isFinite(value)) return "n/a";
    var sign = value > 0 ? "+" : "";
    return sign + (value * 100).toFixed(decimals == null ? 1 : decimals) + "%";
  }

  function fmtShares(value) {
    if (!isFinite(value)) return "n/a";
    return (value / 1e9).toFixed(2) + "B";
  }

  var ENGINE = {
    BASE: BASE,
    SCENARIOS: SCENARIOS,
    computeWacc: computeWacc,
    runModel: runModel,
    buildSensitivity: buildSensitivity,
    runChecks: runChecks,
    format: {
      bigDollars: fmtBigDollars,
      money: fmtMoney,
      pct: fmtPct,
      signedPct: fmtSignedPct,
      shares: fmtShares
    }
  };

  // Expose the pure engine for tests and console inspection.
  if (typeof window !== "undefined") window.DCF = ENGINE;
  if (typeof module !== "undefined" && module.exports) module.exports = ENGINE;

  // ---- Default editable assumption set (Base-case workbook values) ----
  function defaultInputs() {
    return {
      revenueGrowthShift: 0,
      ebitMarginShift: 0,
      taxRate: BASE.taxRate,
      dnaPctRev: BASE.dnaPctRev,
      capexPctRev: BASE.capexPctRev,
      nwcPctChgRev: BASE.nwcPctChgRev,
      terminalGrowth: BASE.terminalGrowth,
      terminalTiming: BASE.terminalTiming,
      riskFreeRate: BASE.riskFreeRate,
      equityRiskPremium: BASE.equityRiskPremium,
      beta: BASE.beta,
      preTaxCostOfDebt: BASE.preTaxCostOfDebt,
      cash: BASE.cash,
      grossDebt: BASE.grossDebt,
      dilutedShares: BASE.dilutedShares,
      currentPrice: BASE.currentPrice
    };
  }

  // ---- Control schema: drives both the form markup and state I/O ----
  // kind "pct" stores a ratio but edits in percent; "shift" is a percentage
  // point delta; "billions" edits $B but stores raw dollars.
  var FIELDS = [
    { id: "revenueGrowthShift", label: "Revenue growth shift", group: "drivers", kind: "shift", step: 0.5, min: -10, max: 15, decimals: 1, hint: "Parallel shift on the scenario growth path" },
    { id: "ebitMarginShift", label: "EBIT margin shift", group: "drivers", kind: "shift", step: 0.5, min: -15, max: 15, decimals: 1, hint: "Parallel shift on the scenario margin path" },
    { id: "taxRate", label: "Tax rate", group: "drivers", kind: "pct", step: 0.5, min: 0, max: 40, decimals: 2 },
    { id: "dnaPctRev", label: "D&A (% revenue)", group: "drivers", kind: "pct", step: 0.1, min: 0, max: 30, decimals: 2 },
    { id: "capexPctRev", label: "CapEx (% revenue)", group: "drivers", kind: "pct", step: 0.1, min: 0, max: 50, decimals: 2 },
    { id: "nwcPctChgRev", label: "Δ NWC (% of Δ revenue)", group: "drivers", kind: "pct", step: 0.5, min: -20, max: 30, decimals: 1 },
    { id: "terminalGrowth", label: "Terminal growth", group: "drivers", kind: "pct", step: 0.25, min: 0, max: 6, decimals: 2 },
    { id: "riskFreeRate", label: "Risk-free rate", group: "capital", kind: "pct", step: 0.1, min: 0, max: 10, decimals: 3 },
    { id: "equityRiskPremium", label: "Equity risk premium", group: "capital", kind: "pct", step: 0.25, min: 0, max: 12, decimals: 2 },
    { id: "beta", label: "Beta", group: "capital", kind: "num", step: 0.01, min: 0, max: 3, decimals: 2 },
    { id: "preTaxCostOfDebt", label: "Pre-tax cost of debt", group: "capital", kind: "pct", step: 0.1, min: 0, max: 20, decimals: 2 },
    { id: "grossDebt", label: "Gross debt", group: "capital", kind: "billions", step: 1, min: 0, max: 1000, decimals: 3, unit: "$B" },
    { id: "cash", label: "Cash & equivalents", group: "capital", kind: "billions", step: 1, min: 0, max: 1000, decimals: 3, unit: "$B" },
    { id: "dilutedShares", label: "Diluted shares", group: "capital", kind: "billions", step: 0.1, min: 0.1, max: 100, decimals: 3, unit: "B sh" },
    { id: "currentPrice", label: "Current share price", group: "capital", kind: "money", step: 1, min: 0.01, max: 5000, decimals: 2, unit: "$" }
  ];

  // Convert a stored model value <-> the value shown in the input box.
  function toField(field, raw) {
    if (field.kind === "pct" || field.kind === "shift") return raw * 100;
    if (field.kind === "billions") return raw / 1e9;
    return raw;
  }
  function fromField(field, shown) {
    if (field.kind === "pct" || field.kind === "shift") return shown / 100;
    if (field.kind === "billions") return shown * 1e9;
    return shown;
  }

  // ---- DOM wiring ----
  function initUi() {
    var root = document.querySelector("[data-dcf-app]");
    if (!root) return;

    var state = { scenario: "base", inputs: defaultInputs() };

    var form = root.querySelector("[data-dcf-form]");
    var scenarioButtons = Array.prototype.slice.call(
      root.querySelectorAll("[data-dcf-scenario]")
    );
    var timingSelect = root.querySelector("[data-dcf-timing]");
    var resetButton = root.querySelector("[data-dcf-reset]");
    var fieldEls = {};

    // Build the control rows from the schema.
    var groups = {
      drivers: root.querySelector('[data-dcf-group="drivers"]'),
      capital: root.querySelector('[data-dcf-group="capital"]')
    };
    FIELDS.forEach(function (field) {
      var wrap = document.createElement("div");
      wrap.className = "dcf-control";
      var inputId = "dcf-" + field.id;

      var label = document.createElement("label");
      label.className = "dcf-control-label";
      label.setAttribute("for", inputId);
      label.textContent = field.label;
      if (field.unit) {
        var unit = document.createElement("span");
        unit.className = "dcf-control-unit";
        unit.textContent = field.unit;
        label.appendChild(unit);
      }

      var inputRow = document.createElement("div");
      inputRow.className = "dcf-control-row";

      var range = document.createElement("input");
      range.type = "range";
      range.className = "dcf-range";
      range.id = inputId + "-range";
      range.min = String(field.min);
      range.max = String(field.max);
      range.step = String(field.step);
      range.setAttribute("aria-label", field.label + " slider");
      range.tabIndex = -1;

      var number = document.createElement("input");
      number.type = "number";
      number.className = "dcf-number";
      number.id = inputId;
      number.min = String(field.min);
      number.max = String(field.max);
      number.step = String(field.step);
      number.dataset.dcfField = field.id;
      if (field.hint) number.setAttribute("aria-describedby", inputId + "-hint");

      inputRow.appendChild(range);
      inputRow.appendChild(number);
      wrap.appendChild(label);
      wrap.appendChild(inputRow);
      if (field.hint) {
        var hint = document.createElement("p");
        hint.className = "dcf-control-hint";
        hint.id = inputId + "-hint";
        hint.textContent = field.hint;
        wrap.appendChild(hint);
      }
      (groups[field.group] || groups.drivers).appendChild(wrap);

      fieldEls[field.id] = { field: field, number: number, range: range };

      function commit(value) {
        var clamped = clamp(value, field.min, field.max);
        state.inputs[field.id] = fromField(field, clamped);
        syncField(field.id);
        render();
        writeUrl();
      }
      number.addEventListener("input", function () {
        var v = parseFloat(number.value);
        if (!isFinite(v)) return;
        state.inputs[field.id] = fromField(field, clamp(v, field.min, field.max));
        range.value = String(clamp(v, field.min, field.max));
        render();
      });
      number.addEventListener("change", function () {
        var v = parseFloat(number.value);
        commit(isFinite(v) ? v : toField(field, defaultInputs()[field.id]));
      });
      range.addEventListener("input", function () {
        commit(parseFloat(range.value));
      });
    });

    function syncField(id) {
      var ref = fieldEls[id];
      if (!ref) return;
      var shown = toField(ref.field, state.inputs[id]);
      var rounded = Number(shown.toFixed(ref.field.decimals));
      if (document.activeElement !== ref.number) ref.number.value = String(rounded);
      ref.range.value = String(clamp(rounded, ref.field.min, ref.field.max));
    }

    function syncAllFields() {
      Object.keys(fieldEls).forEach(syncField);
      if (timingSelect) timingSelect.value = state.inputs.terminalTiming;
      scenarioButtons.forEach(function (btn) {
        var active = btn.dataset.dcfScenario === state.scenario;
        btn.classList.toggle("active", active);
        btn.setAttribute("aria-pressed", String(active));
      });
    }

    if (timingSelect) {
      timingSelect.addEventListener("change", function () {
        state.inputs.terminalTiming = timingSelect.value;
        render();
        writeUrl();
      });
    }

    scenarioButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.scenario = btn.dataset.dcfScenario;
        syncAllFields();
        render();
        writeUrl();
      });
    });

    if (resetButton) {
      resetButton.addEventListener("click", function () {
        state.scenario = "base";
        state.inputs = defaultInputs();
        syncAllFields();
        render();
        history.replaceState(null, "", location.pathname + location.search);
      });
    }

    // ---- Shareable scenario state via URL hash ----
    function writeUrl() {
      var params = new URLSearchParams();
      params.set("s", state.scenario);
      FIELDS.forEach(function (f) {
        var def = defaultInputs()[f.id];
        if (state.inputs[f.id] !== def) {
          params.set(f.id, String(Number(state.inputs[f.id].toPrecision(10))));
        }
      });
      if (state.inputs.terminalTiming !== BASE.terminalTiming) {
        params.set("tt", state.inputs.terminalTiming);
      }
      var qs = params.toString();
      history.replaceState(null, "", qs ? "#" + qs : location.pathname + location.search);
    }

    function readUrl() {
      if (!location.hash || location.hash.length < 2) return;
      var params = new URLSearchParams(location.hash.slice(1));
      var s = params.get("s");
      if (s && SCENARIOS[s]) state.scenario = s;
      var tt = params.get("tt");
      if (tt === "Mid-Year" || tt === "Year-End") state.inputs.terminalTiming = tt;
      FIELDS.forEach(function (f) {
        if (params.has(f.id)) {
          var v = parseFloat(params.get(f.id));
          if (isFinite(v)) state.inputs[f.id] = v;
        }
      });
    }

    // ---- Render: pure engine output -> DOM ----
    var out = {
      impliedPrice: root.querySelector('[data-dcf-out="impliedPrice"]'),
      enterpriseValue: root.querySelector('[data-dcf-out="enterpriseValue"]'),
      equityValue: root.querySelector('[data-dcf-out="equityValue"]'),
      sumPvFcf: root.querySelector('[data-dcf-out="sumPvFcf"]'),
      pvTerminalValue: root.querySelector('[data-dcf-out="pvTerminalValue"]'),
      wacc: root.querySelector('[data-dcf-out="wacc"]'),
      upside: root.querySelector('[data-dcf-out="upside"]'),
      currentPrice: root.querySelector('[data-dcf-out="currentPrice"]')
    };
    var forecastBody = root.querySelector("[data-dcf-forecast]");
    var sensHead = root.querySelector("[data-dcf-sens-head]");
    var sensBody = root.querySelector("[data-dcf-sens-body]");
    var checksBody = root.querySelector("[data-dcf-checks]");
    var overallEl = root.querySelector("[data-dcf-overall]");
    var f = ENGINE.format;

    function setText(el, value) {
      if (el && el.textContent !== value) el.textContent = value;
    }

    function render() {
      var result = runModel(state.inputs, state.scenario);
      var sensitivity = buildSensitivity(state.inputs, result);
      var checkReport = runChecks(state.inputs, result, sensitivity);

      setText(out.impliedPrice, f.money(result.impliedPrice));
      setText(out.enterpriseValue, f.bigDollars(result.enterpriseValue));
      setText(out.equityValue, f.bigDollars(result.equityValue));
      setText(out.sumPvFcf, f.bigDollars(result.sumPvFcf));
      setText(out.pvTerminalValue, f.bigDollars(result.pvTerminalValue));
      setText(out.wacc, f.pct(result.effWacc, 2));
      setText(out.currentPrice, f.money(state.inputs.currentPrice));
      if (out.upside) {
        out.upside.textContent = f.signedPct(result.upside, 1);
        out.upside.dataset.tone = result.upside >= 0 ? "up" : "down";
      }

      var rows = result.years
        .map(function (y) {
          return (
            "<tr><th scope=\"row\">FY" +
            y.year +
            "E</th><td>" +
            f.bigDollars(y.revenue) +
            "</td><td>" +
            f.pct(y.growth, 1) +
            "</td><td>" +
            f.bigDollars(y.ebit) +
            "</td><td>" +
            f.bigDollars(y.tax) +
            "</td><td>" +
            f.bigDollars(y.nopat) +
            "</td><td>" +
            f.bigDollars(y.dna) +
            "</td><td>" +
            f.bigDollars(y.capex) +
            "</td><td>" +
            f.bigDollars(y.changeNwc) +
            "</td><td>" +
            f.bigDollars(y.fcf) +
            "</td><td>" +
            y.discountFactor.toFixed(4) +
            "</td><td>" +
            f.bigDollars(y.pvFcf) +
            "</td></tr>"
          );
        })
        .join("");
      if (forecastBody) forecastBody.innerHTML = rows;

      if (sensHead) {
        sensHead.innerHTML =
          "<tr><th scope=\"col\">WACC \\ g</th>" +
          sensitivity.growthAxis
            .map(function (g) {
              return "<th scope=\"col\">" + f.pct(g, 2) + "</th>";
            })
            .join("") +
          "</tr>";
      }
      if (sensBody) {
        sensBody.innerHTML = sensitivity.rows
          .map(function (r) {
            var isCenterRow = Math.abs(r.wacc - result.effWacc) < 1e-9;
            return (
              "<tr><th scope=\"row\">" +
              f.pct(r.wacc, 2) +
              "</th>" +
              r.cells
                .map(function (c, ci) {
                  var center =
                    isCenterRow &&
                    Math.abs(
                      sensitivity.growthAxis[ci] - result.effTermGrowth
                    ) < 1e-9;
                  return (
                    "<td" +
                    (center ? ' class="is-center"' : "") +
                    ">" +
                    (isFinite(c) ? f.money(c) : "n/a") +
                    "</td>"
                  );
                })
                .join("") +
              "</tr>"
            );
          })
          .join("");
      }

      if (checksBody) {
        checksBody.innerHTML = checkReport.checks
          .map(function (c) {
            return (
              '<tr><th scope="row">' +
              c.label +
              '</th><td>' +
              c.detail +
              '</td><td><span class="dcf-status" data-status="' +
              c.status +
              '">' +
              c.status +
              "</span></td></tr>"
            );
          })
          .join("");
      }
      if (overallEl) {
        overallEl.textContent = checkReport.overall;
        overallEl.dataset.status = checkReport.overall;
      }
    }

    readUrl();
    syncAllFields();
    render();
    if (location.hash && location.hash.length > 1) writeUrl();
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initUi);
    } else {
      initUi();
    }
  }
})();
