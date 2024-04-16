import React, {useCallback, useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function QuickbooksCompanyCardExpenseAccountSelectPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {creditCards} = policy?.connections?.quickbooksOnline?.data ?? {};

    const {exportCompanyCard, syncLocations} = policy?.connections?.quickbooksOnline?.config ?? {};
    const isLocationEnabled = Boolean(syncLocations && syncLocations !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE);

    const defaultCards = [
        {
            name: translate(`workspace.qbo.creditCard`),
        },
        {
            name: translate(`workspace.qbo.debitCard`),
        },
        {
            name: translate(`workspace.qbo.vendorBill`),
        },
    ];
    const cardsBasedOnLocation = isLocationEnabled ? defaultCards.slice(0, -1) : defaultCards;
    const result = creditCards?.length ? creditCards : cardsBasedOnLocation;
    const policyID = policy?.id ?? '';
    const data = useMemo(
        () =>
            result?.map((card) => ({
                value: card.name,
                text: card.name,
                keyForList: card.name,
                isSelected: card.name === exportCompanyCard,
            })),
        [exportCompanyCard, result],
    );

    const onSelectRow = useCallback(
        (row: {value: string}) => {
            if (exportCompanyCard && row.value === exportCompanyCard) {
                Navigation.goBack(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE.getRoute(policyID));
                return;
            }
            Policy.updatePolicyConnectionConfig(policyID, CONST.QUICK_BOOKS_CONFIG.EXPORT_COMPANY_CARD, row.value);
            Navigation.goBack(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE.getRoute(policyID));
        },
        [exportCompanyCard, policyID],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={QuickbooksCompanyCardExpenseAccountSelectPage.displayName}
        >
            <HeaderWithBackButton title={translate('workspace.qbo.exportAs')} />
            <ScrollView contentContainerStyle={styles.pb2}>
                <SelectionList
                    sections={[{data}]}
                    ListItem={RadioListItem}
                    onSelectRow={onSelectRow}
                    initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
                />
                {isLocationEnabled && <Text style={[styles.ph5, styles.mutedTextLabel, styles.pt2]}>{translate('workspace.qbo.companyCardsLocationEnabledDescription')}</Text>}
            </ScrollView>
        </ScreenWrapper>
    );
}

QuickbooksCompanyCardExpenseAccountSelectPage.displayName = 'QuickbooksCompanyCardExpenseAccountSelectPage';

export default withPolicy(QuickbooksCompanyCardExpenseAccountSelectPage);
