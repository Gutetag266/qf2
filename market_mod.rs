use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TradeTick { pub symbol: String, pub price: f64, pub qty: f64, pub ts_ms: i64 }
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BookLevel { pub price: f64, pub qty: f64 }
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrderBook { pub symbol: String, pub bids: Vec<BookLevel>, pub asks: Vec<BookLevel>, pub ts_ms: i64 }

pub trait ExchangeAdapter: Send + Sync {
    fn name(&self) -> &'static str;
    fn subscribe(&self, symbols: &[String]) -> Result<(), String>;
}

pub fn book_imbalance(book: &OrderBook, depth: usize) -> f64 {
    let bid: f64 = book.bids.iter().take(depth).map(|x| x.qty).sum();
    let ask: f64 = book.asks.iter().take(depth).map(|x| x.qty).sum();
    let denom = bid + ask;
    if denom == 0.0 { 0.0 } else { (bid - ask) / denom }
}
