import ConnectionLayout from '@components/ConnectionLayout';
import InteractiveStepSubPageHeader from '@components/InteractiveStepSubPageHeader';

import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useSubPage from '@hooks/useSubPage';
import useThemeStyles from '@hooks/useThemeStyles';

import {isAuthenticationError} from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import type {CustomSubPageTokenInputProps} from '@pages/workspace/accounting/netsuite/types';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {useRoute} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';

import NetSuiteTokenInputForm from './subPages/NetSuiteTokenInputForm';
import NetSuiteTokenSetupContent from './subPages/NetSuiteTokenSetupContent';

const tokenPages = [
    {pageName: CONST.NETSUITE_CONFIG.TOKEN_INPUT.PAGE_NAME.INSTALL, component: NetSuiteTokenSetupContent},
    {pageName: CONST.NETSUITE_CONFIG.TOKEN_INPUT.PAGE_NAME.AUTHENTICATION, component: NetSuiteTokenSetupContent},
    {pageName: CONST.NETSUITE_CONFIG.TOKEN_INPUT.PAGE_NAME.SOAP, component: NetSuiteTokenSetupContent},
    {pageName: CONST.NETSUITE_CONFIG.TOKEN_INPUT.PAGE_NAME.ACCESS_TOKEN, component: NetSuiteTokenSetupContent},
    {pageName: CONST.NETSUITE_CONFIG.TOKEN_INPUT.PAGE_NAME.CREDENTIALS, component: NetSuiteTokenInputForm},
];

const oauthPages = [
    {pageName: CONST.NETSUITE_CONFIG.TOKEN_INPUT.PAGE_NAME.INSTALL, component: NetSuiteTokenSetupContent},
    {pageName: CONST.NETSUITE_CONFIG.TOKEN_INPUT.PAGE_NAME.OAUTH, component: NetSuiteTokenSetupContent},
    {pageName: CONST.NETSUITE_CONFIG.TOKEN_INPUT.PAGE_NAME.REST, component: NetSuiteTokenSetupContent},
    {pageName: CONST.NETSUITE_CONFIG.TOKEN_INPUT.PAGE_NAME.CREDENTIALS, component: NetSuiteTokenInputForm},
];

type NetSuiteTokenInputRoute = PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_TOKEN_INPUT>;

function NetSuiteTokenInputPage({policy}: WithPolicyConnectionsProps) {
    const policyID = policy?.id;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isProduction} = useEnvironment();
    const {params} = useRoute<NetSuiteTokenInputRoute>();
    const {authType} = params;

    const hasAuthError = isAuthenticationError(policy, CONST.POLICY.CONNECTIONS.NAME.NETSUITE);
    // Only dev and staging can switch back to the token-based (TBA/SOAP) flow via route param, for testing.
    const canSwitchToTokenAuthentication = !isProduction;
    const isTokenAuthenticationSelected = canSwitchToTokenAuthentication && authType === CONST.NETSUITE_CONFIG.TOKEN_INPUT.AUTH_TYPE.TBA;
    // TBA connections store a tokenID while OAuth connections do not so this is used to pick the correct credentials
    // form upon reconnection. Fresh connections will always use the OAuth wizard.
    const netSuiteConnection = policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.NETSUITE];
    const isOAuthFlow = !(hasAuthError && !!netSuiteConnection?.tokenID) && !isTokenAuthenticationSelected;
    const pages = isOAuthFlow ? oauthPages : tokenPages;
    const stepNames = isOAuthFlow ? CONST.NETSUITE_CONFIG.TOKEN_INPUT.OAUTH_STEP_INDEX_LIST : CONST.NETSUITE_CONFIG.TOKEN_INPUT.STEP_INDEX_LIST;

    const submit = () => {
        Navigation.dismissModal();
    };

    const {CurrentPage, nextPage, prevPage, pageIndex, moveTo, currentPageName} = useSubPage<CustomSubPageTokenInputProps>({
        pages,
        onFinished: submit,
        buildRoute: (pageName) => ROUTES.POLICY_ACCOUNTING_NETSUITE_TOKEN_INPUT.getRoute(params.policyID, pageName, authType),
    });

    const handleBackButtonPress = () => {
        if (pageIndex === 0) {
            Navigation.goBack();
            return;
        }
        prevPage();
    };

    const shouldPageBeBlocked = !isEmptyObject(policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.NETSUITE]) && !hasAuthError;

    return (
        <ConnectionLayout
            displayName="NetSuiteTokenInputPage"
            headerTitle="workspace.netsuite.tokenInput.title"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.flex1]}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            onBackButtonPress={handleBackButtonPress}
            shouldLoadForEmptyConnection={isEmptyObject(policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.NETSUITE])}
            shouldBeBlocked={shouldPageBeBlocked}
            shouldUseScrollView={CurrentPage !== NetSuiteTokenInputForm}
        >
            <View style={[styles.ph5, styles.mb3, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubPageHeader
                    currentStepIndex={pageIndex}
                    stepNames={stepNames}
                    currentStepAccessibilityDescription={translate('workspace.netsuite.tokenInput.title')}
                    onStepSelected={moveTo}
                />
            </View>
            <CurrentPage
                isEditing={false}
                onNext={nextPage}
                onMove={moveTo}
                currentPageName={currentPageName}
                policyID={policyID}
                isOAuthFlow={isOAuthFlow}
                shouldShowTokenAuthenticationLink={canSwitchToTokenAuthentication && isOAuthFlow}
            />
        </ConnectionLayout>
    );
}

export default withPolicyConnections(NetSuiteTokenInputPage);
