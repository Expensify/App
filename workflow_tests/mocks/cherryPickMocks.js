const utils = require('../utils/utils');

// validateactor
const CHERRYPICK__VALIDATEACTOR__CHECK_IF_USER_IS_DEPLOYER_TRUE__STEP_MOCK = utils.getMockStep(
    'Check if user is deployer',
    'Checking if user is a deployer',
    'VALIDATEACTOR',
    ['GITHUB_TOKEN', 'username', 'team'],
    [],
    {isTeamMember: true},
);
const CHERRYPICK__VALIDATEACTOR__CHECK_IF_USER_IS_DEPLOYER_FALSE__STEP_MOCK = utils.getMockStep(
    'Check if user is deployer',
    'Checking if user is a deployer',
    'VALIDATEACTOR',
    ['GITHUB_TOKEN', 'username', 'team'],
    [],
    {isTeamMember: false},
);
const CHERRYPICK__VALIDATEACTOR__TRUE__STEP_MOCKS = [
    CHERRYPICK__VALIDATEACTOR__CHECK_IF_USER_IS_DEPLOYER_TRUE__STEP_MOCK,
];
const CHERRYPICK__VALIDATEACTOR__FALSE__STEP_MOCKS = [
    CHERRYPICK__VALIDATEACTOR__CHECK_IF_USER_IS_DEPLOYER_FALSE__STEP_MOCK,
];

// createnewversion
const CHERRYPICK__CREATENEWVERSION__CREATE_NEW_VERSION__STEP_MOCK = utils.getMockStep(
    'Create new version',
    'Creating new version',
    'CREATENEWVERSION',
    [],
    [],
    {NEW_VERSION: '1.2.3'},
);
const CHERRYPICK__CREATENEWVERSION__STEP_MOCKS = [
    CHERRYPICK__CREATENEWVERSION__CREATE_NEW_VERSION__STEP_MOCK,
];

