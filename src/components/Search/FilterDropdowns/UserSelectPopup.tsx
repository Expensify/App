import {accountIDSelector} from '@selectors/Session';
import isEmpty from 'lodash/isEmpty';
import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import SelectionList from '@components/SelectionListWithSections';
import UserSelectionListItem from '@components/SelectionListWithSections/Search/UserSelectionListItem';
import type {SelectionListHandle} from '@components/SelectionListWithSections/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import memoize from '@libs/memoize';
import type {Option, Section} from '@libs/OptionsListUtils';
import {filterAndOrderOptions, getValidOptions} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function getSelectedOptionData(option: Option) {
    return {...option, reportID: `${option.reportID}`, selected: true};
}

const optionsMatch = (opt1: Option, opt2: Option) => {
    // Below is just a boolean expression.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return (opt1.accountID && opt1.accountID === opt2?.accountID) || (opt1.reportID && opt1.reportID === opt2?.reportID);
};

const memoizedGetValidOptions = memoize(getValidOptions, {maxSize: 5, monitoringName: 'UserSelectPopup.getValidOptions'});
// Virtualization constants for handling large datasets efficiently
const INITIAL_RENDER_COUNT = 50; // Number of items to render initially
const LOAD_MORE_COUNT = 25; // Number of items to load when scrolling
const SEARCH_THROTTLE_DELAY = 150; // Debounce search input

type UserSelectPopupProps = {
    /** The currently selected users */
    value: string[];

    /** Function to call to close the overlay when changes are applied */
    closeOverlay: () => void;

    /** Function to call when changes are applied */
    onChange: (value: string[]) => void;
};

