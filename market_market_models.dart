class Candle {
  final DateTime time;
  final double open, high, low, close, volume;
  const Candle({required this.time, required this.open, required this.high, required this.low, required this.close, required this.volume});
}

class Setup {
  final String symbol, side;
  final double entry, stop, target, probability, rr;
  const Setup({required this.symbol, required this.side, required this.entry, required this.stop, required this.target, required this.probability, required this.rr});
}
