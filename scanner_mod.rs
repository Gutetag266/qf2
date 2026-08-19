use serde::{Deserialize, Serialize};
use crate::market::OrderBook;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SignalCandidate {
    pub symbol: String,
    pub side: String,
    pub entry: f64,
    pub stop: f64,
    pub target: f64,
    pub rr: f64,
    pub score: f64,
    pub probability: f64,
}

pub fn rank_candidate(symbol: &str, side: &str, entry: f64, stop: f64, target: f64, trend: f64, liquidity_sweep: f64, volume: f64, book: &OrderBook) -> SignalCandidate {
    let risk = (entry-stop).abs();
    let reward = (target-entry).abs();
    let rr = if risk > 0.0 { reward/risk } else { 0.0 };
    let imbalance = crate::market::book_imbalance(book, 10);
    let direction = if side == "LONG" { 1.0 } else { -1.0 };
    let raw = 0.30*trend + 0.25*liquidity_sweep + 0.20*volume + 0.25*(imbalance*direction + 1.0)/2.0;
    let score = raw.clamp(0.0, 1.0);
    SignalCandidate { symbol:symbol.into(), side:side.into(), entry, stop, target, rr, score, probability:score }
}
