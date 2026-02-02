import isEmpty from 'lodash/isEmpty';
import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import SelectionList from '@components/SelectionList';
import UserSelectionListItem from '@components/SelectionList/ListItem/UserSelectionListItem';
import type {ListItem, SelectionListHandle} from '@components/SelectionList/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchSelector from '@hooks/useSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import {getParticipantsOption} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type UserSelectPopupProps = {
    /** The currently selected users */
    value: string[];

    /** Function to call to close the overlay when changes are applied */
    closeOverlay: () => void;

    /** Function to call when changes are applied */
    onChange: (value: string[]) => void;

    /**
     * Whether the search input should be displayed.
     * When undefined, defaults to showing search when user count >= CONST.STANDARD_LIST_ITEM_LIMIT (12 users).
     * Set to true to always show search, or false to never show search regardless of user count.
     */
    isSearchable?: boolean;
};

function UserSelectPopup({value, closeOverlay, onChange, isSearchable}: UserSelectPopupProps) {
    const selectionListRef = useRef<SelectionListHandle<ListItem> | null>(null);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const personalDetails = usePersonalDetails();
    const {windowHeight} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserPersonalDetails.accountID;
    const shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const initialSelectedOptions = useMemo(() => {
        return value.reduce<OptionData[]>((acc, id) => {
            const participant = personalDetails?.[id];
            if (!participant) {
                return acc;
            }

            const optionData = {
                ...getParticipantsOption(participant, personalDetails),
                isSelected: true,
            };

            if (optionData) {
                acc.push(optionData as OptionData);
            }

            return acc;
        }, []);
    }, [value, personalDetails]);

    const {searchTerm, debouncedSearchTerm, setSearchTerm, availableOptions, selectedOptions, toggleSelection, areOptionsInitialized, selectedOptionsForDisplay, onListEndReached} =
        useSearchSelector({
            selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
            searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
            initialSelected: initialSelectedOptions,
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
            includeUserToInvite: false,
            includeCurrentUser: true,
        });

    const listData = useMemo(() => {
        const personalDetailsList = availableOptions.personalDetails.map((participant) => ({
            ...participant,
            keyForList: String(participant.accountID),
        }));
        const recentReports = availableOptions.recentReports.map((report) => ({
            ...report,
            keyForList: String(report.reportID),
        }));
        const combinedOptions = [...selectedOptionsForDisplay, ...personalDetailsList, ...recentReports];

        combinedOptions.sort((a, b) => {
            // selected items first
            if (a.isSelected && !b.isSelected) {
                return -1;
            }
            if (!a.isSelected && b.isSelected) {
                return 1;
            }

            // Put the current user at the top of the list
            if (a.accountID === currentUserAccountID) {
                return -1;
            }
            if (b.accountID === currentUserAccountID) {
                return 1;
            }
            return 0;
        });

        const combinedOptionsWithKeyForList = combinedOptions.map((option) => ({
            ...option,
            keyForList: option.keyForList ?? option.login ?? '',
        }));
        return combinedOptionsWithKeyForList;
    }, [availableOptions.personalDetails, availableOptions.recentReports, selectedOptionsForDisplay, currentUserAccountID]);

    const headerMessage = useMemo(() => {
        const noResultsFound = isEmpty(listData);
        return noResultsFound ? translate('common.noResultsFound') : undefined;
    }, [listData, translate]);

    const selectUser = useCallback(
        (option: OptionData) => {
            toggleSelection(option);
            selectionListRef?.current?.scrollToIndex(0);
        },
        [toggleSelection],
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
    const [totalOptionsCount, setTotalOptionsCount] = useState(() => selectedOptionsForDisplay.length + availableOptions.personalDetails.length + availableOptions.recentReports.length);

    useEffect(() => {
        if (debouncedSearchTerm.length !== 0) {
            return;
        }
        setTotalOptionsCount(selectedOptionsForDisplay.length + availableOptions.personalDetails.length + availableOptions.recentReports.length);
    }, [debouncedSearchTerm.length, selectedOptionsForDisplay.length, availableOptions.personalDetails.length, availableOptions.recentReports.length]);

    const shouldShowSearchInput = isSearchable ?? totalOptionsCount >= CONST.STANDARD_LIST_ITEM_LIMIT;

    const textInputOptions = useMemo(
        () =>
            shouldShowSearchInput
                ? {
                      value: searchTerm,
                      label: translate('selectionList.searchForSomeone'),
                      onChangeText: setSearchTerm,
                      headerMessage,
                      disableAutoFocus: !shouldFocusInputOnScreenFocus,
                  }
                : undefined,
        [shouldShowSearchInput, searchTerm, translate, setSearchTerm, headerMessage, shouldFocusInputOnScreenFocus],
    );

    return (
        <View style={[styles.getUserSelectionListPopoverHeight(listData.length || 1, windowHeight, shouldUseNarrowLayout, shouldShowSearchInput)]}>
            <SelectionList
                data={listData}
                ref={selectionListRef}
                textInputOptions={textInputOptions}
                canSelectMultiple
                ListItem={UserSelectionListItem}
                style={{containerStyle: [!shouldUseNarrowLayout && styles.pt4], listStyle: styles.pb2}}
                onSelectRow={selectUser}
                isLoadingNewOptions={isLoadingNewOptions}
                showLoadingPlaceholder={!areOptionsInitialized}
                onEndReached={onListEndReached}
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

export default memo(UserSelectPopup);