// cherrypick
const CHERRYPICK__CHERRYPICK__CHECKOUT_STAGING_BRANCH__STEP_MOCK = utils.getMockStep(
    'Checkout staging branch',
    'Checking out staging branch',
    'CHERRYPICK',
    ['ref', 'token'],
    [],
);
const CHERRYPICK__CHERRYPICK__SET_UP_GIT_FOR_OSBOTIFY__STEP_MOCK = utils.getMockStep(
    'Set up git for OSBotify',
    'Setting up git for OSBotify',
    'CHERRYPICK',
    ['GPG_PASSPHRASE'],
    [],
);
const CHERRYPICK__CHERRYPICK__CREATE_BRANCH_FOR_NEW_PULL_REQUEST__STEP_MOCK = utils.getMockStep(
    'Create branch for new pull request',
    'Creating branch for new pull request',
    'CHERRYPICK',
    [],
    [],
);
const CHERRYPICK__CHERRYPICK__GET_MERGE_COMMIT_FOR_CP_PULL_REQUEST__STEP_MOCK = utils.getMockStep(
    'Get merge commit for CP pull request',
    'Getting merge commit for CP pull request',
    'CHERRYPICK',
    ['GITHUB_TOKEN', 'USER', 'PULL_REQUEST_NUMBER'],
    [],
    {MERGE_ACTOR: '@dummyauthor'},
);
const CHERRYPICK__CHERRYPICK__GET_MERGE_COMMIT_FOR_VERSION_BUMP_PULL_REQUEST__STEP_MOCK = utils.getMockStep(
    'Get merge commit for version-bump pull request',
    'Getting merge commit for version-bump pull request',
    'CHERRYPICK',
    ['GITHUB_TOKEN', 'USER', 'TITLE_REGEX'],
    [],
    {MERGE_COMMIT_SHA: '0123456789abcdef'},
);
const CHERRYPICK__CHERRYPICK__CHERRY_PICK_THE_VERSION_BUMP_TO_NEW_BRANCH__STEP_MOCK = utils.getMockStep(
    'Cherry-pick the version-bump to new branch',
    'Cherry-picking the version-bump to new branch',
    'CHERRYPICK',
    [],
    [],
);
const CHERRYPICK__CHERRYPICK__CHERRY_PICK_THE_MERGE_COMMIT_OF_TARGET_PR_TO_NEW_BRANCH__SHOULD_MERGE__STEP_MOCK = utils.getMockStep(
    'Cherry-pick the merge commit of target PR to new branch',
    'Cherry-picking the merge commit of target PR to new branch',
    'CHERRYPICK',
    [],
    [],
    {SHOULD_AUTOMERGE: true},
);
// eslint-disable-next-line rulesdir/no-negated-variables
const CHERRYPICK__CHERRYPICK__CHERRY_PICK_THE_MERGE_COMMIT_OF_TARGET_PR_TO_NEW_BRANCH__SHOULD_NOT_MERGE__STEP_MOCK = utils.getMockStep(
    'Cherry-pick the merge commit of target PR to new branch',
    'Cherry-picking the merge commit of target PR to new branch',
    'CHERRYPICK',
    [],
    [],
    {SHOULD_AUTOMERGE: false},
);
const CHERRYPICK__CHERRYPICK__PUSH_CHANGES_TO_CP_BRANCH__STEP_MOCK = utils.getMockStep(
    'Push changes to CP branch',
    'Pushing changes to CP branch',
    'CHERRYPICK',
    [],
    [],
);
const CHERRYPICK__CHERRYPICK__CREATE_PULL_REQUEST__STEP_MOCK = utils.getMockStep(
    'Create Pull Request',
    'Creating Pull Request',
    'CHERRYPICK',
    [],
    ['GITHUB_TOKEN'],
    {PR_NUMBER: '1234'},
);
const CHERRYPICK__CHERRYPICK__CHECK_IF_SHORTVERSIONSTRING_IS_UP_TO_DATE_TRUE__STEP_MOCK = utils.getMockStep(
    'Check if ShortVersionString is up to date',
    'Checking if ShortVersionString is up to date',
    'CHERRYPICK',
    [],
    [],
    {BUNDLE_VERSIONS_MATCH: true},
);
const CHERRYPICK__CHERRYPICK__CHECK_IF_SHORTVERSIONSTRING_IS_UP_TO_DATE_FALSE__STEP_MOCK = utils.getMockStep(
    'Check if ShortVersionString is up to date',
    'Checking if ShortVersionString is up to date',
    'CHERRYPICK',
    [],
    [],
    {BUNDLE_VERSIONS_MATCH: false},
);
const CHERRYPICK__CHERRYPICK__AUTO_ASSIGN_PR_IF_THERE_ARE_MERGE_CONFLICTS_OR_IF_THE_BUNDLE_VERSIONS_ARE_MISMATCHED__STEP_MOCK = utils.getMockStep(
    'Auto-assign PR if there are merge conflicts or if the bundle versions are mismatched',
    'Auto-assigning PR',
    'CHERRYPICK',
    [],
    ['GITHUB_TOKEN'],
);
const CHERRYPICK__CHERRYPICK__ASSIGN_THE_PR_TO_THE_DEPLOYER__STEP_MOCK = utils.getMockStep(
    'Assign the PR to the deployer',
    'Assigning the PR to the deployer',
    'CHERRYPICK',
    [],
    ['GITHUB_TOKEN'],
);
const CHERRYPICK__CHERRYPICK__IF_PR_HAS_MERGE_CONFLICTS_COMMENT_WITH_INSTRUCTIONS_FOR_ASSIGNEE__STEP_MOCK = utils.getMockStep(
    'If PR has merge conflicts, comment with instructions for assignee',
    'Commenting with instructions for assignee',
    'CHERRYPICK',
    [],
    ['GITHUB_TOKEN'],
);
const CHERRYPICK__CHERRYPICK__IF_PR_HAS_A_BUNDLE_VERSION_MISMATCH_COMMENT_WITH_THE_INSTRUCTIONS_FOR_ASSIGNEE__STEP_MOCK = utils.getMockStep(
    'If PR has a bundle version mismatch, comment with the instructions for assignee',
    'Commenting with the instructions for assignee',
    'CHERRYPICK',
    [],
    ['GITHUB_TOKEN'],
);
const CHERRYPICK__CHERRYPICK__AUTO_APPROVE_THE_PR__STEP_MOCK = utils.getMockStep(
    'Auto-approve the PR',
    'Auto-approving the PR',
    'CHERRYPICK',
    [],
    ['GITHUB_TOKEN'],
);
const CHERRYPICK__CHERRYPICK__CHECK_IF_PULL_REQUEST_IS_MERGEABLE_TRUE__STEP_MOCK = utils.getMockStep(
    'Check if pull request is mergeable',
    'Checking if pull request is mergeable',
    'CHERRYPICK',
    ['GITHUB_TOKEN', 'PULL_REQUEST_NUMBER'],
    [],
    {IS_MERGEABLE: true},
);
const CHERRYPICK__CHERRYPICK__CHECK_IF_PULL_REQUEST_IS_MERGEABLE_FALSE__STEP_MOCK = utils.getMockStep(
    'Check if pull request is mergeable',
    'Checking if pull request is mergeable',
    'CHERRYPICK',
    ['GITHUB_TOKEN', 'PULL_REQUEST_NUMBER'],
    [],
    {IS_MERGEABLE: false},
);
const CHERRYPICK__CHERRYPICK__AUTO_MERGE_THE_PR__STEP_MOCK = utils.getMockStep(
    'Auto-merge the PR',
    'Auto-merging the PR',
    'CHERRYPICK',
    [],
    ['GITHUB_TOKEN'],
);
const CHERRYPICK__CHERRYPICK__ANNOUNCES_A_CP_FAILURE_IN_THE_ANNOUNCE_SLACK_ROOM__STEP_MOCK = utils.getMockStep(
    'Announces a CP failure in the #announce Slack room',
    'Announcing a CP failure',
    'CHERRYPICK',
    ['status'],
    ['GITHUB_TOKEN', 'SLACK_WEBHOOK_URL'],
);

