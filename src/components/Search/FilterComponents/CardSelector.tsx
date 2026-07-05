import ActivityIndicator from '@components/ActivityIndicator';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import type {SearchFilterCommonProps} from '@components/Search/types';
import CardListItem from '@components/SelectionList/ListItem/CardListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {TextInputOptions} from '@components/SelectionList/types';

import {useCompanyCardFeedIcons} from '@hooks/useCompanyCardIcons';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';

import {openSearchCardFiltersPage} from '@libs/actions/Search';
import {buildCardsData} from '@libs/CardFeedUtils';
import type {CardFilterItem} from '@libs/CardFeedUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React, {useEffect} from 'react';
import {View} from 'react-native';

import ListFilterView from './ListFilterViewWrapper';

type CardSelectorProps = SearchFilterCommonProps<string[] | undefined>;

function CardSelector({value = [], selectionListTextInputStyle, selectionListStyle, autoFocus, footer, onChange}: CardSelectorProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const illustrations = useThemeIllustrations();
    const companyCardFeedIcons = useCompanyCardFeedIcons();

    const [areCardsLoaded] = useOnyx(ONYXKEYS.IS_SEARCH_FILTERS_CARD_DATA_LOADED);
    const [userCardList, userCardListMetadata] = useOnyx(ONYXKEYS.CARD_LIST);
    const [customCardNames] = useOnyx(ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES);
    const [workspaceCardFeeds, workspaceCardFeedsMetadata] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const personalDetails = usePersonalDetails();

    useEffect(() => {
        if (isOffline) {
            return;
        }
        openSearchCardFiltersPage();
    }, [isOffline]);

    const individualCardsSectionData = buildCardsData(
        workspaceCardFeeds ?? {},
        userCardList ?? {},
        personalDetails ?? {},
        value,
        illustrations,
        companyCardFeedIcons,
        false,
        customCardNames,
    );

    const closedCardsSectionData = buildCardsData(workspaceCardFeeds ?? {}, userCardList ?? {}, personalDetails ?? {}, value, illustrations, companyCardFeedIcons, true, customCardNames);

    const shouldShowSearchInput = individualCardsSectionData.length >= CONST.STANDARD_LIST_ITEM_LIMIT;

    const searchFunction = (item: CardFilterItem) =>
        !!item.text?.toLocaleLowerCase().includes(debouncedSearchTerm.toLocaleLowerCase()) ||
        !!item.lastFourPAN?.toLocaleLowerCase().includes(debouncedSearchTerm.toLocaleLowerCase()) ||
        !!item.cardName?.toLocaleLowerCase().includes(debouncedSearchTerm.toLocaleLowerCase()) ||
        (item.isVirtual && translate('workspace.expensifyCard.virtual').toLocaleLowerCase().includes(debouncedSearchTerm.toLocaleLowerCase()));

    const selectedData = [...individualCardsSectionData, ...closedCardsSectionData].filter((item) => item.isSelected && searchFunction(item));
    const unselectedIndividualCardsData = individualCardsSectionData.filter((item) => !item.isSelected && searchFunction(item));
    const unselectedClosedCardsData = closedCardsSectionData.filter((item) => !item.isSelected && searchFunction(item));

    const itemCount = selectedData.length + unselectedIndividualCardsData.length + unselectedClosedCardsData.length;
    const sectionHeaderCount = unselectedClosedCardsData.length > 0 ? 1 : 0;

    const sections = [
        {
            title: undefined,
            data: selectedData,
            sectionIndex: 0,
        },
        {
            title: undefined,
            data: unselectedIndividualCardsData,
            sectionIndex: 1,
        },
        {
            title: translate('search.filters.card.closedCards'),
            data: unselectedClosedCardsData,
            sectionIndex: 2,
        },
    ];

    const updateNewCards = (item: CardFilterItem) => {
        if (!item.keyForList) {
            return;
        }

        if (item.isSelected) {
            const newCardsObject = value.filter((card) => card !== item.keyForList);
            onChange(newCardsObject);
        } else {
            const newCardsObject = [...value, item.keyForList];
            onChange(newCardsObject);
        }
    };

    const textInputOptions: TextInputOptions = {
        value: searchTerm,
        label: translate('common.search'),
        onChangeText: setSearchTerm,
        headerMessage: debouncedSearchTerm.trim() && sections.every((section) => !section.data.length) ? translate('common.noResultsFound') : '',
        style: {
            containerStyle: selectionListTextInputStyle,
        },
        disableAutoFocus: !autoFocus,
    };

    const isLoadingOnyxData = isLoadingOnyxValue(userCardListMetadata, workspaceCardFeedsMetadata);
    const shouldShowLoadingState = isLoadingOnyxData || (!areCardsLoaded && !isOffline);
    const reasonAttributes: SkeletonSpanReasonAttributes = {context: 'SearchFiltersCardPage', isLoadingFromOnyx: isLoadingOnyxData};

    return (
        <ListFilterView
            itemCount={itemCount}
            itemHeight={variables.optionRowHeight}
            isSearchable={shouldShowSearchInput}
            extraHeight={28 * sectionHeaderCount}
        >
            {shouldShowLoadingState ? (
                <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsCenter]}>
                    <ActivityIndicator
                        color={theme.spinner}
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={[styles.pl3]}
                        reasonAttributes={reasonAttributes}
                    />
                </View>
            ) : (
                <SelectionListWithSections<CardFilterItem>
                    sections={sections}
                    ListItem={CardListItem}
                    onSelectRow={updateNewCards}
                    shouldPreventDefaultFocusOnSelectRow={false}
                    shouldShowTextInput={shouldShowSearchInput}
                    textInputOptions={textInputOptions}
                    shouldStopPropagation
                    canSelectMultiple
                    style={selectionListStyle}
                    footerContent={footer}
                />
            )}
        </ListFilterView>
    );
}

export default CardSelector;
