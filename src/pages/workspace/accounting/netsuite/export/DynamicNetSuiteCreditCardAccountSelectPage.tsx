import BlockingView from '@components/BlockingViews/BlockingView';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateNetSuiteCreditCardAccount} from '@libs/actions/connections/NetSuiteCommands';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getNetSuiteCreditCardAccountOptions} from '@libs/NetSuiteUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';

import {isNonReimbursableCreditCardChargeExport} from '@pages/workspace/accounting/netsuite/utils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import {clearNetSuiteErrorField} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import React from 'react';

function DynamicNetSuiteCreditCardAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = policy?.id;
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_CREDIT_CARD_ACCOUNT_SELECT.path);

    const config = policy?.connections?.netsuite?.options.config;
    const currentSettingName = CONST.NETSUITE_CONFIG.CREDIT_CARD_ACCOUNT;
    const currentCreditCardAccountID = config?.creditCardAccount ?? CONST.NETSUITE_PAYABLE_ACCOUNT_DEFAULT_VALUE;
    const creditCardAccountOptions: SelectorType[] = getNetSuiteCreditCardAccountOptions(policy ?? undefined, currentCreditCardAccountID);

    const initiallyFocusedOptionKey = creditCardAccountOptions?.find((mode) => mode.isSelected)?.keyForList;

    const goBack = () => {
        Navigation.goBack(backPath);
    };

    const updateCreditCardAccount = ({value}: SelectorType) => {
        if (currentCreditCardAccountID !== value && policyID) {
            updateNetSuiteCreditCardAccount(policyID, value, currentCreditCardAccountID);
        }
        goBack();
    };

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.netsuite.noAccountsFound')}
            subtitle={translate('workspace.netsuite.noAccountsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    return (
        <SelectionScreen
            displayName="DynamicNetSuiteCreditCardAccountSelectPage"
            title="workspace.netsuite.creditCardAccount"
            data={creditCardAccountOptions}
            onSelectRow={updateCreditCardAccount}
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            onBackButtonPress={goBack}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            shouldBeBlocked={!isNonReimbursableCreditCardChargeExport(config)}
            pendingAction={settingsPendingAction([currentSettingName], config?.pendingFields)}
            errors={getLatestErrorField(config, currentSettingName)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearNetSuiteErrorField(policyID, currentSettingName)}
            listEmptyContent={listEmptyContent}
        />
    );
}

export default withPolicyConnections(DynamicNetSuiteCreditCardAccountSelectPage);
