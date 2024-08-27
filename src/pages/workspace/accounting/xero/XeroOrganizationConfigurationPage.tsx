import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import * as Illustrations from '@components/Icon/Illustrations';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Xero from '@libs/actions/connections/Xero';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {findCurrentXeroOrganization, getXeroTenants} from '@libs/PolicyUtils';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import variables from '@styles/variables';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
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
            value: tenant.id,
            text: tenant.name,
            keyForList: tenant.id,
            isSelected: tenant.id === organizationID,
        })) ?? [];

    const listHeaderComponent = useMemo(
        () => (
            <View style={[styles.pb2, styles.ph5]}>
                <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.xero.organizationDescription')}</Text>
            </View>
        ),
        [translate, styles.pb2, styles.ph5, styles.pb5, styles.textNormal],
    );

    const saveSelection = ({keyForList}: ListItem) => {
        if (!keyForList) {
            return;
        }

        Xero.updateXeroTenantID(policyID, keyForList, xeroConfig?.tenantID);
        Navigation.goBack();
    };

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={Illustrations.TeleScope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.xero.noAccountsFound')}
                subtitle={translate('workspace.xero.noAccountsFoundDescription')}
                containerStyle={styles.pb10}
            />
        ),
        [translate, styles.pb10],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={XeroOrganizationConfigurationPage.displayName}
            sections={sections.length ? [{data: sections}] : []}
            listItem={RadioListItem}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.XERO}
            onSelectRow={saveSelection}
            initiallyFocusedOptionKey={currentXeroOrganization?.id}
            headerContent={listHeaderComponent}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING.getRoute(policyID))}
            title="workspace.xero.organization"
            listEmptyContent={listEmptyContent}
            pendingAction={xeroConfig?.pendingFields?.tenantID}
            errors={ErrorUtils.getLatestErrorField(xeroConfig ?? {}, CONST.XERO_CONFIG.TENANT_ID)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => Policy.clearXeroErrorField(policyID, CONST.XERO_CONFIG.TENANT_ID)}
            shouldSingleExecuteRowSelect
        />
    );
}

XeroOrganizationConfigurationPage.displayName = 'PolicyXeroOrganizationConfigurationPage';

export default withPolicy(XeroOrganizationConfigurationPage);
