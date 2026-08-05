import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSelectionListSearch from '@hooks/useSelectionListSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearDualEntryErrorField, updateDualEntrySubsidiary} from '@libs/actions/connections/DualEntry';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {DualEntryCompany} from '@src/types/onyx/Policy';

import React from 'react';
import {View} from 'react-native';

type CompanyListItem = ListItem & {
    value: DualEntryCompany['id'];
};

function DualEntryCompanySelector({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const companyList = policy?.connections?.dualEntry?.data?.companies;
    const dualEntryConfig = policy?.connections?.dualEntry?.config;
    const currentCompanyID = dualEntryConfig?.companyID ?? CONST.DEFAULT_NUMBER_ID.toString();
    const policyID = policy?.id ?? CONST.DEFAULT_NUMBER_ID.toString();

    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const data: CompanyListItem[] = companyList
        ? companyList.map((companyItem) => ({
              text: companyItem.name,
              keyForList: companyItem.id,
              isSelected: companyItem.id === currentCompanyID,
              value: companyItem.id,
          }))
        : [];
    const {filteredData, textInputOptions} = useSelectionListSearch(data);

    const updateCompany = ({keyForList, value}: SelectorType) => {
        if (!keyForList || keyForList === currentCompanyID) {
            return;
        }

        updateDualEntrySubsidiary(policyID, value, currentCompanyID);
        Navigation.goBack();
    };

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.dualEntry.noCompaniesFound')}
            subtitle={translate('workspace.dualEntry.noCompaniesFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    const listHeaderComponent = (
        <View style={[styles.pb2, styles.ph5]}>
            <Text style={[styles.pb2, styles.textNormal]}>{translate('workspace.dualEntry.companySelectDescription')}</Text>
        </View>
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="DualEntryCompanySelector"
            data={filteredData}
            textInputOptions={textInputOptions}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.DUALENTRY}
            onSelectRow={updateCompany}
            initiallyFocusedOptionKey={dualEntryConfig?.companyID}
            headerContent={listHeaderComponent}
            onBackButtonPress={() => Navigation.goBack()}
            title="workspace.dualEntry.company"
            listEmptyContent={listEmptyContent}
            pendingAction={settingsPendingAction([CONST.DUALENTRY_CONFIG.COMPANY_ID], dualEntryConfig?.pendingFields)}
            errors={getLatestErrorField(dualEntryConfig ?? {}, CONST.DUALENTRY_CONFIG.COMPANY_ID)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearDualEntryErrorField(policyID, CONST.DUALENTRY_CONFIG.COMPANY_ID)}
        />
    );
}

export default withPolicyConnections(DualEntryCompanySelector);
