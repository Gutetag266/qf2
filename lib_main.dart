import 'package:flutter/material.dart';
import 'core/theme.dart';
import 'features/market/market_screen.dart';

void main() => runApp(const QuantForgeApp());

class QuantForgeApp extends StatelessWidget {
  const QuantForgeApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'QuantForge',
      theme: buildQuantTheme(),
      home: const MarketScreen(),
    );
  }
}
