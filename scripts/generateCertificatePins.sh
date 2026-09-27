#!/bin/bash
#
# generateCertificatePins.sh
#
# Prints the SSL certificate pins used for certificate pinning (see
# config/certificatePinning/pins.json). Every pin is a ROOT CA SPKI hash.
#
# WHY ROOTS: leaves are re-keyed on every renewal and every CA in play issues
# from a rotating pool of intermediates - both have already broken
# leaf/intermediate pins in production (the 2026-07-07 Let's Encrypt -> GTS
# edge rotation on Cloudflare, and the 2026-07 Amazon M01 -> M04 intermediate
# rotation on CloudFront). The CA roots are the only durable pin target.
#
# A TLS server never sends its root certificate, so pins can NOT be derived
# from a live handshake. Instead, this script downloads the root certificates
# from the Mozilla CA bundle (via curl.se) into a gitignored cache
# (config/certificatePinning/roots/) and verifies each one against the
# SHA-256 certificate fingerprints committed in ROOT_MANIFEST below. The
# fingerprints - not the downloaded bytes - are the source of trust: a
# tampered or wrong download fails loudly. Use --verify to confirm each
# pinned domain's live chain actually builds up to one of its pinned roots.
#
# Usage:
#   ./scripts/generateCertificatePins.sh            # print the root pins per group and per domain
#   ./scripts/generateCertificatePins.sh --android  # also print the network_security_config <pin-set> blocks
#   ./scripts/generateCertificatePins.sh --verify   # also check each live chain anchors at a pinned root
#                                                   # (exits 1 if any host FAILs or is UNREACHABLE)
#   ./scripts/generateCertificatePins.sh --refresh  # force re-download of the cached roots; a cached
#                                                   # root the bundle no longer carries is removed
#
#   ROOTS_BUNDLE=/path/to/bundle.pem ./scripts/generateCertificatePins.sh
#       Use a local CA bundle instead of downloading (offline/CI use). The
#       fingerprint verification still applies.
#   ROOTS_DIR=/path/to/cache ./scripts/generateCertificatePins.sh
#       Use a different root cache directory (default:
#       config/certificatePinning/roots/). The regression tests point this at
#       a temp dir.
#
# Regression tests: tests/unit/generateCertificatePinsTest.ts covers clean
# generation, --refresh, unreachable hosts under --verify, and pins.json
# staying in sync with the manifest.
#
# After running, sync the values into:
#   - config/certificatePinning/pins.json                (canonical source of truth)
#   - android/app/src/main/res/xml/network_security_config_enforce.xml
#   - android/app/src/main/java/com/expensify/chat/CertificatePinning.kt
#   - ios/CertificatePinning.swift
#   - patches/react-native-nitro-fetch/react-native-nitro-fetch+1.6.2+001+certificate-pinning.patch
#   - Mobile-Expensify/Android/res/xml/network_security_config_enforce.xml
#   - Mobile-Expensify/Android/src/yapl/android/http/ExpensifyCertificatePinner.java
#   - Mobile-Expensify/iOS/Expensify/ExpensifyAppDelegate.m (TrustKit kTSKPublicKeyHashes)
#
# To add or replace a root (e.g. a CDN starts using a new CA): look up the
# root's SHA-256 certificate fingerprint in the CA's official repository, add
# a "<Name>|<FINGERPRINT>" entry to ROOT_MANIFEST and the name to the relevant
# group below, and re-run this script. The root must be in the Mozilla CA
# program (all publicly trusted TLS roots are); if the bundle no longer
# carries a pinned root, that is a distrust signal to investigate - but it is
# NOT on its own a reason to unpin it, because the device trust stores that
# actually select the anchor lag Mozilla (see the GTS Root R2 note below).
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOTS_DIR="${ROOTS_DIR:-${SCRIPT_DIR}/../config/certificatePinning/roots}"
MOZILLA_BUNDLE_URL="https://curl.se/ca/cacert.pem"

