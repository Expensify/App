import React from 'react';
import useEnvironment from '@hooks/useEnvironment';
import * as Environment from '@libs/Environment/Environment';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import pkg from '../../package.json';
import Badge from './Badge';

const ENVIRONMENT_SHORT_FORM = {
    [CONST.ENVIRONMENT.DEV]: 'DEV',
    [CONST.ENVIRONMENT.STAGING]: 'STG',
    [CONST.ENVIRONMENT.PRODUCTION]: 'PROD',
    [CONST.ENVIRONMENT.ADHOC]: 'ADHOC',
};

function EnvironmentBadge() {
    const styles = useThemeStyles();
    const {environment, isProduction} = useEnvironment();

    // If we are on production, don't show any badge
    if (isProduction) {
        return null;
    }

    const text = Environment.isInternalTestBuild() ? `v${pkg.version} PR:${CONST.PULL_REQUEST_NUMBER}` : ENVIRONMENT_SHORT_FORM[environment];

    return (
        <Badge
            success={environment === CONST.ENVIRONMENT.STAGING || environment === CONST.ENVIRONMENT.ADHOC}
            error={environment !== CONST.ENVIRONMENT.STAGING && environment !== CONST.ENVIRONMENT.ADHOC}
            text={text}
            badgeStyles={[styles.alignSelfEnd, styles.headerEnvBadge]}
            textStyles={[styles.headerEnvBadgeText]}
            environment={environment}
        />
    );
}

EnvironmentBadge.displayName = 'EnvironmentBadge';
export default EnvironmentBadge;
