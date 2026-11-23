/**
 * Small badge shown next to the logo or the top bar title on every environment except production, so it's easy to tell which one you are using.
 */
import useEnvironment from '@hooks/useEnvironment';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {isInternalTestBuild} from '@libs/Environment/Environment';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import pkg from '../../package.json';
import Badge from './Badge';
import Tooltip from './Tooltip';

const ENVIRONMENT_SHORT_FORM = {
    [CONST.ENVIRONMENT.DEV]: 'DEV',
    [CONST.ENVIRONMENT.STAGING]: 'STG',
    [CONST.ENVIRONMENT.QA]: 'QA',
    [CONST.ENVIRONMENT.PRODUCTION]: 'PROD',
    [CONST.ENVIRONMENT.ADHOC]: 'ADHOC',
};

type EnvironmentBadgeProps = {
    style?: StyleProp<ViewStyle>;
};

function EnvironmentBadge({style}: EnvironmentBadgeProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {environment, isProduction} = useEnvironment();
    const [shouldHideEnvironmentBadge = false] = useOnyx(ONYXKEYS.SHOULD_HIDE_ENVIRONMENT_BADGE);

    if (isProduction || shouldHideEnvironmentBadge) {
        return null;
    }

    const adhoc = environment === CONST.ENVIRONMENT.ADHOC;
    const success = environment === CONST.ENVIRONMENT.STAGING;
    const error = environment !== CONST.ENVIRONMENT.STAGING && environment !== CONST.ENVIRONMENT.ADHOC;

    const badgeEnvironmentStyle = StyleUtils.getEnvironmentBadgeStyle(success, error, adhoc);
    // The version and PR number of internal test builds are too long to fit next to the logo, so they are shown on hover
    const tooltipText = isInternalTestBuild() ? `v${pkg.version} PR:${CONST.PULL_REQUEST_NUMBER}` : undefined;

    return (
        <Tooltip text={tooltipText}>
            {/* Tooltip measures its child through a ref, which Badge does not forward */}
            <View>
                <Badge
                    success={success}
                    error={error}
                    text={ENVIRONMENT_SHORT_FORM[environment]}
                    badgeStyles={[styles.headerEnvBadge, styles.environmentBadge, badgeEnvironmentStyle, style]}
                    textStyles={styles.headerEnvBadgeText}
                    environment={environment}
                />
            </View>
        </Tooltip>
    );
}

export default EnvironmentBadge;
