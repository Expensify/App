#!/bin/bash

trap 'exit' INT

PLATFORM=${1:-}

# Validate passed platform
case $PLATFORM in
  ios | android | web )
    ;;

  *)
    echo "Error! You must pass either 'android', 'ios', or 'web'"
    echo ""
    exit 1
    ;;
esac

if [ "$PLATFORM" == "ios" ]; then
  APPID="com.expensify.chat.dev"
  # allTestFiles=$(ls maestro-tests/*.yaml maestro-tests/basic_example/native.yaml)
  allTestFiles=$(ls maestro-tests/native/*.yaml)
elif [ "$PLATFORM" == "android" ]; then
  APPID="com.expensify.chat.dev"
  # allTestFiles=$(ls maestro-tests/native/*.yaml)
  allTestFiles=$(ls maestro-tests/native/test.yaml)
else 
  APPID="https://dev.new.expensify.com:8082"
  # APPID="https://127.0.0.1:8082"
  allTestFiles=$(ls maestro-tests/web/*.yaml)
fi

failedTests=()
for file in $allTestFiles
do
  if ! maestro test "$file" -e APP_ID="$APPID";
  then
    echo "Test ${file} failed. Retrying in 30 seconds..."
    sleep 30
    if ! maestro test "$file" -e APP_ID="$APPID";
    then
      echo "Test ${file} failed again. Retrying for the last time in 120 seconds..."
      sleep 120
      if ! maestro test "$file" -e APP_ID="$APPID";
      then
        failedTests+=("$file")
      fi
    fi
  fi
done

if [ ${#failedTests[@]} -eq 0 ]; then
    exit 0
else
    echo "These tests failed:"
    printf '%s\n' "${failedTests[@]}"
    exit 1
fi