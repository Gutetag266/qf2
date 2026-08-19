use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct Quote { pub bid: f64, pub ask: f64, pub last: f64, pub ts_ms: i64 }

#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct RiskInput { pub entry: f64, pub stop: f64, pub target: f64, pub equity: f64, pub risk_pct: f64 }

#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct RiskOutput { pub rr: f64, pub risk_cash: f64, pub unit_size: f64, pub reward_cash: f64 }

pub fn risk(input: RiskInput) -> RiskOutput {
    let risk_per_unit = (input.entry - input.stop).abs();
    let reward_per_unit = (input.target - input.entry).abs();
    let risk_cash = input.equity * input.risk_pct.clamp(0.0, 1.0);
    let unit_size = if risk_per_unit > 0.0 { risk_cash / risk_per_unit } else { 0.0 };
    RiskOutput {
        rr: if risk_per_unit > 0.0 { reward_per_unit / risk_per_unit } else { 0.0 },
        risk_cash,
        unit_size,
        reward_cash: reward_per_unit * unit_size,
    }
}

pub fn zscore(series: &[f64], window: usize) -> Option<f64> {
    if series.len() < window || window < 2 { return None; }
    let s = &series[series.len()-window..];
    let mean = s.iter().sum::<f64>() / window as f64;
    let var = s.iter().map(|x| (x-mean).powi(2)).sum::<f64>() / window as f64;
    let std = var.sqrt();
    if std == 0.0 { None } else { Some((s[window-1]-mean)/std) }
}

pub fn max_drawdown(equity: &[f64]) -> f64 {
    let mut peak = f64::NEG_INFINITY;
    let mut max_dd = 0.0;
    for &v in equity {
        if v > peak { peak = v; }
        if peak > 0.0 { max_dd = max_dd.max((peak-v)/peak); }
    }
    max_dd
}

pub fn sharpe(returns: &[f64], annualization: f64) -> f64 {
    if returns.len() < 2 { return 0.0; }
    let mean = returns.iter().sum::<f64>() / returns.len() as f64;
    let var = returns.iter().map(|r| (r-mean).powi(2)).sum::<f64>() / (returns.len()-1) as f64;
    let sd = var.sqrt();
    if sd == 0.0 { 0.0 } else { mean / sd * annualization.sqrt() }
}

pub fn sortino(returns: &[f64], annualization: f64) -> f64 {
    if returns.is_empty() { return 0.0; }
    let mean = returns.iter().sum::<f64>() / returns.len() as f64;
    let downside: Vec<f64> = returns.iter().copied().filter(|r| *r < 0.0).collect();
    if downside.is_empty() { return f64::INFINITY; }
    let dd = (downside.iter().map(|r| r.powi(2)).sum::<f64>() / downside.len() as f64).sqrt();
    if dd == 0.0 { 0.0 } else { mean / dd * annualization.sqrt() }
}
