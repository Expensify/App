#!/bin/sh

set -ex

PROJECT_ARN=arn:aws:devicefarm:us-west-2:015174472939:project:741d1dac-84e7-4c6f-84ed-b41a2209319d
DEVICE_POOL_ARN=arn:aws:devicefarm:us-west-2:015174472939:devicepool:741d1dac-84e7-4c6f-84ed-b41a2209319d/efa4b3bb-85ef-45f2-a063-14393eb4d2c2
UPLOAD_ARN=arn:aws:devicefarm:us-west-2:015174472939:upload:741d1dac-84e7-4c6f-84ed-b41a2209319d/e65b711b-9dba-45dd-aeb4-e7c0449bccc8
TEST_SPEC_ARN=arn:aws:devicefarm:us-west-2:015174472939:upload:741d1dac-84e7-4c6f-84ed-b41a2209319d/8e694a23-1dbb-40ff-a0ef-a8077dbfa729
TEST_PACKAGE_ARN=arn:aws:devicefarm:us-west-2:015174472939:upload:741d1dac-84e7-4c6f-84ed-b41a2209319d/6d61e606-5450-43f2-be94-0bee759569e5

aws devicefarm schedule-run --project-arn "${PROJECT_ARN}" --app-arn "${UPLOAD_ARN}" --device-pool-arn "${DEVICE_POOL_ARN}" --name "Test run" --test type=APPIUM_NODE,testPackageArn="${TEST_PACKAGE_ARN}",testSpecArn="${TEST_SPEC_ARN}"
# aws devicefarm list-uploads --arn "${PROJECT_ARN}"
# 
# aws devicefarm create-upload --name TestSpecMain.yml --type APPIUM_NODE_TEST_SPEC --project-arn "${PROJECT_ARN}"