function UserSelectPopup({value, closeOverlay, onChange}: UserSelectPopupProps) {
    const selectionListRef = useRef<SelectionListHandle | null>(null);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {options} = useOptionsList();
    const personalDetails = usePersonalDetails();
    const {windowHeight} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true, selector: accountIDSelector});
    const shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [visibleItemCount, setVisibleItemCount] = useState(INITIAL_RENDER_COUNT);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const [draftComments] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, {canBeMissing: true});
    const [nvpDismissedProductTraining] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {canBeMissing: true});
    const initialSelectedOptions = useMemo(() => {
        return value.reduce<OptionData[]>((acc, id) => {
            const participant = personalDetails?.[id];
            if (!participant) {
                return acc;
            }

            const optionData = getSelectedOptionData(participant);
            if (optionData) {
                acc.push(optionData);
            }

            return acc;
        }, []);
    }, [value, personalDetails]);

    const [selectedOptions, setSelectedOptions] = useState<Option[]>(initialSelectedOptions);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm.trim().toLowerCase());
            setVisibleItemCount(INITIAL_RENDER_COUNT);
        }, SEARCH_THROTTLE_DELAY);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const cleanSearchTerm = debouncedSearchTerm;

    const selectedAccountIDs = useMemo(() => {
        return new Set(selectedOptions.map((option) => option.accountID).filter(Boolean));
    }, [selectedOptions]);

    const optionsList = useMemo(() => {
        return memoizedGetValidOptions(
            {
                reports: options.reports,
                personalDetails: options.personalDetails,
            },
            draftComments,
            nvpDismissedProductTraining,
            {
                excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
                includeCurrentUser: true,
            },
            countryCode,
        );
    }, [options.reports, options.personalDetails, draftComments, nvpDismissedProductTraining, countryCode]);

    const filteredOptions = useMemo(() => {

        const result = filterAndOrderOptions(optionsList, cleanSearchTerm, countryCode, {
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
            canInviteUser: false,
        });
        return result;
    }, [optionsList, cleanSearchTerm, countryCode]);

    // Efficiently process only the visible items to handle large datasets
    const listData = useMemo(() => {

        const {personalDetails: filteredPersonalDetails, recentReports} = filteredOptions;
        // Pre-sort and combine data sources efficiently
        const allOptions = [...filteredPersonalDetails, ...recentReports];

        // Sort once before slicing to ensure consistent ordering
        allOptions.sort((a, b) => {
            const aIsSelected = selectedAccountIDs.has(a.accountID);
            const bIsSelected = selectedAccountIDs.has(b.accountID);

            // Selected items first
            if (aIsSelected && !bIsSelected) {
                return -1;
            }
            if (!aIsSelected && bIsSelected) {
                return 1;
            }

            // Current user at the top
            if (a.accountID === accountID) {
                return -1;
            }
            if (b.accountID === accountID) {
                return 1;
            }

            return 0;
        });

        // Only process the visible items
        const visibleOptions = allOptions.slice(0, visibleItemCount);
        const processedData = visibleOptions.map((option) => ({
            ...option,
            isSelected: selectedAccountIDs.has(option.accountID),
        }));

        return processedData;
    }, [filteredOptions, accountID, selectedAccountIDs, visibleItemCount]);

    const {sections, headerMessage} = useMemo(() => {
        const newSections: Section[] = [
            {
                title: '',
                data: listData,
                shouldShow: !isEmpty(listData),
            },
        ];

        const noResultsFound = isEmpty(listData);
        const message = noResultsFound ? translate('common.noResultsFound') : undefined;

        const result = {
            sections: newSections,
            headerMessage: message,
        };

        return result;
    }, [listData, translate]);

    // Load more items when scrolling reaches the end
    const onEndReached = useCallback(() => {
        const totalItems = (filteredOptions.personalDetails?.length ?? 0) + (filteredOptions.recentReports?.length ?? 0);
        if (visibleItemCount < totalItems) {
            const newCount = Math.min(visibleItemCount + LOAD_MORE_COUNT, totalItems);
            setVisibleItemCount(newCount);
        }
    }, [filteredOptions, visibleItemCount]);

    const selectUser = useCallback(
        (option: Option) => {
            const isSelected = selectedOptions.some((selected) => optionsMatch(selected, option));

            setSelectedOptions((prev) => (isSelected ? prev.filter((selected) => !optionsMatch(selected, option)) : [...prev, getSelectedOptionData(option)]));
            selectionListRef?.current?.scrollToIndex(0, true);
        },
        [selectedOptions],
    );

    const applyChanges = useCallback(() => {
        const accountIDs = selectedOptions.map((option) => (option.accountID ? option.accountID.toString() : undefined)).filter(Boolean) as string[];
        closeOverlay();
        onChange(accountIDs);
    }, [closeOverlay, onChange, selectedOptions]);

    const resetChanges = useCallback(() => {
        onChange([]);
        closeOverlay();
    }, [closeOverlay, onChange]);

    const isLoadingNewOptions = !!isSearchingForReports;
    const dataLength = sections.flatMap((section) => section.data).length;

    return (
        <View style={[styles.getUserSelectionListPopoverHeight(dataLength || 1, windowHeight, shouldUseNarrowLayout)]}>
            <SelectionList
                ref={selectionListRef}
                canSelectMultiple
                textInputAutoFocus={shouldFocusInputOnScreenFocus}
                headerMessage={headerMessage}
                sections={sections}
                ListItem={UserSelectionListItem}
                containerStyle={[!shouldUseNarrowLayout && styles.pt4]}
                contentContainerStyle={[styles.pb2]}
                textInputLabel={translate('selectionList.searchForSomeone')}
                textInputValue={searchTerm}
                onSelectRow={selectUser}
                onChangeText={setSearchTerm}
                onEndReached={onEndReached}
                isLoadingNewOptions={isLoadingNewOptions}
                initialNumToRender={INITIAL_RENDER_COUNT}
                removeClippedSubviews
            />

            <View style={[styles.flexRow, styles.gap2, styles.mh5, !shouldUseNarrowLayout && styles.mb4]}>
                <Button
                    medium
                    style={[styles.flex1]}
                    text={translate('common.reset')}
                    onPress={resetChanges}
                />
                <Button
                    success
                    medium
                    style={[styles.flex1]}
                    text={translate('common.apply')}
                    onPress={applyChanges}
                />
            </View>
        </View>
    );
}

UserSelectPopup.displayName = 'UserSelectPopup';
export default memo(UserSelectPopup);
