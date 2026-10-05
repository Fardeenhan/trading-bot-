import 'package:flutter/material.dart';
import '../models/market_data.dart';
import '../services/trading_engine.dart';
import '../widgets/trading_chart.dart';
import '../widgets/signal_panel.dart';
import '../widgets/order_book.dart';
import '../widgets/watchlist_bar.dart';

class TradingDashboardScreen extends StatefulWidget {
  const TradingDashboardScreen({super.key});

  @override
  State<TradingDashboardScreen> createState() => _TradingDashboardScreenState();
}

class _TradingDashboardScreenState extends State<TradingDashboardScreen> {
  final TradingEngine _engine = TradingEngine();
  bool _alertsEnabled = true;

  @override
  void initState() {
    super.initState();
    _engine.init();
  }

  @override
  void dispose() {
    _engine.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF07090E),
      appBar: _buildAppBar(),
      body: StreamBuilder<List<Candle>>(
        stream: _engine.candlesStream,
        initialData: _engine.currentCandles,
        builder: (context, candleSnapshot) {
          final candles = candleSnapshot.data ?? [];
          return StreamBuilder<TradingSignal>(
            stream: _engine.signalStream,
            initialData: _engine.currentSignal,
            builder: (context, signalSnapshot) {
              final signal = signalSnapshot.data;

              return LayoutBuilder(
                builder: (context, constraints) {
                  bool isWide = constraints.maxWidth >= 960;

                  return SingleChildScrollView(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Watchlist Bar
                        WatchlistBarWidget(
                          activeSymbol: _engine.currentSymbol,
                          onSelectSymbol: (sym) {
                            setState(() => _engine.switchSymbol(sym));
                          },
                        ),
                        const SizedBox(height: 12),

                        // Timeframe Switcher
                        _buildTimeframeBar(),
                        const SizedBox(height: 12),

                        // Responsive Main Layout: PC Wide (2 Columns) or Mobile (1 Column)
                        if (isWide) ...[
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Left: Candlestick Chart (60%) + Order Book
                              Expanded(
                                flex: 6,
                                child: Column(
                                  children: [
                                    SizedBox(
                                      height: 520,
                                      child: TradingChartWidget(candles: candles, signal: signal),
                                    ),
                                    const SizedBox(height: 12),
                                    OrderBookWidget(currentPrice: candles.isNotEmpty ? candles.last.close : 67000),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 12),

                              // Right: Signal Panel & Anti-Trap Defense (40%)
                              Expanded(
                                flex: 4,
                                child: SignalPanelWidget(
                                  signal: signal,
                                  alertsEnabled: _alertsEnabled,
                                  onToggleAlerts: () {
                                    setState(() => _alertsEnabled = !_alertsEnabled);
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text(_alertsEnabled ? "🔔 Push Alerts Active! 100% Sure-Shot notification aayegi." : "🔕 Alerts Muted."),
                                        backgroundColor: const Color(0xFF0F172A),
                                        duration: const Duration(seconds: 2),
                                      ),
                                    );
                                  },
                                ),
                              ),
                            ],
                          ),
                        ] else ...[
                          // Mobile Layout (Stacked)
                          SizedBox(
                            height: 380,
                            child: TradingChartWidget(candles: candles, signal: signal),
                          ),
                          const SizedBox(height: 12),
                          SignalPanelWidget(
                            signal: signal,
                            alertsEnabled: _alertsEnabled,
                            onToggleAlerts: () {
                              setState(() => _alertsEnabled = !_alertsEnabled);
                            },
                          ),
                          const SizedBox(height: 12),
                          OrderBookWidget(currentPrice: candles.isNotEmpty ? candles.last.close : 67000),
                        ],
                      ],
                    ),
                  );
                },
              );
            },
          );
        },
      ),
    );
  }

  AppBar _buildAppBar() {
    return AppBar(
      backgroundColor: const Color(0xFF0C1017),
      elevation: 0,
      title: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: const Color(0xFF10B981).withOpacity(0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.show_chart, color: Color(0xFF10B981), size: 20),
          ),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Text(
                    "FARDEEN TRADING",
                    style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15, letterSpacing: 0.5),
                  ),
                  const SizedBox(width: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                    decoration: BoxDecoration(color: const Color(0xFF10B981), borderRadius: BorderRadius.circular(4)),
                    child: const Text("FLUTTER PRO", style: TextStyle(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 9)),
                  ),
                ],
              ),
              const Text("Pure Research & Anti-Trap Algorithm", style: TextStyle(color: Colors.grey, fontSize: 10.5)),
            ],
          ),
        ],
      ),
      actions: [
        Container(
          margin: const EdgeInsets.only(right: 12),
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: const Color(0xFF10B981).withOpacity(0.4)),
          ),
          child: const Row(
            children: [
              Icon(Icons.circle, color: Color(0xFF10B981), size: 8),
              SizedBox(width: 6),
              Text("LIVE MARKET", style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTimeframeBar() {
    final tfs = ["1m", "5m", "15m", "1h", "4h"];
    return Row(
      children: tfs.map((tf) {
        bool isSel = tf == _engine.currentTimeframe;
        return Padding(
          padding: const EdgeInsets.only(right: 8),
          child: InkWell(
            onTap: () {
              setState(() => _engine.switchTimeframe(tf));
            },
            borderRadius: BorderRadius.circular(8),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              decoration: BoxDecoration(
                color: isSel ? const Color(0xFF10B981) : const Color(0xFF0C1017),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: isSel ? const Color(0xFF10B981) : const Color(0xFF1E293B)),
              ),
              child: Text(
                tf.toUpperCase(),
                style: TextStyle(
                  color: isSel ? Colors.black : Colors.grey[400],
                  fontWeight: FontWeight.w900,
                  fontSize: 11,
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}
