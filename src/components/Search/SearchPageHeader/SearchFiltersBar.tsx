import React, {useCallback, useMemo, useRef} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView, ViewStyle} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import * as Expensicons from '@components/Icon/Expensicons';
import {usePersonalDetails} from '@components/OnyxProvider';
import ScrollView from '@components/ScrollView';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import {useSearchContext} from '@components/Search/SearchContext';
import type {SearchQueryJSON} from '@components/Search/types';
import SearchStatusSkeleton from '@components/Skeletons/SearchStatusSkeleton';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getAllTaxRates} from '@libs/PolicyUtils';
import {buildFilterFormValuesFromQuery} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import DateSelectPopup from '../FilterDropdowns/DateSelectPopup';
import MultiSelectPopup from '../FilterDropdowns/MultiSelectPopup';
import SingleSelectPopup from '../FilterDropdowns/SingleSelectPopup';
import UserSelectPopup from '../FilterDropdowns/UserSelectPopup';
import type {SearchHeaderOptionValue} from './SearchPageHeader';

type SearchFiltersBarProps = {
    queryJSON: SearchQueryJSON;
    headerButtonsOptions: Array<DropdownOption<SearchHeaderOptionValue>>;
};

function SearchFiltersBar({queryJSON, headerButtonsOptions}: SearchFiltersBarProps) {
    const {hash} = queryJSON;
    const scrollRef = useRef<RNScrollView>(null);

    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const StyleUtils = useStyleUtils();

    const {isOffline} = useNetwork();
    const personalDetails = usePersonalDetails();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {selectedTransactions, setExportMode, isExportMode, shouldShowExportModeOption, shouldShowStatusBarLoading} = useSearchContext();

    const [userCardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [currencyList = {}] = useOnyx(ONYXKEYS.CURRENCY_LIST);
    const [policyTagsLists] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS);
    const [policyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES);
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST);
    const [selectionMode] = useOnyx(ONYXKEYS.MOBILE_SELECTION_MODE, {canBeMissing: true});
    const [currentSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`, {canBeMissing: true});

    const taxRates = getAllTaxRates();
    const allCards = useMemo(() => mergeCardListWithWorkspaceFeeds(workspaceCardFeeds ?? CONST.EMPTY_OBJECT, userCardList), [userCardList, workspaceCardFeeds]);
    const selectedTransactionsKeys = useMemo(() => Object.keys(selectedTransactions ?? {}), [selectedTransactions]);

    const hasErrors = Object.keys(currentSearchResults?.errors ?? {}).length > 0 && !isOffline;
    const shouldShowSelectedDropdown = headerButtonsOptions.length > 0 && (!shouldUseNarrowLayout || (!!selectionMode && selectionMode.isEnabled));

    const openAdvancedFilters = useCallback(() => {
        const filterFormValues = buildFilterFormValuesFromQuery(queryJSON, policyCategories, policyTagsLists, currencyList, personalDetails, allCards, reports, taxRates);
        updateAdvancedFilters(filterFormValues);

        Navigation.navigate(ROUTES.SEARCH_ADVANCED_FILTERS);
    }, [allCards, currencyList, personalDetails, policyCategories, policyTagsLists, queryJSON, reports, taxRates]);

    if (hasErrors) {
        return null;
    }

    if (shouldShowStatusBarLoading) {
        return <SearchStatusSkeleton shouldAnimate />;
    }

    const selectionButtonText = isExportMode ? translate('search.exportAll.allMatchingItemsSelected') : translate('workspace.common.selected', {count: selectedTransactionsKeys.length});

    return (
        <View style={[shouldShowSelectedDropdown && styles.ph5, styles.mb2, styles.searchStatusBarContainer]}>
            {shouldShowSelectedDropdown ? (
                <View style={styles.flexRow}>
                    <ButtonWithDropdownMenu
                        onPress={() => null}
                        shouldAlwaysShowDropdownMenu
                        buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                        customText={selectionButtonText}
                        options={headerButtonsOptions}
                        isSplitButton={false}
                        anchorAlignment={{
                            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                        }}
                        popoverHorizontalOffsetType={CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT}
                    />
                    {!isExportMode && shouldShowExportModeOption && (
                        <View style={[styles.button, styles.bgTransparent]}>
                            <Button
                                link
                                shouldUseDefaultHover={false}
                                innerStyles={[styles.p0, StyleUtils.getResetStyle<ViewStyle>(['height', 'minHeight'])]}
                                onPress={() => setExportMode(true)}
                                text={translate('search.exportAll.selectAllMatchingItems')}
                            />
                        </View>
                    )}
                </View>
            ) : (
                <ScrollView
                    style={[styles.flexRow, styles.overflowScroll, styles.flexGrow0]}
                    contentContainerStyle={[styles.flexRow, styles.flexGrow0, styles.gap2, styles.ph5]}
                    ref={scrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                >
                    <DropdownButton
                        label="Type"
                        value={null}
                        items={[]}
                        onChange={() => {}}
                        listItem={SingleSelectPopup}
                    />
                    <DropdownButton
                        label="Status"
                        value={null}
                        items={[]}
                        onChange={() => {}}
                        listItem={MultiSelectPopup}
                    />
                    <DropdownButton
                        label="Date"
                        value={null}
                        items={[]}
                        onChange={() => {}}
                        listItem={DateSelectPopup}
                    />
                    <DropdownButton
                        label="From"
                        value={null}
                        items={[]}
                        onChange={() => {}}
                        listItem={UserSelectPopup}
                    />

                    <Button
                        link
                        small
                        text={translate('search.filtersHeader')}
                        textStyles={[styles.textMicroBold]}
                        iconFill={theme.link}
                        iconHoverFill={theme.linkHover}
                        icon={Expensicons.Filter}
                        onPress={openAdvancedFilters}
                    />
                </ScrollView>
            )}
        </View>
    );
}

SearchFiltersBar.displayName = 'SearchFiltersBar';

export default SearchFiltersBar;
