import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearRilletErrorField, updateRilletCreditCardAccount} from '@libs/actions/connections/Rillet';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

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

function RilletCompanyCardAccountPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const policyID = policy?.id;
    const rilletConfig = policy?.connections?.rillet?.config;
    const rilletData = policy?.connections?.rillet?.data;
    const creditCardAccountCode = rilletConfig?.export?.creditCardAccountCode;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_RILLET_EXPORT.getRoute(policyID) : undefined;

    const data: AccountListItem[] =
        rilletData?.accounts
            ?.filter(
                (accountItem) =>
                    accountItem.type === CONST.RILLET_ACCOUNT_TYPE.LIABILITY &&
                    accountItem.subtype === CONST.RILLET_ACCOUNT_SUBTYPE.CREDIT_CARD &&
                    accountItem.status === CONST.RILLET_ACCOUNT_STATUS.ACTIVE,
            )
            .map((accountItem) => ({
                value: accountItem.code,
                text: accountItem.name,
                keyForList: accountItem.code,
                isSelected: creditCardAccountCode === accountItem.code,
            })) ?? [];

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.rillet.companyCardAccount.description')}</Text>
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

    const selectCreditCardAccount = (item: AccountListItem) => {
        if (item.value !== creditCardAccountCode && policyID) {
            updateRilletCreditCardAccount(policyID, item.value, creditCardAccountCode);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="RilletCompanyCardAccountPage"
            title="workspace.rillet.companyCardAccount.label"
            data={data}
            headerContent={headerContent}
            listEmptyContent={listEmptyContent}
            onSelectRow={selectCreditCardAccount}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={creditCardAccountCode}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.RILLET}
            pendingAction={settingsPendingAction([CONST.RILLET_CONFIG.CREDIT_CARD_ACCOUNTCODE], rilletConfig?.pendingFields)}
            errors={getLatestErrorField(rilletConfig, CONST.RILLET_CONFIG.CREDIT_CARD_ACCOUNTCODE)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearRilletErrorField(policyID, CONST.RILLET_CONFIG.CREDIT_CARD_ACCOUNTCODE)}
        />
    );
}

export default withPolicyConnections(RilletCompanyCardAccountPage);
