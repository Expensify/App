import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import {usePersonalDetails} from '@components/OnyxProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/UserListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {Section} from '@libs/OptionsListUtils';
import {filterAndOrderOptions, formatSectionsFromSearchTerm, getValidOptions} from '@libs/OptionsListUtils';
import {getDisplayNameForParticipant} from '@libs/ReportUtils';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';

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
    const [selectedItems, setSelectedItems] = useState(value);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const cleanSearchTerm = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);

    const {options} = useOptionsList();

    const defaultOptions = useMemo(() => {
        return getValidOptions({
            reports: options.reports,
            personalDetails: options.personalDetails,
        });
    }, [options.personalDetails, options.reports]);

    const chatOptions = useMemo(() => {
        return filterAndOrderOptions(defaultOptions, cleanSearchTerm, {
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        });
    }, [cleanSearchTerm, defaultOptions]);

    const {sections, headerMessage} = useMemo(() => {
        const newSections: Section[] = [];

        const formattedResults = formatSectionsFromSearchTerm(
            cleanSearchTerm,
            [], // JACK_TODO: MAke this selectedItems
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

        const noResultsFound = chatOptions.personalDetails.length === 0 && chatOptions.recentReports.length === 0 && !chatOptions.currentUserOption;
        const message = noResultsFound ? translate('common.noResultsFound') : undefined;

        return {
            sections: newSections,
            headerMessage: message,
        };
    }, [chatOptions, cleanSearchTerm, personalDetails, translate]);

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
                />
                <Button
                    success
                    medium
                    style={[styles.flex1]}
                    text={translate('common.apply')}
                />
            </View>
        ),
        [styles, translate],
    );

    return (
        <SelectionList
            canSelectMultiple
            headerMessage={headerMessage}
            sections={sections}
            containerStyle={[styles.pt4, styles.mh65vh]}
            ListItem={UserListItem}
            showScrollIndicator={false}
            textInputLabel={translate('selectionList.searchForSomeone')}
            textInputValue={searchTerm}
            footerContent={<FooterContent />}
            onChangeText={(term) => {
                setSearchTerm(term);
            }}
            onSelectRow={() => {}}
        />
    );
}

UserSelectPopup.displayName = 'UserSelectPopup';
export default UserSelectPopup;