# Trust-anchor manifest: "<name>|<SHA-256 certificate fingerprint>".
# The committed fingerprints are what anchor trust in the downloaded roots.
# When adding an entry, verify the fingerprint against the CA's published
# value (letsencrypt.org/certificates, pki.goog/repository, ssl.com/repository,
# sectigo.com/knowledge-base, amazontrust.com/repository).
#
# A root here must be in the current Mozilla bundle. One that has left the bundle
# but is still trusted on devices belongs in RETAINED_PINS below instead.
ROOT_MANIFEST=(
  "ISRG_Root_X1|96:BC:EC:06:26:49:76:F3:74:60:77:9A:CF:28:C5:A7:CF:E8:A3:C0:AA:E1:1A:8F:FC:EE:05:C0:BD:DF:08:C6"
  "ISRG_Root_X2|69:72:9B:8E:15:A8:6E:FC:17:7A:57:AF:B7:17:1D:FC:64:AD:D2:8C:2F:CA:8C:F1:50:7E:34:45:3C:CB:14:70"
  "GTS_Root_R1|D9:47:43:2A:BD:E7:B7:FA:90:FC:2E:6B:59:10:1B:12:80:E0:E1:C7:E4:E4:0F:A3:C6:88:7F:FF:57:A7:F4:CF"
  "GTS_Root_R3|34:D8:A7:3E:E2:08:D9:BC:DB:0D:95:65:20:93:4B:4E:40:E6:94:82:59:6E:8B:6F:73:C8:42:6B:01:0A:6F:48"
  "GTS_Root_R4|34:9D:FA:40:58:C5:E2:63:12:3B:39:8A:E7:95:57:3C:4E:13:13:C8:3F:E6:8F:93:55:6C:D5:E8:03:1B:3C:7D"
  "SSL.com_TLS_ECC_Root_CA_2022|C3:2F:FD:9F:46:F9:36:D1:6C:36:73:99:09:59:43:4B:9A:D6:0A:AF:BB:9E:7C:F3:36:54:F1:44:CC:1B:A1:43"
  "SSL.com_TLS_RSA_Root_CA_2022|8F:AF:7D:2E:2C:B4:70:9B:B8:E0:B3:36:66:BF:75:A5:DD:45:B5:DE:48:0F:8E:A8:D4:BF:E6:BE:BC:17:F2:ED"
  "USERTrust_RSA_Certification_Authority|E7:93:C9:B0:2F:D8:AA:13:E2:1C:31:22:8A:CC:B0:81:19:64:3B:74:9C:89:89:64:B1:74:6D:46:C3:D4:CB:D2"
  "USERTrust_ECC_Certification_Authority|4F:F4:60:D5:4B:9C:86:DA:BF:BC:FC:57:12:E0:40:0D:2B:ED:3F:BC:4D:4F:BD:AA:86:E0:6A:DC:D2:A9:AD:7A"
  "Sectigo_Public_Server_Authentication_Root_R46|7B:B6:47:A6:2A:EE:AC:88:BF:25:7A:A5:22:D0:1F:FE:A3:95:E0:AB:45:C7:3F:93:F6:56:54:EC:38:F2:5A:06"
  "Sectigo_Public_Server_Authentication_Root_E46|C9:0F:26:F0:FB:1B:40:18:B2:22:27:51:9B:5C:A2:B5:3E:2C:A5:B3:BE:5C:F1:8E:FE:1B:EF:47:38:0C:53:83"
  "Amazon_Root_CA_1|8E:CD:E6:88:4F:3D:87:B1:12:5B:A3:1A:C3:FC:B1:3D:70:16:DE:7F:57:CC:90:4F:E1:CB:97:C6:AE:98:19:6E"
  "Amazon_Root_CA_2|1B:A5:B2:AA:8C:65:40:1A:82:96:01:18:F8:0B:EC:4F:62:30:4D:83:CE:C4:71:3A:19:C3:9C:01:1E:A4:6D:B4"
  "Amazon_Root_CA_3|18:CE:6C:FE:7B:F1:4E:60:B2:E3:47:B8:DF:E8:68:CB:31:D0:2E:BB:3A:DA:27:15:69:F5:03:43:B4:6D:B3:A4"
  "Amazon_Root_CA_4|E3:5D:28:41:9E:D0:20:25:CF:A6:90:38:CD:62:39:62:45:8D:A5:C6:95:FB:DE:A3:C2:2B:0B:FB:25:89:70:92"
  "Starfield_Services_Root_CA_G2|56:8D:69:05:A2:C8:87:08:A4:B3:02:51:90:ED:CF:ED:B1:97:4A:60:6A:13:C6:E5:29:0F:CB:2A:E6:3E:DA:B5"
)

