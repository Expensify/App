const CONST = {
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
    APP_REPO_URL: '',
    APP_REPO_GIT_URL: '',
};

CONST.APP_REPO_URL = `https://github.com/${CONST.GITHUB_OWNER}/${CONST.APP_REPO}`;
CONST.APP_REPO_GIT_URL = `git@github.com:${CONST.GITHUB_OWNER}/${CONST.APP_REPO}.git`;

export default CONST;
