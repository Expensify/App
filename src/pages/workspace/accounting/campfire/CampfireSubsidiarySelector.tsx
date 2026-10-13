import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSelectionListSearch from '@hooks/useSelectionListSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearCampfireErrorField, updateCampfireSubsidiary} from '@libs/actions/connections/Campfire';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {CampfireSubsidiary} from '@src/types/onyx/Policy';

import React from 'react';
import {View} from 'react-native';

type SubsidiaryListItem = ListItem & {
    value: CampfireSubsidiary['id'];
};

function CampfireSubsidiarySelector({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const subsidiaries = policy?.connections?.campfire?.data?.subsidiaries;
    const campfireConfig = policy?.connections?.campfire?.config;
    const currentSubsidiaryID = campfireConfig?.subsidiaryID ?? CONST.DEFAULT_NUMBER_ID.toString();
    const policyID = policy?.id ?? CONST.DEFAULT_NUMBER_ID.toString();

    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const data: SubsidiaryListItem[] = subsidiaries
        ? subsidiaries.map((subsidiaryItem) => ({
              text: subsidiaryItem.name,
              keyForList: subsidiaryItem.id,
              isSelected: subsidiaryItem.id === currentSubsidiaryID,
              value: subsidiaryItem.id,
          }))
        : [];
    const {filteredData, textInputOptions} = useSelectionListSearch(data);

    const updateSubsidiary = ({keyForList, value}: SelectorType) => {
        if (!keyForList || keyForList === currentSubsidiaryID) {
            return;
        }

        updateCampfireSubsidiary(policyID, value, currentSubsidiaryID);
        Navigation.goBack();
    };

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.campfire.noSubsidiariesFound')}
            subtitle={translate('workspace.campfire.noSubsidiariesFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    const listHeaderComponent = (
        <View style={[styles.pb2, styles.ph5]}>
            <Text style={[styles.pb2, styles.textNormal]}>{translate('workspace.campfire.subsidiarySelectDescription')}</Text>
        </View>
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="CampfireSubsidiarySelector"
            data={filteredData}
            textInputOptions={textInputOptions}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE}
            onSelectRow={updateSubsidiary}
            initiallyFocusedOptionKey={campfireConfig?.subsidiaryID}
            headerContent={listHeaderComponent}
            onBackButtonPress={() => Navigation.goBack()}
            title="workspace.campfire.subsidiary"
            listEmptyContent={listEmptyContent}
            pendingAction={settingsPendingAction([CONST.CAMPFIRE_CONFIG.SUBSIDIARY_ID], campfireConfig?.pendingFields)}
            errors={getLatestErrorField(campfireConfig ?? {}, CONST.CAMPFIRE_CONFIG.SUBSIDIARY_ID)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearCampfireErrorField(policyID, CONST.CAMPFIRE_CONFIG.SUBSIDIARY_ID)}
        />
    );
}

export default withPolicyConnections(CampfireSubsidiarySelector);
