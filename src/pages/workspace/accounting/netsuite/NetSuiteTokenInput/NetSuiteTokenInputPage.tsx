import React from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import InteractiveStepSubPageHeader from '@components/InteractiveStepSubPageHeader';
import useSubPage from '@hooks/useSubPage';
import useThemeStyles from '@hooks/useThemeStyles';
import {isAuthenticationError} from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {CustomSubPageTokenInputProps} from '@pages/workspace/accounting/netsuite/types';
import NetSuiteTokenInputForm from './substeps/NetSuiteTokenInputForm';
import NetSuiteTokenSetupContent from './substeps/NetSuiteTokenSetupContent';

const pages = [
    {pageName: CONST.NETSUITE_CONFIG.TOKEN_INPUT_PAGE_NAME.INSTALL, component: NetSuiteTokenSetupContent},
    {pageName: CONST.NETSUITE_CONFIG.TOKEN_INPUT_PAGE_NAME.AUTHENTICATION, component: NetSuiteTokenSetupContent},
    {pageName: CONST.NETSUITE_CONFIG.TOKEN_INPUT_PAGE_NAME.SOAP, component: NetSuiteTokenSetupContent},
    {pageName: CONST.NETSUITE_CONFIG.TOKEN_INPUT_PAGE_NAME.ACCESS_TOKEN, component: NetSuiteTokenSetupContent},
    {pageName: CONST.NETSUITE_CONFIG.TOKEN_INPUT_PAGE_NAME.CREDENTIALS, component: NetSuiteTokenInputForm},
];
const CREDENTIALS_PAGE_INDEX = 4;

function NetSuiteTokenInputPage({policy, route}: WithPolicyConnectionsProps) {
    const policyID = policy?.id;
    const styles = useThemeStyles();

    const hasAuthError = isAuthenticationError(policy, CONST.POLICY.CONNECTIONS.NAME.NETSUITE);

    const submit = () => {
        Navigation.dismissModal();
    };

    const {CurrentPage, nextPage, prevPage, pageIndex, moveTo, currentPageName} = useSubPage<CustomSubPageTokenInputProps>({
        pages,
        onFinished: submit,
        startFrom: hasAuthError ? CREDENTIALS_PAGE_INDEX : 0,
        buildRoute: (pageName) => ROUTES.POLICY_ACCOUNTING_NETSUITE_TOKEN_INPUT.getRoute(route.params.policyID, pageName),
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
                    stepNames={CONST.NETSUITE_CONFIG.TOKEN_INPUT_STEP_NAMES}
                    onStepSelected={moveTo}
                />
            </View>
            <CurrentPage
                onNext={nextPage}
                onMove={moveTo}
                currentPageName={currentPageName}
                policyID={policyID}
            />
        </ConnectionLayout>
    );
}

export default withPolicyConnections(NetSuiteTokenInputPage);
