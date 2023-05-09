#!/bin/sh

# ------------------------------------------------------------------
# [Author] Title
#          Description
# ------------------------------------------------------------------

VERSION=0.1.0
SUBJECT=sms-retriever-hash-generator
USAGE="Usage: sms_retriever_hash.sh --package package_name --keystore keystore_file"

# --- Options processing -------------------------------------------
if [ $# == 0 ] ; then
    echo $USAGE
    exit 1;
fi

# USE: apkblacklister.sh --source source.apk --target target.apk more files to scan

if [[ "$1" != "--package" ]]; then
  echo "Error: expected --package as first parameter"
  exit 1
fi
pkg="$2"
shift 2

if [[ "$1" != "--keystore" ]]; then
  echo "Error: expected --keystore as third parameter"
  exit 1
fi
keystore="$2"
shift 2



echo
echo "package name: $pkg"
echo "keystore file: $keystore"
echo 

if [ -e "$keystore" ]
then
  echo "File $keystore is found."
  echo
else
  echo "File $keystore is not found."
  echo
  exit 0;
fi

# Retrieve certificate from keystore file. Decoded with Base64 and converted to hex
cert=$(keytool -list -rfc -keystore $keystore | sed  -e '1,/BEGIN/d' | sed -e '/END/,$d' | tr -d ' \n' | base64 --decode | xxd -p | tr -d ' \n')

echo
echo "certificate in hex: $cert"


# concatenate input
input="$pkg $cert"

# 256 bits = 32 bytes = 64 hex chars
output=$(printf "$input" | shasum -a 256 | cut -c1-64)
echo
echo "SHA-256 output in hex: $output"

# take the beginning 72 bits (= 9 bytes = 18 hex chars)
output=$(printf $output | cut -c1-18)

# encode sha256sum output by base64 (11 chars)
base64output=$(printf $output | xxd -r -p | base64 | cut -c1-11)
echo
echo "First 8 bytes encoded by base64: $base64output"
echo
echo "SMS Retriever hash code:  $base64output"
echo