# Pins that ship without a certificate behind them. Pins are matched against the
# anchor the DEVICE trust store selected, not against Mozilla's bundle: Android
# ships CA updates on its own cadence (old OS versions keep roots for years) and
# Apple removes roots on Apple's schedule, so a root Mozilla has dropped can still
# be what a phone anchors at. Such a connection validates at the TLS layer and
# would then MISS a root-only pin set that omits it - monitor noise now, blocked
# requests once enforce mode is on.
#
# The bundle no longer carries the certificate, so its SPKI hash cannot be
# re-derived here. The hash below is the value this script generated while the
# root was still in the bundle; `git log -S` on it in config/certificatePinning/
# pins.json shows when and from what it came. The fingerprint identifies that
# certificate and the URL is where to obtain it if you want to re-check the hash
# by hand:
#
#   curl -s <url> | openssl x509 -noout -fingerprint -sha256
#   curl -s <url> | openssl x509 -pubkey -noout | openssl pkey -pubin -outform DER \
#     | openssl dgst -sha256 -binary | openssl enc -base64
#
# Entries are "<name>|<SPKI pin>|<SHA-256 fingerprint>|<source URL>|<label>" and
# keep their place in the group lists below, so the generated order still matches
# pins.json. --verify cannot check a chain against a retained root (there is no
# certificate to build a path to); it says so and verifies the rest.
#
# Remove an entry only once the supported platform trust stores no longer trust
# the root - see step 4 of the rotation runbook in config/certificatePinning/README.md.
RETAINED_PINS=(
  "GTS_Root_R2|Vfd95BwDeSQo+NUYxVEEIlvkOlWY2SalKK1lPhzOx78=|8D:25:CD:97:22:9D:BF:70:35:6B:DA:4E:B3:CC:73:40:31:E2:4C:F0:0F:AF:CF:D3:2D:C7:6E:B5:84:1C:7E:A8|https://pki.goog/repo/certs/gtsr2.pem|GTS Root R2 - retained, dropped from the Mozilla bundle in 2026"
)

# Groups A-D: Cloudflare-fronted expensify.com hosts. Cloudflare can rotate the
# edge certificate between Let's Encrypt, Google Trust Services and SSL.com
# without notice, and its backup certificates - deployed automatically on a
# revocation or key compromise - can also be issued by Sectigo
# (developers.cloudflare.com/ssl/reference/certificate-authorities/), so the
# roots of all four CAs are pinned. Sectigo issues from two hierarchies
# (USERTrust RSA/ECC and Sectigo Public Server Authentication Root R46/E46),
# so both are included.
CLOUDFLARE_ROOTS=(
  "ISRG_Root_X1"
  "ISRG_Root_X2"
  "GTS_Root_R1"
  "GTS_Root_R2"
  "GTS_Root_R3"
  "GTS_Root_R4"
  "SSL.com_TLS_ECC_Root_CA_2022"
  "SSL.com_TLS_RSA_Root_CA_2022"
  "USERTrust_RSA_Certification_Authority"
  "USERTrust_ECC_Certification_Authority"
  "Sectigo_Public_Server_Authentication_Root_R46"
  "Sectigo_Public_Server_Authentication_Root_E46"
)
CLOUDFLARE_DOMAINS=(
  "www.expensify.com"
  "secure.expensify.com"
  "staging.expensify.com"
  "staging-secure.expensify.com"
  "new.expensify.com"
  "staging.new.expensify.com"
  "integrations.expensify.com"
  "travel.expensify.com"
  "staging.travel.expensify.com"
)

# Group E: CloudFront CDN. AWS documents the Amazon Trust Services roots as the
# only stable pin targets for ACM-issued certificates.
CLOUDFRONT_ROOTS=(
  "Amazon_Root_CA_1"
  "Amazon_Root_CA_2"
  "Amazon_Root_CA_3"
  "Amazon_Root_CA_4"
  "Starfield_Services_Root_CA_G2"
)
CLOUDFRONT_DOMAINS=(
  "d2k5nsl2zxldvw.cloudfront.net"
)

