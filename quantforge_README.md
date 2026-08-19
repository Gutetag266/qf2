# QuantForge

Cross-platform quantitative trading workstation for iOS, macOS and Windows.

## Architecture
- Flutter 3.44+ UI for iOS/macOS/Windows.
- Rust engine for low-latency market state, order-book aggregation, indicators and risk math.
- Backend service for exchange connectivity, secrets, historical data, scanning, backtesting and broker execution.
- PostgreSQL/TimescaleDB for candles, trades, signals and audit events.
- Redis for short-lived market state and distributed scan jobs.

## Latency model
Exchange -> backend WS adapters -> normalized event bus -> Rust engine -> bounded UI state stream.
The UI is never the source of truth for market data or execution.

## Important
This repository is a production-oriented foundation, not a claim that live-money execution is safe without broker-specific certification, integration tests, paper trading and operational controls.
