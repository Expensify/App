import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updatePolicyConnectionConfig} from '@libs/actions/connections';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {findCurrentXeroOrganization, getXeroTenants} from '@libs/PolicyUtils';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import * as Policy from '@userActions/Policy/Policy';
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
    const tenants = useMemo(() => getXeroTenants(policy ?? undefined), [policy]);
    const xeroConfig = policy?.connections?.xero?.config;
    const currentXeroOrganization = findCurrentXeroOrganization(tenants, xeroConfig?.tenantID);

    const policyID = policy?.id ?? '-1';

    const sections =
        policy?.connections?.xero?.data?.tenants.map((tenant) => ({
            text: tenant.name,
            keyForList: tenant.id,
            isSelected: tenant.id === organizationID,
        })) ?? [];

    const saveSelection = ({keyForList}: ListItem) => {
        if (!keyForList) {
            return;
        }

        updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.XERO, CONST.XERO_CONFIG.TENANT_ID, keyForList);
        Navigation.goBack();
    };

    return (
        <ConnectionLayout
            displayName={XeroOrganizationConfigurationPage.displayName}
            headerTitle="workspace.xero.organization"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            shouldIncludeSafeAreaPaddingBottom
            connectionName={CONST.POLICY.CONNECTIONS.NAME.XERO}
        >
            <OfflineWithFeedback
                errors={ErrorUtils.getLatestErrorField(xeroConfig ?? {}, CONST.XERO_CONFIG.TENANT_ID)}
                errorRowStyles={[styles.ph5, styles.mt2]}
                onClose={() => Policy.clearXeroErrorField(policyID, CONST.XERO_CONFIG.TENANT_ID)}
            >
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.xero.organizationDescription')}</Text>
                <SelectionList
                    containerStyle={styles.pb0}
                    ListItem={RadioListItem}
                    onSelectRow={saveSelection}
                    shouldDebounceRowSelect
                    sections={[{data: sections}]}
                    initiallyFocusedOptionKey={currentXeroOrganization?.id}
                />
            </OfflineWithFeedback>
        </ConnectionLayout>
    );
}

XeroOrganizationConfigurationPage.displayName = 'PolicyXeroOrganizationConfigurationPage';

export default withPolicy(XeroOrganizationConfigurationPage);
