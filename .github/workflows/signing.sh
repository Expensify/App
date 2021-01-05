#!/bin/bash

commit_list=$(git rev-list master..)
declare -r commit_list

unsigned_commit=false
for commit in $commit_list; do
    if ! git verify-commit "$commit" 2>&1 | grep -q "Signature"; then
        echo "Commit $commit not signed"
        unsigned_commit=true
    fi
done

if [[ $unsigned_commit == true ]]; then
    exit 1
fi