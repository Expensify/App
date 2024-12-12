import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
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
import type {Card, CardList, CompanyCardFeed, WorkspaceCardsList} from '@src/types/onyx';
import type {BankIcon} from '@src/types/onyx/Bank';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type CardFilterItem = Partial<OptionData> & {bankIcon?: BankIcon; lastFourPAN?: string; isVirtual?: boolean; isCardFeed?: boolean; correspondingCards?: string[]};

type DomainFeedData = {bank: string; domainName: string; correspondingCardIDs: string[]};

function getReapeatingBanks(workspaceCardFeedsKeys: string[], domainFeedsData: Record<string, DomainFeedData>) {
    const repeatingBanks: string[] = [];
    const banks: string[] = [];
    const handleRepeatingBankNames = (bankName: string) => {
        if (banks.includes(bankName) && !repeatingBanks.includes(bankName)) {
            repeatingBanks.push(bankName);
        } else {
            banks.push(bankName);
        }
    };

    workspaceCardFeedsKeys.forEach((cardFeedKey) => {
        const bankName = cardFeedKey.split('_').at(2);
        if (!bankName) {
            return;
        }

        handleRepeatingBankNames(bankName);
    });
    Object.values(domainFeedsData).forEach((domainFeed) => {
        handleRepeatingBankNames(domainFeed.bank);
    });
    return repeatingBanks;
}

function buildIndividualCardsData(workspaceCardFeeds: Record<string, WorkspaceCardsList | undefined>, userCardList: CardList, selectedCards: string[], iconStyles: StyleProp<ViewStyle>) {
    const userAssignedCards = Object.values(userCardList ?? {}).map((card) => {
        const isSelected = selectedCards.includes(card.cardID.toString());
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
    });

    // When user is admin of a workspace he sees all the cards of workspace under cards_ Onyx key
    const allWorkspaceCards = Object.values(workspaceCardFeeds)
        .filter((cardFeed) => !isEmptyObject(cardFeed))
        .flatMap((cardFeed) => {
            return Object.values(cardFeed as Record<string, Card>)
                .filter((card) => card && CardUtils.isCard(card) && !userCardList?.[card.cardID])
                .map((card) => {
                    const isSelected = selectedCards.includes(card.cardID.toString());
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
                });
        });
    return [...userAssignedCards, ...allWorkspaceCards];
}

