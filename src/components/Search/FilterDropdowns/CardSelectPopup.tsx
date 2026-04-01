import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import CardListItem from '@components/SelectionList/ListItem/CardListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import Text from '@components/Text';
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
import type {PopoverComponentProps} from './DropdownButton';

type CardSelectPopupProps = PopoverComponentProps & {
    updateFilterForm: (values: Partial<SearchAdvancedFiltersForm>) => void;
};

function CardSelectPopup({updateFilterForm, closeOverlay}: CardSelectPopupProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const illustrations = useThemeIllustrations();
    const companyCardFeedIcons = useCompanyCardFeedIcons();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {windowHeight} = useWindowDimensions();

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
        if (isOffline) {
            return;
        }
        openSearchCardFiltersPage();
    }, [isOffline]);

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

    const applyChanges = () => {
        const feeds = cardFeedsSectionData.selected.map((feed) => feed.cardFeedKey);
        const cardsFromSelectedFeed = getSelectedCardsFromFeeds(userCardList, workspaceCardFeeds, feeds);
        const IDs = selectedCards.filter((card) => !cardsFromSelectedFeed.includes(card));

        updateFilterForm({cardID: IDs, feed: feeds});
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
        <View style={[!isSmallScreenWidth && styles.pv4, styles.gap2]}>
            {isSmallScreenWidth && <Text style={[styles.textLabel, styles.textSupporting, styles.ph5, styles.pv1]}>{translate('common.card')}</Text>}
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
                <View style={[styles.getSelectionListPopoverHeight(sections.flatMap((section) => section.data).length || 1, windowHeight, shouldShowSearchInput)]}>
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
                </View>
            )}

            <View style={[styles.flexRow, styles.gap2, styles.ph5]}>
                <Button
                    medium
                    style={[styles.flex1]}
                    text={translate('common.reset')}
                    onPress={resetChanges}
                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_RESET_CARD}
                />
                <Button
                    success
                    medium
                    style={[styles.flex1]}
                    text={translate('common.apply')}
                    onPress={applyChanges}
                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_APPLY_CARD}
                />
            </View>
        </View>
    );
}

export default CardSelectPopup;
