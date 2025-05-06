import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import {usePersonalDetails} from '@components/OnyxProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import SelectionList from '@components/SelectionList';
import UserSelectionListItem from '@components/SelectionList/Search/UserSelectionListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {Option, Section} from '@libs/OptionsListUtils';
import {filterAndOrderOptions, formatSectionsFromSearchTerm, getValidOptions} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import {getDisplayNameForParticipant} from '@libs/ReportUtils';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';

function getSelectedOptionData(option: Option): OptionData {
    return {...option, selected: true, reportID: option.reportID ?? '-1'};
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
    const [selectedOptions, setSelectedOptions] = useState<OptionData[]>(initialSelectedData);
    const cleanSearchTerm = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);

    // A list of all reports and personal details the user has access to
    const validOptions = useMemo(() => {
        return getValidOptions(
            {
                reports: options.reports,
                personalDetails: options.personalDetails,
            },
            {
                selectedOptions,
                excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            },
        );
    }, [options.personalDetails, options.reports, selectedOptions]);

    // Takes the list of all options & filters them based on the search term
    const filteredOptions = useMemo(() => {
        return filterAndOrderOptions(validOptions, cleanSearchTerm, {
            selectedOptions,
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        });
    }, [cleanSearchTerm, validOptions, selectedOptions]);

    const {sections, headerMessage} = useMemo(() => {
        const newSections: Section[] = [];

        const formattedResults = formatSectionsFromSearchTerm(cleanSearchTerm, selectedOptions, filteredOptions.recentReports, filteredOptions.personalDetails, personalDetails, true);
        const currentUserSelected = formattedResults.section.data.find((option) => option.accountID === filteredOptions.currentUserOption?.accountID);

        if (filteredOptions.currentUserOption) {
            const formattedName = getDisplayNameForParticipant({
                accountID: filteredOptions.currentUserOption.accountID,
                shouldAddCurrentUserPostfix: true,
                personalDetailsData: personalDetails,
            });
            if (currentUserSelected) {
                currentUserSelected.text = formattedName;
            } else {
                filteredOptions.currentUserOption.text = formattedName;
                filteredOptions.recentReports = [filteredOptions.currentUserOption, ...filteredOptions.recentReports];
            }
        }

        newSections.push(formattedResults.section);

        newSections.push({
            title: '',
            data: filteredOptions.recentReports,
            shouldShow: filteredOptions.recentReports.length > 0,
        });

        newSections.push({
            title: '',
            data: filteredOptions.personalDetails,
            shouldShow: filteredOptions.personalDetails.length > 0,
        });

        const noResultsFound = filteredOptions.personalDetails.length === 0 && filteredOptions.recentReports.length === 0 && !filteredOptions.currentUserOption;
        const message = noResultsFound ? translate('common.noResultsFound') : undefined;

        return {
            sections: newSections,
            headerMessage: message,
        };
    }, [cleanSearchTerm, selectedOptions, filteredOptions, personalDetails, translate]);

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
        Report.searchInServer(debouncedSearchTerm.trim());
    }, [debouncedSearchTerm]);

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
        <SelectionList
            canSelectMultiple
            headerMessage={headerMessage}
            sections={sections}
            containerStyle={[styles.pt4, styles.mh65vh]}
            ListItem={UserSelectionListItem}
            showScrollIndicator={false}
            textInputLabel={translate('selectionList.searchForSomeone')}
            textInputValue={searchTerm}
            footerContent={<FooterContent />}
            onSelectRow={selectUser}
            onChangeText={setSearchTerm}
        />
    );
}

UserSelectPopup.displayName = 'UserSelectPopup';
export default UserSelectPopup;
