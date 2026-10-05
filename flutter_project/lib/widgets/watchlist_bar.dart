import 'package:flutter/material.dart';

class WatchlistBarWidget extends StatelessWidget {
  final String activeSymbol;
  final Function(String) onSelectSymbol;

  const WatchlistBarWidget({
    super.key,
    required this.activeSymbol,
    required this.onSelectSymbol,
  });

  static const symbols = [
    {"name": "BTC/USDT", "price": "\$67,420", "change": "+2.4%"},
    {"name": "ETH/USDT", "price": "\$3,520", "change": "+1.8%"},
    {"name": "SOL/USDT", "price": "\$178.5", "change": "+4.2%"},
    {"name": "BNB/USDT", "price": "\$585.0", "change": "-0.5%"},
    {"name": "XRP/USDT", "price": "\$0.585", "change": "+1.2%"},
  ];

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: symbols.map((item) {
          bool isSelected = item["name"] == activeSymbol;
          bool isPositive = item["change"]!.startsWith("+");

          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: InkWell(
              onTap: () => onSelectSymbol(item["name"]!),
              borderRadius: BorderRadius.circular(10),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: isSelected ? const Color(0xFF1E293B) : const Color(0xFF0C1017),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: isSelected ? const Color(0xFF10B981) : const Color(0xFF1E293B),
                    width: isSelected ? 1.5 : 1,
                  ),
                ),
                child: Row(
                  children: [
                    Text(
                      item["name"]!,
                      style: TextStyle(
                        color: isSelected ? Colors.white : Colors.grey[400],
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      item["price"]!,
                      style: const TextStyle(color: Colors.white, fontSize: 11, fontFamily: 'monospace'),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      item["change"]!,
                      style: TextStyle(
                        color: isPositive ? const Color(0xFF10B981) : const Color(0xFFF43F5E),
                        fontSize: 10.5,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}
