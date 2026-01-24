import isEmpty from 'lodash/isEmpty';
import React, {memo, useCallback, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import SelectionList from '@components/SelectionList';
import UserSelectionListItem from '@components/SelectionList/ListItem/UserSelectionListItem';
import type {ListItem, SelectionListHandle} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import memoize from '@libs/memoize';
import type {Option} from '@libs/OptionsListUtils';
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
    const {options} = useOptionsList();
    const personalDetails = usePersonalDetails();
    const {windowHeight} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: true});
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const [draftComments] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, {canBeMissing: true});
    const [nvpDismissedProductTraining] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {canBeMissing: true});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
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

    const cleanSearchTerm = searchTerm.trim().toLowerCase();

    const selectedAccountIDs = useMemo(() => {
        return new Set(selectedOptions.map((option) => option.accountID).filter(Boolean));
    }, [selectedOptions]);

    const initialSelectedAccountIDs = useMemo(() => {
        return new Set(initialSelectedOptions.map((option) => option.accountID).filter(Boolean));
    }, [initialSelectedOptions]);

    const optionsList = useMemo(() => {
        return memoizedGetValidOptions(
            {
                reports: options.reports,
                personalDetails: options.personalDetails,
            },
            allPolicies,
            draftComments,
            nvpDismissedProductTraining,
            loginList,
            {
                excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
                includeCurrentUser: true,
                personalDetails,
            },
            countryCode,
        );
    }, [options.reports, options.personalDetails, allPolicies, draftComments, nvpDismissedProductTraining, loginList, countryCode, personalDetails]);

    const filteredOptions = useMemo(() => {
        return filterAndOrderOptions(optionsList, cleanSearchTerm, countryCode, loginList, {
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
            canInviteUser: false,
        });
    }, [optionsList, cleanSearchTerm, countryCode, loginList]);

    const listData = useMemo(() => {
        const initialOptions: Array<Option & {keyForList: string}> = [];
        const remainingOptions: Array<Option & {keyForList: string}> = [];

        const personalDetailOptions = filteredOptions.personalDetails.map((participant) => ({
            ...participant,
            isSelected: selectedAccountIDs.has(participant.accountID),
            keyForList: String(participant.accountID),
        }));

        const recentReportOptions = filteredOptions.recentReports.map((report) => ({
            ...report,
            isSelected: selectedAccountIDs.has(report.accountID),
            keyForList: String(report.reportID),
        }));

        const totalOptions = personalDetailOptions.length + recentReportOptions.length;
        const reordered = [...personalDetailOptions, ...recentReportOptions];

        if (totalOptions <= CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD) {
            return reordered;
        }

        for (const option of reordered) {
            if (option.accountID && initialSelectedAccountIDs.has(option.accountID)) {
                initialOptions.push(option);
            } else {
                remainingOptions.push(option);
            }
        }

        return [...initialOptions, ...remainingOptions];
    }, [filteredOptions, initialSelectedAccountIDs, selectedAccountIDs]);

    const headerMessage = useMemo(() => {
        const noResultsFound = isEmpty(listData);
        return noResultsFound ? translate('common.noResultsFound') : undefined;
    }, [listData, translate]);

    const selectUser = useCallback(
        (option: Option) => {
            const isSelected = selectedOptions.some((selected) => optionsMatch(selected, option));

            setSelectedOptions((prev) => (isSelected ? prev.filter((selected) => !optionsMatch(selected, option)) : [...prev, getSelectedOptionData(option)]));
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
    const totalOptionsCount = optionsList.personalDetails.length + optionsList.recentReports.length;
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
