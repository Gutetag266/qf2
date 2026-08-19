class QuantEngine {
  double? zScore(List<double> values, int window) {
    if (values.length < window || window < 2) return null;
    final s = values.sublist(values.length - window);
    final mean = s.reduce((a,b) => a+b) / s.length;
    final variance = s.map((x) => (x-mean)*(x-mean)).reduce((a,b) => a+b) / s.length;
    final sd = variance.sqrt();
    return sd == 0 ? null : (s.last-mean)/sd;
  }
}

extension on double {
  double sqrt() {
    if (this <= 0) return 0;
    double x = this;
    for (var i=0; i<12; i++) x = 0.5*(x + this/x);
    return x;
  }
}
