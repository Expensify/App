import {CONST as COMMON_CONST} from 'expensify-common';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateQuickbooksDesktopAccountingMethod} from '@libs/actions/connections/QuickbooksDesktop';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';

type MenuListItem = ListItem & {
    value: ValueOf<typeof COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD>;
};

function QuickbooksDesktopAccountingMethodPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const policyID = policy?.id;
    const styles = useThemeStyles();
    const config = policy?.connections?.quickbooksDesktop?.config;
    const accountingMethod = config?.export?.accountingMethod ?? COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH;

    const data: MenuListItem[] = Object.values(COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD).map((accountingMethodType) => ({
        value: accountingMethodType,
        text: translate(`workspace.qbd.accountingMethods.values.${accountingMethodType}` as TranslationPaths),
        alternateText: translate(`workspace.qbd.accountingMethods.alternateText.${accountingMethodType}` as TranslationPaths),
        keyForList: accountingMethodType,
        isSelected: accountingMethod === accountingMethodType,
    }));

    const pendingAction =
        settingsPendingAction([CONST.QUICKBOOKS_DESKTOP_CONFIG.AUTO_SYNC], config?.pendingFields) ??
        settingsPendingAction([CONST.QUICKBOOKS_DESKTOP_CONFIG.ACCOUNTING_METHOD], config?.pendingFields);

    const headerContent = useMemo(
        () => (
            <View>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbd.accountingMethods.description')}</Text>
            </View>
        ),
        [translate, styles.pb5, styles.ph5],
    );

    const selectAccountingMethod = useCallback(
        (row: MenuListItem) => {
            if (row.value !== accountingMethod) {
                if (!policyID) {
                    return;
                }
                updateQuickbooksDesktopAccountingMethod(policyID, row.value, accountingMethod);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_AUTO_SYNC.getRoute(policyID));
        },
        [accountingMethod, policyID],
    );

    return (
        <SelectionScreen
            displayName="QuickbooksDesktopAccountingMethodPage"
            headerTitleAlreadyTranslated={translate('workspace.qbd.accountingMethods.label')}
            headerContent={headerContent}
            data={data}
            listItem={RadioListItem}
            onSelectRow={(selection: SelectorType) => selectAccountingMethod(selection as MenuListItem)}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_AUTO_SYNC.getRoute(policyID))}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBD}
            pendingAction={pendingAction}
            shouldBeBlocked={!config?.autoSync?.enabled}
        />
    );
}

export default withPolicyConnections(QuickbooksDesktopAccountingMethodPage);
