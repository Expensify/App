const GIT_CONST = {
    GITHUB_OWNER: 'Expensify',
    APP_REPO: 'App',
} as const;

const CONST = {
    ...GIT_CONST,
    APPLAUSE_BOT: 'applausebot',
    OS_BOTIFY: 'OSBotify',
    LABELS: {
        STAGING_DEPLOY: 'StagingDeployCash',
        DEPLOY_BLOCKER: 'DeployBlockerCash',
        INTERNAL_QA: 'InternalQA',
    },
    DATE_FORMAT_STRING: 'yyyy-MM-dd',
    APP_REPO_URL: `https://github.com/${GIT_CONST.GITHUB_OWNER}/${GIT_CONST.APP_REPO}`,
    APP_REPO_GIT_URL: `git@github.com:${GIT_CONST.GITHUB_OWNER}/${GIT_CONST.APP_REPO}.git`,
} as const;

export default CONST;
