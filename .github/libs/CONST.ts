const GITHUB_BASE_URL_REGEX = new RegExp('https?://(?:github\\.com|api\\.github\\.com)');

const GIT_CONST = {
    GITHUB_OWNER: process.env.GITHUB_REPOSITORY_OWNER,
    APP_REPO: process.env.GITHUB_REPOSITORY.split('/').at(1) ?? '',
    MOBILE_EXPENSIFY_REPO: 'Mobile-Expensify',
} as const;

const CONST = {
    ...GIT_CONST,
    APPLAUSE_BOT: 'applausebot',
    OS_BOTIFY: 'OSBotify',
    LABELS: {
        STAGING_DEPLOY: 'StagingDeployCash',
        DEPLOY_BLOCKER: 'DeployBlockerCash',
        INTERNAL_QA: 'InternalQA',
        HELP_WANTED: 'Help Wanted',
        CP_STAGING: 'CP Staging',
    },
    ACTIONS: {
        CREATED: 'created',
        EDITED: 'edited',
    },
    EVENTS: {
        ISSUE_COMMENT: 'issue_comment',
    },
    PROPOSAL_KEYWORD: 'Proposal',
    DATE_FORMAT_STRING: 'yyyy-MM-dd',
    PULL_REQUEST_REGEX: new RegExp(`${GITHUB_BASE_URL_REGEX.source}/.*/.*/pull/([0-9]+).*`),
    ISSUE_REGEX: new RegExp(`${GITHUB_BASE_URL_REGEX.source}/.*/.*/issues/([0-9]+).*`),
    ISSUE_OR_PULL_REQUEST_REGEX: new RegExp(`${GITHUB_BASE_URL_REGEX.source}/.*/.*/(?:pull|issues)/([0-9]+).*`),
    POLL_RATE: 10000,
    APP_REPO_URL: `https://github.com/${GIT_CONST.GITHUB_OWNER}/${GIT_CONST.APP_REPO}`,
    APP_REPO_GIT_URL: `git@github.com:${GIT_CONST.GITHUB_OWNER}/${GIT_CONST.APP_REPO}.git`,
    NO_ACTION: 'NO_ACTION',
    ACTION_EDIT: 'ACTION_EDIT',
    ACTION_REQUIRED: 'ACTION_REQUIRED',
} as const;

export default CONST;
