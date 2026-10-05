import 'dart:math';
import 'package:flutter/material.dart';

class OrderBookWidget extends StatelessWidget {
  final double currentPrice;

  const OrderBookWidget({super.key, required this.currentPrice});

  @override
  Widget build(BuildContext context) {
    final rnd = Random(42);
    final asks = List.generate(5, (i) {
      double p = currentPrice + (i + 1) * (currentPrice * 0.0003);
      double size = 0.5 + rnd.nextDouble() * 3.5;
      return MapEntry(p, size);
    }).reversed.toList();

    final bids = List.generate(5, (i) {
      double p = currentPrice - (i + 1) * (currentPrice * 0.0003);
      double size = 0.6 + rnd.nextDouble() * 4.2;
      return MapEntry(p, size);
    });

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF0C1017),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              const Icon(Icons.bar_chart, color: Colors.grey, size: 16),
              const SizedBox(width: 6),
              const Text("Order Book & Depth", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
              const Spacer(),
              Text("Spread: \$${(currentPrice * 0.00015).toStringAsFixed(1)}", style: const TextStyle(color: Colors.grey, fontSize: 10, fontFamily: 'monospace')),
            ],
          ),
          const SizedBox(height: 8),

          // Asks (Red)
          for (final ask in asks) ...[
            _buildRow(ask.key, ask.value, false),
          ],

          // Current Price Bar
          Container(
            margin: const EdgeInsets.symmetric(vertical: 6),
            padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text("\$${currentPrice.toStringAsFixed(2)}", style: const TextStyle(color: Color(0xFF38BDF8), fontWeight: FontWeight.bold, fontSize: 12, fontFamily: 'monospace')),
                const Text("LIVE TICKER", style: TextStyle(color: Colors.grey, fontSize: 9, fontWeight: FontWeight.bold)),
              ],
            ),
          ),

          // Bids (Green)
          for (final bid in bids) ...[
            _buildRow(bid.key, bid.value, true),
          ],
        ],
      ),
    );
  }

  Widget _buildRow(double price, double size, bool isBid) {
    double barPct = min(1.0, size / 5.0);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Stack(
        children: [
          Align(
            alignment: isBid ? Alignment.centerLeft : Alignment.centerRight,
            child: Container(
              height: 16,
              width: 120 * barPct,
              decoration: BoxDecoration(
                color: (isBid ? const Color(0xFF10B981) : const Color(0xFFF43F5E)).withOpacity(0.15),
                borderRadius: BorderRadius.circular(3),
              ),
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "\$${price.toStringAsFixed(2)}",
                style: TextStyle(
                  color: isBid ? const Color(0xFF10B981) : const Color(0xFFF43F5E),
                  fontSize: 11,
                  fontFamily: 'monospace',
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                size.toStringAsFixed(3),
                style: const TextStyle(color: Colors.white70, fontSize: 11, fontFamily: 'monospace'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
