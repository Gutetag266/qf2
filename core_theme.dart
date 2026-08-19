import 'package:flutter/material.dart';

ThemeData buildQuantTheme() {
  const bg = Color(0xFF050708);
  const panel = Color(0xFF0C1012);
  const cyan = Color(0xFF00E5FF);
  return ThemeData.dark().copyWith(
    scaffoldBackgroundColor: bg,
    colorScheme: const ColorScheme.dark(primary: cyan, surface: panel),
    cardColor: panel,
    dividerColor: const Color(0xFF1B2225),
    textTheme: ThemeData.dark().textTheme.apply(fontFamily: 'Inter'),
  );
}
