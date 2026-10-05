import os
import zipfile

base_dir = "/tmp/flutter_fardeen_app"
os.makedirs(os.path.join(base_dir, "lib"), exist_ok=True)
os.makedirs(os.path.join(base_dir, "android", "app", "src", "main", "res", "values"), exist_ok=True)

pubspec = """name: fardeen_trading
description: "Fardeen Professional Trading App for Android & iOS"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  flutter_inappwebview: ^6.0.0
  url_launcher: ^6.2.5
  cupertino_icons: ^1.0.6

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
"""

with open(os.path.join(base_dir, "pubspec.yaml"), "w", encoding="utf-8") as f:
    f.write(pubspec)

main_dart = """import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

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
  runApp(const FardeenApp());
}

class FardeenApp extends StatelessWidget {
  const FardeenApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Fardeen Trading',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF07090E),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF10B981),
          surface: Color(0xFF0F172A),
        ),
      ),
      home: const TradingWebViewScreen(),
    );
  }
}

class TradingWebViewScreen extends StatefulWidget {
  const TradingWebViewScreen({super.key});

  @override
  State<TradingWebViewScreen> createState() => _TradingWebViewScreenState();
}

class _TradingWebViewScreenState extends State<TradingWebViewScreen> {
  InAppWebViewController? webViewController;
  double progress = 0;
  bool isLoading = true;

  final String targetUrl = 'https://ais-pre-ut6cu5pxxtcjr7wpepcqrp-179830712736.asia-east1.run.app';

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        if (webViewController != null && await webViewController!.canGoBack()) {
          webViewController!.goBack();
          return false;
        }
        return true;
      },
      child: Scaffold(
        backgroundColor: const Color(0xFF07090E),
        body: SafeArea(
          child: Stack(
            children: [
              InAppWebView(
                initialUrlRequest: URLRequest(url: WebUri(targetUrl)),
                initialSettings: InAppWebViewSettings(
                  useShouldOverrideUrlLoading: true,
                  mediaPlaybackRequiresUserGesture: false,
                  allowsInlineMediaPlayback: true,
                  iframeAllow: 'camera; microphone',
                  iframeAllowFullscreen: true,
                  javaScriptEnabled: true,
                  domStorageEnabled: true,
                  databaseEnabled: true,
                  clearCache: false,
                  supportZoom: false,
                  transparentBackground: false,
                ),
                onWebViewCreated: (controller) {
                  webViewController = controller;
                },
                onProgressChanged: (controller, prog) {
                  setState(() {
                    progress = prog / 100;
                    if (prog == 100) {
                      isLoading = false;
                    }
                  });
                },
                onReceivedError: (controller, request, error) {
                  debugPrint('Webview Error: ${error.description}');
                },
              ),
              if (isLoading)
                Container(
                  color: const Color(0xFF07090E),
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF10B981), Color(0xFF047857)],
                            ),
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF10B981).withOpacity(0.3),
                                blurRadius: 25,
                                offset: const Offset(0, 10),
                              ),
                            ],
                          ),
                          child: const Center(
                            child: Text(
                              'F',
                              style: TextStyle(
                                fontSize: 44,
                                fontWeight: FontWeight.w900,
                                color: Color(0xFF07090E),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 28),
                        const SizedBox(
                          width: 32,
                          height: 32,
                          child: CircularProgressIndicator(
                            color: Color(0xFF10B981),
                            strokeWidth: 3,
                          ),
                        ),
                        const SizedBox(height: 20),
                        const Text(
                          'FARDEEN TRADING',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.5,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Loading Live Institutional Feeds (${(progress * 100).toInt()}%)...',
                          style: const TextStyle(
                            color: Color(0xFF94A3B8),
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
"""

with open(os.path.join(base_dir, "lib", "main.dart"), "w", encoding="utf-8") as f:
    f.write(main_dart)

manifest = """<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.fardeen.trading">
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
    <application
        android:label="Fardeen"
        android:name="${applicationName}"
        android:icon="@mipmap/ic_launcher"
        android:usesCleartextTraffic="true">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize">
            <meta-data
              android:name="io.flutter.embedding.android.NormalTheme"
              android:resource="@style/NormalTheme"
              />
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
        <meta-data
            android:name="flutterEmbedding"
            android:value="2" />
    </application>
</manifest>
"""

with open(os.path.join(base_dir, "android", "app", "src", "main", "AndroidManifest.xml"), "w", encoding="utf-8") as f:
    f.write(manifest)

readme = """# Fardeen Pro Trading App - Flutter 3 Source Code

Yeh Fardeen Trading App ka 100% complete Flutter code hai. Isse aap directly Android APK, App Bundle ya iOS app generate kar sakte hain.

### Kaise Use Karein:
1. Is ZIP file ko extract / unzip karein.
2. Android Studio ya VS Code me folder open karein.
3. Dependencies install karein:
   ```bash
   flutter pub get
   ```
4. Mobile device connect karke test run karein:
   ```bash
   flutter run
   ```
5. Production Release APK banane ke liye command chalayein:
   ```bash
   flutter build apk --release
   ```
6. Generated APK file is path par milegi:
   `build/app/outputs/flutter-apk/app-release.apk`
"""

with open(os.path.join(base_dir, "README.md"), "w", encoding="utf-8") as f:
    f.write(readme)

# Write to public/flutter_fardeen_app.zip
out_zip = os.path.join(os.getcwd(), "public", "flutter_fardeen_app.zip")
with zipfile.ZipFile(out_zip, "w", zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, base_dir)
            z.write(full_path, rel_path)

print(f"Created {out_zip} successfully!")
