import React, {useCallback, useMemo} from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as QuickbooksOnline from '@libs/actions/connections/QuickbooksOnline';
import Navigation from '@navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type CardListItem = ListItem & {
    value: string;
};

function QuickbooksNonReimbursableDefaultVendorSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {vendors} = policy?.connections?.quickbooksOnline?.data ?? {};
    const {nonReimbursableBillDefaultVendor} = policy?.connections?.quickbooksOnline?.config ?? {};

    const policyID = policy?.id ?? '-1';
    const sections = useMemo(() => {
        const data: CardListItem[] =
            vendors?.map((vendor) => ({
                value: vendor.id,
                text: vendor.name,
                keyForList: vendor.name,
                isSelected: vendor.id === nonReimbursableBillDefaultVendor,
            })) ?? [];
        return data.length ? [{data}] : [];
    }, [nonReimbursableBillDefaultVendor, vendors]);

    const selectVendor = useCallback(
        (row: CardListItem) => {
            if (row.value !== nonReimbursableBillDefaultVendor) {
                QuickbooksOnline.updateQuickbooksOnlineNonReimbursableBillDefaultVendor(policyID, row.value);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT.getRoute(policyID));
        },
        [nonReimbursableBillDefaultVendor, policyID],
    );

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={Illustrations.TeleScope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.qbo.noAccountsFound')}
                subtitle={translate('workspace.qbo.noAccountsFoundDescription')}
                containerStyle={styles.pb10}
            />
        ),
        [translate, styles.pb10],
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
        >
            <ScreenWrapper testID={QuickbooksNonReimbursableDefaultVendorSelectPage.displayName}>
                <HeaderWithBackButton title={translate('workspace.accounting.defaultVendor')} />
                <SelectionList
                    sections={sections}
                    ListItem={RadioListItem}
                    onSelectRow={selectVendor}
                    shouldSingleExecuteRowSelect
                    initiallyFocusedOptionKey={sections[0]?.data.find((mode) => mode.isSelected)?.keyForList}
                    listEmptyContent={listEmptyContent}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

QuickbooksNonReimbursableDefaultVendorSelectPage.displayName = 'QuickbooksNonReimbursableDefaultVendorSelectPage';

export default withPolicyConnections(QuickbooksNonReimbursableDefaultVendorSelectPage);
