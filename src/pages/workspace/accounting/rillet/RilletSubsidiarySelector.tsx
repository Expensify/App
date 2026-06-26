import BlockingView from '@components/BlockingViews/BlockingView';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearRilletErrorField, updateRilletSubsidiary} from '@libs/actions/connections/Rillet';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

function RilletSubsidiarySelector({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const subsidiaryList = policy?.connections?.rillet?.data?.subsidiaries;
    const rilletConfig = policy?.connections?.rillet?.config;
    const currentSubsidiaryID = rilletConfig?.subsidiaryID ?? CONST.DEFAULT_NUMBER_ID.toString();
    const policyID = policy?.id ?? CONST.DEFAULT_NUMBER_ID.toString();

    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const subsidiaryListSections = subsidiaryList
        ? subsidiaryList.map((subsidiary) => ({
              text: subsidiary.tradeName,
              keyForList: subsidiary.id,
              isSelected: subsidiary.id === currentSubsidiaryID,
              value: subsidiary.id,
          }))
        : [];

    const updateSubsidiary = ({keyForList, value}: SelectorType) => {
        if (!keyForList || keyForList === currentSubsidiaryID) {
            return;
        }

        updateRilletSubsidiary(policyID, value, currentSubsidiaryID);
        Navigation.goBack();
    };

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.rillet.noSubsidiariesFound')}
            subtitle={translate('workspace.rillet.noSubsidiariesFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    const listHeaderComponent = (
        <View style={[styles.pb2, styles.ph5]}>
            <Text style={[styles.pb2, styles.textNormal]}>{translate('workspace.rillet.subsidiarySelectDescription')}</Text>
        </View>
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="RilletSubsidiarySelector"
            data={subsidiaryListSections}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.RILLET}
            onSelectRow={updateSubsidiary}
            initiallyFocusedOptionKey={rilletConfig?.subsidiaryID ?? subsidiaryListSections?.at(0)?.keyForList}
            headerContent={listHeaderComponent}
            onBackButtonPress={() => Navigation.goBack()}
            title="workspace.rillet.subsidiary"
            listEmptyContent={listEmptyContent}
            pendingAction={settingsPendingAction([CONST.RILLET_CONFIG.SUBSIDIARY_ID], rilletConfig?.pendingFields)}
            errors={getLatestErrorField(rilletConfig ?? {}, CONST.RILLET_CONFIG.SUBSIDIARY_ID)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearRilletErrorField(policyID, CONST.RILLET_CONFIG.SUBSIDIARY_ID)}
        />
    );
}

export default withPolicyConnections(RilletSubsidiarySelector);
