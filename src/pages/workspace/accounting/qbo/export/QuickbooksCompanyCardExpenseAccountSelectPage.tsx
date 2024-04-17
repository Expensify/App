import React, {useCallback, useMemo} from 'react';
import type {SectionListData} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem, Section} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type CardListItem = ListItem & {
    value: string;
};
type CardsSection = SectionListData<CardListItem, Section<CardListItem>>;
type Card = {name: string};

function QuickbooksCompanyCardExpenseAccountSelectPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {creditCards} = policy?.connections?.quickbooksOnline?.data ?? {};

    const {exportCompanyCard, syncLocations} = policy?.connections?.quickbooksOnline?.config ?? {};
    const isLocationEnabled = Boolean(syncLocations && syncLocations !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE);

    const defaultCards = useMemo<Card[]>(
        () => [
            {
                name: translate(`workspace.qbo.creditCard`),
            },
            {
                name: translate(`workspace.qbo.debitCard`),
            },
            {
                name: translate(`workspace.qbo.vendorBill`),
            },
        ],
        [translate],
    );
    const cards = useMemo<Card[]>(() => {
        if (creditCards?.length) {
            return creditCards;
        }
        return isLocationEnabled ? defaultCards.slice(0, -1) : defaultCards;
    }, [creditCards, isLocationEnabled, defaultCards]);

    const data = useMemo<CardListItem[]>(
        () =>
            cards.map((card) => ({
                value: card.name,
                text: card.name,
                keyForList: card.name,
                isSelected: card.name === exportCompanyCard,
            })),
        [cards, exportCompanyCard],
    );

    const sections = useMemo<CardsSection[]>(() => [{data}], [data]);
    const policyID = policy?.id ?? '';

    const onSelectRow = useCallback(
        (row: CardListItem) => {
            if (row.value !== exportCompanyCard) {
                Policy.updatePolicyConnectionConfig(policyID, CONST.QUICK_BOOKS_CONFIG.EXPORT_COMPANY_CARD, row.value);
            }
            Navigation.goBack(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT.getRoute(policyID));
        },
        [exportCompanyCard, policyID],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={QuickbooksCompanyCardExpenseAccountSelectPage.displayName}
        >
            <HeaderWithBackButton title={translate('workspace.qbo.exportCompany')} />
            <ScrollView contentContainerStyle={styles.pb2}>
                <SelectionList
                    headerContent={<Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbo.exportCompanyCardsDescription')}</Text>}
                    sections={sections}
                    ListItem={RadioListItem}
                    onSelectRow={onSelectRow}
                    initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
                    footerContent={isLocationEnabled && <Text style={[styles.mutedNormalTextLabel, styles.pt2]}>{translate('workspace.qbo.companyCardsLocationEnabledDescription')}</Text>}
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

QuickbooksCompanyCardExpenseAccountSelectPage.displayName = 'QuickbooksCompanyCardExpenseAccountSelectPage';

export default withPolicy(QuickbooksCompanyCardExpenseAccountSelectPage);