ANDROID=0
VERIFY=0
REFRESH=0
for arg in "$@"; do
  case "$arg" in
    --android) ANDROID=1 ;;
    --verify) VERIFY=1 ;;
    --refresh) REFRESH=1 ;;
    *)
      echo "Unknown option: $arg" >&2
      echo "Usage: $0 [--android] [--verify] [--refresh]" >&2
      exit 1
      ;;
  esac
done

fingerprint_of() {
  # $1 = path to a PEM certificate. Prints the SHA-256 certificate fingerprint.
  openssl x509 -in "$1" -noout -fingerprint -sha256 2>/dev/null | sed 's/.*=//'
}

manifest_fingerprint() {
  # $1 = root name. Prints its expected fingerprint, failing loudly if unknown.
  local entry name fingerprint
  for entry in "${ROOT_MANIFEST[@]}"; do
    IFS='|' read -r name fingerprint <<< "$entry"
    if [ "$name" = "$1" ]; then
      echo "$fingerprint"
      return 0
    fi
  done
  echo "ERROR: root '$1' is not in ROOT_MANIFEST" >&2
  exit 1
}

retained_field() {
  # $1 = root name, $2 = field index in the RETAINED_PINS entry. Prints nothing
  # when the root is not retained, which is how callers tell the two apart.
  local entry name pin fingerprint url label
  for entry in "${RETAINED_PINS[@]}"; do
    IFS='|' read -r name pin fingerprint url label <<< "$entry"
    if [ "$name" = "$1" ]; then
      case "$2" in
        2) echo "$pin" ;;
        3) echo "$fingerprint" ;;
        4) echo "$url" ;;
        5) echo "$label" ;;
      esac
      return 0
    fi
  done
}

retained_pin() {
  # $1 = root name. Prints the committed SPKI pin for a retained root, or nothing.
  retained_field "$1" 2
}

cached_root_ok() {
  # $1 = root name. Succeeds if the cached PEM exists and matches its fingerprint.
  local path="${ROOTS_DIR}/$1.pem"
  [ -s "$path" ] || return 1
  [ "$(fingerprint_of "$path")" = "$(manifest_fingerprint "$1")" ]
}

