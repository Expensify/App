#!/bin/bash

GREEN=$'\e[1;32m'
RED=$'\e[1;31m'
BLUE=$'\e[1;34m'
TITLE=$'\e[1;4;34m'
RESET=$'\e[0m'

function success {
  echo "🎉 $GREEN$1$RESET"
}

function error {
  echo "💥 $RED$1$RESET"
}

function info {
  echo "$BLUE$1$RESET"
}

function title {
  printf "\n%s%s%s\n" "$TITLE" "$1" "$RESET"
}

function assert_equal {
  if [[ "$1" != "$2" ]]; then
    error "Assertion failed: $1 is not equal to $2"
    exit 1
  else
    success "Assertion passed: $1 is equal to $1"
  fi
}

function assert_string_contains_substring {
  if [[ "$1" != *"$2"* ]]; then
    error "Assertion failed: \"$1\" does not contain substring \"$2\""
    exit 1
  else
    success "Assertion passed: \"$1\" contains substring \"$2\""
  fi
}

function assert_string_doesnt_contain_substring {
  if [[ "$1" == *"$2"* ]]; then
    error "Assertion failed: \"$1\" contains substring \"$2\""
    exit 1
  else
    success "Assertion passed: \"$1\" does not contain substring \"$2\""
  fi
}
