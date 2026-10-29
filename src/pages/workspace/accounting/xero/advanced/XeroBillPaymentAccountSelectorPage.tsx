import BlockingView from '@components/BlockingViews/BlockingView';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getXeroBankAccounts, settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import {updateXeroSyncReimbursementAccountID} from '@userActions/connections/Xero';
import {clearXeroErrorField} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

function XeroBillPaymentAccountSelectorPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = policy?.id ?? CONST.DEFAULT_NUMBER_ID.toString();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const {config} = policy?.connections?.xero ?? {};
    const {reimbursementAccountID, syncReimbursedReports} = policy?.connections?.xero?.config.sync ?? {};
    const xeroSelectorOptions: SelectorType[] = getXeroBankAccounts(policy ?? undefined, reimbursementAccountID);

    const listHeaderComponent = (
        <View style={[styles.pb2, styles.ph5]}>
            <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.xero.advancedConfig.xeroBillPaymentAccountDescription')}</Text>
        </View>
    );

    const initiallyFocusedOptionKey = xeroSelectorOptions?.find((mode) => mode.isSelected)?.keyForList;

    const updateAccount = ({value}: SelectorType) => {
        updateXeroSyncReimbursementAccountID(policyID, value, reimbursementAccountID);
        Navigation.goBack(ROUTES.POLICY_ACCOUNTING_XERO_ADVANCED.getRoute(policyID));
    };

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.xero.noAccountsFound')}
            subtitle={translate('workspace.xero.noAccountsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="XeroBillPaymentAccountSelectorPage"
            data={xeroSelectorOptions}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.XERO}
            shouldBeBlocked={!syncReimbursedReports}
            onSelectRow={updateAccount}
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            headerContent={listHeaderComponent}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_XERO_ADVANCED.getRoute(policyID))}
            title="workspace.xero.advancedConfig.xeroBillPaymentAccount"
            listEmptyContent={listEmptyContent}
            pendingAction={settingsPendingAction([CONST.XERO_CONFIG.REIMBURSEMENT_ACCOUNT_ID], config?.pendingFields)}
            errors={getLatestErrorField(config ?? {}, CONST.XERO_CONFIG.REIMBURSEMENT_ACCOUNT_ID)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearXeroErrorField(policyID, CONST.XERO_CONFIG.REIMBURSEMENT_ACCOUNT_ID)}
        />
    );
}

export default withPolicyConnections(XeroBillPaymentAccountSelectorPage);
