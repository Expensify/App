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
import {updateXeroAccountingMethod} from '@libs/actions/connections/Xero';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

type MenuListItem = ListItem & {
    value: ValueOf<typeof COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD>;
};

function DynamicXeroAccountingMethodPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const policyID = policy?.id;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_XERO_ACCOUNTING_METHOD.path);
    const styles = useThemeStyles();
    const config = policy?.connections?.xero?.config;
    const accountingMethod = config?.export?.accountingMethod ?? COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH;

    const data: MenuListItem[] = Object.values(COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD).map((accountingMethodType) => ({
        value: accountingMethodType,
        text: translate(`workspace.xero.accountingMethods.values.${accountingMethodType}` as TranslationPaths),
        alternateText: translate(`workspace.xero.accountingMethods.alternateText.${accountingMethodType}` as TranslationPaths),
        keyForList: accountingMethodType,
        isSelected: accountingMethod === accountingMethodType,
    }));

    const pendingAction = settingsPendingAction([CONST.XERO_CONFIG.AUTO_SYNC], config?.pendingFields) ?? settingsPendingAction([CONST.XERO_CONFIG.ACCOUNTING_METHOD], config?.pendingFields);

    const headerContent = useMemo(
        () => (
            <View>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.xero.accountingMethods.description')}</Text>
            </View>
        ),
        [translate, styles.pb5, styles.ph5],
    );

    const selectExpenseReportApprovalLevel = useCallback(
        (row: MenuListItem) => {
            if (row.value !== accountingMethod) {
                updateXeroAccountingMethod(policyID, row.value, accountingMethod);
            }
            Navigation.goBack(backPath);
        },
        [accountingMethod, policyID, backPath],
    );

    return (
        <SelectionScreen
            displayName="XeroAccountingMethodPage"
            headerTitleAlreadyTranslated={translate('workspace.xero.accountingMethods.label')}
            headerContent={headerContent}
            data={data}
            listItem={RadioListItem}
            onSelectRow={(selection: SelectorType) => selectExpenseReportApprovalLevel(selection as MenuListItem)}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.XERO}
            pendingAction={pendingAction}
            shouldBeBlocked={!config?.autoSync?.enabled}
        />
    );
}

export default withPolicyConnections(DynamicXeroAccountingMethodPage);
