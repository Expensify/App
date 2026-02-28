import React, {useMemo} from 'react';
import {View} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateXeroTenantID} from '@libs/actions/connections/Xero';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {findCurrentXeroOrganization, getXeroTenants} from '@libs/PolicyUtils';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import variables from '@styles/variables';
import {clearXeroErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type XeroOrganizationConfigurationPageProps = WithPolicyProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.XERO_ORGANIZATION>;
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

    const policyID = policy?.id ?? CONST.DEFAULT_NUMBER_ID.toString();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

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

        updateXeroTenantID(policyID, keyForList, xeroConfig?.tenantID);
        Navigation.goBack();
    };

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={illustrations.Telescope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.xero.noAccountsFound')}
                subtitle={translate('workspace.xero.noAccountsFoundDescription')}
                containerStyle={styles.pb10}
            />
        ),
        [illustrations.Telescope, translate, styles.pb10],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="XeroOrganizationConfigurationPage"
            data={sections}
            listItem={RadioListItem}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.XERO}
            onSelectRow={saveSelection}
            initiallyFocusedOptionKey={currentXeroOrganization?.id}
            headerContent={listHeaderComponent}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING.getRoute(policyID))}
            title="workspace.xero.organization"
            listEmptyContent={listEmptyContent}
            pendingAction={xeroConfig?.pendingFields?.tenantID}
            errors={getLatestErrorField(xeroConfig ?? {}, CONST.XERO_CONFIG.TENANT_ID)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearXeroErrorField(policyID, CONST.XERO_CONFIG.TENANT_ID)}
            shouldSingleExecuteRowSelect
        />
    );
}

export default withPolicy(XeroOrganizationConfigurationPage);
