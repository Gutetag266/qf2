use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BacktestStats {
    pub cagr: f64,
    pub volatility: f64,
    pub sharpe: f64,
    pub sortino: f64,
    pub max_drawdown: f64,
    pub var95: f64,
    pub cvar95: f64,
    pub win_rate: f64,
    pub expectancy: f64,
    pub profit_factor: f64,
}

pub fn stats(returns: &[f64], starting_equity: f64, periods_per_year: f64) -> BacktestStats {
    if returns.is_empty() { return BacktestStats { cagr:0.0, volatility:0.0, sharpe:0.0, sortino:0.0, max_drawdown:0.0, var95:0.0, cvar95:0.0, win_rate:0.0, expectancy:0.0, profit_factor:0.0 }; }
    let end = returns.iter().fold(starting_equity, |e, r| e * (1.0+r));
    let years = returns.len() as f64 / periods_per_year;
    let cagr = if years > 0.0 { (end / starting_equity).powf(1.0/years) - 1.0 } else { 0.0 };
    let mean = returns.iter().sum::<f64>() / returns.len() as f64;
    let var = if returns.len() > 1 { returns.iter().map(|r| (r-mean).powi(2)).sum::<f64>()/(returns.len()-1) as f64 } else { 0.0 };
    let vol = var.sqrt() * periods_per_year.sqrt();
    let sharpe = if vol == 0.0 { 0.0 } else { mean * periods_per_year / vol };
    let downside: Vec<f64> = returns.iter().copied().filter(|r| *r < 0.0).collect();
    let downside_dev = if downside.is_empty() { 0.0 } else { (downside.iter().map(|r| r*r).sum::<f64>()/downside.len() as f64).sqrt() * periods_per_year.sqrt() };
    let sortino = if downside_dev == 0.0 { f64::INFINITY } else { mean * periods_per_year / downside_dev };
    let mut equity = starting_equity; let mut peak = starting_equity; let mut mdd = 0.0;
    for r in returns { equity *= 1.0+r; if equity > peak { peak=equity; } if peak > 0.0 { mdd=mdd.max((peak-equity)/peak); } }
    let mut sorted = returns.to_vec(); sorted.sort_by(|a,b| a.partial_cmp(b).unwrap());
    let idx = ((sorted.len()-1) as f64 * 0.05).floor() as usize;
    let var95 = -sorted[idx];
    let tail = &sorted[..=idx];
    let cvar95 = if tail.is_empty() { var95 } else { -tail.iter().sum::<f64>()/tail.len() as f64 };
    let wins: Vec<f64> = returns.iter().copied().filter(|r| *r > 0.0).collect();
    let losses: Vec<f64> = returns.iter().copied().filter(|r| *r < 0.0).collect();
    let win_rate = wins.len() as f64 / returns.len() as f64;
    let expectancy = mean;
    let gross_win = wins.iter().sum::<f64>();
    let gross_loss = -losses.iter().sum::<f64>();
    let profit_factor = if gross_loss == 0.0 { f64::INFINITY } else { gross_win/gross_loss };
    BacktestStats { cagr, volatility: vol, sharpe, sortino, max_drawdown:mdd, var95, cvar95, win_rate, expectancy, profit_factor }
}

pub fn monte_carlo_terminal(returns: &[f64], paths: usize, horizon: usize, seed: u64, start: f64) -> Vec<f64> {
    if returns.is_empty() || paths == 0 || horizon == 0 { return Vec::new(); }
    let mut state = seed.max(1);
    let mut out = Vec::with_capacity(paths);
    for _ in 0..paths {
        let mut equity = start;
        for _ in 0..horizon {
            state ^= state << 13; state ^= state >> 7; state ^= state << 17;
            let i = (state as usize) % returns.len();
            equity *= 1.0 + returns[i];
        }
        out.push(equity);
    }
    out.sort_by(|a,b| a.partial_cmp(b).unwrap());
    out
}
