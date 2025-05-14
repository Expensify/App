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
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type {Option, Section} from '@libs/OptionsListUtils';
import {filterAndOrderOptions, getValidOptions} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import {searchInServer} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function getSelectedOptionData(option: Option) {
    return {...option, selected: true};
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
    const {windowHeight} = useWindowDimensions();
    const personalDetails = usePersonalDetails();

    // Since accountIDs are passed as value, we need to "populate" them into OptionData
    const initialSelectedData: OptionData[] = useMemo(() => {
        const initialOptions = value
            .map((accountID) => {
                const participant = personalDetails?.[accountID];

                if (!participant) {
                    return;
                }

                return getSelectedOptionData(participant);
            })
            .filter(Boolean) as OptionData[];

        return initialOptions;

        // The initial value of a useState only gets calculated once, so we dont need to keep calculating this initial state
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [selectedOptions, setSelectedOptions] = useState<Option[]>(initialSelectedData);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});

    const cleanSearchTerm = searchTerm.trim().toLowerCase();

    // Get a list of all options/personal details and filter them by the current search term
    const listData = useMemo(() => {
        const optionsList = getValidOptions(
            {
                reports: options.reports,
                personalDetails: options.personalDetails,
            },
            {excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT},
        );

        const filteredOptionsList = filterAndOrderOptions(optionsList, cleanSearchTerm, {
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        });

        const personalDetailList = filteredOptionsList.personalDetails.map((participant) => ({
            ...participant,
            isSelected: selectedOptions.some((selectedOption) => selectedOption.accountID === participant.accountID),
        }));

        const recentReportList = filteredOptionsList.recentReports.map((report) => ({
            ...report,
            isSelected: selectedOptions.some((selectedOption) => selectedOption.accountID === report.accountID),
        }));

        const currentUserOption = filteredOptionsList.currentUserOption
            ? {
                  ...filteredOptionsList.currentUserOption,
                  isSelected: selectedOptions.some((selectedOption) => selectedOption.accountID === filteredOptionsList.currentUserOption?.accountID),
              }
            : null;

        return {personalDetails: personalDetailList, recentReports: recentReportList, currentUserOption};
    }, [cleanSearchTerm, options.personalDetails, options.reports, selectedOptions]);

    const {sections, headerMessage} = useMemo(() => {
        const newSections: Section[] = [
            ...(listData.currentUserOption ? [{title: '', data: [listData.currentUserOption], shouldShow: true}] : []),
            {
                title: '',
                data: listData.recentReports,
                shouldShow: listData.recentReports.length > 0,
            },
            {
                title: '',
                data: listData.personalDetails,
                shouldShow: listData.personalDetails.length > 0,
            },
        ];

        const noResultsFound = listData.personalDetails.length === 0 && listData.recentReports.length === 0 && !listData.currentUserOption;
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
        onChange(accountIDs);
        closeOverlay();
    }, [closeOverlay, onChange, selectedOptions]);

    const resetChanges = () => {
        setSelectedOptions([]);
    };

    useEffect(() => {
        searchInServer(debouncedSearchTerm.trim());
    }, [debouncedSearchTerm]);

    const isLoadingNewOptions = !!isSearchingForReports;
    const dataLength = sections.flatMap((section) => section.data).length;

    const FooterContent = useCallback(
        () => (
            <View style={[styles.flexRow, styles.gap2]}>
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
        ),
        [applyChanges, styles, translate],
    );

    return (
        <View style={[styles.getUserSelectionListPopoverHeight(dataLength || 1, windowHeight)]}>
            <SelectionList
                canSelectMultiple
                shouldClearInputOnSelect={false}
                headerMessage={headerMessage}
                sections={sections}
                ListItem={UserSelectionListItem}
                showScrollIndicator={false}
                containerStyle={[styles.pt4]}
                textInputLabel={translate('selectionList.searchForSomeone')}
                textInputValue={searchTerm}
                footerContent={<FooterContent />}
                onSelectRow={selectUser}
                onChangeText={setSearchTerm}
                isLoadingNewOptions={isLoadingNewOptions}
            />
        </View>
    );
}

UserSelectPopup.displayName = 'UserSelectPopup';
export default memo(UserSelectPopup);
