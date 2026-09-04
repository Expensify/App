import BlockingView from '@components/BlockingViews/BlockingView';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import useIsGlobalReimbursementFXEnabled from '@hooks/useIsGlobalReimbursementFXEnabled';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateNetSuiteFxExpenseAccount} from '@libs/actions/connections/NetSuiteCommands';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getNetSuiteExpenseAccountOptions, settingsPendingAction} from '@libs/PolicyUtils';

import {shouldHideReimbursedReportsSection} from '@pages/workspace/accounting/netsuite/utils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import {clearNetSuiteErrorField} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';

function NetSuiteFxExpenseAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isGlobalReimbursementFXEnabled = useIsGlobalReimbursementFXEnabled();

    const policyID = policy?.id;
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const config = policy?.connections?.netsuite?.options.config;
    const netsuiteFxExpenseAccountOptions = useMemo<SelectorType[]>(
        () => getNetSuiteExpenseAccountOptions(policy ?? undefined, config?.fxExpenseAccount),
        [config?.fxExpenseAccount, policy],
    );

    const initiallyFocusedOptionKey = useMemo(() => netsuiteFxExpenseAccountOptions?.find((mode) => mode.isSelected)?.keyForList, [netsuiteFxExpenseAccountOptions]);

    const updateFxExpenseAccount = useCallback(
        ({value}: SelectorType) => {
            if (config?.fxExpenseAccount !== value && policyID) {
                updateNetSuiteFxExpenseAccount(policyID, value, config?.fxExpenseAccount);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID));
        },
        [policyID, config?.fxExpenseAccount],
    );

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={illustrations.Telescope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.netsuite.noAccountsFound')}
                subtitle={translate('workspace.netsuite.noAccountsFoundDescription')}
                containerStyle={styles.pb10}
            />
        ),
        [illustrations.Telescope, translate, styles.pb10],
    );

    const headerContent = useMemo(
        () => (
            <View>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.netsuite.advancedConfig.fxExpenseAccountDescription')}</Text>
            </View>
        ),
        [translate, styles.pb5, styles.ph5],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="NetSuiteFxExpenseAccountSelectPage"
            headerContent={headerContent}
            data={netsuiteFxExpenseAccountOptions}
            onSelectRow={updateFxExpenseAccount}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID))}
            title="workspace.netsuite.advancedConfig.fxExpenseAccount"
            listEmptyContent={listEmptyContent}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            shouldBeBlocked={shouldHideReimbursedReportsSection(config) || !isGlobalReimbursementFXEnabled}
            pendingAction={settingsPendingAction([CONST.NETSUITE_CONFIG.FX_EXPENSE_ACCOUNT], config?.pendingFields)}
            errors={getLatestErrorField(config, CONST.NETSUITE_CONFIG.FX_EXPENSE_ACCOUNT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.FX_EXPENSE_ACCOUNT)}
        />
    );
}

export default withPolicyConnections(NetSuiteFxExpenseAccountSelectPage);
