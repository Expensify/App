import isEmpty from 'lodash/isEmpty';
import React, {memo, useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import SelectionList from '@components/SelectionList';
import UserSelectionListItem from '@components/SelectionList/Search/UserSelectionListItem';
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

type UserSelectPopupProps = {
    /** The currently selected users */
    value: string[];

    /** Function to call to close the overlay when changes are applied */
    closeOverlay: () => void;

    /** Function to call when changes are applied */
    onChange: (value: string[]) => void;
};

function UserSelectPopup({value, closeOverlay, onChange}: UserSelectPopupProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {options} = useOptionsList();
    const personalDetails = usePersonalDetails();
    const {windowHeight} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true, selector: (onyxSession) => onyxSession?.accountID});
    const shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();

    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
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

    const optionsList = useMemo(() => {
        return memoizedGetValidOptions(
            {
                reports: options.reports,
                personalDetails: options.personalDetails,
            },
            {
                excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            },
        );
    }, [options.reports, options.personalDetails]);

    const filteredOptions = useMemo(() => {
        return filterAndOrderOptions(optionsList, cleanSearchTerm, {
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
            canInviteUser: false,
        });
    }, [optionsList, cleanSearchTerm]);

    const listData = useMemo(() => {
        const personalDetailList = filteredOptions.personalDetails
            .map((participant) => ({
                ...participant,
                isSelected: selectedAccountIDs.has(participant.accountID),
            }))
            .sort((a, b) => {
                // Put the current user at the top of the list
                if (a.accountID === accountID) {
                    return -1;
                }
                if (b.accountID === accountID) {
                    return 1;
                }
                return 0;
            });

        const recentReportsList = filteredOptions.recentReports.map((report) => {
            const isSelected = selectedOptions.some((selectedOption) => selectedOption.reportID === report.reportID);
            return {
                ...report,
                isSelected,
            };
        });

        const currentUserOption = filteredOptions.currentUserOption;
        const userOptions = currentUserOption
            ? [
                  {
                      ...currentUserOption,
                      isSelected: selectedOptions.some((selectedOption) => selectedOption.accountID === currentUserOption?.accountID),
                  },
              ]
            : [];

        return [...userOptions, ...personalDetailList, ...recentReportsList];
    }, [filteredOptions, selectedOptions, accountID, selectedAccountIDs]);

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

        return {
            sections: newSections,
            headerMessage: message,
        };
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
    const dataLength = sections.flatMap((section) => section.data).length;

    return (
        <View style={[styles.getUserSelectionListPopoverHeight(dataLength || 1, windowHeight, shouldUseNarrowLayout)]}>
            <SelectionList
                canSelectMultiple
                textInputAutoFocus={shouldFocusInputOnScreenFocus}
                shouldClearInputOnSelect={false}
                headerMessage={headerMessage}
                sections={sections}
                ListItem={UserSelectionListItem}
                containerStyle={[!shouldUseNarrowLayout && styles.pt4]}
                contentContainerStyle={[styles.pb2]}
                textInputLabel={translate('selectionList.searchForSomeone')}
                textInputValue={searchTerm}
                onSelectRow={selectUser}
                onChangeText={setSearchTerm}
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

UserSelectPopup.displayName = 'UserSelectPopup';
export default memo(UserSelectPopup);
