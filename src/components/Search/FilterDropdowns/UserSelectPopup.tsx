import isEmpty from 'lodash/isEmpty';
import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import SelectionList from '@components/SelectionList';
import UserSelectionListItem from '@components/SelectionList/ListItem/UserSelectionListItem';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useInitialSelectionRef from '@hooks/useInitialSelectionRef';
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
import {reorderItemsByInitialSelection} from '@libs/SelectionListOrderUtils';
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

    /** Whether the popup content is currently visible */
    isVisible?: boolean;
};

function UserSelectPopup({value, closeOverlay, onChange, isSearchable, isVisible = false}: UserSelectPopupProps) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const {options, currentOption, isLoading} = usePersonalDetailOptions();
    const {windowHeight} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserEmail = currentUserPersonalDetails.email ?? '';
    const shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});
    const hasBeenVisibleRef = useRef(false);
    const availableAccountIDs = new Set(options?.map((option) => option.accountID.toString()) ?? []);
    if (currentOption?.accountID) {
        availableAccountIDs.add(currentOption.accountID.toString());
    }
    const incomingSelectedAccountIDs = value.filter((accountID) => availableAccountIDs.has(accountID));

    const [selectedAccountIDs, setSelectedAccountIDs] = useState<Set<string>>(() => new Set(incomingSelectedAccountIDs));
    const initialSelectedAccountIDs = useInitialSelectionRef(incomingSelectedAccountIDs, {resetDeps: [isVisible, isLoading]});

    useEffect(() => {
        if (!isVisible) {
            hasBeenVisibleRef.current = false;
            return;
        }

        if (isLoading) {
            return;
        }

        if (hasBeenVisibleRef.current) {
            return;
        }

        hasBeenVisibleRef.current = true;
        setSelectedAccountIDs(new Set(incomingSelectedAccountIDs));
        setSearchTerm('');
    }, [incomingSelectedAccountIDs, isLoading, isVisible]);

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
            includeSelectedOptions: true,
            searchString: cleanSearchTerm,
        });
    }, [transformedOptions, currentUserEmail, cleanSearchTerm, formatPhoneNumber, countryCode, loginList]);

    const currentUserSearchTerms = useMemo(() => [translate('common.you'), translate('common.me')], [translate]);

    const filteredCurrentUserOption = useMemo(() => {
        const newOption = filterOption(currentOption, cleanSearchTerm, currentUserSearchTerms);
        if (newOption) {
            return {
                ...newOption,
                isSelected: selectedAccountIDs.has(newOption.accountID.toString()),
            };
        }
        return newOption;
    }, [currentOption, cleanSearchTerm, selectedAccountIDs, currentUserSearchTerms]);

    const baseVisibleOptions = useMemo(() => {
        if (!filteredCurrentUserOption) {
            return optionsList.personalDetails;
        }

        return [filteredCurrentUserOption, ...optionsList.personalDetails];
    }, [filteredCurrentUserOption, optionsList.personalDetails]);

    const listData = useMemo(() => {
        if (cleanSearchTerm) {
            return baseVisibleOptions;
        }

        return reorderItemsByInitialSelection(baseVisibleOptions, initialSelectedAccountIDs, baseVisibleOptions.length);
    }, [baseVisibleOptions, cleanSearchTerm, initialSelectedAccountIDs]);

    const headerMessage = useMemo(() => {
        const noResultsFound = isEmpty(listData);
        return noResultsFound ? translate('common.noResultsFound') : undefined;
    }, [listData, translate]);

    const selectUser = useCallback(
        (option: OptionData) => {
            const isSelected = selectedAccountIDs.has(option.accountID.toString());

            setSelectedAccountIDs((prev) => (isSelected ? new Set([...prev].filter((id) => id !== option.accountID.toString())) : new Set([...prev, option.accountID.toString()])));
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
    const shouldShowLoadingPlaceholder = isLoading;

    const textInputOptions = useMemo(
        () =>
            shouldShowSearchInput
                ? {
                      value: searchTerm,
                      label: translate('common.search'),
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
                textInputOptions={textInputOptions}
                canSelectMultiple
                ListItem={UserSelectionListItem}
                style={{containerStyle: [!shouldUseNarrowLayout && styles.pt4], listStyle: styles.pb2}}
                onSelectRow={selectUser}
                isLoadingNewOptions={isLoadingNewOptions}
                shouldShowLoadingPlaceholder={shouldShowLoadingPlaceholder}
                shouldScrollToTopOnSelect={false}
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