ensure_roots() {
  # Downloads (or reads $ROOTS_BUNDLE), fingerprint-verifies, and caches every
  # root in ROOT_MANIFEST under $ROOTS_DIR. No-op when the cache is already
  # complete and verified, unless --refresh was passed.
  mkdir -p "$ROOTS_DIR"

  local needed=() entry name
  for entry in "${ROOT_MANIFEST[@]}"; do
    name="${entry%%|*}"
    if [ "$REFRESH" = "1" ] || ! cached_root_ok "$name"; then
      needed+=("$name")
    fi
  done
  if [ "${#needed[@]}" -eq 0 ]; then
    return
  fi

  local tmpdir bundle
  tmpdir="$(mktemp -d)"

  if [ -n "${ROOTS_BUNDLE:-}" ]; then
    bundle="$ROOTS_BUNDLE"
    echo "Using local CA bundle: ${bundle}" >&2
  else
    bundle="${tmpdir}/cacert.pem"
    echo "Downloading Mozilla CA bundle from ${MOZILLA_BUNDLE_URL} ..." >&2
    if ! curl -fsSL "$MOZILLA_BUNDLE_URL" -o "$bundle"; then
      echo "ERROR: could not download the CA bundle. Either retry with network access" >&2
      echo "or point ROOTS_BUNDLE at a local copy (e.g. from another checkout or" >&2
      echo "your system's ca-certificates package). Missing roots: ${needed[*]}" >&2
      rm -rf "$tmpdir"
      exit 1
    fi
  fi

  # Split the bundle into individual certificates.
  awk -v dir="$tmpdir" '
    /BEGIN CERTIFICATE/ { c++; f = dir "/split_" c ".pem" }
    c > 0 { print >> f }
    /END CERTIFICATE/ { close(f) }
  ' "$bundle"

  # Extract every needed root into a staging directory by matching fingerprints
  # (identity = fingerprint, never the bundle's own labels). Nothing touches the
  # cache until the whole bundle has been scanned.
  local staging="${tmpdir}/roots"
  mkdir -p "$staging"
  local split fp
  for split in "$tmpdir"/split_*.pem; do
    [ -s "$split" ] || continue
    fp="$(fingerprint_of "$split")"
    for name in "${needed[@]}"; do
      if [ "$fp" = "$(manifest_fingerprint "$name")" ]; then
        openssl x509 -in "$split" -out "${staging}/${name}.pem" 2>/dev/null
      fi
    done
  done

  # Install what the bundle provided. A needed root that the bundle does NOT
  # carry is an error even when a previously cached copy exists: that copy is
  # stale (this happens on --refresh, or when the cached PEM failed its
  # fingerprint check), so it is removed rather than silently kept - otherwise a
  # --refresh could never surface a root that Mozilla has since dropped.
  local failed=0
  for name in "${needed[@]}"; do
    if [ -s "${staging}/${name}.pem" ]; then
      mv -f "${staging}/${name}.pem" "${ROOTS_DIR}/${name}.pem"
      continue
    fi
    if [ -e "${ROOTS_DIR}/${name}.pem" ]; then
      rm -f "${ROOTS_DIR}/${name}.pem"
      echo "Removed stale cached root ${ROOTS_DIR}/${name}.pem (not in the current CA bundle)." >&2
    fi
    echo "ERROR: root '${name}' was not found in the CA bundle. If Mozilla no longer" >&2
    echo "ships this root, that is a distrust signal - investigate before pinning it." >&2
    echo "Do NOT unpin it on that basis alone: pins are matched against the anchor the" >&2
    echo "DEVICE trust store selected, and Android/Apple drop roots later than Mozilla," >&2
    echo "so a still-trusted root missing from the pin set breaks live traffic. To keep" >&2
    echo "shipping the pin, move the root from ROOT_MANIFEST to RETAINED_PINS (see the" >&2
    echo "comment above it) - its committed hash is then carried forward as-is." >&2
    failed=1
  done
  rm -rf "$tmpdir"
  [ "$failed" = "0" ] || exit 1

  # Every root must now be cached and fingerprint-verified.
  for name in "${needed[@]}"; do
    if ! cached_root_ok "$name"; then
      echo "ERROR: cached root ${ROOTS_DIR}/${name}.pem failed fingerprint verification." >&2
      exit 1
    fi
  done
}

spki_hash_from_pem() {
  # $1 = path to a PEM certificate. Prints base64(SHA-256(SPKI)).
  openssl x509 -in "$1" -pubkey -noout 2>/dev/null \
    | openssl pkey -pubin -outform DER 2>/dev/null \
    | openssl dgst -sha256 -binary \
    | openssl enc -base64
}

root_pem_path() {
  # $1 = root name. Prints the cached PEM path, failing loudly if missing.
  local path="${ROOTS_DIR}/$1.pem"
  if [ ! -s "$path" ]; then
    echo "ERROR: missing root certificate ${path}" >&2
    exit 1
  fi
  echo "$path"
}

print_group() {
  # $1 = group label; remaining args = root names.
  local label="$1"
  shift
  echo "=== ${label} ==="
  local root
  for root in "$@"; do
    local pem hash subject retained
    retained="$(retained_pin "$root")"
    if [ -n "$retained" ]; then
      printf '  sha256/%s   [%s]\n' "$retained" "$(retained_field "$root" 5)"
      continue
    fi
    pem="$(root_pem_path "$root")"
    hash="$(spki_hash_from_pem "$pem")"
    subject="$(openssl x509 -in "$pem" -noout -subject 2>/dev/null | sed 's/^subject=//')"
    printf '  sha256/%s   [%s]\n' "$hash" "$subject"
  done
  echo
}

