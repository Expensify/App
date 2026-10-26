import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSelectionListSearch from '@hooks/useSelectionListSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearRilletErrorField, updateRilletReimbursementAccount} from '@libs/actions/connections/Rillet';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction, shouldShowReimbursableExportDestinationAccountError} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {RilletAccount} from '@src/types/onyx/Policy';

import React from 'react';
import {View} from 'react-native';

type AccountListItem = ListItem & {
    value: RilletAccount['code'];
};

function RilletReimbursementAccountPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const policyID = policy?.id;
    const rilletConfig = policy?.connections?.rillet?.config;
    const rilletData = policy?.connections?.rillet?.data;
    const reimbursementAccountCode = rilletConfig?.export?.reimbursementAccountCode;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_RILLET_EXPORT.getRoute(policyID) : undefined;

    const data: AccountListItem[] =
        rilletData?.accounts
            ?.filter(
                (accountItem) =>
                    accountItem.type === CONST.RILLET_ACCOUNT_TYPE.LIABILITY &&
                    accountItem.subtype !== CONST.RILLET_ACCOUNT_SUBTYPE.CREDIT_CARD &&
                    accountItem.subtype !== CONST.RILLET_ACCOUNT_SUBTYPE.ACCOUNTS_PAYABLE &&
                    accountItem.subtype !== CONST.RILLET_ACCOUNT_SUBTYPE.OTHER_LONG_TERM_LIABILITY &&
                    accountItem.status === CONST.RILLET_ACCOUNT_STATUS.ACTIVE,
            )
            .map((accountItem) => ({
                value: accountItem.code,
                text: `${accountItem.code} ${accountItem.name}`,
                keyForList: accountItem.code,
                isSelected: reimbursementAccountCode === accountItem.code,
            })) ?? [];
    const {filteredData, textInputOptions} = useSelectionListSearch(data);

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.rillet.reimbursementAccount.description')}</Text>
        </View>
    );

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.rillet.noAccountsFound')}
            subtitle={translate('workspace.rillet.noAccountsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    const errors = shouldShowReimbursableExportDestinationAccountError(policy, [CONST.POLICY.CONNECTIONS.NAME.RILLET])
        ? {
              [CONST.RILLET_CONFIG.REIMBURSEMENT_ACCOUNT_CODE]: translate('workspace.rillet.reimbursementAccount.accountRequiredError'),
          }
        : getLatestErrorField(rilletConfig, CONST.RILLET_CONFIG.REIMBURSEMENT_ACCOUNT_CODE);

    const selectReimbursementAccount = (item: AccountListItem) => {
        if (item.value !== reimbursementAccountCode && policyID) {
            updateRilletReimbursementAccount(policyID, item.value, reimbursementAccountCode);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="RilletReimbursementAccountPage"
            title="workspace.rillet.reimbursementAccount.label"
            data={filteredData}
            textInputOptions={textInputOptions}
            headerContent={headerContent}
            listEmptyContent={listEmptyContent}
            onSelectRow={selectReimbursementAccount}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={reimbursementAccountCode}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.RILLET}
            pendingAction={settingsPendingAction([CONST.RILLET_CONFIG.REIMBURSEMENT_ACCOUNT_CODE], rilletConfig?.pendingFields)}
            errors={errors}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearRilletErrorField(policyID, CONST.RILLET_CONFIG.REIMBURSEMENT_ACCOUNT_CODE)}
        />
    );
}

export default withPolicyConnections(RilletReimbursementAccountPage);
