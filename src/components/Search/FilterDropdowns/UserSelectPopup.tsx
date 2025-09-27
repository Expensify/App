import {accountIDSelector} from '@selectors/Session';
import isEmpty from 'lodash/isEmpty';
import React, {memo, useCallback, useMemo, useRef} from 'react';
import {View} from 'react-native';
import type {SectionListData} from 'react-native';
import Button from '@components/Button';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import SelectionList from '@components/SelectionListWithSections';
import UserSelectionListItem from '@components/SelectionListWithSections/Search/UserSelectionListItem';
import type {Section, SelectionListHandle} from '@components/SelectionListWithSections/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchSelector from '@hooks/useSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import {getParticipantsOption} from '@libs/OptionsListUtils';
import type {Option} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function getSelectedOptionData(option: Option) {
    return {...option, reportID: `${option.reportID ?? -1}`, selected: true, isSelected: true};
}

type Sections = Array<SectionListData<OptionData, Section<OptionData>>>;

type UserSelectPopupProps = {
    /** The currently selected users */
    value: string[];

    /** Function to call to close the overlay when changes are applied */
    closeOverlay: () => void;

    /** Function to call when changes are applied */
    onChange: (value: string[]) => void;
};

function UserSelectPopup({value, closeOverlay, onChange}: UserSelectPopupProps) {
    const selectionListRef = useRef<SelectionListHandle | null>(null);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const personalDetails = usePersonalDetails();
    const {windowHeight} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true, selector: accountIDSelector});
    const shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const initialSelectedOptions = useMemo(() => {
        return value.reduce<OptionData[]>((acc, id) => {
            const participant = personalDetails?.[id];
            if (!participant) {
                return acc;
            }

            const optionData = getSelectedOptionData(getParticipantsOption(participant, personalDetails));
            if (optionData) {
                acc.push(optionData);
            }

            return acc;
        }, []);
    }, [value, personalDetails]);

    const {searchTerm, setSearchTerm, availableOptions, selectedOptions, toggleSelection, areOptionsInitialized, selectedOptionsForDisplay} = useSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
        searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
        initialSelected: initialSelectedOptions,
        excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
        includeUserToInvite: false,
        includeCurrentUser: true,
    });

    const listData = useMemo(() => {
        const combined = [...selectedOptionsForDisplay, ...availableOptions.personalDetails, ...availableOptions.recentReports];

        combined.sort((a, b) => {
            // selected items first
            if (a.isSelected && !b.isSelected) {
                return -1;
            }
            if (!a.isSelected && b.isSelected) {
                return 1;
            }

            // Put the current user at the top of the list
            if (a.accountID === accountID) {
                return -1;
            }
            if (b.accountID === accountID) {
                return 1;
            }
            return 0;
        });

        return combined;
    }, [availableOptions.personalDetails, availableOptions.recentReports, selectedOptionsForDisplay, accountID]);

    const {sections, headerMessage} = useMemo(() => {
        const newSections: Sections = [
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
        (option: OptionData) => {
            toggleSelection(option);
            selectionListRef?.current?.scrollToIndex(0, true);
        },
        [toggleSelection],
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
                ref={selectionListRef}
                canSelectMultiple
                textInputAutoFocus={shouldFocusInputOnScreenFocus}
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
                showLoadingPlaceholder={!areOptionsInitialized}
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
