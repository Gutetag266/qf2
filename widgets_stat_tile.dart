import 'package:flutter/material.dart';
class StatTile extends StatelessWidget {
  final String label, value;
  const StatTile({super.key, required this.label, required this.value});
  @override Widget build(BuildContext context) => Card(child: Padding(padding: const EdgeInsets.all(10), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(label, style: const TextStyle(fontSize: 11)), const SizedBox(height: 5), Text(value, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700))])));
}
