# QuantForge Architecture

## Processes
1. `quantforge_app`: Flutter application. Rendering, navigation, charts, interaction and presentation state only.
2. `quantforge_engine`: Rust dynamic library exposed through FFI. Market state, indicators, order-book imbalance, risk calculations and deterministic backtest primitives.
3. `quantforge_backend`: Rust API/WebSocket gateway. Broker/exchange adapters, authentication, persistence, scanner orchestration and execution safeguards.

## Data path
1. Exchange adapter receives raw WebSocket frames.
2. Adapter normalizes trades, books and candles into a common event schema.
3. Events enter a bounded queue. Slow consumers never block market ingestion.
4. Rust engine maintains the latest book and candle state.
5. UI receives coalesced snapshots on animation-aligned intervals rather than every tick.

## Trading safety
- Paper trading is the default environment.
- Live execution requires explicit account mode + server-side risk validation.
- Every order receives a client id and an immutable audit event.
- Max position notional, max daily loss, max order rate and symbol whitelist are enforced server-side.
- Exchange API secrets never enter Flutter storage in plaintext.

## Modules
- Market: subscriptions, candles, books, trades, footprints, profiles.
- Scanner: breakout, sweep, structure, volume anomaly and R:R ranking.
- Quant Lab: correlations, z-score, mean reversion, Monte Carlo, Sharpe, Sortino, MDD, VaR.
- Portfolio: exposure, PnL, risk budget, covariance and concentration.
- Execution: paper/live adapters, pre-trade checks, idempotency, reconciliation.
