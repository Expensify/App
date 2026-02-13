import React, {useMemo} from 'react';
import {View} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNetSuiteSubsidiary} from '@libs/actions/connections/NetSuiteCommands';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import {clearNetSuiteErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type {NetSuiteSubsidiary} from '@src/types/onyx/Policy';

function NetSuiteSubsidiarySelector({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const subsidiaryList = policy?.connections?.netsuite?.options?.data?.subsidiaryList ?? [];
    const netsuiteConfig = policy?.connections?.netsuite?.options?.config;
    const currentSubsidiaryName = netsuiteConfig?.subsidiary ?? '';
    const currentSubsidiaryID = netsuiteConfig?.subsidiaryID ?? CONST.DEFAULT_NUMBER_ID.toString();
    const policyID = policy?.id ?? CONST.DEFAULT_NUMBER_ID.toString();

    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const subsidiaryListSections =
        subsidiaryList.map((subsidiary: NetSuiteSubsidiary) => ({
            text: subsidiary.name,
            keyForList: subsidiary.internalID,
            isSelected: subsidiary.name === currentSubsidiaryName,
            value: subsidiary.name,
        })) ?? [];

    const updateSubsidiary = ({keyForList, value}: SelectorType) => {
        if (!keyForList || keyForList === currentSubsidiaryID) {
            return;
        }

        updateNetSuiteSubsidiary(
            policyID,
            {
                subsidiary: value,
                subsidiaryID: keyForList,
            },
            {
                subsidiary: currentSubsidiaryName,
                subsidiaryID: currentSubsidiaryID,
            },
        );
        Navigation.goBack();
    };

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={illustrations.Telescope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.netsuite.noSubsidiariesFound')}
                subtitle={translate('workspace.netsuite.noSubsidiariesFoundDescription')}
                containerStyle={styles.pb10}
            />
        ),
        [translate, styles.pb10, illustrations.Telescope],
    );

    const listHeaderComponent = useMemo(
        () => (
            <View style={[styles.pb2, styles.ph5]}>
                <Text style={[styles.pb2, styles.textNormal]}>{translate('workspace.netsuite.subsidiarySelectDescription')}</Text>
            </View>
        ),
        [styles.pb2, styles.ph5, styles.textNormal, translate],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="NetSuiteSubsidiarySelector"
            data={subsidiaryListSections}
            listItem={RadioListItem}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            onSelectRow={updateSubsidiary}
            initiallyFocusedOptionKey={netsuiteConfig?.subsidiaryID ?? subsidiaryListSections?.at(0)?.keyForList}
            headerContent={listHeaderComponent}
            onBackButtonPress={() => Navigation.goBack()}
            title="workspace.netsuite.subsidiary"
            listEmptyContent={listEmptyContent}
            pendingAction={settingsPendingAction([CONST.NETSUITE_CONFIG.SUBSIDIARY], netsuiteConfig?.pendingFields)}
            errors={getLatestErrorField(netsuiteConfig ?? {}, CONST.NETSUITE_CONFIG.SUBSIDIARY)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.SUBSIDIARY)}
        />
    );
}

export default withPolicyConnections(NetSuiteSubsidiarySelector);
