use axum::Json;
use serde::Serialize;

#[derive(Serialize)]
pub struct Health { pub status: &'static str }

pub async fn health() -> Json<Health> { Json(Health { status: "ok" }) }

#[derive(Serialize)]
pub struct MarketSnapshot {
    pub symbol: String,
    pub bid: f64,
    pub ask: f64,
    pub last: f64,
    pub timestamp_ms: i64,
}

pub async fn market_snapshot() -> Json<MarketSnapshot> {
    Json(MarketSnapshot {
        symbol: "BTCUSDT".into(), bid: 0.0, ask: 0.0, last: 0.0,
        timestamp_ms: chrono::Utc::now().timestamp_millis(),
    })
}
