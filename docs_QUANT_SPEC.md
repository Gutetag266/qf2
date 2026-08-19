# Quant specification

## Setup score
score = weighted(signal_quality, trend_alignment, liquidity_event, volume_confirmation, volatility_regime, execution_quality)

A probability field is an empirical model output, not a guarantee of winning. It must be calibrated using out-of-sample observations.

## Risk
risk_cash = equity * risk_pct
unit_size = risk_cash / abs(entry - stop)
reward_cash = abs(target - entry) * unit_size
R:R = reward_cash / risk_cash

## Required backtest outputs
- CAGR
- annualized volatility
- Sharpe
- Sortino
- maximum drawdown
- Calmar
- VaR / CVaR
- win rate
- expectancy
- profit factor
- turnover
- exposure
- worst streak
- parameter sensitivity
- Monte Carlo confidence bands