const getCherryPickMockSteps = (upToDate, isMergeable, shouldMerge) => [
    CHERRYPICK__CHERRYPICK__CHECKOUT_STAGING_BRANCH__STEP_MOCK,
    CHERRYPICK__CHERRYPICK__SET_UP_GIT_FOR_OSBOTIFY__STEP_MOCK,
    CHERRYPICK__CHERRYPICK__CREATE_BRANCH_FOR_NEW_PULL_REQUEST__STEP_MOCK,
    CHERRYPICK__CHERRYPICK__GET_MERGE_COMMIT_FOR_CP_PULL_REQUEST__STEP_MOCK,
    CHERRYPICK__CHERRYPICK__GET_MERGE_COMMIT_FOR_VERSION_BUMP_PULL_REQUEST__STEP_MOCK,
    CHERRYPICK__CHERRYPICK__CHERRY_PICK_THE_VERSION_BUMP_TO_NEW_BRANCH__STEP_MOCK,
    shouldMerge ? CHERRYPICK__CHERRYPICK__CHERRY_PICK_THE_MERGE_COMMIT_OF_TARGET_PR_TO_NEW_BRANCH__SHOULD_MERGE__STEP_MOCK : CHERRYPICK__CHERRYPICK__CHERRY_PICK_THE_MERGE_COMMIT_OF_TARGET_PR_TO_NEW_BRANCH__SHOULD_NOT_MERGE__STEP_MOCK,
    CHERRYPICK__CHERRYPICK__PUSH_CHANGES_TO_CP_BRANCH__STEP_MOCK,
    CHERRYPICK__CHERRYPICK__CREATE_PULL_REQUEST__STEP_MOCK,
    upToDate ? CHERRYPICK__CHERRYPICK__CHECK_IF_SHORTVERSIONSTRING_IS_UP_TO_DATE_TRUE__STEP_MOCK : CHERRYPICK__CHERRYPICK__CHECK_IF_SHORTVERSIONSTRING_IS_UP_TO_DATE_FALSE__STEP_MOCK,
    CHERRYPICK__CHERRYPICK__AUTO_ASSIGN_PR_IF_THERE_ARE_MERGE_CONFLICTS_OR_IF_THE_BUNDLE_VERSIONS_ARE_MISMATCHED__STEP_MOCK,
    CHERRYPICK__CHERRYPICK__ASSIGN_THE_PR_TO_THE_DEPLOYER__STEP_MOCK,
    CHERRYPICK__CHERRYPICK__IF_PR_HAS_MERGE_CONFLICTS_COMMENT_WITH_INSTRUCTIONS_FOR_ASSIGNEE__STEP_MOCK,
    CHERRYPICK__CHERRYPICK__IF_PR_HAS_A_BUNDLE_VERSION_MISMATCH_COMMENT_WITH_THE_INSTRUCTIONS_FOR_ASSIGNEE__STEP_MOCK,
    CHERRYPICK__CHERRYPICK__AUTO_APPROVE_THE_PR__STEP_MOCK,
    isMergeable ? CHERRYPICK__CHERRYPICK__CHECK_IF_PULL_REQUEST_IS_MERGEABLE_TRUE__STEP_MOCK : CHERRYPICK__CHERRYPICK__CHECK_IF_PULL_REQUEST_IS_MERGEABLE_FALSE__STEP_MOCK,
    CHERRYPICK__CHERRYPICK__AUTO_MERGE_THE_PR__STEP_MOCK,
    CHERRYPICK__CHERRYPICK__ANNOUNCES_A_CP_FAILURE_IN_THE_ANNOUNCE_SLACK_ROOM__STEP_MOCK,
];

module.exports = {
    CHERRYPICK__VALIDATEACTOR__TRUE__STEP_MOCKS,
    CHERRYPICK__VALIDATEACTOR__FALSE__STEP_MOCKS,
    CHERRYPICK__CREATENEWVERSION__STEP_MOCKS,
    getCherryPickMockSteps,
};
