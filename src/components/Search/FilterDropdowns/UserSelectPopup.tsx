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
import type {Option, Section} from '@libs/OptionsListUtils';
import {filterAndOrderOptions, formatSectionsFromSearchTerm, getValidOptions} from '@libs/OptionsListUtils';
import {getDisplayNameForParticipant} from '@libs/ReportUtils';
import type {OptionData} from '@libs/ReportUtils';
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
    const shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();

    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const [selectedOptions, setSelectedOptions] = useState<Option[]>(() => {
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
    });

    const cleanSearchTerm = searchTerm.trim().toLowerCase();

    const defaultOptions = useMemo(() => {
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

    const chatOptions = useMemo(() => {
        return filterAndOrderOptions(defaultOptions, cleanSearchTerm, {
            selectedOptions,
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
            canInviteUser: false,
        });
    }, [defaultOptions, cleanSearchTerm, selectedOptions]);

    const {sections, headerMessage} = useMemo(() => {
        const newSections: Section[] = [];

        const formattedResults = formatSectionsFromSearchTerm(
            cleanSearchTerm,
            selectedOptions as OptionData[],
            chatOptions.recentReports,
            chatOptions.personalDetails,
            personalDetails,
            true,
        );
        const selectedCurrentUser = formattedResults.section.data.find((option) => option.accountID === chatOptions.currentUserOption?.accountID);

        if (chatOptions.currentUserOption) {
            const formattedName = getDisplayNameForParticipant({
                accountID: chatOptions.currentUserOption.accountID,
                shouldAddCurrentUserPostfix: true,
                personalDetailsData: personalDetails,
            });
            if (selectedCurrentUser) {
                selectedCurrentUser.text = formattedName;
            } else {
                chatOptions.currentUserOption.text = formattedName;
                chatOptions.recentReports = [chatOptions.currentUserOption, ...chatOptions.recentReports];
            }
        }

        newSections.push(formattedResults.section);

        newSections.push({
            title: '',
            data: chatOptions.recentReports,
            shouldShow: chatOptions.recentReports.length > 0,
        });

        newSections.push({
            title: '',
            data: chatOptions.personalDetails,
            shouldShow: chatOptions.personalDetails.length > 0,
        });

        const noResultsFound =
            Object.values(formattedResults.section.data).length === 0 && chatOptions.personalDetails.length === 0 && chatOptions.recentReports.length === 0 && !chatOptions.currentUserOption;
        const message = noResultsFound ? translate('common.noResultsFound') : undefined;

        return {
            sections: newSections,
            headerMessage: message,
        };
    }, [cleanSearchTerm, selectedOptions, chatOptions, personalDetails, translate]);

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
