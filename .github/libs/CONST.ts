type Const = {
    GITHUB_OWNER: string;
    APP_REPO: string;
    APPLAUSE_BOT: string;
    OS_BOTIFY: string;
    LABELS: {
        STAGING_DEPLOY: string;
        DEPLOY_BLOCKER: string;
        INTERNAL_QA: string;
    };
    DATE_FORMAT_STRING: string;
    APP_REPO_URL?: string;
    APP_REPO_GIT_URL?: string;
};

const CONST: Const = {
    GITHUB_OWNER: 'Expensify',
    APP_REPO: 'App',
    APPLAUSE_BOT: 'applausebot',
    OS_BOTIFY: 'OSBotify',
    LABELS: {
        STAGING_DEPLOY: 'StagingDeployCash',
        DEPLOY_BLOCKER: 'DeployBlockerCash',
        INTERNAL_QA: 'InternalQA',
    },
    DATE_FORMAT_STRING: 'yyyy-MM-dd',
};

CONST.APP_REPO_URL = `https://github.com/${CONST.GITHUB_OWNER}/${CONST.APP_REPO}`;
CONST.APP_REPO_GIT_URL = `git@github.com:${CONST.GITHUB_OWNER}/${CONST.APP_REPO}.git`;

module.exports = CONST;
