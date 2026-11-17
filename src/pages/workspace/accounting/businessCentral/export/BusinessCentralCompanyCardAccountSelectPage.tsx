import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSelectionListSearch from '@hooks/useSelectionListSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearBusinessCentralErrorField, updateBusinessCentralNonReimbursableAccount} from '@libs/actions/connections/BusinessCentral';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

type AccountListItem = ListItem & {
    value: string;
};

function BusinessCentralCompanyCardAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const policyID = policy?.id;
    const businessCentralConfig = policy?.connections?.businessCentral?.config;
    const nonReimbursableAccount = businessCentralConfig?.export?.nonReimbursableAccount;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_EXPORT.getRoute(policyID) : undefined;

    const data: AccountListItem[] =
        policy?.connections?.businessCentral?.data?.bankAccounts?.map((bankAccount) => ({
            value: bankAccount.id,
            text: `${bankAccount.number} ${bankAccount.name}`,
            keyForList: bankAccount.id,
            isSelected: nonReimbursableAccount === bankAccount.id,
        })) ?? [];
    const {filteredData, textInputOptions} = useSelectionListSearch(data);

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.businessCentral.companyCardAccount.description')}</Text>
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

    const selectAccount = (item: AccountListItem) => {
        if (item.value !== nonReimbursableAccount && policyID) {
            updateBusinessCentralNonReimbursableAccount(policyID, item.value, nonReimbursableAccount);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="BusinessCentralCompanyCardAccountSelectPage"
            title="workspace.businessCentral.companyCardAccount.label"
            data={filteredData}
            textInputOptions={textInputOptions}
            headerContent={headerContent}
            listEmptyContent={listEmptyContent}
            onSelectRow={selectAccount}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={nonReimbursableAccount}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL}
            pendingAction={settingsPendingAction([CONST.BUSINESS_CENTRAL_CONFIG.NON_REIMBURSABLE_ACCOUNT], businessCentralConfig?.pendingFields)}
            errors={getLatestErrorField(businessCentralConfig, CONST.BUSINESS_CENTRAL_CONFIG.NON_REIMBURSABLE_ACCOUNT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearBusinessCentralErrorField(policyID, CONST.BUSINESS_CENTRAL_CONFIG.NON_REIMBURSABLE_ACCOUNT)}
        />
    );
}

export default withPolicyConnections(BusinessCentralCompanyCardAccountSelectPage);
