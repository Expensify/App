import Text from '@components/Text';
import TextLink from '@components/TextLink';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import type {StyleProp, TextStyle} from 'react-native';

import React from 'react';

type NetSuiteTokenAuthenticationLinkProps = {
    policyID: string | undefined;
    style?: StyleProp<TextStyle>;
};

/** Renders a sentence with a link that moves the wizard from the OAuth 2.0 steps to the first token-based authentication (SOAP) step. */
function NetSuiteTokenAuthenticationLink({policyID, style}: NetSuiteTokenAuthenticationLinkProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const switchToTokenAuthentication = () => {
        Navigation.navigate(
            ROUTES.POLICY_ACCOUNTING_NETSUITE_TOKEN_INPUT.getRoute(policyID, CONST.NETSUITE_CONFIG.TOKEN_INPUT.PAGE_NAME.AUTHENTICATION, CONST.NETSUITE_CONFIG.TOKEN_INPUT.AUTH_TYPE.TBA),
        );
    };

    return (
        <Text style={[styles.textSupporting, style]}>
            {translate('workspace.netsuite.tokenInput.tokenAuthenticationPrompt.beforeLink')}{' '}
            <TextLink onPress={switchToTokenAuthentication}>{translate('workspace.netsuite.tokenInput.tokenAuthenticationPrompt.link')}</TextLink>{' '}
            {translate('workspace.netsuite.tokenInput.tokenAuthenticationPrompt.afterLink')}
        </Text>
    );
}

export default NetSuiteTokenAuthenticationLink;
