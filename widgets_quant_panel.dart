import 'package:flutter/material.dart';
class QuantPanel extends StatelessWidget {
  final String title; final Widget child;
  const QuantPanel({super.key, required this.title, required this.child});
  @override Widget build(BuildContext context) => Card(child: Padding(padding: const EdgeInsets.all(12), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(title, style: const TextStyle(fontWeight: FontWeight.w700)), const SizedBox(height: 8), child])));
}
