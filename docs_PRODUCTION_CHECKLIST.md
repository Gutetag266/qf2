# Before live trading

- Implement at least one real exchange adapter with heartbeat, reconnect, sequence-gap handling and clock synchronization.
- Add exchange-specific order validation and idempotency keys.
- Persist order state and reconcile open orders/positions after reconnect.
- Add paper trading and deterministic replay tests before enabling live mode.
- Calibrate signal probabilities on walk-forward out-of-sample data. Never treat a raw model score as a probability without calibration.
- Add Prometheus/OpenTelemetry metrics: feed latency, book gap rate, order ack latency, reject rate, p99 scanner duration, UI snapshot age, and data freshness.
- Encrypt credentials using platform secure storage and keep broker API secrets server-side where possible.
- Add kill switch, max daily loss, max notional, per-symbol exposure and stale-data execution guard.
