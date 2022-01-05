#!/bin/bash

GREEN=$'\e[1;32m'
RED=$'\e[1;31m'
BLUE=$'\e[1;34m'
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


