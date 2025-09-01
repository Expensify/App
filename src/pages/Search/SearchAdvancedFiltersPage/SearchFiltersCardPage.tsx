import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchFilterPageFooterButtons from '@components/Search/SearchFilterPageFooterButtons';
import SelectionList from '@components/SelectionList';
import CardListItem from '@components/SelectionList/Search/CardListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import type {CardFilterItem} from '@libs/CardFeedUtils';
import {buildCardFeedsData, buildCardsData, generateSelectedCards, getDomainFeedData, getSelectedCardsFromFeeds} from '@libs/CardFeedUtils';
import {getFirstSelectedItem} from '@libs/OptionsListUtils';
import Navigation from '@navigation/Navigation';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

function SearchFiltersCardPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useThemeIllustrations();

    const [userCardList, userCardListMetadata] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});
    const [workspaceCardFeeds, workspaceCardFeedsMetadata] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: true});
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [searchAdvancedFiltersForm, searchAdvancedFiltersFormMetadata] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});
    const personalDetails = usePersonalDetails();

    const [selectedCards, setSelectedCards] = useState<string[]>([]);

    useEffect(() => {
        const generatedCards = generateSelectedCards(userCardList, workspaceCardFeeds, searchAdvancedFiltersForm?.feed, searchAdvancedFiltersForm?.cardID);
        setSelectedCards(generatedCards);
    }, [searchAdvancedFiltersForm?.feed, searchAdvancedFiltersForm?.cardID, workspaceCardFeeds, userCardList]);

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
        cardFeedsSectionData.length + cardFeedsSectionData.length + individualCardsSectionData.length + individualCardsSectionData.length > CONST.COMPANY_CARDS.CARD_LIST_THRESHOLD;

    const searchFunction = useCallback(
        (item: CardFilterItem) =>
            !!item.text?.toLocaleLowerCase().includes(debouncedSearchTerm.toLocaleLowerCase()) ||
            !!item.lastFourPAN?.toLocaleLowerCase().includes(debouncedSearchTerm.toLocaleLowerCase()) ||
            !!item.cardName?.toLocaleLowerCase().includes(debouncedSearchTerm.toLocaleLowerCase()) ||
            (item.isVirtual && translate('workspace.expensifyCard.virtual').toLocaleLowerCase().includes(debouncedSearchTerm.toLocaleLowerCase())),
        [debouncedSearchTerm, translate],
    );

    const {sections, firstKeyForList} = useMemo(() => {
        let firstKey = '';
        if (searchAdvancedFiltersForm === undefined) {
            return {sections: [], firstKeyForList: firstKey};
        }

        const newSections = [];

        newSections.push({
            title: translate('search.filters.card.cardFeeds'),
            data: cardFeedsSectionData.filter(searchFunction),
            shouldShow: cardFeedsSectionData.length > 0,
        });
        if (!firstKey) {
            firstKey = getFirstSelectedItem(cardFeedsSectionData);
        }

        newSections.push({
            title: translate('search.filters.card.individualCards'),
            data: individualCardsSectionData.filter(searchFunction),
            shouldShow: individualCardsSectionData.length > 0,
        });
        if (!firstKey) {
            firstKey = getFirstSelectedItem(individualCardsSectionData);
        }

        newSections.push({
            title: translate('search.filters.card.closedCards'),
            data: closedCardsSectionData.filter(searchFunction),
            shouldShow: closedCardsSectionData.length > 0,
        });
        if (!firstKey) {
            firstKey = getFirstSelectedItem(closedCardsSectionData);
        }

        return {sections: newSections, firstKeyForList: firstKey};
    }, [searchAdvancedFiltersForm, cardFeedsSectionData, individualCardsSectionData, closedCardsSectionData, searchFunction, translate]);

    const handleConfirmSelection = useCallback(() => {
        const feeds = cardFeedsSectionData.filter((feed) => feed.isSelected).map((feed) => feed.cardFeedKey);
        const cardsFromSelectedFeed = getSelectedCardsFromFeeds(userCardList, workspaceCardFeeds, feeds);
        const IDs = selectedCards.filter((card) => !cardsFromSelectedFeed.includes(card));

        updateAdvancedFilters({
            cardID: IDs,
            feed: feeds,
        });

        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    }, [userCardList, selectedCards, cardFeedsSectionData, workspaceCardFeeds]);

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

    const resetChanges = useCallback(() => {
        setSelectedCards([]);
    }, [setSelectedCards]);

    const footerContent = useMemo(
        () => (
            <SearchFilterPageFooterButtons
                applyChanges={handleConfirmSelection}
                resetChanges={resetChanges}
            />
        ),
        [resetChanges, handleConfirmSelection],
    );

    return (
        <ScreenWrapper
            testID={SearchFiltersCardPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            shouldEnableMaxHeight
        >
            {({didScreenTransitionEnd}) => (
                <>
                    <HeaderWithBackButton
                        title={translate('common.card')}
                        onBackButtonPress={() => {
                            Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
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
                            ListItem={CardListItem}
                            shouldShowTextInput={shouldShowSearchInput}
                            textInputLabel={shouldShowSearchInput ? translate('common.search') : undefined}
                            textInputValue={searchTerm}
                            onChangeText={(value) => {
                                setSearchTerm(value);
                            }}
                            showLoadingPlaceholder={isLoadingOnyxValue(userCardListMetadata, workspaceCardFeedsMetadata, searchAdvancedFiltersFormMetadata) || !didScreenTransitionEnd}
                            initiallyFocusedOptionKey={firstKeyForList}
                            getItemHeight={() => variables.optionRowHeight}
                        />
                    </View>
                </>
            )}
        </ScreenWrapper>
    );
}

SearchFiltersCardPage.displayName = 'SearchFiltersCardPage';

export default SearchFiltersCardPage;
