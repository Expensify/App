import type {Step} from '@kie/act-js';
import {createStepAssertion} from '../utils/utils';

function assertValidateActorJobExecuted(workflowResult: Step[], pullRequestNumber = '1234', didExecute = true) {
    const steps = [
        createStepAssertion('Is Expensify employee', true, null, 'VALIDATEACTOR', 'Is Expensify employee', [], [{key: 'GITHUB_TOKEN', value: '***'}]),
        createStepAssertion(
            'Set HAS_READY_TO_BUILD_LABEL flag',
            true,
            null,
            'VALIDATEACTOR',
            'Set HAS_READY_TO_BUILD_LABEL flag',
            [],
            [
                {key: 'PULL_REQUEST_NUMBER', value: pullRequestNumber},
                {key: 'GITHUB_TOKEN', value: '***'},
            ],
        ),
    ] as const;

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

function assertGetBranchRefJobExecuted(workflowResult: Step[], didExecute = true) {
    const steps = [
        createStepAssertion('Checkout', true, null, 'GETBRANCHREF', 'Checkout', [], []),
        createStepAssertion('Check if pull request number is correct', true, null, 'GETBRANCHREF', 'Check if pull request number is correct', [], [{key: 'GITHUB_TOKEN', value: '***'}]),
    ] as const;

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

function assertAndroidJobExecuted(workflowResult: Step[], ref = '', didExecute = true, failsAt = -1) {
    const steps = [
        createStepAssertion('Checkout', true, null, 'ANDROID', 'Checkout', [{key: 'ref', value: ref}], []),
        createStepAssertion('Create .env.adhoc file based on staging and add PULL_REQUEST_NUMBER env to it', true, null, 'ANDROID', 'Creating .env.adhoc file based on staging', [], []),
        createStepAssertion('Setup Node', true, null, 'ANDROID', 'Setup Node', [], []),
        createStepAssertion(
            'Setup Java',
            true,
            null,
            'ANDROID',
            'Setup Java',
            [
                {key: 'distribution', value: 'oracle'},
                {key: 'java-version', value: '17'},
            ],
            [],
        ),
        createStepAssertion(
            'Setup Ruby',
            true,
            null,
            'ANDROID',
            'Setup Ruby',
            [
                {key: 'ruby-version', value: '2.7'},
                {key: 'bundler-cache', value: true},
            ],
            [],
        ),
        createStepAssertion('Decrypt keystore', true, null, 'ANDROID', 'Decrypt keystore', [], [{key: 'LARGE_SECRET_PASSPHRASE', value: '***'}]),
        createStepAssertion('Decrypt json key', true, null, 'ANDROID', 'Decrypt json key', [], [{key: 'LARGE_SECRET_PASSPHRASE', value: '***'}]),
        createStepAssertion(
            'Configure AWS Credentials',
            true,
            null,
            'ANDROID',
            'Configure AWS Credentials',
            [
                {key: 'aws-access-key-id', value: '***'},
                {key: 'aws-secret-access-key', value: '***'},
                {key: 'aws-region', value: 'us-east-1'},
            ],
            [],
        ),
        createStepAssertion('Configure MapBox SDK', true, null, 'ANDROID', 'Configure MapBox SDK'),
        createStepAssertion(
            'Run Fastlane beta test',
            true,
            null,
            'ANDROID',
            'Run Fastlane beta test',
            [],
            [
                {key: 'S3_ACCESS_KEY', value: '***'},
                {key: 'S3_SECRET_ACCESS_KEY', value: '***'},
                {key: 'S3_BUCKET', value: 'ad-hoc-expensify-cash'},
                {key: 'S3_REGION', value: 'us-east-1'},
                {key: 'MYAPP_UPLOAD_STORE_PASSWORD', value: '***'},
                {key: 'MYAPP_UPLOAD_KEY_PASSWORD', value: '***'},
            ],
        ),
        createStepAssertion(
            'Upload Artifact',
            true,
            null,
            'ANDROID',
            'Upload Artifact',
            [
                {key: 'name', value: 'android'},
                {key: 'path', value: './android_paths.json'},
            ],
            [],
        ),
    ] as const;

    steps.forEach((expectedStep, i) => {
        if (didExecute) {
            if (failsAt === -1 || i < failsAt) {
                // either whole job is successful, or steps up to this point are successful
                expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
            } else if (i === failsAt) {
                // this is the failing step
                steps[i].status = 1;
                expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
            } else {
                // steps after failed one do not execute
                expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
            }
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

function assertIOSJobExecuted(workflowResult: Step[], ref = '', didExecute = true, failsAt = -1) {
    const steps = [
        createStepAssertion('Checkout', true, null, 'IOS', 'Checkout', [{key: 'ref', value: ref}], []),
        createStepAssertion('Configure MapBox SDK', true, null, 'IOS', 'Configure MapBox SDK'),
        createStepAssertion('Create .env.adhoc file based on staging and add PULL_REQUEST_NUMBER env to it', true, null, 'IOS', 'Creating .env.adhoc file based on staging', [], []),
        createStepAssertion('Setup Node', true, null, 'IOS', 'Setup Node', [], []),
        createStepAssertion('Setup XCode', true, null, 'IOS', 'Setup XCode', [], []),
        createStepAssertion(
            'Setup Ruby',
            true,
            null,
            'IOS',
            'Setup Ruby',
            [
                {key: 'ruby-version', value: '2.7'},
                {key: 'bundler-cache', value: true},
            ],
            [],
        ),
        createStepAssertion('Cache Pod dependencies', true, null, 'IOS', 'Cache Pod dependencies', [
            {key: 'path', value: 'ios/Pods'},
            {key: 'key', value: 'Linux-pods-cache-'},
            {key: 'restore-keys', value: 'Linux-pods-cache-'},
        ]),
        createStepAssertion('Compare Podfile.lock and Manifest.lock', true, null, 'IOS', 'Compare Podfile.lock and Manifest.lock'),
        createStepAssertion(
            'Install cocoapods',
            true,
            null,
            'IOS',
            'Install cocoapods',
            [
                {key: 'timeout_minutes', value: '10'},
                {key: 'max_attempts', value: '5'},
                {key: 'command', value: 'cd ios && bundle exec pod install --verbose'},
            ],
            [],
        ),
        createStepAssertion('Decrypt AdHoc profile', true, null, 'IOS', 'Decrypt AdHoc profile', [], [{key: 'LARGE_SECRET_PASSPHRASE', value: '***'}]),
        createStepAssertion(
            'Decrypt AdHoc Notification Service profile',
            true,
            null,
            'IOS',
            'Decrypt AdHoc Notification Service profile',
            [],
            [{key: 'LARGE_SECRET_PASSPHRASE', value: '***'}],
        ),
        createStepAssertion('Decrypt certificate', true, null, 'IOS', 'Decrypt certificate', [], [{key: 'LARGE_SECRET_PASSPHRASE', value: '***'}]),
        createStepAssertion(
            'Configure AWS Credentials',
            true,
            null,
            'IOS',
            'Configure AWS Credentials',
            [
                {key: 'aws-access-key-id', value: '***'},
                {key: 'aws-secret-access-key', value: '***'},
                {key: 'aws-region', value: 'us-east-1'},
            ],
            [],
        ),
        createStepAssertion(
            'Run Fastlane',
            true,
            null,
            'IOS',
            'Run Fastlane',
            [],
            [
                {key: 'S3_ACCESS_KEY', value: '***'},
                {key: 'S3_SECRET_ACCESS_KEY', value: '***'},
                {key: 'S3_BUCKET', value: 'ad-hoc-expensify-cash'},
                {key: 'S3_REGION', value: 'us-east-1'},
            ],
        ),
        createStepAssertion(
            'Upload Artifact',
            true,
            null,
            'IOS',
            'Upload Artifact',
            [
                {key: 'name', value: 'ios'},
                {key: 'path', value: './ios_paths.json'},
            ],
            [],
        ),
    ] as const;

    steps.forEach((expectedStep, i) => {
        if (didExecute) {
            if (failsAt === -1 || i < failsAt) {
                // either whole job is successful, or steps up to this point are successful
                expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
            } else if (i === failsAt) {
                // this is the failing step
                steps[i].status = 1;
                expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
            } else {
                // steps after failed one do not execute
                expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
            }
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

function assertDesktopJobExecuted(workflowResult: Step[], ref = '', didExecute = true, failsAt = -1) {
    const steps = [
        createStepAssertion('Checkout', true, null, 'DESKTOP', 'Checkout', [{key: 'ref', value: ref}], []),
        createStepAssertion('Create .env.adhoc file based on staging and add PULL_REQUEST_NUMBER env to it', true, null, 'DESKTOP', 'Creating .env.adhoc file based on staging', [], []),
        createStepAssertion('Setup Node', true, null, 'DESKTOP', 'Setup Node', [], []),
        createStepAssertion('Decrypt Developer ID Certificate', true, null, 'DESKTOP', 'Decrypt Developer ID Certificate', [], [{key: 'DEVELOPER_ID_SECRET_PASSPHRASE', value: '***'}]),
        createStepAssertion(
            'Configure AWS Credentials',
            true,
            null,
            'DESKTOP',
            'Configure AWS Credentials',
            [
                {key: 'aws-access-key-id', value: '***'},
                {key: 'aws-secret-access-key', value: '***'},
                {key: 'aws-region', value: 'us-east-1'},
            ],
            [],
        ),
        createStepAssertion(
            'Build desktop app for testing',
            true,
            null,
            'DESKTOP',
            'Build desktop app for testing',
            [],
            [
                {key: 'CSC_LINK', value: '***'},
                {key: 'CSC_KEY_PASSWORD', value: '***'},
                {key: 'APPLE_ID', value: '***'},
                {key: 'APPLE_APP_SPECIFIC_PASSWORD', value: '***'},
                {key: 'AWS_ACCESS_KEY_ID', value: '***'},
                {key: 'AWS_SECRET_ACCESS_KEY', value: '***'},
            ],
        ),
    ] as const;

    steps.forEach((expectedStep, i) => {
        if (didExecute) {
            if (failsAt === -1 || i < failsAt) {
                // either whole job is successful, or steps up to this point are successful
                expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
            } else if (i === failsAt) {
                // this is the failing step
                steps[i].status = 1;
                expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
            } else {
                // steps after failed one do not execute
                expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
            }
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

function assertWebJobExecuted(workflowResult: Step[], ref = '', didExecute = true, failsAt = -1) {
    const steps = [
        createStepAssertion('Checkout', true, null, 'WEB', 'Checkout', [{key: 'ref', value: ref}], []),
        createStepAssertion('Create .env.adhoc file based on staging and add PULL_REQUEST_NUMBER env to it', true, null, 'WEB', 'Creating .env.adhoc file based on staging', [], []),
        createStepAssertion('Setup Node', true, null, 'WEB', 'Setup Node', [], []),
        createStepAssertion(
            'Configure AWS Credentials',
            true,
            null,
            'WEB',
            'Configure AWS Credentials',
            [
                {key: 'aws-access-key-id', value: '***'},
                {key: 'aws-secret-access-key', value: '***'},
                {key: 'aws-region', value: 'us-east-1'},
            ],
            [],
        ),
        createStepAssertion('Build web for testing', true, null, 'WEB', 'Build web for testing', [], []),
        createStepAssertion('Build docs', true, null, 'WEB', 'Build docs', [], []),
        createStepAssertion('Deploy to S3 for internal testing', true, null, 'WEB', 'Deploy to S3 for internal testing', [], []),
    ] as const;

    steps.forEach((expectedStep, i) => {
        if (didExecute) {
            if (failsAt === -1 || i < failsAt) {
                // either whole job is successful, or steps up to this point are successful
                expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
            } else if (i === failsAt) {
                // this is the failing step
                steps[i].status = 1;
                expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
            } else {
                // steps after failed one do not execute
                expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
            }
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

function assertPostGithubCommentJobExecuted(
    workflowResult: Step[],
    ref = '',
    pullRequestNumber = '1234',
    didExecute = true,
    androidStatus = 'success',
    iOSStatus = 'success',
    desktopStatus = 'success',
    webStatus = 'success',
) {
    const steps = [
        createStepAssertion('Checkout', true, null, 'POSTGITHUBCOMMENT', 'Checkout', [{key: 'ref', value: ref}], []),
        createStepAssertion('Download Artifact', true, null, 'POSTGITHUBCOMMENT', 'Download Artifact', [], []),
    ];

    if (androidStatus === 'success') {
        steps.push(createStepAssertion('Read JSONs with android paths', true, null, 'POSTGITHUBCOMMENT', 'Read JSONs with android paths', [], []));
    }
    if (iOSStatus === 'success') {
        steps.push(createStepAssertion('Read JSONs with iOS paths', true, null, 'POSTGITHUBCOMMENT', 'Read JSONs with iOS paths', [], []));
    }

    steps.push(
        createStepAssertion(
            'Publish links to apps for download',
            true,
            null,
            'POSTGITHUBCOMMENT',
            'Publish links to apps for download',
            [
                {key: 'PR_NUMBER', value: pullRequestNumber},
                {key: 'GITHUB_TOKEN', value: '***'},
                {key: 'ANDROID', value: androidStatus},
                {key: 'DESKTOP', value: desktopStatus},
                {key: 'IOS', value: iOSStatus},
                {key: 'WEB', value: webStatus},
                {key: 'ANDROID_LINK', value: androidStatus === 'success' ? 'http://dummy.android.link' : ''},
                {key: 'DESKTOP_LINK', value: `https://ad-hoc-expensify-cash.s3.amazonaws.com/desktop/${pullRequestNumber}/NewExpensify.dmg`},
                {key: 'IOS_LINK', value: iOSStatus === 'success' ? 'http://dummy.ios.link' : ''},
                {key: 'WEB_LINK', value: `https://${pullRequestNumber}.pr-testing.expensify.com`},
            ],
            [],
        ),
    );

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

export default {
    assertValidateActorJobExecuted,
    assertGetBranchRefJobExecuted,
    assertAndroidJobExecuted,
    assertIOSJobExecuted,
    assertDesktopJobExecuted,
    assertWebJobExecuted,
    assertPostGithubCommentJobExecuted,
};
