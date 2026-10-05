import 'dart:math';

class Candle {
  final DateTime time;
  final double open;
  final double high;
  final double low;
  final double close;
  final double volume;

  const Candle({
    required this.time,
    required this.open,
    required this.high,
    required this.low,
    required this.close,
    required this.volume,
  });

  bool get isGreen => close >= open;
  double get range => max(0.0001, high - low);
  double get upperWick => high - max(open, close);
  double get lowerWick => min(open, close) - low;
  double get body => (close - open).abs();
  double get upperWickRatio => upperWick / range;
  double get lowerWickRatio => lowerWick / range;
  double get bodyRatio => body / range;
}

enum SignalType { strongBuy, strongSell, neutral }

enum TrapStatus { safe, bullTrapDetected, bearTrapDetected, chopTrap }

class ConfluenceCheck {
  final String name;
  final bool passed;
  final String note;

  const ConfluenceCheck({
    required this.name,
    required this.passed,
    required this.note,
  });
}

class TradingSignal {
  final String id;
  final String symbol;
  final String timeframe;
  final SignalType type;
  final double price;
  final double tp1;
  final double tp2;
  final double sl;
  final double zeroLossBreakeven;
  final int confidence;
  final bool isSureShot;
  final TrapStatus trapStatus;
  final String? trapWarning;
  final String? trapName;
  final String? retailMistake;
  final String? institutionalAction;
  final List<String> reasons;
  final List<ConfluenceCheck> checks;
  final DateTime timestamp;

  const TradingSignal({
    required this.id,
    required this.symbol,
    required this.timeframe,
    required this.type,
    required this.price,
    required this.tp1,
    required this.tp2,
    required this.sl,
    required this.zeroLossBreakeven,
    required this.confidence,
    required this.isSureShot,
    required this.trapStatus,
    this.trapWarning,
    this.trapName,
    this.retailMistake,
    this.institutionalAction,
    required this.reasons,
    required this.checks,
    required this.timestamp,
  });

  bool get isBuy => type == SignalType.strongBuy;
  bool get isSell => type == SignalType.strongSell;
  bool get isNeutral => type == SignalType.neutral;
  bool get isTrap => trapStatus == TrapStatus.bullTrapDetected || trapStatus == TrapStatus.bearTrapDetected;
}
