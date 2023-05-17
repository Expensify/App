import React from 'react';
import CONST from '../CONST';
import withEnvironment, {environmentPropTypes} from './withEnvironment';
import Badge from './Badge';
import styles from '../styles/styles';
import * as Environment from '../libs/Environment/Environment';
import pkg from '../../package.json';

const ENVIRONMENT_SHORT_FORM = {
    [CONST.ENVIRONMENT.DEV]: 'DEV',
    [CONST.ENVIRONMENT.STAGING]: 'STG',
    [CONST.ENVIRONMENT.PRODUCTION]: 'PROD',
    [CONST.ENVIRONMENT.ADHOC]: 'ADHOC',
};

const EnvironmentBadge = (props) => {
    // If we are on production, don't show any badge
    if (props.environment === CONST.ENVIRONMENT.PRODUCTION) {
        return null;
    }

    const text = Environment.isInternalTestBuild() ? `v${pkg.version} PR:${CONST.PULL_REQUEST_NUMBER}` : ENVIRONMENT_SHORT_FORM[props.environment];

    return (
        <Badge
            success={props.environment === CONST.ENVIRONMENT.STAGING || props.environment === CONST.ENVIRONMENT.ADHOC}
            error={props.environment !== CONST.ENVIRONMENT.STAGING && props.environment !== CONST.ENVIRONMENT.ADHOC}
            text={text}
            badgeStyles={[styles.alignSelfCenter]}
            environment={props.environment}
        />
    );
};

EnvironmentBadge.displayName = 'EnvironmentBadge';
EnvironmentBadge.propTypes = environmentPropTypes;
export default withEnvironment(EnvironmentBadge);
