/**
 * Small badge shown next to the top bar title on every environment except production, so it's easy to tell which one you are using.
 */
import useEnvironment from '@hooks/useEnvironment';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {isInternalTestBuild} from '@libs/Environment/Environment';

import CONST from '@src/CONST';

import React from 'react';

import pkg from '../../package.json';
import Badge from './Badge';

const ENVIRONMENT_SHORT_FORM = {
    [CONST.ENVIRONMENT.DEV]: 'DEV',
    [CONST.ENVIRONMENT.STAGING]: 'STG',
    [CONST.ENVIRONMENT.QA]: 'QA',
    [CONST.ENVIRONMENT.PRODUCTION]: 'PROD',
    [CONST.ENVIRONMENT.ADHOC]: 'ADHOC',
};

function EnvironmentBadge() {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {environment, isProduction} = useEnvironment();

    if (isProduction) {
        return null;
    }

    const adhoc = environment === CONST.ENVIRONMENT.ADHOC;
    const success = environment === CONST.ENVIRONMENT.STAGING;
    const error = environment !== CONST.ENVIRONMENT.STAGING && environment !== CONST.ENVIRONMENT.ADHOC;

    const badgeEnvironmentStyle = StyleUtils.getEnvironmentBadgeStyle(success, error, adhoc);
    const text = isInternalTestBuild() ? `v${pkg.version} PR:${CONST.PULL_REQUEST_NUMBER}` : ENVIRONMENT_SHORT_FORM[environment];

    return (
        <Badge
            success={success}
            error={error}
            text={text}
            badgeStyles={[styles.alignSelfStart, styles.headerEnvBadge, styles.environmentBadge, badgeEnvironmentStyle]}
            textStyles={styles.headerEnvBadgeText}
            environment={environment}
        />
    );
}

export default EnvironmentBadge;
