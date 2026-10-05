import os
import sys
import zipfile
import hashlib
import base64
import struct
import subprocess
import shutil

def main():
    print("=== Rebuilding Standalone APK with Offline React Engine ===")
    work_dir = "/tmp/apk_work"
    if os.path.exists(work_dir):
        shutil.rmtree(work_dir)
    os.makedirs(work_dir)

    apk_src = "public/Fardeen-Pro.apk"
    if not os.path.exists(apk_src):
        print(f"Error: {apk_src} not found!")
        sys.exit(1)

    # 1. Extract all files except META-INF
    with zipfile.ZipFile(apk_src, "r") as z:
        for item in z.infolist():
            if not item.filename.startswith("META-INF/"):
                z.extract(item, work_dir)

    print("Step 1: Extracted original APK files.")

    # 2. Patch targetSdkVersion in AndroidManifest.xml from 34 (0x22) to 29 (0x1D)
    manifest_path = os.path.join(work_dir, "AndroidManifest.xml")
    with open(manifest_path, "rb") as f:
        m_bytes = bytearray(f.read())

    # Check offset 5316
    if m_bytes[5316] == 34 and m_bytes[5317] == 0:
        m_bytes[5316] = 29
        print("Step 2: Patched AndroidManifest.xml targetSdkVersion at offset 5316 to 29 (Android 10 compatibility).")
    else:
        # Search for pattern
        pat = b"\x14\x00\x00\x00\xff\xff\xff\xff\x08\x00\x00\x10\x22\x00\x00\x00"
        pos = m_bytes.find(pat)
        if pos != -1:
            m_bytes[pos + 12] = 29
            print(f"Step 2: Patched targetSdkVersion pattern at {pos} to 29.")

    with open(manifest_path, "wb") as f:
        f.write(m_bytes)

    # 3. Update assets/settings.json to load local WebViewAssetLoader securely
    settings_path = os.path.join(work_dir, "assets", "settings.json")
    settings_json = '''{
  "sites": [
    {
      "url": "https://appassets.androidplatform.net/assets/web/index.html",
      "title": "Fardeen Trading Pro"
    }
  ],
  "other": "https://appassets.androidplatform.net/assets/web/index.html",
  "match": [
    ["host", "contains", "androidplatform.net"],
    ["host", "contains", "binance.com"],
    ["host", "contains", "run.app"]
  ],
  "skip": [],
  "remote_debug": true,
  "console_log": true,
  "js_interface": true,
  "context_menu": false,
  "not_matching": false,
  "local_sites": true,
  "update_zip": "",
  "web_settings": {
    "JavaScriptEnabled": true,
    "DomStorageEnabled": true,
    "AllowFileAccess": true,
    "AllowContentAccess": true
  },
  "source": "assets",
  "timestamp": "2026-09-07T12:00:00Z"
}'''
    os.makedirs(os.path.dirname(settings_path), exist_ok=True)
    with open(settings_path, "w", encoding="utf-8") as f:
        f.write(settings_json)
    print("Step 3: Updated assets/settings.json.")

    # 4. Update assets/local/config.json
    local_config_path = os.path.join(work_dir, "assets", "local", "config.json")
    local_config_json = '''{
  "sites": {
    "web/index.html": "Fardeen Trading Pro",
    "demo/index.html": "Local Demo Site"
  },
  "bundles": [],
  "prefix": "https://appassets.androidplatform.net/assets/"
}'''
    os.makedirs(os.path.dirname(local_config_path), exist_ok=True)
    with open(local_config_path, "w", encoding="utf-8") as f:
        f.write(local_config_json)
    print("Step 4: Updated assets/local/config.json.")

    # 5. Place built React files into assets/web/ and fallback paths
    web_dir = os.path.join(work_dir, "assets", "web")
    web_assets_dir = os.path.join(web_dir, "assets")
    os.makedirs(web_assets_dir, exist_ok=True)

    css_files = [f for f in os.listdir("dist/assets") if f.endswith(".css")]
    js_files = [f for f in os.listdir("dist/assets") if f.endswith(".js")]
    if not css_files or not js_files:
        print("Error: Built assets in dist/assets missing!")
        sys.exit(1)

    css_file = css_files[0]
    js_file = js_files[0]

    # Copy to web/assets
    shutil.copy(os.path.join("dist/assets", css_file), os.path.join(web_assets_dir, css_file))
    shutil.copy(os.path.join("dist/assets", js_file), os.path.join(web_assets_dir, js_file))

    # Also copy to root assets/assets/ and assets/ for multi-path compatibility
    assets_assets_dir = os.path.join(work_dir, "assets", "assets")
    os.makedirs(assets_assets_dir, exist_ok=True)
    shutil.copy(os.path.join("dist/assets", css_file), os.path.join(assets_assets_dir, css_file))
    shutil.copy(os.path.join("dist/assets", js_file), os.path.join(assets_assets_dir, js_file))
    shutil.copy(os.path.join("dist/assets", css_file), os.path.join(work_dir, "assets", css_file))
    shutil.copy(os.path.join("dist/assets", js_file), os.path.join(work_dir, "assets", js_file))

    # Prepare web/index.html with relative paths
    with open("dist/index.html", "r", encoding="utf-8") as f:
        idx_content = f.read()

    idx_patched = idx_content.replace('src="/assets/', 'src="./assets/').replace('href="/assets/', 'href="./assets/')

    with open(os.path.join(web_dir, "index.html"), "w", encoding="utf-8") as f:
        f.write(idx_patched)

    with open(os.path.join(work_dir, "assets", "index.html"), "w", encoding="utf-8") as f:
        f.write(idx_patched)

    # Copy icons & manifest
    for icon in ["icon-192.png", "icon-512.png", "manifest.json", "icon.svg"]:
        pub_p = os.path.join("public", icon)
        if os.path.exists(pub_p):
            shutil.copy(pub_p, os.path.join(web_dir, icon))
            shutil.copy(pub_p, os.path.join(work_dir, "assets", icon))

    print("Step 5: Injected complete production React app into APK assets.")

    # 6. Gather all files in work_dir in sorted order to compute MANIFEST.MF
    all_files = []
    for root, dirs, files in os.walk(work_dir):
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, work_dir).replace("\\", "/")
            all_files.append((rel_path, full_path))

    all_files.sort(key=lambda x: x[0])

    manifest_lines = [
        "Manifest-Version: 1.0",
        "Created-By: 1.0 (Android)",
        ""
    ]
    manifest_entries = {}

    for rel_path, full_path in all_files:
        with open(full_path, "rb") as f:
            data = f.read()
        digest = base64.b64encode(hashlib.sha256(data).digest()).decode("ascii")
        entry_str = f"Name: {rel_path}\r\nSHA-256-Digest: {digest}\r\n\r\n"
        manifest_entries[rel_path] = (entry_str, digest)
        manifest_lines.append(f"Name: {rel_path}")
        manifest_lines.append(f"SHA-256-Digest: {digest}")
        manifest_lines.append("")

    manifest_content = "\r\n".join(manifest_lines) + "\r\n"
    manifest_bytes = manifest_content.encode("utf-8")
    manifest_digest = base64.b64encode(hashlib.sha256(manifest_bytes).digest()).decode("ascii")

    # 7. Generate FARDEEN.SF (Standard JAR Signature File, NO X-Android-APK-Signed to avoid v2 signature mismatch)
    sf_lines = [
        "Signature-Version: 1.0",
        "Created-By: 1.0 (Android)",
        f"SHA-256-Digest-Manifest: {manifest_digest}",
        ""
    ]

    for rel_path, (entry_str, _) in manifest_entries.items():
        entry_hash = base64.b64encode(hashlib.sha256(entry_str.encode("utf-8")).digest()).decode("ascii")
        sf_lines.append(f"Name: {rel_path}")
        sf_lines.append(f"SHA-256-Digest: {entry_hash}")
        sf_lines.append("")

    sf_content = "\r\n".join(sf_lines) + "\r\n"
    sf_bytes = sf_content.encode("utf-8")

    meta_dir = os.path.join(work_dir, "META-INF")
    os.makedirs(meta_dir, exist_ok=True)
    with open(os.path.join(meta_dir, "MANIFEST.MF"), "wb") as f:
        f.write(manifest_bytes)
    with open(os.path.join(meta_dir, "FARDEEN.SF"), "wb") as f:
        f.write(sf_bytes)

    # 8. Generate RSA Key & Cert with OpenSSL, then sign FARDEEN.SF -> FARDEEN.RSA
    key_pem = "/tmp/fardeen_key.pem"
    cert_pem = "/tmp/fardeen_cert.pem"
    rsa_path = os.path.join(meta_dir, "FARDEEN.RSA")

    if not os.path.exists(key_pem) or not os.path.exists(cert_pem):
        subprocess.run([
            "openssl", "req", "-x509", "-newkey", "rsa:2048",
            "-keyout", key_pem, "-out", cert_pem,
            "-days", "10000", "-nodes",
            "-subj", "/C=AE/ST=Dubai/L=Dubai/O=Fardeen/OU=Trading/CN=Fardeen"
        ], check=True)

    subprocess.run([
        "openssl", "smime", "-sign", "-in", os.path.join(meta_dir, "FARDEEN.SF"),
        "-inkey", key_pem, "-signer", cert_pem,
        "-outform", "DER", "-out", rsa_path,
        "-nodetach", "-binary"
    ], check=True)

    print("Step 6: Generated valid cryptographic JAR signatures (MANIFEST.MF, FARDEEN.SF, FARDEEN.RSA).")

    # 9. Pack everything into clean ZIP/APK
    out_apk = "/tmp/Fardeen-Pro-Final.apk"
    if os.path.exists(out_apk):
        os.remove(out_apk)

    with zipfile.ZipFile(out_apk, "w", compression=zipfile.ZIP_DEFLATED) as z_out:
        # First write META-INF entries
        for meta_f in ["MANIFEST.MF", "FARDEEN.SF", "FARDEEN.RSA"]:
            f_path = os.path.join(meta_dir, meta_f)
            z_out.write(f_path, f"META-INF/{meta_f}")

        # Write all other files
        for rel_path, full_path in all_files:
            # Don't store uncompressed if .dex, store deflated
            z_out.write(full_path, rel_path)

    final_size_mb = os.path.getsize(out_apk) / (1024 * 1024)
    print(f"Step 7: Successfully packaged clean signed APK ({final_size_mb:.2f} MB).")

    # Copy to destination paths in public and dist
    dest_names = [
        "Fardeen-Pro.apk",
        "fardeen.apk",
        "Fardeen-Trading.apk",
        "Fardeen-Boot.apk",
        "ApexTrade-Pro-v2.4.apk"
    ]
    for d in ["public", "dist"]:
        if os.path.exists(d):
            for name in dest_names:
                shutil.copy(out_apk, os.path.join(d, name))
                print(f"Copied to {d}/{name}")

    print("=== Standalone APK Rebuild Complete! ===")

if __name__ == "__main__":
    main()
