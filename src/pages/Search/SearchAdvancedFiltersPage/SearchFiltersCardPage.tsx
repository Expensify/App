import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchFilterPageFooterButtons from '@components/Search/SearchFilterPageFooterButtons';
import CardListItem from '@components/SelectionList/ListItem/CardListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import {useCompanyCardFeedIcons} from '@hooks/useCompanyCardIcons';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import type {CardFilterItem} from '@libs/CardFeedUtils';
import {buildCardFeedsData, buildCardsData, generateSelectedCards, getDomainFeedData, getSelectedCardsFromFeeds} from '@libs/CardFeedUtils';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

function SearchFiltersCardPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useThemeIllustrations();
    const companyCardFeedIcons = useCompanyCardFeedIcons();

    const [userCardList, userCardListMetadata] = useOnyx(ONYXKEYS.CARD_LIST);
    const [workspaceCardFeeds, workspaceCardFeedsMetadata] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST);
    const [policies, policiesMetadata] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [searchAdvancedFiltersForm, searchAdvancedFiltersFormMetadata] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const personalDetails = usePersonalDetails();

    const [selectedCards, setSelectedCards] = useState<string[]>([]);

    useEffect(() => {
        const generatedCards = generateSelectedCards(userCardList, workspaceCardFeeds, searchAdvancedFiltersForm?.feed, searchAdvancedFiltersForm?.cardID);
        setSelectedCards(generatedCards);
    }, [searchAdvancedFiltersForm?.feed, searchAdvancedFiltersForm?.cardID, workspaceCardFeeds, userCardList]);

    const individualCardsSectionData = buildCardsData(workspaceCardFeeds ?? {}, userCardList ?? {}, personalDetails ?? {}, selectedCards, illustrations, companyCardFeedIcons, false);

    const closedCardsSectionData = buildCardsData(workspaceCardFeeds ?? {}, userCardList ?? {}, personalDetails ?? {}, selectedCards, illustrations, companyCardFeedIcons, true);

    const domainFeedsData = getDomainFeedData(workspaceCardFeeds);

    const cardFeedsSectionData = buildCardFeedsData(workspaceCardFeeds ?? CONST.EMPTY_OBJECT, domainFeedsData, policies, selectedCards, translate, illustrations, companyCardFeedIcons);

    const shouldShowSearchInput =
        cardFeedsSectionData.selected.length + cardFeedsSectionData.unselected.length + individualCardsSectionData.selected.length + individualCardsSectionData.unselected.length >
        CONST.COMPANY_CARDS.CARD_LIST_THRESHOLD;

    const searchFunction = (item: CardFilterItem) =>
        !!item.text?.toLocaleLowerCase().includes(debouncedSearchTerm.toLocaleLowerCase()) ||
        !!item.lastFourPAN?.toLocaleLowerCase().includes(debouncedSearchTerm.toLocaleLowerCase()) ||
        !!item.cardName?.toLocaleLowerCase().includes(debouncedSearchTerm.toLocaleLowerCase()) ||
        (item.isVirtual && translate('workspace.expensifyCard.virtual').toLocaleLowerCase().includes(debouncedSearchTerm.toLocaleLowerCase()));

    const sections =
        searchAdvancedFiltersForm === undefined
            ? []
            : [
                  {
                      title: undefined,
                      data: [...cardFeedsSectionData.selected, ...individualCardsSectionData.selected, ...closedCardsSectionData.selected].filter(searchFunction),
                      sectionIndex: 0,
                  },
                  {
                      title: translate('search.filters.card.cardFeeds'),
                      data: cardFeedsSectionData.unselected.filter(searchFunction),
                      sectionIndex: 1,
                  },
                  {
                      title: translate('search.filters.card.individualCards'),
                      data: individualCardsSectionData.unselected.filter(searchFunction),
                      sectionIndex: 2,
                  },
                  {
                      title: translate('search.filters.card.closedCards'),
                      data: closedCardsSectionData.unselected.filter(searchFunction),
                      sectionIndex: 3,
                  },
              ];

    const handleConfirmSelection = () => {
        const feeds = cardFeedsSectionData.selected.map((feed) => feed.cardFeedKey);
        const cardsFromSelectedFeed = getSelectedCardsFromFeeds(userCardList, workspaceCardFeeds, feeds);
        const IDs = selectedCards.filter((card) => !cardsFromSelectedFeed.includes(card));

        updateAdvancedFilters({
            cardID: IDs,
            feed: feeds,
        });

        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    };

    const updateNewCards = (item: CardFilterItem) => {
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
    };

    const footerContent = (
        <SearchFilterPageFooterButtons
            applyChanges={handleConfirmSelection}
            resetChanges={() => setSelectedCards([])}
        />
    );

    const textInputOptions = {
        value: searchTerm,
        label: translate('common.search'),
        onChangeText: setSearchTerm,
        headerMessage: debouncedSearchTerm.trim() && sections.every((section) => !section.data.length) ? translate('common.noResultsFound') : '',
    };

    return (
        <ScreenWrapper
            testID="SearchFiltersCardPage"
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
                        <SelectionListWithSections<CardFilterItem>
                            sections={sections}
                            ListItem={CardListItem}
                            onSelectRow={updateNewCards}
                            footerContent={footerContent}
                            shouldPreventDefaultFocusOnSelectRow={false}
                            shouldShowTextInput={shouldShowSearchInput}
                            textInputOptions={textInputOptions}
                            showLoadingPlaceholder={
                                isLoadingOnyxValue(userCardListMetadata, workspaceCardFeedsMetadata, searchAdvancedFiltersFormMetadata, policiesMetadata) || !didScreenTransitionEnd
                            }
                            shouldStopPropagation
                            canSelectMultiple
                        />
                    </View>
                </>
            )}
        </ScreenWrapper>
    );
}

export default SearchFiltersCardPage;
