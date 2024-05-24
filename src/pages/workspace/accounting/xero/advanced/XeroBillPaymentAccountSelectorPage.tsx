import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function XeroBillPaymentAccountSelectorPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = policy?.id ?? '';
    const {bankAccounts} = policy?.connections?.xero?.data ?? {};

    const {reimbursementAccountID, syncReimbursedReports} = policy?.connections?.xero?.config.sync ?? {};

    const xeroSelectorOptions = useMemo<SelectorType[]>(
        () =>
            (bankAccounts ?? []).map(({id, name}) => ({
                value: id,
                text: name,
                keyForList: id,
                isSelected: reimbursementAccountID === id,
            })),
        [reimbursementAccountID, bankAccounts],
    );

    const listHeaderComponent = useMemo(
        () => (
            <View style={[styles.pb2, styles.ph5]}>
                <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.xero.advancedConfig.xeroBillPaymentAccountDescription')}</Text>
            </View>
        ),
        [translate, styles.pb2, styles.ph5, styles.pb5, styles.textNormal],
    );

    const initiallyFocusedOptionKey = useMemo(() => xeroSelectorOptions?.find((mode) => mode.isSelected)?.keyForList, [xeroSelectorOptions]);

    const updateAccount = useCallback(
        ({value}: SelectorType) => {
            Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.XERO, CONST.XERO_CONFIG.SYNC, {
                reimbursementAccountID: value,
            });
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_XERO_ADVANCED.getRoute(policyID));
        },
        [policyID],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={XeroBillPaymentAccountSelectorPage.displayName}
            sections={[{data: xeroSelectorOptions}]}
            listItem={RadioListItem}
            shouldBeBlocked={!syncReimbursedReports}
            onSelectRow={updateAccount}
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            headerContent={listHeaderComponent}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_XERO_ADVANCED.getRoute(policyID))}
            title="workspace.xero.advancedConfig.xeroBillPaymentAccount"
        />
    );
}

XeroBillPaymentAccountSelectorPage.displayName = 'XeroBillPaymentAccountSelectorPage';

export default withPolicyConnections(XeroBillPaymentAccountSelectorPage);