openssl_isolation_flags() {
  # Flags that stop `openssl verify` consulting the system trust store. Without
  # them the default CA directory (SSL_CERT_DIR, /etc/ssl/certs) is still
  # searched for an anchor, so a chain that anchors at ANY locally trusted CA
  # verifies and --verify reports "anchors at a pinned root" for a chain that
  # does nothing of the sort. The pinned roots passed with -CAfile must be the
  # only anchors considered.
  local help flag
  help="$(openssl verify -help 2>&1 || true)"
  ISOLATION_FLAGS=()
  for flag in -no-CAfile -no-CApath -no-CAstore; do
    case "$help" in
      *"$flag"*) ISOLATION_FLAGS+=("$flag") ;;
    esac
  done
  # -no-CApath is the one that matters (the default directory); refuse to run
  # rather than report a verification this openssl cannot actually isolate.
  case " ${ISOLATION_FLAGS[*]} " in
    *" -no-CApath "*) ;;
    *)
      echo "ERROR: this openssl ($(openssl version)) does not support -no-CApath, so" >&2
      echo "--verify cannot keep the system trust store out of the chain check and would" >&2
      echo "report a pass for a chain anchored at any locally trusted CA. Re-run with a" >&2
      echo "modern OpenSSL (3.x)." >&2
      exit 1
      ;;
  esac
}

verify_retained_pins() {
  # --verify is the one networked command, so it is where a retained pin gets
  # checked against the CA's published certificate: fetch it, confirm the
  # fingerprint, re-derive the SPKI hash and compare it with the value shipped in
  # RETAINED_PINS. A verified certificate then also serves as a trust anchor
  # below, so a chain that legitimately builds to a retained root verifies
  # instead of being reported as a failure.
  RETAINED_ANCHOR_DIR="$(mktemp -d)"
  local entry name pin fingerprint url label pem got_fp got_pin
  for entry in "${RETAINED_PINS[@]}"; do
    IFS='|' read -r name pin fingerprint url label <<< "$entry"
    pem="${RETAINED_ANCHOR_DIR}/${name}.pem"
    if ! curl -fsSL "$url" -o "$pem" 2>/dev/null; then
      rm -f "$pem"
      printf '  %-34s UNREACHABLE (could not fetch %s - pin not verified)\n' "$name" "$url"
      VERIFY_FAILED=1
      continue
    fi
    got_fp="$(fingerprint_of "$pem")"
    if [ "$got_fp" != "$fingerprint" ]; then
      rm -f "$pem"
      printf '  %-34s FAIL (certificate at %s has fingerprint %s, expected %s)\n' "$name" "$url" "$got_fp" "$fingerprint"
      VERIFY_FAILED=1
      continue
    fi
    got_pin="$(spki_hash_from_pem "$pem")"
    if [ "$got_pin" != "$pin" ]; then
      rm -f "$pem"
      printf '  %-34s FAIL (published certificate yields sha256/%s but sha256/%s is pinned)\n' "$name" "$got_pin" "$pin"
      VERIFY_FAILED=1
      continue
    fi
    printf '  %-34s OK (published certificate matches the committed fingerprint and pin)\n' "$name"
  done
}

verify_domain() {
  # $1 = hostname; remaining args = root names the domain may anchor at.
  # Fetches the served chain and verifies it builds to one of the pinned roots.
  local host="$1"
  shift
  local tmpdir
  tmpdir="$(mktemp -d)"
  echo | openssl s_client -connect "${host}:443" -servername "${host}" -showcerts 2>/dev/null \
    | awk -v dir="$tmpdir" 'BEGIN{c=0} /BEGIN CERTIFICATE/{c++} c>0{print > (dir "/cert_" c ".pem")}' || true

  if [ ! -s "${tmpdir}/cert_1.pem" ]; then
    # Nothing was verified for this host, so the run must not succeed: an
    # unreachable endpoint would otherwise hide a pin that no longer matches.
    printf '  %-34s UNREACHABLE (could not fetch the served chain - nothing verified)\n' "$host"
    VERIFY_FAILED=1
    rm -rf "$tmpdir"
    return
  fi

  local roots_bundle="${tmpdir}/roots.pem"
  local root retained_anchor
  for root in "$@"; do
    if [ -n "$(retained_pin "$root")" ]; then
      # Usable as an anchor only if verify_retained_pins fetched and verified it.
      retained_anchor="${RETAINED_ANCHOR_DIR:-}/${root}.pem"
      if [ -n "${RETAINED_ANCHOR_DIR:-}" ] && [ -s "$retained_anchor" ]; then
        cat "$retained_anchor" >> "$roots_bundle"
      fi
      continue
    fi
    cat "$(root_pem_path "$root")" >> "$roots_bundle"
  done

  local untrusted="${tmpdir}/untrusted.pem"
  cat "${tmpdir}"/cert_*.pem > "$untrusted"

  # ISOLATION_FLAGS keep the system trust store out of this: the pinned roots in
  # $roots_bundle must be the only anchors, or a chain anchored at any locally
  # trusted CA would pass and be reported as anchoring at a pinned root.
  if openssl verify -CAfile "$roots_bundle" "${ISOLATION_FLAGS[@]}" -untrusted "$untrusted" "${tmpdir}/cert_1.pem" >/dev/null 2>&1; then
    local leaf_subject
    leaf_subject="$(openssl x509 -in "${tmpdir}/cert_1.pem" -noout -subject 2>/dev/null | sed 's/^subject=//')"
    printf '  %-34s OK (chain anchors at a pinned root) [%s]\n' "$host" "$leaf_subject"
  else
    printf '  %-34s FAIL (served chain does NOT build to a pinned root - a new CA may be in play)\n' "$host"
    VERIFY_FAILED=1
  fi
  rm -rf "$tmpdir"
}

