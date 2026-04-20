import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import CardListItem from '@components/SelectionList/ListItem/CardListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';
import {useCompanyCardFeedIcons} from '@hooks/useCompanyCardIcons';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {openSearchCardFiltersPage} from '@libs/actions/Search';
import {buildCardFeedsData, buildCardsData, generateSelectedCards, getDomainFeedData, getSelectedCardsFromFeeds} from '@libs/CardFeedUtils';
import type {CardFilterItem} from '@libs/CardFeedUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import BasePopup from './BasePopup';

type CardSelectPopupProps = {
    isExpanded: boolean;
    closeOverlay: () => void;
    updateFilterForm: (values: Partial<SearchAdvancedFiltersForm>) => void;
};

function CardSelectPopup({isExpanded, updateFilterForm, closeOverlay}: CardSelectPopupProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const illustrations = useThemeIllustrations();
    const companyCardFeedIcons = useCompanyCardFeedIcons();
    const {windowHeight} = useWindowDimensions();
    const {shouldUseNarrowLayout, isInLandscapeMode} = useResponsiveLayout();

    const [areCardsLoaded] = useOnyx(ONYXKEYS.IS_SEARCH_FILTERS_CARD_DATA_LOADED);
    const [userCardList, userCardListMetadata] = useOnyx(ONYXKEYS.CARD_LIST);
    const [customCardNames] = useOnyx(ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES);
    const [workspaceCardFeeds, workspaceCardFeedsMetadata] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST);
    const [policies, policiesMetadata] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [searchAdvancedFiltersForm, searchAdvancedFiltersFormMetadata] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const personalDetails = usePersonalDetails();

    const [selectedCards, setSelectedCards] = useState<string[]>([]);

    useEffect(() => {
        if (isOffline || !isExpanded) {
            return;
        }
        openSearchCardFiltersPage();
    }, [isOffline, isExpanded]);

    useEffect(() => {
        const generatedCards = generateSelectedCards(userCardList, workspaceCardFeeds, searchAdvancedFiltersForm?.feed, searchAdvancedFiltersForm?.cardID);
        setSelectedCards(generatedCards);
    }, [searchAdvancedFiltersForm?.feed, searchAdvancedFiltersForm?.cardID, workspaceCardFeeds, userCardList]);

    const individualCardsSectionData = buildCardsData(
        workspaceCardFeeds ?? {},
        userCardList ?? {},
        personalDetails ?? {},
        selectedCards,
        illustrations,
        companyCardFeedIcons,
        false,
        customCardNames,
    );

    const closedCardsSectionData = buildCardsData(
        workspaceCardFeeds ?? {},
        userCardList ?? {},
        personalDetails ?? {},
        selectedCards,
        illustrations,
        companyCardFeedIcons,
        true,
        customCardNames,
    );

    const domainFeedsData = getDomainFeedData(workspaceCardFeeds);

    const cardFeedsSectionData = buildCardFeedsData(workspaceCardFeeds ?? CONST.EMPTY_OBJECT, domainFeedsData, policies, selectedCards, translate, illustrations, companyCardFeedIcons);

    const shouldShowSearchInput =
        cardFeedsSectionData.selected.length + cardFeedsSectionData.unselected.length + individualCardsSectionData.selected.length + individualCardsSectionData.unselected.length >=
        CONST.STANDARD_LIST_ITEM_LIMIT;

    const searchFunction = (item: CardFilterItem) =>
        !!item.text?.toLocaleLowerCase().includes(debouncedSearchTerm.toLocaleLowerCase()) ||
        !!item.lastFourPAN?.toLocaleLowerCase().includes(debouncedSearchTerm.toLocaleLowerCase()) ||
        !!item.cardName?.toLocaleLowerCase().includes(debouncedSearchTerm.toLocaleLowerCase()) ||
        (item.isVirtual && translate('workspace.expensifyCard.virtual').toLocaleLowerCase().includes(debouncedSearchTerm.toLocaleLowerCase()));

    let sections: Array<Section<CardFilterItem>> = [];
    let itemCount;
    let sectionHeaderCount = 0;

    if (searchAdvancedFiltersForm) {
        const selectedData = [...cardFeedsSectionData.selected, ...individualCardsSectionData.selected, ...closedCardsSectionData.selected].filter(searchFunction);
        const unselectedCardFeedsData = cardFeedsSectionData.unselected.filter(searchFunction);
        const unselectedIndividualCardsData = individualCardsSectionData.unselected.filter(searchFunction);
        const unselectedClosedCardsData = closedCardsSectionData.unselected.filter(searchFunction);

        itemCount = selectedData.length + unselectedCardFeedsData.length + unselectedIndividualCardsData.length + unselectedClosedCardsData.length;
        sectionHeaderCount = [unselectedCardFeedsData.length, unselectedIndividualCardsData.length, unselectedClosedCardsData.length].filter(Boolean).length;

        sections = [
            {
                title: undefined,
                data: selectedData,
                sectionIndex: 0,
            },
            {
                title: translate('search.filters.card.cardFeeds'),
                data: unselectedCardFeedsData,
                sectionIndex: 1,
            },
            {
                title: translate('search.filters.card.individualCards'),
                data: unselectedIndividualCardsData,
                sectionIndex: 2,
            },
            {
                title: translate('search.filters.card.closedCards'),
                data: unselectedClosedCardsData,
                sectionIndex: 3,
            },
        ];
    }

    const applyChanges = () => {
        const feeds = cardFeedsSectionData.selected.map((feed) => feed.cardFeedKey);
        const cardsFromSelectedFeed = getSelectedCardsFromFeeds(userCardList, workspaceCardFeeds, feeds);
        const cardIDs = selectedCards.filter((card) => !cardsFromSelectedFeed.includes(card));

        updateFilterForm({cardID: cardIDs, feed: feeds});
        closeOverlay();
    };

    const resetChanges = () => {
        updateFilterForm({feed: undefined, cardID: undefined});
        closeOverlay();
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

    const textInputOptions = {
        value: searchTerm,
        label: translate('common.search'),
        onChangeText: setSearchTerm,
        headerMessage: debouncedSearchTerm.trim() && sections.every((section) => !section.data.length) ? translate('common.noResultsFound') : '',
    };

    const isLoadingOnyxData = isLoadingOnyxValue(userCardListMetadata, workspaceCardFeedsMetadata, searchAdvancedFiltersFormMetadata, policiesMetadata);
    const shouldShowLoadingState = isLoadingOnyxData || (!areCardsLoaded && !isOffline);
    const reasonAttributes: SkeletonSpanReasonAttributes = {context: 'SearchFiltersCardPage', isLoadingFromOnyx: isLoadingOnyxData};

    return (
        <BasePopup
            label={translate('common.card')}
            onReset={resetChanges}
            onApply={applyChanges}
            resetSentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_RESET_CARD}
            applySentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_APPLY_CARD}
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- we want to fallback to 1 when it's 0
            style={styles.getCardSelectionListPopoverHeight(itemCount || 1, sectionHeaderCount, windowHeight, shouldUseNarrowLayout, isInLandscapeMode, shouldShowSearchInput)}
        >
            {!!shouldShowLoadingState && (
                <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsCenter]}>
                    <ActivityIndicator
                        color={theme.spinner}
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={[styles.pl3]}
                        reasonAttributes={reasonAttributes}
                    />
                </View>
            )}
            {!shouldShowLoadingState && (
                <SelectionListWithSections<CardFilterItem>
                    sections={sections}
                    ListItem={CardListItem}
                    onSelectRow={updateNewCards}
                    shouldPreventDefaultFocusOnSelectRow={false}
                    shouldShowTextInput={shouldShowSearchInput}
                    textInputOptions={textInputOptions}
                    shouldStopPropagation
                    canSelectMultiple
                />
            )}
        </BasePopup>
    );
}

export default CardSelectPopup;
