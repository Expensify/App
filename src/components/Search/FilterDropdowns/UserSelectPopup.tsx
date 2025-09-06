import isEmpty from 'lodash/isEmpty';
import React, {memo, useCallback, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {usePersonalDetailsOptionsList} from '@components/PersonalDetailsOptionListContextProvider';
import SelectionList from '@components/SelectionList';
import UserSelectionListItem from '@components/SelectionList/Search/UserSelectionListItem';
import type {SelectionListHandle} from '@components/SelectionList/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import memoize from '@libs/memoize';
import {filterOption, getValidOptions} from '@libs/PersonalDetailsOptionsListUtils';
import type {OptionData} from '@libs/PersonalDetailsOptionsListUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type SectionBase = {
    title: string | undefined;
    shouldShow: boolean;
};

type Section = SectionBase & {
    data: OptionData[];
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
    const selectionListRef = useRef<SelectionListHandle | null>(null);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {options, currentOption} = usePersonalDetailsOptionsList();
    const personalDetails = usePersonalDetails();
    const {login} = useCurrentUserPersonalDetails();
    const {windowHeight} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();
    const [countryCode] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const getInitialSelectedIDs = useCallback(() => {
        return value.reduce<Set<string>>((acc, id) => {
            const participant = personalDetails?.[id];
            if (!participant) {
                return acc;
            }
            acc.add(id);
            return acc;
        }, new Set<string>());
    }, [value, personalDetails]);

    const [selectedAccountIDs, setSelectedAccountIDs] = useState<Set<string>>(() => getInitialSelectedIDs());

    const cleanSearchTerm = searchTerm.trim().toLowerCase();

    const transformedOptions = useMemo(
        () =>
            options.map((option) => ({
                ...option,
                isSelected: selectedAccountIDs.has(option.accountID.toString()),
            })),
        [options, selectedAccountIDs],
    );

    // Filter options based on search term

    const optionsList = useMemo(() => {
        return memoizedGetValidOptions(transformedOptions, login ?? '', {
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            includeCurrentUser: false,
            includeRecentReports: false,
            searchString: cleanSearchTerm,
        });
    }, [transformedOptions, login, cleanSearchTerm]);

    const filteredCurrentUserOption = useMemo(() => {
        const newOption = filterOption(currentOption, cleanSearchTerm);
        if (newOption) {
            return {
                ...newOption,
                isSelected: selectedAccountIDs.has(newOption.accountID.toString()),
            };
        }
        return newOption;
    }, [currentOption, cleanSearchTerm, selectedAccountIDs]);

    const listData = useMemo(() => {
        if (!filteredCurrentUserOption) {
            return [...optionsList.selectedOptions, ...optionsList.personalDetails];
        }
        const isCurrentOptionSelected = filteredCurrentUserOption.isSelected;
        if (isCurrentOptionSelected) {
            return [filteredCurrentUserOption, ...optionsList.selectedOptions, ...optionsList.personalDetails];
        }
        return [...optionsList.selectedOptions, filteredCurrentUserOption, ...optionsList.personalDetails];
    }, [filteredCurrentUserOption, optionsList.selectedOptions, optionsList.personalDetails]);

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
        (option: OptionData) => {
            const isSelected = selectedAccountIDs.has(option.accountID.toString());

            setSelectedAccountIDs((prev) => (isSelected ? new Set([...prev].filter((id) => id !== option.accountID.toString())) : new Set([...prev, option.accountID.toString()])));
            selectionListRef?.current?.scrollToIndex(0, true);
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
