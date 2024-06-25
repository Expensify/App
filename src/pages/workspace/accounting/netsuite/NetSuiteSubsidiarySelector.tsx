import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import {View} from 'react-native-reanimated/lib/typescript/Animated';
import BlockingView from '@components/BlockingViews/BlockingView';
import ConnectionLayout from '@components/ConnectionLayout';
import * as Illustrations from '@components/Icon/Illustrations';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNetSuiteSubsidiary} from '@libs/actions/connections/NetSuiteCommands';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {NetSuiteSubsidiary} from '@src/types/onyx/Policy';

type NetSuiteSubsidiarySelectorProps = WithPolicyConnectionsProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_SUBSIDIARY_SELECTOR>;

type SubsidiaryListItemWithId = ListItem & {subsidiaryID: string};

function NetSuiteSubsidiarySelector({policy}: NetSuiteSubsidiarySelectorProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const subsidiaryList = policy?.connections?.netsuite?.options?.data?.subsidiaryList ?? [];
    const netsuiteConfig = policy?.connections?.netsuite?.options?.config;
    const currentSubsidiaryName = netsuiteConfig?.subsidiary ?? '';
    const currentSubsidiaryID = netsuiteConfig?.subsidiaryID ?? '';
    const policyID = policy?.id ?? '';

    const sections =
        subsidiaryList.map((subsidiary: NetSuiteSubsidiary) => ({
            text: subsidiary.name,
            keyForList: subsidiary.name,
            isSelected: subsidiary.name === currentSubsidiaryName,
            subsidiaryID: subsidiary.internalID,
            value: subsidiary.name,
        })) ?? [];

    const saveSelection = ({keyForList, subsidiaryID}: SubsidiaryListItemWithId) => {
        if (!keyForList || keyForList === currentSubsidiaryName) {
            return;
        }

        updateNetSuiteSubsidiary(
            policyID,
            {
                subsidiary: keyForList,
                subsidiaryID,
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
                icon={Illustrations.TeleScope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.netsuite.noSubsidiariesFound')}
                subtitle={translate('workspace.netsuite.noSubsidiariesFoundDescription')}
                containerStyle={styles.pb10}
            />
        ),
        [translate, styles.pb10],
    );

    const listHeaderComponent = useMemo(
        () => (
            <OfflineWithFeedback
                errors={ErrorUtils.getLatestErrorField(netsuiteConfig ?? {}, CONST.NETSUITE_CONFIG.SUBSIDIARY)}
                errorRowStyles={[styles.ph5, styles.mt2]}
                onClose={() => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.SUBSIDIARY)}
            >
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.netsuite.subsidiarySelectDescription')}</Text>
            </OfflineWithFeedback>
        ),
        [translate, styles.pb2, styles.ph5, styles.pb5, styles.textNormal],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={NetSuiteSubsidiarySelector.displayName}
            sections={[{data: sections}]}
            listItem={RadioListItem}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            onSelectRow={() => {}}
            initiallyFocusedOptionKey={netsuiteConfig?.subsidiary ?? sections?.[0].keyForList}
            headerContent={listHeaderComponent}
            onBackButtonPress={() => Navigation.goBack()}
            title="workspace.netsuite.subsidiary"
            listEmptyContent={listEmptyContent}
        />
    );
}

NetSuiteSubsidiarySelector.displayName = 'NetSuiteSubsidiarySelector';

export default withPolicyConnections(NetSuiteSubsidiarySelector);
