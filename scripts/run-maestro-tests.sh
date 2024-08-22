#!/bin/bash

trap 'exit' INT

PLATFORM=${1:-}

# Validate passed platform
case $PLATFORM in
  ios | android )
    ;;

  *)
    echo "Error! You must pass either 'android' or 'ios'"
    echo ""
    exit 1
    ;;
esac

if [ "$PLATFORM" == "ios" ]; then
  APPID="com.chat.expensify.chat"
  allTestFiles=$(ls maestro-tests/*.yaml maestro-tests/basic_example/*.yaml)
else
  APPID="com.expensify.chat.dev"
  allTestFiles=$(ls maestro-tests/*.yaml maestro-tests/basic_example/*.yaml)
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