print_pin_set() {
  # Args = root names. Prints an Android <pin-set> block.
  echo '        <pin-set>'
  local root
  for root in "$@"; do
    local pem hash cn retained
    retained="$(retained_pin "$root")"
    if [ -n "$retained" ]; then
      printf '            <pin digest="SHA-256">%s</pin> <!-- %s -->\n' "$retained" "$(retained_field "$root" 5)"
      continue
    fi
    pem="$(root_pem_path "$root")"
    hash="$(spki_hash_from_pem "$pem")"
    cn="$(openssl x509 -in "$pem" -noout -subject 2>/dev/null | sed 's/.*CN *= *//')"
    printf '            <pin digest="SHA-256">%s</pin> <!-- %s -->\n' "$hash" "$cn"
  done
  echo '        </pin-set>'
}

ensure_roots

echo "Root CA certificate pins (generated $(date +%Y-%m-%d); roots fetched and fingerprint-verified per ROOT_MANIFEST):"
echo

print_group "Groups A-D: Cloudflare-fronted expensify.com hosts" "${CLOUDFLARE_ROOTS[@]}"
print_group "Group E: CloudFront CDN" "${CLOUDFRONT_ROOTS[@]}"

echo "Domain -> group:"
for d in "${CLOUDFLARE_DOMAINS[@]}"; do
  printf '  %-34s Groups A-D (Cloudflare roots)\n' "$d"
done
for d in "${CLOUDFRONT_DOMAINS[@]}"; do
  printf '  %-34s Group E (CloudFront roots)\n' "$d"
done
echo

if [ "$ANDROID" = "1" ]; then
  echo "----- network_security_config_enforce.xml <pin-set> blocks -----"
  echo "Cloudflare-fronted expensify.com hosts:"
  print_pin_set "${CLOUDFLARE_ROOTS[@]}"
  echo
  echo "CloudFront CDN:"
  print_pin_set "${CLOUDFRONT_ROOTS[@]}"
  echo
fi

if [ "$VERIFY" = "1" ]; then
  VERIFY_FAILED=0
  echo "----- live chain verification -----"
  openssl_isolation_flags
  if [ "${#RETAINED_PINS[@]}" -gt 0 ]; then
    verify_retained_pins
  fi
  for d in "${CLOUDFLARE_DOMAINS[@]}"; do
    verify_domain "$d" "${CLOUDFLARE_ROOTS[@]}"
  done
  for d in "${CLOUDFRONT_DOMAINS[@]}"; do
    verify_domain "$d" "${CLOUDFRONT_ROOTS[@]}"
  done
  rm -rf "${RETAINED_ANCHOR_DIR:-}"
  if [ "$VERIFY_FAILED" != "0" ]; then
    echo "Verification FAILED: at least one host did not anchor at a pinned root, a retained" >&2
    echo "pin could not be checked against its published certificate, or a host was unreachable." >&2
    exit 1
  fi
fi
