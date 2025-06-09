import isEmpty from 'lodash/isEmpty';
import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import {usePersonalDetails} from '@components/OnyxProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import SelectionList from '@components/SelectionList';
import UserSelectionListItem from '@components/SelectionList/Search/UserSelectionListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type {Option, Section} from '@libs/OptionsListUtils';
import {filterAndOrderOptions, getValidOptions} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import {searchInServer} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function getSelectedOptionData(option: Option) {
    return {...option, reportID: `${option.reportID}`, selected: true};
}

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
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});

    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const [selectedOptions, setSelectedOptions] = useState<Option[]>(() => {
        return value.reduce<OptionData[]>((acc, accountID) => {
            const participant = personalDetails?.[accountID];
            if (!participant) {
                return acc;
            }

            const optionData = getSelectedOptionData(participant);
            if (optionData) {
                acc.push(optionData);
            }

            return acc;
        }, []);
    });

    const cleanSearchTerm = searchTerm.trim().toLowerCase();

    // Get a list of all options/personal details and filter them by the current search term
    const listData = useMemo(() => {
        const optionsList = getValidOptions(
            {
                reports: options.reports,
                personalDetails: options.personalDetails,
            },
            {
                selectedOptions,
                excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
                includeSelectedOptions: true,
                includeCurrentUser: true,
            },
        );

        const {personalDetails: filteredOptionsList, recentReports} = filterAndOrderOptions(optionsList, cleanSearchTerm, {
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        });

        const personalDetailList = filteredOptionsList
            .map((participant) => ({
                ...participant,
                isSelected: selectedOptions.some((selectedOption) => selectedOption.accountID === participant.accountID),
            }))
            .sort((a, b) => {
                // Put the current user at the top of the list
                if (a.accountID === session?.accountID) {
                    return -1;
                }
                if (b.accountID === session?.accountID) {
                    return 1;
                }
                return 0;
            });

        return [...(personalDetailList ?? []), ...(recentReports ?? [])];
    }, [cleanSearchTerm, options.personalDetails, options.reports, selectedOptions, session?.accountID]);

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
            const optionIndex = selectedOptions.findIndex((selectedOption: Option) => {
                const matchesAccountID = selectedOption.accountID && selectedOption.accountID === option?.accountID;
                const matchesReportID = selectedOption.reportID && selectedOption.reportID === option?.reportID;

                // Below is just a boolean expression.
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                return matchesAccountID || matchesReportID;
            });

            if (optionIndex === -1) {
                setSelectedOptions([...selectedOptions, getSelectedOptionData(option)]);
            } else {
                const newSelectedOptions = [...selectedOptions.slice(0, optionIndex), ...selectedOptions.slice(optionIndex + 1)];
                setSelectedOptions(newSelectedOptions);
            }
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

    useEffect(() => {
        searchInServer(debouncedSearchTerm.trim());
    }, [debouncedSearchTerm]);

    const isLoadingNewOptions = !!isSearchingForReports;
    const dataLength = sections.flatMap((section) => section.data).length;

    return (
        <View style={[styles.getUserSelectionListPopoverHeight(dataLength || 1, windowHeight, shouldUseNarrowLayout)]}>
            <SelectionList
                canSelectMultiple
                textInputAutoFocus
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
