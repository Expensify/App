import {CONST as COMMON_CONST} from 'expensify-common';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
import Text from '@components/Text';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateSageIntacctAccountingMethod} from '@libs/actions/connections/SageIntacct';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

type MenuListItem = ListItem & {
    value: ValueOf<typeof COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD>;
};

function DynamicSageIntacctAccountingMethodPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const policyID = policy?.id;
    const styles = useThemeStyles();
    const config = policy?.connections?.intacct?.config;
    const accountingMethod = config?.export?.accountingMethod ?? COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_ACCOUNTING_METHOD.path);

    const data: MenuListItem[] = Object.values(COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD).map((accountingMethodType) => ({
        value: accountingMethodType,
        text: translate(`workspace.sageIntacct.accountingMethods.values.${accountingMethodType}` as const),
        alternateText: translate(`workspace.sageIntacct.accountingMethods.alternateText.${accountingMethodType}` as const),
        keyForList: `${accountingMethodType}`,
        isSelected: accountingMethod === accountingMethodType,
    }));

    const pendingAction =
        settingsPendingAction([CONST.SAGE_INTACCT_CONFIG.AUTO_SYNC], config?.pendingFields) ?? settingsPendingAction([CONST.SAGE_INTACCT_CONFIG.ACCOUNTING_METHOD], config?.pendingFields);

    const headerContent = useMemo(
        () => (
            <View>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.sageIntacct.accountingMethods.description')}</Text>
            </View>
        ),
        [translate, styles.pb5, styles.ph5],
    );

    const goBack = useCallback(() => {
        Navigation.goBack(backPath);
    }, [backPath]);

    const selectExpenseReportApprovalLevel = useCallback(
        (row: MenuListItem) => {
            if (row.value !== accountingMethod) {
                updateSageIntacctAccountingMethod(policyID, row.value, accountingMethod);
            }
            goBack();
        },
        [accountingMethod, policyID, goBack],
    );

    return (
        <SelectionScreen
            displayName="DynamicSageIntacctAccountingMethodPage"
            headerTitleAlreadyTranslated={translate('workspace.sageIntacct.accountingMethods.label')}
            headerContent={headerContent}
            data={data}
            listItem={RadioListItem}
            onSelectRow={(selection: SelectorType) => selectExpenseReportApprovalLevel(selection as MenuListItem)}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            onBackButtonPress={goBack}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
            pendingAction={pendingAction}
            shouldBeBlocked={!config?.autoSync?.enabled}
        />
    );
}

export default withPolicyConnections(DynamicSageIntacctAccountingMethodPage);
