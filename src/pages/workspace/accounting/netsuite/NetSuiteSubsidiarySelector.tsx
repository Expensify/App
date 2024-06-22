import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNetSuiteSubsidiary} from '@libs/actions/connections/netsuite';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
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
        Navigation.goBack(ROUTES.WORKSPACE_ACCOUNTING.getRoute(policyID));
    };

    return (
        <ConnectionLayout
            displayName={NetSuiteSubsidiarySelector.displayName}
            headerTitle="workspace.netsuite.subsidiary"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            shouldIncludeSafeAreaPaddingBottom
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
        >
            <OfflineWithFeedback
                errors={ErrorUtils.getLatestErrorField(netsuiteConfig ?? {}, CONST.NETSUITE_CONFIG.SUBSIDIARY)}
                errorRowStyles={[styles.ph5, styles.mt2]}
                onClose={() => Policy.clearNetSuiteErrorField(policyID, CONST.POLICY.CONNECTIONS.NAME.NETSUITE, CONST.NETSUITE_CONFIG.SUBSIDIARY)}
            >
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.netsuite.subsidiarySelectDescription')}</Text>
            </OfflineWithFeedback>
            <SelectionList
                containerStyle={styles.pb0}
                ListItem={RadioListItem}
                onSelectRow={saveSelection}
                shouldDebounceRowSelect
                sections={[{data: sections}]}
                initiallyFocusedOptionKey={netsuiteConfig?.subsidiary ?? sections?.[0].keyForList}
                isNestedInsideScrollView
            />
        </ConnectionLayout>
    );
}

NetSuiteSubsidiarySelector.displayName = 'NetSuiteSubsidiarySelector';

export default withPolicyConnections(NetSuiteSubsidiarySelector);
