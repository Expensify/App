#!/usr/bin/env bash
#
# generateCertificatePins.sh
#
# Regenerates / verifies the SSL certificate pins used for certificate pinning
# (see config/certificatePinning/pins.json). For each pinned domain it connects
# over TLS, extracts the leaf and issuing-intermediate Subject Public Key Info
# (SPKI), and prints the base64-encoded SHA-256 hashes.
#
# For each domain we emit TWO pins:
#   1. The leaf certificate SPKI hash (primary pin).
#   2. The issuing intermediate CA SPKI hash (durable backup that survives
#      leaf-certificate rotation - Let's Encrypt rotates leaves every ~90 days).
#
# Usage:
#   ./scripts/generateCertificatePins.sh                 # print pins for every domain
#   ./scripts/generateCertificatePins.sh --android       # also print the network_security_config <pin-set>
#
# After running, sync the values into:
#   - config/certificatePinning/pins.json                (canonical source of truth)
#   - android/app/src/main/res/xml/network_security_config_enforce.xml
#   - android/app/src/main/java/com/expensify/chat/CertificatePinning.kt
#   - ios/CertificatePinning.swift
#   - patches/react-native-nitro-fetch+1.5.0.patch
#   - Mobile-Expensify/Android/res/xml/network_security_config_enforce.xml
#   - Mobile-Expensify/Android/src/yapl/android/http/ExpensifyCertificatePinner.java
#   - Mobile-Expensify/iOS/Expensify/ExpensifyAppDelegate.m (TrustKit kTSKPublicKeyHashes)
#
set -euo pipefail

DOMAINS=(
  "www.expensify.com"
  "secure.expensify.com"
  "new.expensify.com"
  "integrations.expensify.com"
  "travel.expensify.com"
  "d2k5nsl2zxldvw.cloudfront.net"
  "staging.expensify.com"
  "staging-secure.expensify.com"
  "staging.new.expensify.com"
  "staging.travel.expensify.com"
)

spki_hash_from_pem() {
  # $1 = path to a PEM certificate. Prints base64(SHA-256(SPKI)).
  openssl x509 -in "$1" -pubkey -noout 2>/dev/null \
    | openssl pkey -pubin -outform der 2>/dev/null \
    | openssl dgst -sha256 -binary 2>/dev/null \
    | openssl enc -base64
}

collect_pins() {
  # $1 = hostname. Echoes one "hash<TAB>subject" line per certificate in the chain (leaf + intermediate).
  local host="$1"
  local tmpdir
  tmpdir="$(mktemp -d)"
  echo | openssl s_client -connect "${host}:443" -servername "${host}" -showcerts 2>/dev/null \
    | awk -v dir="$tmpdir" 'BEGIN{c=0} /BEGIN CERTIFICATE/{c++} {print > (dir "/cert_" c ".pem")}'
  for f in "${tmpdir}/cert_1.pem" "${tmpdir}/cert_2.pem"; do
    if [ -s "$f" ]; then
      local h subj
      h="$(spki_hash_from_pem "$f")"
      subj="$(openssl x509 -in "$f" -noout -subject 2>/dev/null | sed 's/^subject=//')"
      printf '%s\t%s\n' "$h" "$subj"
    fi
  done
  rm -rf "$tmpdir"
}

echo "Certificate pins (generated $(date +%Y-%m-%d)):"
echo

for d in "${DOMAINS[@]}"; do
  echo "=== ${d} ==="
  collect_pins "$d" | while IFS=$'\t' read -r hash subject; do
    printf '  sha256/%s   [%s]\n' "$hash" "$subject"
  done
  echo
done

if [ "${1:-}" = "--android" ]; then
  echo "----- network_security_config.xml <pin-set> (dedup the hashes as needed) -----"
  declare -A SEEN
  echo '        <pin-set>'
  for d in "${DOMAINS[@]}"; do
    while IFS=$'\t' read -r hash _subject; do
      if [ -z "${SEEN[$hash]:-}" ]; then
        SEEN[$hash]=1
        printf '            <pin digest="SHA-256">%s</pin>\n' "$hash"
      fi
    done < <(collect_pins "$d")
  done
  echo '        </pin-set>'
fi
