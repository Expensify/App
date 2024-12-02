import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import CardListItem from '@components/SelectionList/CardListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import type {OptionData} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import variables from '@styles/variables';
import * as SearchActions from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {CompanyCardFeed} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type SearchCardItemProps = Partial<OptionData> & {isCardFeed?: boolean; correspondingCards?: string[]};

function SearchFiltersCardPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [userCardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const userCardListArray = Object.values(userCardList ?? {});

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const policyList = Object.values(policies ?? {});
    const [workspaceCardFeeds] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}`);

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const currentCards = searchAdvancedFiltersForm?.cardID;
    const [newCards, setNewCards] = useState(currentCards ?? []);

    const sections = useMemo(() => {
        const newSections = [];

        const cardFeedsSection = Object.entries(workspaceCardFeeds ?? {})
            .filter(([, expensifyCards]) => !isEmptyObject(expensifyCards))
            .map(([expensifyCardListKey, expensifyCards]) => {
                const [, workspaceAccountID, bank] = expensifyCardListKey.split('_');
                const correspondingPolicy = policyList.find((policy) => policy?.workspaceAccountID?.toString() === workspaceAccountID);
                const cardFeedBankName = bank === CONST.EXPENSIFY_CARD.BANK ? translate('search.filters.card.expensify') : CardUtils.getCardFeedName(bank as CompanyCardFeed);
                const text = translate('search.filters.card.cardFeedName', cardFeedBankName, correspondingPolicy?.name);
                const correspondingCards = Object.keys(expensifyCards ?? {}).filter((expensifyCardKey) => userCardListArray.some((card) => card.cardID.toString() === expensifyCardKey));
                let isSelected = true;
                correspondingCards.forEach((card) => {
                    if (newCards.includes(card)) {
                        return;
                    }
                    isSelected = false;
                });

                const icon = CardUtils.getCardFeedIcon(bank as CompanyCardFeed | typeof CONST.EXPENSIFY_CARD.BANK);
                return {
                    text,
                    keyForList: workspaceAccountID,
                    isSelected,
                    bankIcon: {
                        icon,
                        iconWidth: variables.cardIconWidth,
                        iconHeight: variables.cardIconHeight,
                        iconStyles: [styles.cardIcon],
                    },
                    isCardFeed: true,
                    correspondingCards,
                };
            });
        newSections.push({title: translate('search.filters.card.cardFeeds'), data: cardFeedsSection, shouldShow: cardFeedsSection.length > 0});

        const cards = userCardListArray
            .sort((a, b) => a.bank.localeCompare(b.bank))
            .map((card) => {
                const icon = CardUtils.getCardFeedIcon(card?.bank as CompanyCardFeed);
                const cardName = card?.nameValuePairs?.cardTitle ?? card?.cardName;
                const text = card.bank === CONST.EXPENSIFY_CARD.BANK ? card.bank : cardName;

                return {
                    lastFourPAN: card.lastFourPAN,
                    isVirtual: card?.nameValuePairs?.isVirtual,
                    text,
                    keyForList: card.cardID.toString(),
                    isSelected: newCards.includes(card.cardID.toString()),
                    bankIcon: {
                        icon,
                        iconWidth: variables.cardIconWidth,
                        iconHeight: variables.cardIconHeight,
                        iconStyles: [styles.cardIcon],
                    },
                    isCardFeed: false,
                };
            });
        newSections.push({
            title: translate('search.filters.card.individualCards'),
            data: cards,
            shouldShow: cards.length > 0,
        });
        return newSections;
    }, [workspaceCardFeeds, translate, userCardListArray, policyList, styles.cardIcon, newCards]);

    const handleConfirmSelection = useCallback(() => {
        SearchActions.updateAdvancedFilters({
            cardID: newCards,
        });

        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
    }, [newCards]);

    const updateNewCards = useCallback(
        (item: SearchCardItemProps) => {
            if (!item.keyForList) {
                return;
            }

            const isCardFeed = item?.isCardFeed && item?.correspondingCards;

            if (item.isSelected) {
                const newCardsObject = newCards.filter((card) => (isCardFeed ? !item.correspondingCards?.includes(card) : card !== item.keyForList));
                setNewCards(newCardsObject);
            } else {
                const newCardsObject = isCardFeed ? [...newCards, ...(item?.correspondingCards ?? [])] : [...newCards, item.keyForList];
                setNewCards(newCardsObject);
            }
        },
        [newCards],
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
                <SelectionList<SearchCardItemProps>
                    sections={sections}
                    onSelectRow={updateNewCards}
                    footerContent={footerContent}
                    shouldStopPropagation
                    shouldShowTooltips
                    canSelectMultiple
                    ListItem={CardListItem}
                />
            </View>
        </ScreenWrapper>
    );
}

SearchFiltersCardPage.displayName = 'SearchFiltersCardPage';

export default SearchFiltersCardPage;
