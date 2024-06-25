import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import * as Illustrations from '@components/Icon/Illustrations';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';
import {getXeroBankAccountsWithDefaultSelect} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function XeroBankAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = policy?.id ?? '-1';

    const {nonReimbursableAccount: nonReimbursableAccountID} = policy?.connections?.xero?.config.export ?? {};
    const xeroSelectorOptions = useMemo<SelectorType[]>(() => getXeroBankAccountsWithDefaultSelect(policy ?? undefined, nonReimbursableAccountID), [nonReimbursableAccountID, policy]);

    const listHeaderComponent = useMemo(
        () => (
            <View style={[styles.pb2, styles.ph5]}>
                <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.xero.xeroBankAccountDescription')}</Text>
            </View>
        ),
        [translate, styles.pb2, styles.ph5, styles.pb5, styles.textNormal],
    );

    const initiallyFocusedOptionKey = useMemo(() => xeroSelectorOptions?.find((mode) => mode.isSelected)?.keyForList, [xeroSelectorOptions]);

    const updateBankAccount = useCallback(
        ({value}: SelectorType) => {
            if (initiallyFocusedOptionKey !== value) {
                Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.XERO, CONST.XERO_CONFIG.EXPORT, {
                    nonReimbursableAccount: value,
                });
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_XERO_EXPORT.getRoute(policyID));
        },
        [policyID, initiallyFocusedOptionKey],
    );

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
            displayName={XeroBankAccountSelectPage.displayName}
            sections={xeroSelectorOptions.length ? [{data: xeroSelectorOptions}] : []}
            listItem={RadioListItem}
            onSelectRow={updateBankAccount}
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            headerContent={listHeaderComponent}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_XERO_EXPORT.getRoute(policyID))}
            title="workspace.xero.xeroBankAccount"
            listEmptyContent={listEmptyContent}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.XERO}
        />
    );
}

XeroBankAccountSelectPage.displayName = 'XeroBankAccountSelectPage';

export default withPolicyConnections(XeroBankAccountSelectPage);
