use axum::{routing::get, Router};
use tracing::info;

mod api;
mod market;
mod quant;
mod scanner;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt().with_env_filter("info").init();
    let app = Router::new()
        .route("/health", get(api::health))
        .route("/api/v1/market/snapshot", get(api::market_snapshot));
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
    info!("quantforge backend listening on 0.0.0.0:8080");
    axum::serve(listener, app).await.unwrap();
}
