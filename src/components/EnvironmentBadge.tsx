import React from 'react';
import useEnvironment from '@hooks/useEnvironment';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Environment from '@libs/Environment/Environment';
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
    const StyleUtils = useStyleUtils();
    const {environment, isProduction} = useEnvironment();

    const adhoc = environment === CONST.ENVIRONMENT.ADHOC;
    const success = environment === CONST.ENVIRONMENT.STAGING;
    const error = environment !== CONST.ENVIRONMENT.STAGING && environment !== CONST.ENVIRONMENT.ADHOC;

    const badgeEnviromentStyle = StyleUtils.getEnvironmentBadgeStyle(success, error, adhoc);

    // If we are on production, don't show any badge
    if (isProduction) {
        return null;
    }

    const text = Environment.isInternalTestBuild() ? `v${pkg.version} PR:${CONST.PULL_REQUEST_NUMBER}` : ENVIRONMENT_SHORT_FORM[environment];

    return (
        <Badge
            success={success}
            error={error}
            text={text}
            badgeStyles={[styles.alignSelfStart, styles.headerEnvBadge, styles.environmentBadge, badgeEnviromentStyle]}
            textStyles={styles.headerEnvBadgeText}
            environment={environment}
            pressable
        />
    );
}

EnvironmentBadge.displayName = 'EnvironmentBadge';
export default EnvironmentBadge;
