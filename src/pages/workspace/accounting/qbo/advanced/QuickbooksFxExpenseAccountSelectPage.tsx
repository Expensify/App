import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import useIsGlobalReimbursementFXEnabled from '@hooks/useIsGlobalReimbursementFXEnabled';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateQuickbooksOnlineFxExpenseAccount} from '@libs/actions/connections/QuickbooksOnline';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import {getQuickbooksOnlineIntegrationName} from '@pages/workspace/accounting/utils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import {clearQBOErrorField} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';

type SelectorType = ListItem & {
    value: string;
};

function QuickbooksFxExpenseAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isGlobalReimbursementFXEnabled = useIsGlobalReimbursementFXEnabled();
    const integrationName = getQuickbooksOnlineIntegrationName(policy, translate);
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const policyID = policy?.id ?? CONST.DEFAULT_NUMBER_ID.toString();
    const {expenseAccounts} = policy?.connections?.quickbooksOnline?.data ?? {};
    const qboConfig = policy?.connections?.quickbooksOnline?.config;

    const qboOnlineSelectorOptions = useMemo<SelectorType[]>(
        () =>
            (expenseAccounts ?? []).map(({id, name}) => ({
                value: id,
                text: name,
                keyForList: id,
                isSelected: qboConfig?.fxExpenseAccount === id,
            })),
        [qboConfig?.fxExpenseAccount, expenseAccounts],
    );

    const listHeaderComponent = useMemo(
        () => (
            <View style={[styles.pb2, styles.ph5]}>
                <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.qbo.advancedConfig.fxExpenseAccountDescription', integrationName)}</Text>
            </View>
        ),
        [translate, styles.pb2, styles.ph5, styles.pb5, styles.textNormal, integrationName],
    );

    const initiallyFocusedOptionKey = useMemo(() => qboOnlineSelectorOptions?.find((mode) => mode.isSelected)?.keyForList, [qboOnlineSelectorOptions]);

    const updateAccount = useCallback(
        ({value}: SelectorType) => {
            updateQuickbooksOnlineFxExpenseAccount(policyID, value, qboConfig?.fxExpenseAccount);
            Navigation.goBack(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ADVANCED.getRoute(policyID));
        },
        [policyID, qboConfig?.fxExpenseAccount],
    );

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={illustrations.Telescope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.qbo.noAccountsFound')}
                subtitle={translate('workspace.qbo.noAccountsFoundDescription', integrationName)}
                containerStyle={styles.pb10}
            />
        ),
        [illustrations.Telescope, translate, styles.pb10, integrationName],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            shouldBeBlocked={!isGlobalReimbursementFXEnabled}
            displayName="QuickbooksFxExpenseAccountSelectPage"
            data={qboOnlineSelectorOptions}
            headerContent={listHeaderComponent}
            onSelectRow={updateAccount}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            listEmptyContent={listEmptyContent}
            title="workspace.qbo.advancedConfig.qboFxExpenseAccount"
            headerTitleAlreadyTranslated={translate('workspace.qbo.advancedConfig.qboFxExpenseAccount', integrationName)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ADVANCED.getRoute(policyID))}
            pendingAction={settingsPendingAction([CONST.QUICKBOOKS_CONFIG.FX_EXPENSE_ACCOUNT], qboConfig?.pendingFields)}
            errors={getLatestErrorField(qboConfig, CONST.QUICKBOOKS_CONFIG.FX_EXPENSE_ACCOUNT)}
            errorRowStyles={[styles.ph5, styles.mv3]}
            onClose={() => clearQBOErrorField(policyID, CONST.QUICKBOOKS_CONFIG.FX_EXPENSE_ACCOUNT)}
        />
    );
}

export default withPolicyConnections(QuickbooksFxExpenseAccountSelectPage);
