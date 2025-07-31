#!/bin/bash

# Deploy coverage static to S3

# Check if required arguments are provided
if [ $# -ne 2 ]; then
    echo "Usage: $0 <PR_NUMBER> <RUN_ID>"
    exit 1
fi

PR_NUMBER=$1
RUN_ID=$2

# Create a unique S3 path for this PR and run
S3_PATH="coverage/pr${PR_NUMBER}-run${RUN_ID}"
S3_BUCKET="ad-hoc-expensify-cash"

# Deploy to S3 with AWS CLI
aws s3 sync ./coverage "s3://${S3_BUCKET}/${S3_PATH}" --acl public-read

# Save the coverage URL for the next step  
COVERAGE_URL="https://${S3_BUCKET}.s3.amazonaws.com/${S3_PATH}/index.html"
echo "COVERAGE_URL=$COVERAGE_URL" >> "$GITHUB_ENV"
echo "Coverage report deployed to: $COVERAGE_URL"
