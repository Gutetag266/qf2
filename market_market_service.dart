import 'dart:async';
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';

class MarketService {
  WebSocketChannel? _channel;
  final _quotes = StreamController<Map<String, dynamic>>.broadcast();
  Stream<Map<String, dynamic>> get quotes => _quotes.stream;

  void connect(String url) {
    _channel?.sink.close();
    _channel = WebSocketChannel.connect(Uri.parse(url));
    _channel!.stream.listen((event) {
      try {
        final decoded = jsonDecode(event as String);
        if (decoded is Map<String, dynamic>) _quotes.add(decoded);
      } catch (_) {}
    }, onError: (_) {});
  }

  void dispose() {
    _channel?.sink.close();
    _quotes.close();
  }
}
