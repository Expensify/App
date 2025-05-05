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
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const personalDetails = usePersonalDetails();

    const initialSelectedData: OptionData[] = useMemo(() => {
        const options = value
            .map((accountID) => {
                const participant = personalDetails?.[accountID];

                if (!participant) {
                    return;
                }

                return getSelectedOptionData(participant);
            })
            .filter((option): option is OptionData => !!option);

        return options;
    }, []);

    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [selectedItems, setSelectedItems] = useState<OptionData[]>(initialSelectedData);
    const cleanSearchTerm = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);

    const {options} = useOptionsList();

    // A list of all reports and personal details the user has access to
    const defaultOptions = useMemo(() => {
        return getValidOptions(
            {
                reports: options.reports,
                personalDetails: options.personalDetails,
            },
            {
                selectedOptions: selectedItems,
                excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            },
        );
    }, [options.personalDetails, options.reports, selectedItems]);

    // Takes the list of all options & filters them based on the search term
    const filteredOptions = useMemo(() => {
        return filterAndOrderOptions(defaultOptions, cleanSearchTerm, {
            selectedOptions: selectedItems,
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        });
    }, [cleanSearchTerm, defaultOptions, selectedItems]);

    const {sections, headerMessage} = useMemo(() => {
        const newSections: Section[] = [];

        const formattedResults = formatSectionsFromSearchTerm(cleanSearchTerm, selectedItems, filteredOptions.recentReports, filteredOptions.personalDetails, personalDetails, true);

        const selectedCurrentUser = formattedResults.section.data.find((option) => option.accountID === filteredOptions.currentUserOption?.accountID);

        if (filteredOptions.currentUserOption) {
            const formattedName = getDisplayNameForParticipant({
                accountID: filteredOptions.currentUserOption.accountID,
                shouldAddCurrentUserPostfix: true,
                personalDetailsData: personalDetails,
            });
            if (selectedCurrentUser) {
                selectedCurrentUser.text = formattedName;
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
    }, [cleanSearchTerm, selectedItems, filteredOptions, personalDetails, translate]);

    const selectUser = useCallback(
        (option: Option) => {
            const optionIndex = selectedItems.findIndex((selectedOption: Option) => {
                const matchesAccountID = selectedOption.accountID && selectedOption.accountID === option?.accountID;
                const matchesReportID = selectedOption.reportID && selectedOption.reportID === option?.reportID;

                // Below is just a boolean expression.
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                return matchesAccountID || matchesReportID;
            });

            if (optionIndex === -1) {
                setSelectedItems([...selectedItems, getSelectedOptionData(option)]);
            } else {
                const newSelectedOptions = [...selectedItems.slice(0, optionIndex), ...selectedItems.slice(optionIndex + 1)];
                setSelectedItems(newSelectedOptions);
            }
        },
        [selectedItems],
    );

    const applyChanges = useCallback(() => {
        const accountIDs = selectedItems.map((option) => (option.accountID ? option.accountID.toString() : undefined)).filter(Boolean) as string[];
        onChange(accountIDs);
        closeOverlay();
    }, [closeOverlay, onChange, selectedItems]);

    const resetChanges = () => {
        setSelectedItems([]);
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
            onChangeText={(term) => {
                setSearchTerm(term);
            }}
            onSelectRow={selectUser}
        />
    );
}

UserSelectPopup.displayName = 'UserSelectPopup';
export default UserSelectPopup;
