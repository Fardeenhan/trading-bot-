import 'package:flutter/material.dart';
import '../models/market_data.dart';

class SignalPanelWidget extends StatelessWidget {
  final TradingSignal? signal;
  final bool alertsEnabled;
  final VoidCallback onToggleAlerts;

  const SignalPanelWidget({
    super.key,
    required this.signal,
    required this.alertsEnabled,
    required this.onToggleAlerts,
  });

  @override
  Widget build(BuildContext context) {
    if (signal == null) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF0C1017),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFF1E293B)),
        ),
        child: const Center(
          child: Text("Initializing Zero-Kachra Scanner...", style: TextStyle(color: Colors.grey)),
        ),
      );
    }

    final sig = signal!;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // 1. Anti-Trap / Zero-Kachra Header Banner
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF064E3B), Color(0xFF0F172A), Color(0xFF134E4A)],
            ),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFF10B981).withOpacity(0.5)),
          ),
          child: Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.shield_outlined, color: Color(0xFF10B981), size: 18),
              ),
              const SizedBox(width: 10),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "Zero-Kachra & Anti-Trap Algorithm",
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                    Text(
                      "Sirf 100% Sure-Shot signals milenge. Bull/Bear traps strictly blocked.",
                      style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                    ),
                  ],
                ),
              ),
              // Alert Button
              InkWell(
                onTap: onToggleAlerts,
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: alertsEnabled ? const Color(0xFFF59E0B) : const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        alertsEnabled ? Icons.notifications_active : Icons.notifications_none,
                        color: alertsEnabled ? Colors.black : Colors.white70,
                        size: 15,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        alertsEnabled ? "Alerts ON 🔔" : "Enable Alerts",
                        style: TextStyle(
                          color: alertsEnabled ? Colors.black : Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),

        // 2. Main Signal Banner (STRONG BUY / STRONG SELL or ANTI-TRAP SHIELD)
        if (sig.isTrap || sig.isNeutral) ...[
          _buildAntiTrapCard(context, sig),
        ] else ...[
          _buildStrongSignalCard(context, sig),
        ],

        const SizedBox(height: 12),

        // 3. 5/5 Institutional Confluence Checklist
        _buildChecklist(context, sig),
      ],
    );
  }

  Widget _buildStrongSignalCard(BuildContext context, TradingSignal sig) {
    bool isBuy = sig.isBuy;
    Color primaryColor = isBuy ? const Color(0xFF10B981) : const Color(0xFFF43F5E);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0C1017),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: primaryColor, width: 2),
        boxShadow: [
          BoxShadow(
            color: primaryColor.withOpacity(0.2),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: primaryColor,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  children: [
                    Icon(isBuy ? Icons.trending_up : Icons.trending_down, color: isBuy ? Colors.black : Colors.white, size: 16),
                    const SizedBox(width: 6),
                    Text(
                      isBuy ? "STRONG BUY" : "STRONG SELL",
                      style: TextStyle(
                        color: isBuy ? Colors.black : Colors.white,
                        fontWeight: FontWeight.w900,
                        fontSize: 13,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  sig.timeframe.toUpperCase(),
                  style: const TextStyle(color: Colors.white70, fontSize: 11, fontFamily: 'monospace'),
                ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF10B981).withOpacity(0.5)),
                ),
                child: Text(
                  isBuy ? "100% UPWARD MOVE" : "100% DOWNWARD DUMP",
                  style: const TextStyle(color: Color(0xFF34D399), fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Price targets grid
          Row(
            children: [
              Expanded(child: _buildPriceBox("ENTRY", "\$${sig.price.toStringAsFixed(1)}", const Color(0xFF38BDF8))),
              const SizedBox(width: 8),
              Expanded(child: _buildPriceBox("TARGET 1", "\$${sig.tp1.toStringAsFixed(1)}", const Color(0xFF10B981))),
              const SizedBox(width: 8),
              Expanded(child: _buildPriceBox("TARGET 2", "\$${sig.tp2.toStringAsFixed(1)}", const Color(0xFF34D399))),
              const SizedBox(width: 8),
              Expanded(child: _buildPriceBox("STOP LOSS", "\$${sig.sl.toStringAsFixed(1)}", const Color(0xFFF43F5E))),
            ],
          ),
          const SizedBox(height: 12),

          // Zero Loss Rule Box
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF022C22),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFF059669).withOpacity(0.5)),
            ),
            child: Row(
              children: [
                const Icon(Icons.check_circle_outline, color: Color(0xFF34D399), size: 16),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    "Zero-Loss Rule: Jaise hi Target 1 (\$${sig.tp1.toStringAsFixed(1)}) hit ho, Stop Loss ko Entry (\$${sig.price.toStringAsFixed(1)}) par shift karein. Loss = \$0!",
                    style: const TextStyle(color: Color(0xFFD1FAE5), fontSize: 11, fontWeight: FontWeight.w500),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),

          // Hindi Audio Voice Guide Button
          OutlinedButton.icon(
            onPressed: () => _showHindiDialog(context, sig),
            icon: const Icon(Icons.volume_up, color: Color(0xFFF59E0B), size: 16),
            label: const Text("Hindi Audio Voice Guidance (Trade Samajhein)", style: TextStyle(color: Color(0xFFF59E0B), fontSize: 12, fontWeight: FontWeight.bold)),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Color(0xFFF59E0B)),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAntiTrapCard(BuildContext context, TradingSignal sig) {
    bool isBullTrap = sig.trapStatus == TrapStatus.bullTrapDetected;
    bool isBearTrap = sig.trapStatus == TrapStatus.bearTrapDetected;
    Color alertColor = isBullTrap ? const Color(0xFFF43F5E) : isBearTrap ? const Color(0xFF14B8A6) : const Color(0xFFF59E0B);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0C1017),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: alertColor.withOpacity(0.8), width: 1.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: alertColor.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: alertColor),
                ),
                child: Row(
                  children: [
                    Icon(Icons.warning_amber_rounded, color: alertColor, size: 16),
                    const SizedBox(width: 4),
                    Text(
                      isBullTrap
                          ? "⚠️ BULL TRAP DETECTED!"
                          : isBearTrap
                          ? "⚠️ BEAR TRAP DETECTED!"
                          : "ZERO-KACHRA: CONSOLIDATION",
                      style: TextStyle(color: alertColor, fontWeight: FontWeight.w900, fontSize: 12),
                    ),
                  ],
                ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text("Capital Saved: 100%", style: TextStyle(color: Color(0xFFF59E0B), fontSize: 11, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            sig.trapWarning ?? "Bhai market me choppy movement hai. 100% setup confirm hone tak no trade!",
            style: const TextStyle(color: Colors.white, fontSize: 12.5, height: 1.4),
          ),
          if (sig.retailMistake != null) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B).withOpacity(0.6),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Retail Mistake: ${sig.retailMistake}", style: const TextStyle(color: Color(0xFFFDA4AF), fontSize: 11)),
                  const SizedBox(height: 4),
                  Text("Smart Money Action: ${sig.institutionalAction}", style: const TextStyle(color: Color(0xFF6EE7B7), fontSize: 11)),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildChecklist(BuildContext context, TradingSignal sig) {
    int passedCount = sig.checks.where((c) => c.passed).length;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF0C1017),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.checklist_rtl, color: Color(0xFF38BDF8), size: 18),
              const SizedBox(width: 8),
              Text(
                "5/5 Institutional Confluence Checklist ($passedCount/5 Met)",
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12.5),
              ),
            ],
          ),
          const SizedBox(height: 10),
          for (final check in sig.checks) ...[
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                children: [
                  Icon(
                    check.passed ? Icons.check_circle : Icons.radio_button_unchecked,
                    color: check.passed ? const Color(0xFF10B981) : Colors.grey[600],
                    size: 16,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      "${check.name}: ${check.note}",
                      style: TextStyle(
                        color: check.passed ? Colors.white : Colors.grey[400],
                        fontSize: 11.5,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildPriceBox(String title, String val, Color col) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 6),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B).withOpacity(0.5),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          Text(title, style: TextStyle(color: Colors.grey[400], fontSize: 9, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(val, style: TextStyle(color: col, fontSize: 11, fontWeight: FontWeight.w900, fontFamily: 'monospace')),
        ],
      ),
    );
  }

  void _showHindiDialog(BuildContext context, TradingSignal sig) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF0C1017),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: const BorderSide(color: Color(0xFF1E293B))),
        title: Row(
          children: [
            const Icon(Icons.record_voice_over, color: Color(0xFFF59E0B)),
            const SizedBox(width: 8),
            Text(
              sig.isBuy ? "Fardeen Voice: STRONG BUY Trade" : "Fardeen Voice: STRONG SELL Trade",
              style: const TextStyle(color: Colors.white, fontSize: 15),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              sig.isBuy
                  ? "Bhai, ${sig.symbol} me 100% STRONG BUY setup ban chuka hai! SuperTrend green hai aur price EMA 20 ke upar hai. Koi trap nahi hai."
                  : "Bhai, ${sig.symbol} me 100% STRONG SELL setup ban chuka hai! SuperTrend red hai aur sellers dominant hain. Falling knife trap se bach gaye hain.",
              style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.5),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: const Color(0xFF022C22), borderRadius: BorderRadius.circular(8)),
              child: Text(
                "Entry: \$${sig.price.toStringAsFixed(1)} | TP1: \$${sig.tp1.toStringAsFixed(1)} | Stop Loss: \$${sig.sl.toStringAsFixed(1)}. Target 1 hit hote hi Stop Loss ko entry par shift karein!",
                style: const TextStyle(color: Color(0xFF6EE7B7), fontSize: 11.5),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text("Samajh Gaya (Done)", style: TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
