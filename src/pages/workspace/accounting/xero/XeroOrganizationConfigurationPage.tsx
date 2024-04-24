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
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import FeatureEnabledAccessOrNotFoundWrapper from '@pages/workspace/FeatureEnabledAccessOrNotFoundWrapper';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import CONST from '@src/CONST';

type XeroOrganizationConfigurationPageProps = WithPolicyProps;
function XeroOrganizationConfigurationPage({policy}: XeroOrganizationConfigurationPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const policyID = policy?.id ?? '';
    const currentOrganizationID = policy?.connections?.xero.config.tenantID ?? '';

    const sections =
        policy?.connections?.xero.data.tenants.map((tenant) => ({
            text: tenant.name,
            keyForList: tenant.id,
            isSelected: tenant.id === currentOrganizationID,
        })) ?? [];

    const saveSelection = ({keyForList}: ListItem) => {
        if (!keyForList) {
            return;
        }

        updatePolicyConnectionConfig(policyID, 'xero', 'tenantID', keyForList);
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
                            initiallyFocusedOptionKey={currentOrganizationID}
                        />
                    </ScrollView>
                </ScreenWrapper>
            </FeatureEnabledAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

XeroOrganizationConfigurationPage.displayName = 'PolicyXeroOrganizationConfigurationPage';

export default withPolicy(XeroOrganizationConfigurationPage);
