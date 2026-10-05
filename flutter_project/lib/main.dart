import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'screens/trading_dashboard.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF07090E),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  runApp(const FardeenTradingApp());
}

class FardeenTradingApp extends StatelessWidget {
  const FardeenTradingApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Fardeen Trading Pro',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF07090E),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF10B981),
          surface: Color(0xFF0C1017),
        ),
        fontFamily: 'Roboto',
      ),
      home: const TradingDashboardScreen(),
    );
  }
}
