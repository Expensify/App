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

function DualEntrySubsidiarySelector({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const companyList = policy?.connections?.dualEntry?.data?.companies;
    const dualEntryConfig = policy?.connections?.dualEntry?.config;
    const currentSubsidiaryID = dualEntryConfig?.subsidiaryID ?? CONST.DEFAULT_NUMBER_ID.toString();
    const policyID = policy?.id ?? CONST.DEFAULT_NUMBER_ID.toString();

    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const data: CompanyListItem[] = companyList
        ? companyList.map((companyItem) => ({
              text: companyItem.name,
              keyForList: companyItem.id,
              isSelected: companyItem.id === currentSubsidiaryID,
              value: companyItem.id,
          }))
        : [];
    const {filteredData, textInputOptions} = useSelectionListSearch(data);

    const updateSubsidiary = ({keyForList, value}: SelectorType) => {
        if (!keyForList || keyForList === currentSubsidiaryID) {
            return;
        }

        updateDualEntrySubsidiary(policyID, value, currentSubsidiaryID);
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
            <Text style={[styles.pb2, styles.textNormal]}>{translate('workspace.dualEntry.subsidiarySelectDescription')}</Text>
        </View>
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="DualEntrySubsidiarySelector"
            data={filteredData}
            textInputOptions={textInputOptions}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.DUALENTRY}
            onSelectRow={updateSubsidiary}
            initiallyFocusedOptionKey={dualEntryConfig?.subsidiaryID}
            headerContent={listHeaderComponent}
            onBackButtonPress={() => Navigation.goBack()}
            title="workspace.dualEntry.subsidiary"
            listEmptyContent={listEmptyContent}
            pendingAction={settingsPendingAction([CONST.DUALENTRY_CONFIG.SUBSIDIARY_ID], dualEntryConfig?.pendingFields)}
            errors={getLatestErrorField(dualEntryConfig ?? {}, CONST.DUALENTRY_CONFIG.SUBSIDIARY_ID)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearDualEntryErrorField(policyID, CONST.DUALENTRY_CONFIG.SUBSIDIARY_ID)}
        />
    );
}

export default withPolicyConnections(DualEntrySubsidiarySelector);
