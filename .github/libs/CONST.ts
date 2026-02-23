const GITHUB_BASE_URL_REGEX = new RegExp('https?://(?:github\\.com|api\\.github\\.com)');

const GIT_CONST = {
    GITHUB_OWNER: process.env.GITHUB_REPOSITORY_OWNER ?? 'Expensify',
    APP_REPO: (process.env.GITHUB_REPOSITORY ?? 'Expensify/App').split('/').at(1) ?? '',
    MOBILE_EXPENSIFY_REPO: 'Mobile-Expensify',
    DEFAULT_BASE_REF: 'main',
} as const;

const CONST = {
    ...GIT_CONST,
    APPLAUSE_BOT: 'applausebot',
    OS_BOTIFY: 'OSBotify',
    LABELS: {
        STAGING_DEPLOY: 'StagingDeployCash',
        DEPLOY_BLOCKER: 'DeployBlockerCash',
        LOCK_DEPLOY: '🔐 LockCashDeploys 🔐',
        INTERNAL_QA: 'InternalQA',
        HELP_WANTED: 'Help Wanted',
        CP_STAGING: 'CP Staging',
    },
    STATE: {
        OPEN: 'open',
    },
    COMMENT: {
        TYPE_BOT: 'Bot',
        NAME_MELVIN_BOT: 'melvin-bot',
        NAME_MELVIN_USER: 'MelvinBot',
        NAME_CODEX: 'chatgpt-codex-connector',
        NAME_GITHUB_ACTIONS: 'github-actions',
    },
    ACTIONS: {
        CREATED: 'created',
        EDITED: 'edited',
    },
    EVENTS: {
        ISSUE_COMMENT: 'issue_comment',
    },
    RUN_EVENT: {
        PULL_REQUEST: 'pull_request',
        PULL_REQUEST_TARGET: 'pull_request_target',
        PUSH: 'push',
    },
    RUN_STATUS: {
        COMPLETED: 'completed',
        IN_PROGRESS: 'in_progress',
        QUEUED: 'queued',
    },
    RUN_STATUS_CONCLUSION: {
        SUCCESS: 'success',
    },
    TEST_WORKFLOW_NAME: 'Jest Unit Tests',
    TEST_WORKFLOW_PATH: '.github/workflows/test.yml',
    PROPOSAL_KEYWORD: 'Proposal',
    PROPOSAL_HEADER_A: 'what is the root cause of that problem?',
    PROPOSAL_HEADER_B: 'what changes do you think we should make in order to solve the problem?',
    DATE_FORMAT_STRING: 'yyyy-MM-dd',
    PULL_REQUEST_REGEX: new RegExp(`${GITHUB_BASE_URL_REGEX.source}/.*/.*/pull/([0-9]+).*`),
    ISSUE_REGEX: new RegExp(`${GITHUB_BASE_URL_REGEX.source}/.*/.*/issues/([0-9]+).*`),
    ISSUE_OR_PULL_REQUEST_REGEX: new RegExp(`${GITHUB_BASE_URL_REGEX.source}/.*/.*/(?:pull|issues)/([0-9]+).*`),
    POLL_RATE: 10000,
    APP_REPO_URL: `https://github.com/${GIT_CONST.GITHUB_OWNER}/${GIT_CONST.APP_REPO}`,
    APP_REPO_GIT_URL: `git@github.com:${GIT_CONST.GITHUB_OWNER}/${GIT_CONST.APP_REPO}.git`,
    MOBILE_EXPENSIFY_URL: `https://github.com/${GIT_CONST.GITHUB_OWNER}/${GIT_CONST.MOBILE_EXPENSIFY_REPO}`,
    NO_ACTION: 'NO_ACTION',
    ACTION_EDIT: 'ACTION_EDIT',
    ACTION_REQUIRED: 'ACTION_REQUIRED',
    ACTION_HIDE_DUPLICATE: 'ACTION_HIDE_DUPLICATE',
} as const;

export default CONST;
