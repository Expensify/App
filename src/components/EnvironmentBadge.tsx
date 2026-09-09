import useEnvironment from '@hooks/useEnvironment';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {getActiveServer} from '@libs/ApiUtils';
import * as Environment from '@libs/Environment/Environment';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ValueOf} from 'type-fest';

import React from 'react';

import type {EnvironmentValue} from './EnvironmentContextProvider/types';

import pkg from '../../package.json';
import Badge from './Badge';

const ENVIRONMENT_SHORT_FORM = {
    [CONST.ENVIRONMENT.DEV]: 'DEV',
    [CONST.ENVIRONMENT.STAGING]: 'STG',
    [CONST.ENVIRONMENT.QA]: 'QA',
    [CONST.ENVIRONMENT.PRODUCTION]: 'PROD',
    [CONST.ENVIRONMENT.ADHOC]: 'ADHOC',
};

function getBadgeEnvironment(activeServer: ValueOf<typeof CONST.SERVER>, environment: EnvironmentValue): EnvironmentValue {
    if (activeServer === CONST.SERVER.QA) {
        return CONST.ENVIRONMENT.QA;
    }

    if (activeServer === CONST.SERVER.STAGING) {
        return CONST.ENVIRONMENT.STAGING;
    }

    // A staging build reaching here is talking to production despite its name
    return environment === CONST.ENVIRONMENT.STAGING ? CONST.ENVIRONMENT.PRODUCTION : environment;
}

function EnvironmentBadge() {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {environment, isProduction} = useEnvironment();
    // Subscribed only to re-render when the switch flips
    useOnyx(ONYXKEYS.ACTIVE_SERVER);

    const badgeEnvironment = getBadgeEnvironment(getActiveServer(), environment);

    const adhoc = badgeEnvironment === CONST.ENVIRONMENT.ADHOC;
    const success = badgeEnvironment === CONST.ENVIRONMENT.STAGING;
    const error = badgeEnvironment !== CONST.ENVIRONMENT.STAGING && badgeEnvironment !== CONST.ENVIRONMENT.ADHOC;

    const badgeEnvironmentStyle = StyleUtils.getEnvironmentBadgeStyle(success, error, adhoc);

    // A production build cannot switch servers
    if (isProduction) {
        return null;
    }

    const text = Environment.isInternalTestBuild() ? `v${pkg.version} PR:${CONST.PULL_REQUEST_NUMBER}` : ENVIRONMENT_SHORT_FORM[badgeEnvironment];

    return (
        <Badge
            success={success}
            error={error}
            text={text}
            badgeStyles={[styles.alignSelfStart, styles.headerEnvBadge, styles.environmentBadge, badgeEnvironmentStyle]}
            textStyles={styles.headerEnvBadgeText}
            environment={badgeEnvironment}
            pressable
        />
    );
}

export default EnvironmentBadge;
