import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import useExpensifyCardFeeds from '@hooks/useExpensifyCardFeeds';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSelectionListSearch from '@hooks/useSelectionListSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearBusinessCentralErrorField, updateBusinessCentralReimbursementBankAccount, updateBusinessCentralSettlementsBankAccount} from '@libs/actions/connections/BusinessCentral';
import {isExpensifyCardFullySetUp} from '@libs/CardUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';
import {View} from 'react-native';

type BankAccountListItem = ListItem & {
    value: string;
};

type BusinessCentralBankAccountSelectPageProps = WithPolicyConnectionsProps &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.BUSINESS_CENTRAL_BANK_ACCOUNT_SELECTOR>;

/** Picks the bank account Business Central records reimbursements or Expensify Card settlements against, depending on the setting in the route. */
function BusinessCentralBankAccountSelectPage({policy, route}: BusinessCentralBankAccountSelectPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const policyID = policy?.id;
    const settingName = route.params.settingName;
    const isSettlementsBankAccount = settingName === CONST.BUSINESS_CENTRAL_CONFIG.SETTLEMENTS_BANK_ACCOUNT_ID;
    const businessCentralConfig = policy?.connections?.businessCentral?.config;
    const selectedBankAccountID = businessCentralConfig?.sync?.[settingName];
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_ADVANCED.getRoute(policyID) : undefined;
    const allCardSettings = useExpensifyCardFeeds(policyID);
    const isExpensifyCardsEnabled = Object.values(allCardSettings ?? {}).some((cardSetting) => isExpensifyCardFullySetUp(policy, cardSetting));
    const shouldBeBlocked = isSettlementsBankAccount
        ? !isExpensifyCardsEnabled || !(businessCentralConfig?.sync?.syncExpensifyCardSettlements ?? false)
        : !(businessCentralConfig?.sync?.syncReimbursedReports ?? true);
    const translationKey = isSettlementsBankAccount ? 'settlementsBankAccount' : 'reimbursementBankAccount';

    const data: BankAccountListItem[] =
        policy?.connections?.businessCentral?.data?.bankAccounts?.map((bankAccount) => ({
            value: bankAccount.id,
            text: `${bankAccount.number} ${bankAccount.name}`,
            keyForList: bankAccount.id,
            isSelected: selectedBankAccountID === bankAccount.id,
        })) ?? [];
    const {filteredData, textInputOptions} = useSelectionListSearch(data);

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate(`workspace.businessCentral.advanced.${translationKey}.description`)}</Text>
        </View>
    );

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.businessCentral.noBankAccountsFound')}
            subtitle={translate('workspace.businessCentral.noBankAccountsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    const selectBankAccount = (item: BankAccountListItem) => {
        if (item.value !== selectedBankAccountID && policyID) {
            if (isSettlementsBankAccount) {
                updateBusinessCentralSettlementsBankAccount(policyID, item.value, selectedBankAccountID);
            } else {
                updateBusinessCentralReimbursementBankAccount(policyID, item.value, selectedBankAccountID);
            }
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            shouldBeBlocked={shouldBeBlocked}
            displayName="BusinessCentralBankAccountSelectPage"
            title={`workspace.businessCentral.advanced.${translationKey}.label`}
            data={filteredData}
            textInputOptions={textInputOptions}
            headerContent={headerContent}
            listEmptyContent={listEmptyContent}
            onSelectRow={selectBankAccount}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={selectedBankAccountID}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL}
            pendingAction={settingsPendingAction([settingName], businessCentralConfig?.pendingFields)}
            errors={getLatestErrorField(businessCentralConfig, settingName)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearBusinessCentralErrorField(policyID, settingName)}
        />
    );
}

export default withPolicyConnections(BusinessCentralBankAccountSelectPage);
