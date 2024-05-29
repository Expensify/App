import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type SelectorType = ListItem & {
    value: string;
};

function QuickbooksInvoiceAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = policy?.id ?? '';
    const {bankAccounts, otherCurrentAssetAccounts} = policy?.connections?.quickbooksOnline?.data ?? {};
    const accountOptions = useMemo(() => [...(bankAccounts ?? []), ...(otherCurrentAssetAccounts ?? [])], [bankAccounts, otherCurrentAssetAccounts]);
    const {collectionAccountID} = policy?.connections?.quickbooksOnline?.config ?? {};

    const qboOnlineSelectorOptions = useMemo<SelectorType[]>(
        () =>
            accountOptions?.map(({id, name}) => ({
                value: id,
                text: name,
                keyForList: id,
                isSelected: collectionAccountID === id,
            })),
        [collectionAccountID, accountOptions],
    );

    const listHeaderComponent = useMemo(
        () => (
            <View style={[styles.pb2, styles.ph5]}>
                <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.qbo.advancedConfig.invoiceAccountSelectorDescription')}</Text>
            </View>
        ),
        [translate, styles.pb2, styles.ph5, styles.pb5, styles.textNormal],
    );

    const initiallyFocusedOptionKey = useMemo(() => qboOnlineSelectorOptions?.find((mode) => mode.isSelected)?.keyForList, [qboOnlineSelectorOptions]);

    const updateAccount = useCallback(
        ({value}: SelectorType) => {
            Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.QBO, CONST.QUICK_BOOKS_CONFIG.COLLECTION_ACCOUNT_ID, value);
            Navigation.goBack(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ADVANCED.getRoute(policyID));
        },
        [policyID],
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                testID={QuickbooksInvoiceAccountSelectPage.displayName}
            >
                <HeaderWithBackButton title={translate('workspace.qbo.advancedConfig.qboInvoiceCollectionAccount')} />

                <SelectionList
                    sections={[{data: qboOnlineSelectorOptions}]}
                    ListItem={RadioListItem}
                    headerContent={listHeaderComponent}
                    onSelectRow={updateAccount}
                    shouldDebounceRowSelect
                    initiallyFocusedOptionKey={initiallyFocusedOptionKey}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

QuickbooksInvoiceAccountSelectPage.displayName = 'QuickbooksInvoiceAccountSelectPage';

export default withPolicyConnections(QuickbooksInvoiceAccountSelectPage);
