import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {usePersonalDetails} from '@components/OnyxProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import CardListItem from '@components/SelectionList/Search/CardListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import {openSearchFiltersCardPage, updateAdvancedFilters} from '@libs/actions/Search';
import type {CardFilterItem} from '@libs/CardFeedUtils';
import {buildCardFeedsData, buildCardsData, generateSelectedCards, getDomainFeedData, getSelectedCardsFromFeeds} from '@libs/CardFeedUtils';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SearchFiltersCardPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useThemeIllustrations();

    const [userCardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const personalDetails = usePersonalDetails();

    const [selectedCards, setSelectedCards] = useState<string[]>([]);

    useEffect(() => {
        const generatedCards = generateSelectedCards(userCardList, workspaceCardFeeds, searchAdvancedFiltersForm?.feed, searchAdvancedFiltersForm?.cardID);
        setSelectedCards(generatedCards);
    }, [searchAdvancedFiltersForm?.feed, searchAdvancedFiltersForm?.cardID, workspaceCardFeeds, userCardList]);

    useEffect(() => {
        openSearchFiltersCardPage();
    }, []);

    const individualCardsSectionData = useMemo(
        () => buildCardsData(workspaceCardFeeds ?? {}, userCardList ?? {}, personalDetails ?? {}, selectedCards, illustrations, false),
        [workspaceCardFeeds, userCardList, personalDetails, selectedCards, illustrations],
    );

    const closedCardsSectionData = useMemo(
        () => buildCardsData(workspaceCardFeeds ?? {}, userCardList ?? {}, personalDetails ?? {}, selectedCards, illustrations, true),
        [workspaceCardFeeds, userCardList, personalDetails, selectedCards, illustrations],
    );

    const domainFeedsData = useMemo(() => getDomainFeedData(workspaceCardFeeds), [workspaceCardFeeds]);

    const cardFeedsSectionData = useMemo(
        () => buildCardFeedsData(workspaceCardFeeds ?? CONST.EMPTY_OBJECT, domainFeedsData, selectedCards, translate, illustrations),
        [domainFeedsData, workspaceCardFeeds, selectedCards, translate, illustrations],
    );

    const shouldShowSearchInput =
        cardFeedsSectionData.selected.length + cardFeedsSectionData.unselected.length + individualCardsSectionData.selected.length + individualCardsSectionData.unselected.length >
        CONST.COMPANY_CARDS.CARD_LIST_THRESHOLD;

    const searchFunction = useCallback(
        (item: CardFilterItem) =>
            !!item.text?.toLocaleLowerCase().includes(debouncedSearchTerm.toLocaleLowerCase()) ||
            !!item.lastFourPAN?.toLocaleLowerCase().includes(debouncedSearchTerm.toLocaleLowerCase()) ||
            !!item.cardName?.toLocaleLowerCase().includes(debouncedSearchTerm.toLocaleLowerCase()) ||
            (item.isVirtual && translate('workspace.expensifyCard.virtual').toLocaleLowerCase().includes(debouncedSearchTerm.toLocaleLowerCase())),
        [debouncedSearchTerm, translate],
    );

    const sections = useMemo(() => {
        if (searchAdvancedFiltersForm === undefined) {
            return [];
        }

        const newSections = [];
        const selectedItems = [...cardFeedsSectionData.selected, ...individualCardsSectionData.selected, ...closedCardsSectionData.selected];

        newSections.push({
            title: undefined,
            data: selectedItems.filter(searchFunction),
            shouldShow: selectedItems.length > 0,
        });
        newSections.push({
            title: translate('search.filters.card.cardFeeds'),
            data: cardFeedsSectionData.unselected.filter(searchFunction),
            shouldShow: cardFeedsSectionData.unselected.length > 0,
        });
        newSections.push({
            title: translate('search.filters.card.individualCards'),
            data: individualCardsSectionData.unselected.filter(searchFunction),
            shouldShow: individualCardsSectionData.unselected.length > 0,
        });
        newSections.push({
            title: translate('search.filters.card.closedCards'),
            data: closedCardsSectionData.unselected.filter(searchFunction),
            shouldShow: closedCardsSectionData.unselected.length > 0,
        });
        return newSections;
    }, [
        searchAdvancedFiltersForm,
        cardFeedsSectionData.selected,
        cardFeedsSectionData.unselected,
        individualCardsSectionData.selected,
        individualCardsSectionData.unselected,
        closedCardsSectionData.selected,
        closedCardsSectionData.unselected,
        searchFunction,
        translate,
    ]);

    const handleConfirmSelection = useCallback(() => {
        const feeds = cardFeedsSectionData.selected.map((feed) => feed.cardFeedKey);
        const cardsFromSelectedFeed = getSelectedCardsFromFeeds(userCardList, workspaceCardFeeds, feeds);
        const IDs = selectedCards.filter((card) => !cardsFromSelectedFeed.includes(card));

        updateAdvancedFilters({
            cardID: IDs,
            feed: feeds,
        });

        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
    }, [userCardList, selectedCards, cardFeedsSectionData.selected, workspaceCardFeeds]);

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

    const headerMessage = debouncedSearchTerm.trim() && sections.every((section) => !section.data.length) ? translate('common.noResultsFound') : '';

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
                    headerMessage={headerMessage}
                    shouldStopPropagation
                    shouldShowTooltips
                    canSelectMultiple
                    shouldPreventDefaultFocusOnSelectRow={false}
                    shouldKeepFocusedItemAtTopOfViewableArea={false}
                    shouldScrollToFocusedIndex={false}
                    ListItem={CardListItem}
                    shouldShowTextInput={shouldShowSearchInput}
                    textInputLabel={shouldShowSearchInput ? translate('common.search') : undefined}
                    textInputValue={searchTerm}
                    onChangeText={(value) => {
                        setSearchTerm(value);
                    }}
                    showLoadingPlaceholder
                />
            </View>
        </ScreenWrapper>
    );
}

SearchFiltersCardPage.displayName = 'SearchFiltersCardPage';

export default SearchFiltersCardPage;
