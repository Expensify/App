import isEmpty from 'lodash/isEmpty';
import React, {memo, useCallback, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import SelectionList from '@components/SelectionList';
import UserSelectionListItem from '@components/SelectionList/ListItem/UserSelectionListItem';
import type {ListItem, SelectionListHandle} from '@components/SelectionList/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalDetailOptions from '@hooks/usePersonalDetailOptions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import memoize from '@libs/memoize';
import {filterOption, getValidOptions} from '@libs/PersonalDetailOptionsListUtils';
import type {OptionData} from '@libs/PersonalDetailOptionsListUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const memoizedGetValidOptions = memoize(getValidOptions, {maxSize: 5, monitoringName: 'UserSelectPopup.getValidOptions'});

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
    const {translate, formatPhoneNumber} = useLocalize();
    const {options, currentOption} = usePersonalDetailOptions();
    const personalDetails = usePersonalDetails();
    const {windowHeight} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserEmail = currentUserPersonalDetails.email ?? '';
    const shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});

    const getInitialSelectedIDs = useCallback(() => {
        return value.reduce<Set<string>>((acc, id) => {
            const participant = personalDetails?.[id];
            if (!participant) {
                return acc;
            }
            acc.add(id);
            return acc;
        }, new Set<string>());
    }, [value, personalDetails]);

    const [selectedAccountIDs, setSelectedAccountIDs] = useState<Set<string>>(() => getInitialSelectedIDs());

    const cleanSearchTerm = searchTerm.trim().toLowerCase();

    const transformedOptions = useMemo(
        () =>
            options?.map((option) => ({
                ...option,
                isSelected: selectedAccountIDs.has(option.accountID.toString()),
            })) ?? [],
        [options, selectedAccountIDs],
    );

    const optionsList = useMemo(() => {
        return memoizedGetValidOptions(transformedOptions, currentUserEmail, formatPhoneNumber, countryCode, loginList, {
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            includeCurrentUser: false,
            includeRecentReports: false,
            searchString: cleanSearchTerm,
        });
    }, [transformedOptions, currentUserEmail, cleanSearchTerm, formatPhoneNumber, countryCode, loginList]);

    const filteredCurrentUserOption = useMemo(() => {
        const newOption = filterOption(currentOption, cleanSearchTerm);
        if (newOption) {
            return {
                ...newOption,
                isSelected: selectedAccountIDs.has(newOption.accountID.toString()),
            };
        }
        return newOption;
    }, [currentOption, cleanSearchTerm, selectedAccountIDs]);

    const listData = useMemo(() => {
        if (!filteredCurrentUserOption) {
            return [...optionsList.selectedOptions, ...optionsList.personalDetails];
        }
        const isCurrentOptionSelected = filteredCurrentUserOption.isSelected;
        if (isCurrentOptionSelected) {
            return [filteredCurrentUserOption, ...optionsList.selectedOptions, ...optionsList.personalDetails];
        }
        return [...optionsList.selectedOptions, filteredCurrentUserOption, ...optionsList.personalDetails];
    }, [filteredCurrentUserOption, optionsList.selectedOptions, optionsList.personalDetails]);

    const headerMessage = useMemo(() => {
        const noResultsFound = isEmpty(listData);
        return noResultsFound ? translate('common.noResultsFound') : undefined;
    }, [listData, translate]);

    const selectUser = useCallback(
        (option: OptionData) => {
            const isSelected = selectedAccountIDs.has(option.accountID.toString());

            setSelectedAccountIDs((prev) => (isSelected ? new Set([...prev].filter((id) => id !== option.accountID.toString())) : new Set([...prev, option.accountID.toString()])));
            selectionListRef?.current?.scrollToIndex(0);
        },
        [selectedAccountIDs],
    );

    const applyChanges = useCallback(() => {
        const accountIDs = Array.from(selectedAccountIDs);
        closeOverlay();
        onChange(accountIDs);
    }, [closeOverlay, onChange, selectedAccountIDs]);

    const resetChanges = useCallback(() => {
        onChange([]);
        closeOverlay();
    }, [closeOverlay, onChange]);

    const isLoadingNewOptions = !!isSearchingForReports;
    const shouldShowSearchInput = isSearchable ?? transformedOptions.length >= CONST.STANDARD_LIST_ITEM_LIMIT;

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
        [searchTerm, translate, headerMessage, shouldFocusInputOnScreenFocus, shouldShowSearchInput],
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
            />

            <View style={[styles.flexRow, styles.gap2, styles.mh5, !shouldUseNarrowLayout && styles.mb4]}>
                <Button
                    medium
                    style={[styles.flex1]}
                    text={translate('common.reset')}
                    onPress={resetChanges}
                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_RESET_USER}
                />
                <Button
                    success
                    medium
                    style={[styles.flex1]}
                    text={translate('common.apply')}
                    onPress={applyChanges}
                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_APPLY_USER}
                />
            </View>
        </View>
    );
}

export default memo(UserSelectPopup);
