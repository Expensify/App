import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updatePolicyConnectionConfig} from '@libs/actions/connections';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import FeatureEnabledAccessOrNotFoundWrapper from '@pages/workspace/FeatureEnabledAccessOrNotFoundWrapper';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type XeroOrganizationConfigurationPageProps = WithPolicyProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.XERO_ORGANIZATION>;
function XeroOrganizationConfigurationPage({
    policy,
    route: {
        params: {organizationID},
    },
}: XeroOrganizationConfigurationPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const policyID = policy?.id ?? '';

    const sections =
        policy?.connections?.xero.data.tenants.map((tenant) => ({
            text: tenant.name,
            keyForList: tenant.id,
            isSelected: tenant.id === organizationID,
        })) ?? [];

    const saveSelection = ({keyForList}: ListItem) => {
        if (!keyForList) {
            return;
        }

        updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.XERO, 'tenantID', keyForList);
    };

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={policyID}>
            <FeatureEnabledAccessOrNotFoundWrapper
                policyID={policyID}
                featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            >
                <ScreenWrapper
                    includeSafeAreaPaddingBottom={false}
                    shouldEnableMaxHeight
                    testID={XeroOrganizationConfigurationPage.displayName}
                >
                    <HeaderWithBackButton title={translate('workspace.xero.organization')} />
                    <ScrollView contentContainerStyle={styles.pb2}>
                        <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.xero.organizationDescription')}</Text>
                        <SelectionList
                            ListItem={RadioListItem}
                            onSelectRow={saveSelection}
                            sections={[{data: sections}]}
                            initiallyFocusedOptionKey={organizationID}
                        />
                    </ScrollView>
                </ScreenWrapper>
            </FeatureEnabledAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

XeroOrganizationConfigurationPage.displayName = 'PolicyXeroOrganizationConfigurationPage';

export default withPolicy(XeroOrganizationConfigurationPage);
