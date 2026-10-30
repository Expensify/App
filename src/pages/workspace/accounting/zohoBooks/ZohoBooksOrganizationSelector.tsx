import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSelectionListSearch from '@hooks/useSelectionListSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearZohoBooksErrorField, updateZohoBooksSubsidiary} from '@libs/actions/connections/ZohoBooks';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {ZohoBooksOrganization} from '@src/types/onyx/Policy';

import React from 'react';
import {View} from 'react-native';

type OrganizationListItem = ListItem & {
    value: ZohoBooksOrganization['id'];
};

function ZohoBooksOrganizationSelector({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const organizations = policy?.connections?.zohoBooks?.data?.organizations;
    const zohoBooksConfig = policy?.connections?.zohoBooks?.config;
    const currentOrganizationID = zohoBooksConfig?.subsidiaryID ?? CONST.DEFAULT_NUMBER_ID.toString();
    const policyID = policy?.id ?? CONST.DEFAULT_NUMBER_ID.toString();

    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    // Multi-location organizations are not supported yet, so they are listed but can't be selected.
    const data: OrganizationListItem[] = organizations
        ? organizations.map((organization) => ({
              text: organization.name,
              alternateText: organization.isMultiLocation ? translate('workspace.zohoBooks.multiLocationNotSupported') : undefined,
              keyForList: organization.id,
              isSelected: organization.id === currentOrganizationID,
              isDisabled: !!organization.isMultiLocation,
              value: organization.id,
          }))
        : [];
    const {filteredData, textInputOptions} = useSelectionListSearch(data);

    const updateOrganization = ({keyForList, value, isDisabled}: SelectorType) => {
        if (!keyForList || keyForList === currentOrganizationID || isDisabled) {
            return;
        }

        updateZohoBooksSubsidiary(policyID, value, currentOrganizationID);
        Navigation.goBack();
    };

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.zohoBooks.noOrganizationsFound')}
            subtitle={translate('workspace.zohoBooks.noOrganizationsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    const listHeaderComponent = (
        <View style={[styles.pb2, styles.ph5]}>
            <Text style={[styles.pb2, styles.textNormal]}>{translate('workspace.zohoBooks.organizationSelectDescription')}</Text>
        </View>
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="ZohoBooksOrganizationSelector"
            data={filteredData}
            textInputOptions={textInputOptions}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS}
            onSelectRow={updateOrganization}
            initiallyFocusedOptionKey={zohoBooksConfig?.subsidiaryID}
            headerContent={listHeaderComponent}
            onBackButtonPress={() => Navigation.goBack()}
            title="workspace.zohoBooks.organization"
            listEmptyContent={listEmptyContent}
            pendingAction={settingsPendingAction([CONST.ZOHO_BOOKS_CONFIG.SUBSIDIARY_ID], zohoBooksConfig?.pendingFields)}
            errors={getLatestErrorField(zohoBooksConfig ?? {}, CONST.ZOHO_BOOKS_CONFIG.SUBSIDIARY_ID)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearZohoBooksErrorField(policyID, CONST.ZOHO_BOOKS_CONFIG.SUBSIDIARY_ID)}
        />
    );
}

export default withPolicyConnections(ZohoBooksOrganizationSelector);
