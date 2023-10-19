const CONST = {
    GITHUB_OWNER: 'margelo',
    APP_REPO: 'expensify-app-fork',
    APPLAUSE_BOT: 'applausebot',
    OS_BOTIFY: 'OSBotify',
    LABELS: {
        STAGING_DEPLOY: 'StagingDeployCash',
        DEPLOY_BLOCKER: 'DeployBlockerCash',
        INTERNAL_QA: 'InternalQA',
    },
};

CONST.APP_REPO_URL = `https://github.com/${CONST.GITHUB_OWNER}/${CONST.APP_REPO}`;
CONST.APP_REPO_GIT_URL = `git@github.com:${CONST.GITHUB_OWNER}/${CONST.APP_REPO}.git`;

module.exports = CONST;
