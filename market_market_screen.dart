import 'package:flutter/material.dart';
import 'market_models.dart';
import '../../widgets/stat_tile.dart';
import '../../widgets/quant_panel.dart';

class MarketScreen extends StatefulWidget {
  const MarketScreen({super.key});
  @override State<MarketScreen> createState() => _MarketScreenState();
}

class _MarketScreenState extends State<MarketScreen> {
  String symbol = 'BTCUSDT';
  final List<Setup> setups = const [
    Setup(symbol:'BTCUSDT', side:'LONG', entry:112400, stop:111650, target:114150, probability:0.67, rr:2.33),
    Setup(symbol:'ETHUSDT', side:'SHORT', entry:4210, stop:4255, target:4115, probability:0.61, rr:2.11),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('QUANTFORGE'), backgroundColor: Colors.transparent),
      body: LayoutBuilder(builder: (context, c) {
        final desktop = c.maxWidth >= 1000;
        final chart = Container(decoration: BoxDecoration(color: const Color(0xFF080B0D), borderRadius: BorderRadius.circular(14)), child: Center(child: Text('$symbol\nLIVE CANDLE ENGINE', textAlign: TextAlign.center, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w700))));
        final side = Column(children: [
          Row(children: const [Expanded(child: StatTile(label:'Sharpe', value:'1.82')), Expanded(child: StatTile(label:'Max DD', value:'7.4%')), Expanded(child: StatTile(label:'VaR 95%', value:'2.1%'))]),
          const SizedBox(height: 12),
          QuantPanel(title:'AI / Quant Setups', child: Column(children: setups.map((s) => ListTile(dense:true, title: Text('${s.symbol}  ${s.side}'), subtitle: Text('E ${s.entry}  SL ${s.stop}  TP ${s.target}'), trailing: Text('R:R ${s.rr.toStringAsFixed(2)}')).toList()))),
        ]);
        return Padding(padding: const EdgeInsets.all(12), child: desktop ? Row(crossAxisAlignment: CrossAxisAlignment.stretch, children: [Expanded(flex: 7, child: chart), const SizedBox(width: 12), Expanded(flex: 3, child: side)]) : ListView(children: [SizedBox(height: 420, child: chart), const SizedBox(height: 12), side]));
      }),
    );
  }
}
