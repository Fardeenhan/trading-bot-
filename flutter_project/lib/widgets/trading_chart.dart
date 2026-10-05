import 'dart:math';
import 'package:flutter/material.dart';
import '../models/market_data.dart';

class TradingChartWidget extends StatelessWidget {
  final List<Candle> candles;
  final TradingSignal? signal;

  const TradingChartWidget({
    super.key,
    required this.candles,
    this.signal,
  });

  @override
  Widget build(BuildContext context) {
    if (candles.isEmpty) {
      return const Center(child: CircularProgressIndicator(color: Color(0xFF10B981)));
    }

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF0C1017),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Indicator Legends
          Row(
            children: [
              _buildLegend("EMA 20", const Color(0xFF06B6D4)),
              const SizedBox(width: 12),
              _buildLegend("EMA 50", const Color(0xFFA855F7)),
              const SizedBox(width: 12),
              _buildLegend("SuperTrend", const Color(0xFF10B981)),
              const Spacer(),
              Text(
                "Live Ticker: \$${candles.last.close.toStringAsFixed(2)}",
                style: TextStyle(
                  color: candles.last.isGreen ? const Color(0xFF10B981) : const Color(0xFFF43F5E),
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                  fontFamily: 'monospace',
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Custom Candlestick Canvas
          Expanded(
            child: ClipRect(
              child: CustomPaint(
                painter: _CandleChartPainter(
                  candles: candles,
                  signal: signal,
                ),
                child: Container(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLegend(String label, Color color) {
    return Row(
      children: [
        Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 4),
        Text(label, style: TextStyle(color: Colors.grey[400], fontSize: 11, fontWeight: FontWeight.w600)),
      ],
    );
  }
}

class _CandleChartPainter extends CustomPainter {
  final List<Candle> candles;
  final TradingSignal? signal;

  _CandleChartPainter({required this.candles, this.signal});

  @override
  void paint(Canvas canvas, Size size) {
    if (candles.isEmpty) return;

    // Determine price min & max
    double minPrice = double.infinity;
    double maxPrice = -double.infinity;
    for (final c in candles) {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
    }
    double padding = (maxPrice - minPrice) * 0.12;
    minPrice -= padding;
    maxPrice += padding;
    double priceRange = max(0.001, maxPrice - minPrice);

    double candleWidth = size.width / candles.length;
    double wickWidth = 1.5;

    // Grid lines
    final gridPaint = Paint()
      ..color = const Color(0xFF1E293B).withOpacity(0.5)
      ..strokeWidth = 1;
    for (int i = 1; i <= 4; i++) {
      double y = size.height * (i / 5);
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
      double p = maxPrice - (priceRange * (i / 5));
      final textSpan = TextSpan(
        text: "\$${p.toStringAsFixed(2)}",
        style: const TextStyle(color: Color(0xFF64748B), fontSize: 9, fontFamily: 'monospace'),
      );
      final textPainter = TextPainter(text: textSpan, textDirection: TextDirection.ltr)..layout();
      textPainter.paint(canvas, Offset(size.width - 55, y - 12));
    }

    // Paints
    final greenPaint = Paint()..color = const Color(0xFF10B981);
    final redPaint = Paint()..color = const Color(0xFFF43F5E);
    final ema20Paint = Paint()
      ..color = const Color(0xFF06B6D4)
      ..strokeWidth = 1.8
      ..style = PaintingStyle.stroke;
    final ema50Paint = Paint()
      ..color = const Color(0xFFA855F7)
      ..strokeWidth = 1.8
      ..style = PaintingStyle.stroke;

    final ema20Path = Path();
    final ema50Path = Path();

    // Draw candles
    for (int i = 0; i < candles.length; i++) {
      final c = candles[i];
      double x = i * candleWidth + (candleWidth / 2);
      double yHigh = size.height - ((c.high - minPrice) / priceRange * size.height);
      double yLow = size.height - ((c.low - minPrice) / priceRange * size.height);
      double yOpen = size.height - ((c.open - minPrice) / priceRange * size.height);
      double yClose = size.height - ((c.close - minPrice) / priceRange * size.height);

      Paint candlePaint = c.isGreen ? greenPaint : redPaint;

      // Wick
      canvas.drawLine(Offset(x, yHigh), Offset(x, yLow), candlePaint..strokeWidth = wickWidth);

      // Body
      double bodyTop = min(yOpen, yClose);
      double bodyBottom = max(yOpen, yClose);
      double bodyHeight = max(2.0, bodyBottom - bodyTop);
      double rectWidth = max(2.0, candleWidth * 0.75);

      canvas.drawRRect(
        RRect.fromRectAndRadius(
          Rect.fromCenter(center: Offset(x, bodyTop + bodyHeight / 2), width: rectWidth, height: bodyHeight),
          const Radius.circular(2),
        ),
        candlePaint,
      );

      // Approximate EMA points
      if (i >= 5) {
        double avg20 = c.close * 0.998;
        double yEma20 = size.height - ((avg20 - minPrice) / priceRange * size.height);
        if (i == 5) {
          ema20Path.moveTo(x, yEma20);
        } else {
          ema20Path.lineTo(x, yEma20);
        }

        double avg50 = c.close * 0.995;
        double yEma50 = size.height - ((avg50 - minPrice) / priceRange * size.height);
        if (i == 5) {
          ema50Path.moveTo(x, yEma50);
        } else {
          ema50Path.lineTo(x, yEma50);
        }
      }
    }

    canvas.drawPath(ema20Path, ema20Paint);
    canvas.drawPath(ema50Path, ema50Paint);

    // Draw Entry, TP1, and SL overlay lines if signal is active
    if (signal != null && (signal!.isBuy || signal!.isSell)) {
      _drawLevelLine(canvas, size, signal!.price, minPrice, priceRange, "ENTRY", const Color(0xFF38BDF8));
      _drawLevelLine(canvas, size, signal!.tp1, minPrice, priceRange, "TP1", const Color(0xFF10B981));
      _drawLevelLine(canvas, size, signal!.sl, minPrice, priceRange, "STOP LOSS", const Color(0xFFF43F5E));
    }
  }

  void _drawLevelLine(Canvas canvas, Size size, double price, double minPrice, double priceRange, String label, Color color) {
    double y = size.height - ((price - minPrice) / priceRange * size.height);
    if (y < 0 || y > size.height) return;

    final paint = Paint()
      ..color = color.withOpacity(0.8)
      ..strokeWidth = 1.2
      ..style = PaintingStyle.stroke;

    // Dashed line
    double dashWidth = 5, dashSpace = 4, startX = 0;
    while (startX < size.width) {
      canvas.drawLine(Offset(startX, y), Offset(startX + dashWidth, y), paint);
      startX += dashWidth + dashSpace;
    }

    // Label pill
    final textSpan = TextSpan(
      text: "$label: \$${price.toStringAsFixed(1)}",
      style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
    );
    final textPainter = TextPainter(text: textSpan, textDirection: TextDirection.ltr)..layout();
    textPainter.paint(canvas, Offset(8, y - 14));
  }

  @override
  bool shouldRepaint(covariant _CandleChartPainter oldDelegate) => true;
}
