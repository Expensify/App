import TextLink from '@components/TextLink';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

type NetSuiteTokenAuthenticationLinkProps = {
    policyID: string | undefined;
};

/** Moves the wizard from the OAuth 2.0 steps to the first token-based authentication (SOAP) step. */
function NetSuiteTokenAuthenticationLink({policyID}: NetSuiteTokenAuthenticationLinkProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const switchToTokenAuthentication = () => {
        Navigation.navigate(
            ROUTES.POLICY_ACCOUNTING_NETSUITE_TOKEN_INPUT.getRoute(policyID, CONST.NETSUITE_CONFIG.TOKEN_INPUT.PAGE_NAME.AUTHENTICATION, CONST.NETSUITE_CONFIG.TOKEN_INPUT.AUTH_TYPE.TBA),
        );
    };

    return (
        <TextLink
            style={[styles.link, styles.fontSizeLabel, styles.textAlignCenter, styles.mt3]}
            onPress={switchToTokenAuthentication}
        >
            {translate('workspace.netsuite.tokenInput.connectWithTokenAuthentication')}
        </TextLink>
    );
}

export default NetSuiteTokenAuthenticationLink;
