/**
 * Lets an admin change which Business Central company the workspace syncs with. The backend picks the first company
 * when it connects, so this page is only reachable when the credentials can see more than one.
 */
import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSelectionListSearch from '@hooks/useSelectionListSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearBusinessCentralErrorField, updateBusinessCentralCompany} from '@libs/actions/connections/BusinessCentral';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {BusinessCentralCompany} from '@src/types/onyx/Policy';

import React from 'react';
import {View} from 'react-native';

type CompanyListItem = ListItem & {
    value: BusinessCentralCompany['id'];
};

function BusinessCentralCompanySelector({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const companies = policy?.connections?.businessCentral?.data?.companies;
    const businessCentralConfig = policy?.connections?.businessCentral?.config;
    const currentCompanyID = businessCentralConfig?.companyID;
    const policyID = policy?.id ?? CONST.DEFAULT_NUMBER_ID.toString();

    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const data: CompanyListItem[] = companies
        ? companies.map((company) => ({
              text: company.displayName,
              keyForList: company.id,
              isSelected: company.id === currentCompanyID,
              value: company.id,
          }))
        : [];
    const {filteredData, textInputOptions} = useSelectionListSearch(data);

    const updateCompany = ({keyForList, value}: SelectorType) => {
        if (!keyForList || keyForList === currentCompanyID) {
            return;
        }

        updateBusinessCentralCompany(policyID, value, currentCompanyID);
        Navigation.goBack();
    };

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.businessCentral.noCompaniesFound')}
            subtitle={translate('workspace.businessCentral.noCompaniesFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    const listHeaderComponent = (
        <View style={[styles.pb2, styles.ph5]}>
            <Text style={[styles.pb2, styles.textNormal]}>{translate('workspace.businessCentral.companySelectDescription')}</Text>
        </View>
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="BusinessCentralCompanySelector"
            data={filteredData}
            textInputOptions={textInputOptions}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL}
            onSelectRow={updateCompany}
            initiallyFocusedOptionKey={businessCentralConfig?.companyID}
            headerContent={listHeaderComponent}
            onBackButtonPress={() => Navigation.goBack()}
            title="workspace.businessCentral.company"
            listEmptyContent={listEmptyContent}
            pendingAction={settingsPendingAction([CONST.BUSINESS_CENTRAL_CONFIG.COMPANY_ID], businessCentralConfig?.pendingFields)}
            errors={getLatestErrorField(businessCentralConfig ?? {}, CONST.BUSINESS_CENTRAL_CONFIG.COMPANY_ID)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearBusinessCentralErrorField(policyID, CONST.BUSINESS_CENTRAL_CONFIG.COMPANY_ID)}
        />
    );
}

export default withPolicyConnections(BusinessCentralCompanySelector);
