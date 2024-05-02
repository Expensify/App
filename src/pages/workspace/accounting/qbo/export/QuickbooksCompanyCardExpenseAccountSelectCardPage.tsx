import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {SectionListData} from 'react-native';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem, Section} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections';
import Navigation from '@navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type CardListItem = ListItem & {
    value: ValueOf<typeof CONST.QUICKBOOKS_EXPORT_COMPANY_CARD_ACCOUNT_TYPE>;
};
type CardsSection = SectionListData<CardListItem, Section<CardListItem>>;
type Card = {name: string; id: ValueOf<typeof CONST.QUICKBOOKS_EXPORT_COMPANY_CARD_ACCOUNT_TYPE>};

function QuickbooksCompanyCardExpenseAccountSelectCardPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '';
    const {exportCompanyCard, syncLocations} = policy?.connections?.quickbooksOnline?.config ?? {};
    const isLocationEnabled = Boolean(syncLocations && syncLocations !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE);

    const defaultCards = useMemo<Card[]>(
        () => [
            {
                name: translate(`workspace.qbo.accounts.credit_card`),
                id: CONST.QUICKBOOKS_EXPORT_COMPANY_CARD_ACCOUNT_TYPE.CREDIT_CARD,
            },
            {
                name: translate(`workspace.qbo.accounts.debit_card`),
                id: CONST.QUICKBOOKS_EXPORT_COMPANY_CARD_ACCOUNT_TYPE.DEBIT_CARD,
            },
            {
                name: translate(`workspace.qbo.accounts.bill`),
                id: CONST.QUICKBOOKS_EXPORT_COMPANY_CARD_ACCOUNT_TYPE.VENDOR_BILL,
            },
        ],
        [translate],
    );
    const cards = useMemo<Card[]>(() => (isLocationEnabled ? defaultCards.slice(0, -1) : defaultCards), [isLocationEnabled, defaultCards]);

    const data = useMemo<CardListItem[]>(
        () =>
            cards.map((card) => ({
                value: card.id,
                text: card.name,
                keyForList: card.name,
                isSelected: card.id === exportCompanyCard,
            })),
        [cards, exportCompanyCard],
    );

    const sections = useMemo<CardsSection[]>(() => [{data}], [data]);

    const selectExportCompanyCard = useCallback(
        (row: CardListItem) => {
            if (row.value !== exportCompanyCard) {
                Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.QBO, CONST.QUICK_BOOKS_CONFIG.EXPORT_COMPANY_CARD, row.value);
                Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.QBO, CONST.QUICK_BOOKS_CONFIG.EXPORT_COMPANY_CARD_ACCOUNT);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT.getRoute(policyID));
        },
        [exportCompanyCard, policyID],
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
        >
            <ScreenWrapper testID={QuickbooksCompanyCardExpenseAccountSelectCardPage.displayName}>
                <HeaderWithBackButton title={translate('workspace.qbo.exportCompany')} />
                <View style={styles.flex1}>
                    <SelectionList
                        containerStyle={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                        headerContent={<Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbo.exportCompanyCardsDescription')}</Text>}
                        sections={sections}
                        ListItem={RadioListItem}
                        onSelectRow={selectExportCompanyCard}
                        initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
                        footerContent={
                            isLocationEnabled && <Text style={[styles.mutedNormalTextLabel, styles.pt2]}>{translate('workspace.qbo.companyCardsLocationEnabledDescription')}</Text>
                        }
                    />
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

QuickbooksCompanyCardExpenseAccountSelectCardPage.displayName = 'QuickbooksCompanyCardExpenseAccountSelectCardPage';

export default withPolicyConnections(QuickbooksCompanyCardExpenseAccountSelectCardPage);
