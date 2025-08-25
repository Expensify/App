APK=./build/outputs/apk/debug/Expensify-debug.apk
READELF=/opt/homebrew/opt/llvm/bin/llvm-readelf   # или /opt/homebrew/opt/binutils/bin/readelf

unzip -Z1 "$APK" "lib/*/*.so" | while read -r so; do
  abi=$(echo "$so" | cut -d/ -f2)
  name=$(basename "$so")
  align=$(
    unzip -p "$APK" "$so" \
    | $READELF -W -l - \
    | awk '/LOAD/{for(i=1;i<=NF;i++){if($i ~ /^0x/){a=$i}}} END{print a}'
  )
  printf "[%s] %-30s align=%s\n" "$abi" "$name" "$align"
done