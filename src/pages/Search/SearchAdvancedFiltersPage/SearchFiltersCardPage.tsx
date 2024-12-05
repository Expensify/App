import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import CardListItem from '@components/SelectionList/CardListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import variables from '@styles/variables';
import * as SearchActions from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Card, CompanyCardFeed} from '@src/types/onyx';
import type {BankIcon} from '@src/types/onyx/Bank';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type CardFilterItem = Partial<OptionData> & {bankIcon?: BankIcon; lastFourPAN?: string; isVirtual?: boolean; isCardFeed?: boolean; correspondingCards?: string[]};

type DomainFeedData = {bank: string; domainName: string; correspospondingCardIDs: string[]};

function isCard(item: Card | Record<string, string>): item is Card {
    return 'cardID' in item && !!item.cardID && 'bank' in item && !!item.bank;
}

function buildIndividualCardItem(card: Card, isSelected: boolean, iconStyles: StyleProp<ViewStyle>): CardFilterItem {
    const icon = CardUtils.getCardFeedIcon(card?.bank as CompanyCardFeed);
    const cardName = card?.nameValuePairs?.cardTitle ?? card?.cardName;
    const text = card.bank === CONST.EXPENSIFY_CARD.BANK ? card.bank : cardName;

    return {
        lastFourPAN: card.lastFourPAN,
        isVirtual: card?.nameValuePairs?.isVirtual,
        text,
        keyForList: card.cardID.toString(),
        isSelected,
        bankIcon: {
            icon,
            iconWidth: variables.cardIconWidth,
            iconHeight: variables.cardIconHeight,
            iconStyles,
        },
        isCardFeed: false,
    };
}

function buildCardFeedItem(
    text: string,
    keyForList: string,
    correspondingCardIDs: string[],
    selectedCards: string[],
    bank: CompanyCardFeed,
    iconStyles: StyleProp<ViewStyle>,
): CardFilterItem {
    let isSelected = true;
    correspondingCardIDs.forEach((card) => {
        if (selectedCards.includes(card)) {
            return;
        }
        isSelected = false;
    });

    const icon = CardUtils.getCardFeedIcon(bank);
    return {
        text,
        keyForList,
        isSelected,
        bankIcon: {
            icon,
            iconWidth: variables.cardIconWidth,
            iconHeight: variables.cardIconHeight,
            iconStyles,
        },
        isCardFeed: true,
        correspondingCards: correspondingCardIDs,
    };
}

function SearchFiltersCardPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [userCardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [workspaceCardFeeds] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}`);
    const filteredWorkspaceCardFeeds = Object.entries(workspaceCardFeeds ?? {}).filter((cardFeed) => !isEmptyObject(cardFeed));

    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const initiallySelectedCards = searchAdvancedFiltersForm?.cardID;
    const [newSelectedCards, setNewSelectedCards] = useState(initiallySelectedCards ?? []);

    const {invidualCardsSectionData, domainCardFeedsData} = useMemo(() => {
        const individualCards: CardFilterItem[] = [];
        const domainFeedsCards: Record<string, DomainFeedData> = {};

        Object.values(userCardList ?? {}).forEach((card) => {
            const isSelected = newSelectedCards.includes(card.cardID.toString());
            const cardData = buildIndividualCardItem(card, isSelected, styles.cardIcon);

            individualCards.push(cardData);

            // Cards in cardList can also be domain cards, we use them to compute domain feed
            if (!card.domainName.match(CONST.REGEX.EXPENSIFY_POLICY_DOMAIN_NAME)) {
                if (domainFeedsCards[card.domainName]) {
                    domainFeedsCards[card.domainName].correspospondingCardIDs.push(card.cardID.toString());
                } else {
                    domainFeedsCards[card.domainName] = {domainName: card.domainName, bank: card.bank, correspospondingCardIDs: [card.cardID.toString()]};
                }
            }
        });

        // When user is admin of a workspace he sees all the cards of workspace under cards_ Onyx key
        filteredWorkspaceCardFeeds.forEach(([, cardFeed]) => {
            Object.values(cardFeed ?? {}).forEach((card) => {
                if (!card || !isCard(card) || userCardList?.[card.cardID]) {
                    return;
                }
                const isSelected = newSelectedCards.includes(card.cardID.toString());
                const cardData = buildIndividualCardItem(card, isSelected, styles.cardIcon);

                individualCards.push(cardData);
            });
        });
        return {invidualCardsSectionData: individualCards, domainCardFeedsData: domainFeedsCards};
    }, [filteredWorkspaceCardFeeds, newSelectedCards, styles.cardIcon, userCardList]);

    const cardFeedsSectionData = useMemo(() => {
        const repeatingBanks: string[] = [];
        const banks: string[] = [];
        const handleRepeatingBankNames = (bankName: string) => {
            if (banks.includes(bankName)) {
                repeatingBanks.push(bankName);
            } else {
                banks.push(bankName);
            }
        };

        filteredWorkspaceCardFeeds.forEach(([cardFeedKey]) => {
            const bankName = cardFeedKey.split('_').at(2);
            if (!bankName) {
                return;
            }

            handleRepeatingBankNames(bankName);
        });
        Object.values(domainCardFeedsData).forEach((domainFeed) => {
            handleRepeatingBankNames(domainFeed.bank);
        });

        const cardFeedsData: CardFilterItem[] = [];

        filteredWorkspaceCardFeeds.forEach(([, cardFeed]) => {
            const representativeCard = Object.values(cardFeed ?? {}).find((cardFeedItem) => isCard(cardFeedItem));
            if (!representativeCard) {
                return;
            }
            const {domainName, bank} = representativeCard;
            const isBankRepeating = repeatingBanks.includes(bank);
            const cardFeedBankName = bank === CONST.EXPENSIFY_CARD.BANK ? translate('search.filters.card.expensify') : CardUtils.getCardFeedName(bank as CompanyCardFeed);
            const policyID = domainName.match(CONST.REGEX.EXPENSIFY_POLICY_DOMAIN_NAME)?.[1] ?? '';
            const correspondingPolicy = PolicyUtils.getPolicy(policyID?.toUpperCase());
            const text = translate('search.filters.card.cardFeedName', cardFeedBankName, isBankRepeating ? correspondingPolicy?.name : undefined);
            const correspondingCards = Object.keys(cardFeed ?? {});
            if (debouncedSearchTerm && !text.includes(debouncedSearchTerm)) {
                return;
            }

            cardFeedsData.push(buildCardFeedItem(text, policyID, correspondingCards, newSelectedCards, bank as CompanyCardFeed, styles.cardIcon));
        });

        Object.values(domainCardFeedsData).forEach((domainFeed) => {
            const {domainName, bank, correspospondingCardIDs} = domainFeed;
            const isBankRepeating = repeatingBanks.includes(bank);
            const cardFeedBankName = bank === CONST.EXPENSIFY_CARD.BANK ? translate('search.filters.card.expensify') : CardUtils.getCardFeedName(bank as CompanyCardFeed);
            const text = translate('search.filters.card.cardFeedName', cardFeedBankName, isBankRepeating ? domainName : undefined);
            if (debouncedSearchTerm && !text.includes(debouncedSearchTerm)) {
                return;
            }

            cardFeedsData.push(buildCardFeedItem(text, domainName, correspospondingCardIDs, newSelectedCards, bank as CompanyCardFeed, styles.cardIcon));
        });
        return cardFeedsData;
    }, [debouncedSearchTerm, domainCardFeedsData, filteredWorkspaceCardFeeds, newSelectedCards, styles.cardIcon, translate]);

    const shouldShowSearchInput = cardFeedsSectionData.length + invidualCardsSectionData.length > 8;

    const sections = useMemo(() => {
        const newSections = [];

        newSections.push({
            title: translate('search.filters.card.cardFeeds'),
            data: debouncedSearchTerm ? cardFeedsSectionData.filter((item) => item.text?.includes(debouncedSearchTerm)) : cardFeedsSectionData,
            shouldShow: cardFeedsSectionData.length > 0,
        });
        newSections.push({
            title: translate('search.filters.card.individualCards'),
            data: debouncedSearchTerm ? invidualCardsSectionData.filter((item) => item.text?.includes(debouncedSearchTerm)) : invidualCardsSectionData,
            shouldShow: invidualCardsSectionData.length > 0,
        });
        return newSections;
    }, [translate, cardFeedsSectionData, invidualCardsSectionData, debouncedSearchTerm]);

    const handleConfirmSelection = useCallback(() => {
        SearchActions.updateAdvancedFilters({
            cardID: newSelectedCards,
        });

        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
    }, [newSelectedCards]);

    const updateNewCards = useCallback(
        (item: CardFilterItem) => {
            if (!item.keyForList) {
                return;
            }

            const isCardFeed = item?.isCardFeed && item?.correspondingCards;

            if (item.isSelected) {
                const newCardsObject = newSelectedCards.filter((card) => (isCardFeed ? !item.correspondingCards?.includes(card) : card !== item.keyForList));
                setNewSelectedCards(newCardsObject);
            } else {
                const newCardsObject = isCardFeed ? [...newSelectedCards, ...(item?.correspondingCards ?? [])] : [...newSelectedCards, item.keyForList];
                setNewSelectedCards(newCardsObject);
            }
        },
        [newSelectedCards],
    );

    const footerContent = useMemo(
        () => (
            <Button
                success
                text={translate('common.save')}
                pressOnEnter
                onPress={handleConfirmSelection}
                large
            />
        ),
        [translate, handleConfirmSelection],
    );

    return (
        <ScreenWrapper
            testID={SearchFiltersCardPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('common.card')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                }}
            />
            <View style={[styles.flex1]}>
                <SelectionList<CardFilterItem>
                    sections={sections}
                    onSelectRow={updateNewCards}
                    footerContent={footerContent}
                    shouldStopPropagation
                    shouldShowTooltips
                    canSelectMultiple
                    ListItem={CardListItem}
                    textInputLabel={shouldShowSearchInput ? translate('common.search') : undefined}
                    textInputValue={searchTerm}
                    onChangeText={(value) => {
                        setSearchTerm(value);
                    }}
                />
            </View>
        </ScreenWrapper>
    );
}

SearchFiltersCardPage.displayName = 'SearchFiltersCardPage';

export default SearchFiltersCardPage;