function buildCardFeedsData(
    workspaceCardFeeds: Record<string, WorkspaceCardsList | undefined>,
    domainFeedsData: Record<string, DomainFeedData>,
    selectedCards: string[],
    iconStyles: StyleProp<ViewStyle>,
    translate: LocaleContextProps['translate'],
) {
    const repeatingBanks = getReapeatingBanks(Object.keys(workspaceCardFeeds), domainFeedsData);
    const domainFeeds = Object.values(domainFeedsData).map((domainFeed) => {
        const {domainName, bank, correspondingCardIDs} = domainFeed;
        const isBankRepeating = repeatingBanks.includes(bank);
        const cardFeedBankName = bank === CONST.EXPENSIFY_CARD.BANK ? translate('search.filters.card.expensify') : CardUtils.getCardFeedName(bank as CompanyCardFeed);
        const text = translate('search.filters.card.cardFeedName', {cardFeedBankName, cardFeedLabel: isBankRepeating ? domainName : undefined});

        const isSelected = correspondingCardIDs.every((card) => selectedCards.includes(card));

        const icon = CardUtils.getCardFeedIcon(bank as CompanyCardFeed);
        return {
            text,
            keyForList: `${domainName}-${bank}`,
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
    });

    const workspaceFeeds = Object.entries(workspaceCardFeeds)
        .filter(([, cardFeed]) => !isEmptyObject(cardFeed))
        .map(([cardFeedKey, cardFeed]) => {
            const representativeCard = Object.values(cardFeed ?? {}).find((cardFeedItem) => CardUtils.isCard(cardFeedItem));
            if (!representativeCard) {
                return;
            }
            const {domainName, bank} = representativeCard;
            const isBankRepeating = repeatingBanks.includes(bank);
            const cardFeedBankName = bank === CONST.EXPENSIFY_CARD.BANK ? translate('search.filters.card.expensify') : CardUtils.getCardFeedName(bank as CompanyCardFeed);
            const policyID = domainName.match(CONST.REGEX.EXPENSIFY_POLICY_DOMAIN_NAME)?.[1] ?? '';
            const correspondingPolicy = PolicyUtils.getPolicy(policyID?.toUpperCase());
            const text = translate('search.filters.card.cardFeedName', {cardFeedBankName, cardFeedLabel: isBankRepeating ? correspondingPolicy?.name : undefined});
            const correspondingCardIDs = Object.keys(cardFeed ?? {}).filter((cardKey) => cardKey !== 'cardList');

            const isSelected = correspondingCardIDs.every((card) => selectedCards.includes(card));

            const icon = CardUtils.getCardFeedIcon(bank as CompanyCardFeed);
            return {
                text,
                keyForList: cardFeedKey,
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
        })
        .filter((feed) => feed) as CardFilterItem[];

    return [...domainFeeds, ...workspaceFeeds];
}

function SearchFiltersCardPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [userCardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [workspaceCardFeeds] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}`);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const initiallySelectedCards = searchAdvancedFiltersForm?.cardID;
    const [selectedCards, setSelectedCards] = useState(initiallySelectedCards ?? []);

    const individualCardsSectionData = useMemo(
        () => buildIndividualCardsData(workspaceCardFeeds ?? {}, userCardList ?? {}, selectedCards, styles.cardIcon),
        [workspaceCardFeeds, selectedCards, styles.cardIcon, userCardList],
    );

    const domainFeedsData = useMemo(
        () =>
            Object.values(userCardList ?? {}).reduce((accumulator, currentCard) => {
                // Cards in cardList can also be domain cards, we use them to compute domain feed
                if (!currentCard.domainName.match(CONST.REGEX.EXPENSIFY_POLICY_DOMAIN_NAME)) {
                    if (accumulator[currentCard.domainName]) {
                        accumulator[currentCard.domainName].correspondingCardIDs.push(currentCard.cardID.toString());
                    } else {
                        accumulator[currentCard.domainName] = {domainName: currentCard.domainName, bank: currentCard.bank, correspondingCardIDs: [currentCard.cardID.toString()]};
                    }
                }
                return accumulator;
            }, {} as Record<string, DomainFeedData>),
        [userCardList],
    );

    const cardFeedsSectionData = useMemo(
        () => buildCardFeedsData(workspaceCardFeeds ?? {}, domainFeedsData, selectedCards, styles.cardIcon, translate),
        [domainFeedsData, workspaceCardFeeds, selectedCards, styles.cardIcon, translate],
    );

    const shouldShowSearchInput = cardFeedsSectionData.length + individualCardsSectionData.length > CONST.COMPANY_CARDS.CARD_LIST_THRESHOLD;

    const sections = useMemo(() => {
        const newSections = [];

        newSections.push({
            title: translate('search.filters.card.cardFeeds'),
            data: cardFeedsSectionData.filter((item) => item && item.text?.toLocaleLowerCase().includes(debouncedSearchTerm.toLocaleLowerCase())),
            shouldShow: cardFeedsSectionData.length > 0,
        });
        newSections.push({
            title: translate('search.filters.card.individualCards'),
            data: individualCardsSectionData.filter((item) => item.text?.toLocaleLowerCase().includes(debouncedSearchTerm.toLocaleLowerCase())),
            shouldShow: individualCardsSectionData.length > 0,
        });
        return newSections;
    }, [translate, cardFeedsSectionData, individualCardsSectionData, debouncedSearchTerm]);

    const handleConfirmSelection = useCallback(() => {
        SearchActions.updateAdvancedFilters({
            cardID: selectedCards,
        });

        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
    }, [selectedCards]);

    const updateNewCards = useCallback(
        (item: CardFilterItem) => {
            if (!item.keyForList) {
                return;
            }

            const isCardFeed = item?.isCardFeed && item?.correspondingCards;

            if (item.isSelected) {
                const newCardsObject = selectedCards.filter((card) => (isCardFeed ? !item.correspondingCards?.includes(card) : card !== item.keyForList));
                setSelectedCards(newCardsObject);
            } else {
                const newCardsObject = isCardFeed ? [...selectedCards, ...(item?.correspondingCards ?? [])] : [...selectedCards, item.keyForList];
                setSelectedCards(newCardsObject);
            }
        },
        [selectedCards],
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
                    shouldShowTextInput={shouldShowSearchInput}
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
export {buildIndividualCardsData, buildCardFeedsData};
