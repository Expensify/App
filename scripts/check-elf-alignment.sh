#!/bin/bash
set -o pipefail

progname="${0##*/}"
progname="${progname%.sh}"

# usage: check_elf_alignment.sh [path to *.so files|path to *.apk]
cleanup_trap() {
  if [ -n "$tmp" ] && [ -d "$tmp" ]; then
    rm -rf "$tmp"
  fi
  exit "${1:-0}"
}

# shellcheck disable=SC1090
source "$(dirname "$0")/shellUtils.sh"

usage() {
  echo "Host side script to check the ELF alignment of shared libraries."
  echo "Shared libraries are reported ALIGNED when their ELF regions are"
  echo "16 KB or 64 KB aligned. Otherwise they are reported as UNALIGNED."
  echo
  echo "Usage: ${progname} [input-path|input-APK|input-APEX]"
}

if [ "$#" -ne 1 ]; then
  usage
  exit 1
fi

case "$1" in
  --help | -h | -\?)
    usage
    exit 0
    ;;
  *)
    dir="$1"
    ;;
esac

if ! [ -f "$dir" ] && ! [ -d "$dir" ]; then
  error "Invalid file: $dir"
  exit 1
fi

if [[ "$dir" == *.apk ]]; then
  trap 'cleanup_trap' EXIT

  echo
  title "Recursively analyzing $dir"
  echo

  if zipalign --help 2>&1 | grep -q "\-P <pagesize_kb>"; then
    title "APK zip-alignment"
    zipalign -v -c -P 16 4 "$dir" | grep -E 'lib/arm64-v8a|lib/x86_64|Verification'
    echo "========================="
  else
    info "NOTICE: Zip alignment check requires build-tools version 35.0.0-rc3 or higher."
    info "  You can install the latest build-tools by running the below command"
    info "  and updating your \$PATH:"
    echo
    info '    sdkmanager "build-tools;35.0.0-rc3"'
  fi

  dir_filename=$(basename "$dir")
  tmp=$(mktemp -d -t "${dir_filename%.apk}_out_XXXXX")
  unzip "$dir" lib/* -d "$tmp" >/dev/null 2>&1
  dir="$tmp"
fi

if [[ "$dir" == *.apex ]]; then
  trap 'cleanup_trap' EXIT

  echo
  title "Recursively analyzing $dir"
  echo

  dir_filename=$(basename "$dir")
  tmp=$(mktemp -d -t "${dir_filename%.apex}_out_XXXXX")
  if ! deapexer extract "$dir" "$tmp"; then
    error "Failed to deapex."
    exit 1
  fi
  dir="$tmp"
fi

unaligned_libs=()

echo
title "ELF alignment"

matches="$(find "$dir" -type f)"
IFS=$'\n'
for match in $matches; do
  [[ "$match" == *".apk"  ]] && warn "doesn't recursively inspect .apk file: $match"
  [[ "$match" == *".apex" ]] && warn "doesn't recursively inspect .apex file: $match"

  [[ $(file "$match") == *"ELF"* ]] || continue

  res="$(objdump -p "$match" | grep LOAD | awk '{ print $NF }' | head -1)"
  if [[ $res =~ 2\*\*(1[4-9]|[2-9][0-9]|[1-9][0-9]{2,}) ]]; then
    printf "%s: %sALIGNED%s (%s)\n" "$match" "$GREEN" "$RESET" "$res"
  else
    printf "%s: %sUNALIGNED%s (%s)\n" "$match" "$RED" "$RESET" "$res"
    unaligned_libs+=("$match")
  fi
done

if [ "${#unaligned_libs[@]}" -gt 0 ]; then
  printf "%sFound %d unaligned libs (only arm64-v8a/x86_64 libs need to be aligned).%s\n" "$RED" "${#unaligned_libs[@]}" "$RESET"
elif [ -n "${dir_filename:-}" ]; then
  success "ELF Verification Successful"
fi
echo "====================="