import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo} from 'react';
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
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {findCurrentXeroOrganization, getXeroTenants} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
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
    const currentXeroOrganization = findCurrentXeroOrganization(tenants, policy?.connections?.xero?.config?.tenantID);

    const policyID = policy?.id ?? '';

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

        updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.XERO, 'tenantID', keyForList);
        Navigation.goBack(ROUTES.WORKSPACE_ACCOUNTING.getRoute(policyID));
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
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
                        shouldDebounceRowSelect
                        sections={[{data: sections}]}
                        initiallyFocusedOptionKey={currentXeroOrganization?.id}
                    />
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

XeroOrganizationConfigurationPage.displayName = 'PolicyXeroOrganizationConfigurationPage';

export default withPolicy(XeroOrganizationConfigurationPage);
