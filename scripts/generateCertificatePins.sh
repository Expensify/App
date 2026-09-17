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
#   - patches/react-native-nitro-fetch+1.5.4+001+certificate-pinning.patch
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

# --ca-pins: print & self-verify the multi-CA root + live-intermediate pins used by the
# Cloudflare-fronted expensify.com hosts (Groups A & B in pins.json). Cloudflare can issue those
# hosts from Let's Encrypt, Google Trust Services or SSL.com and rotate between them without notice,
# so we pin the SPKI of each CA's ROOT plus its live issuing intermediate. Each pin is recomputed
# from the CA's published certificate and compared against the value committed to pins.json.
spki_from_url() {
  # $1 = URL to a PEM or DER certificate. Prints base64(SHA-256(SPKI)) or "FETCH-FAILED".
  local url="$1" tmp pin
  tmp="$(mktemp)"
  if ! curl -fsSL "$url" -o "$tmp" 2>/dev/null; then rm -f "$tmp"; echo "FETCH-FAILED"; return; fi
  pin="$(openssl x509 -in "$tmp" -inform pem -pubkey -noout 2>/dev/null | openssl pkey -pubin -outform der 2>/dev/null | openssl dgst -sha256 -binary | openssl enc -base64)"
  if [ -z "$pin" ]; then
    pin="$(openssl x509 -in "$tmp" -inform der -pubkey -noout 2>/dev/null | openssl pkey -pubin -outform der 2>/dev/null | openssl dgst -sha256 -binary | openssl enc -base64)"
  fi
  rm -f "$tmp"
  echo "${pin:-PARSE-FAILED}"
}

ca_pins() {
  # name | published-cert URL | expected pin committed to pins.json
  local entries=(
    "Let's Encrypt ISRG Root X1|https://letsencrypt.org/certs/isrgrootx1.pem|C5+lpZ7tcVwmwQIMcRtPbsQtWLABXhQzejna0wHFr8M="
    "Let's Encrypt ISRG Root X2|https://letsencrypt.org/certs/isrg-root-x2.pem|diGVwiVYbubAI3RW4hB9xU8e/CH2GnkuvVFZE8zmgzI="
    "Let's Encrypt YE1 (live int)|https://letsencrypt.org/certs/gen-y/int-ye1.pem|brzvtCELCIZUo4sD/qPX0ccRtPsd3DY6RfmxpOU9oB4="
    "GTS Root R1|https://pki.goog/repo/certs/gtsr1.pem|hxqRlPTu1bMS/0DITB1SSu0vd4u/8l8TjPgfaAp63Gc="
    "GTS Root R2|https://pki.goog/repo/certs/gtsr2.pem|Vfd95BwDeSQo+NUYxVEEIlvkOlWY2SalKK1lPhzOx78="
    "GTS Root R3|https://pki.goog/repo/certs/gtsr3.pem|QXnt2YHvdHR3tJYmQIr0Paosp6t/nggsEGD4QJZ3Q0g="
    "GTS Root R4|https://pki.goog/repo/certs/gtsr4.pem|mEflZT5enoR1FuXLgYYGqnVEoZvmf9c2bVBpiOjYQ0c="
    "GTS WE1 (live int)|https://pki.goog/repo/certs/we1.pem|kIdp6NNEd8wsugYyyIYFsi1ylMCED3hZbSR8ZFsa/A4="
    # SSL.com publishes these under https://www.ssl.com/repository/ - adjust the URL if SSL.com moves it.
    "SSL.com TLS ECC Root CA 2022|https://ssl.com/repository/SSLcom-TLS-ECC-Root-2022.pem|G/ANXI8TwJTdF+AFBM8IiIUPEv0Gf6H5LA/b9guG4yE="
    "SSL.com TLS RSA Root CA 2022|https://ssl.com/repository/SSLcom-TLS-RSA-Root-2022.pem|K89VOmb1cJAN3TK6bf4ezAbJGC1mLcG2Dh97dnwr3VQ="
  )
  echo "Cloudflare-fronted expensify.com multi-CA pins (Groups A & B) - recomputed from published certs:"
  echo
  local rc=0 name url expected got
  for e in "${entries[@]}"; do
    IFS='|' read -r name url expected <<< "$e"
    got="$(spki_from_url "$url")"
    if [ "$got" = "$expected" ]; then
      printf '  [ OK ]  %-32s sha256/%s\n' "$name" "$expected"
    elif [ "$got" = "FETCH-FAILED" ] || [ "$got" = "PARSE-FAILED" ]; then
      printf '  [WARN]  %-32s could not fetch/parse (%s); committed: sha256/%s\n' "$name" "$got" "$expected"
      rc=1
    else
      printf '  [FAIL]  %-32s committed sha256/%s but published cert is sha256/%s\n' "$name" "$expected" "$got"
      rc=1
    fi
  done
  echo
  [ $rc -eq 0 ] && echo "All committed CA pins match the published certificates." || echo "One or more CA pins need attention (see above)."
  return $rc
}

if [ "${1:-}" = "--ca-pins" ]; then
  ca_pins
  exit $?
fi

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
