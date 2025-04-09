#!/bin/bash

version="$1"

if [ -z "$version" ]; then
    echo "Missing version argument"
    exit 1
fi

find patches -type f -name "react-native+${version}*.patch" -exec sha256sum {} + | sort | sha256sum | awk '{print $1}'
