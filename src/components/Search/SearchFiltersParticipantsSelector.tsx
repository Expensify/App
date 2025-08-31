import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {usePersonalDetailsOptionsList} from '@components/PersonalDetailsOptionListContextProvider';
import SelectionList from '@components/SelectionList';
import UserSelectionListItem from '@components/SelectionList/Search/UserSelectionListItem';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import memoize from '@libs/memoize';
import {filterOption, getValidOptions} from '@libs/PersonalDetailsOptionsListUtils';
import type {OptionData} from '@libs/PersonalDetailsOptionsListUtils';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SearchFilterPageFooterButtons from './SearchFilterPageFooterButtons';

type SectionBase = {
    title: string | undefined;
    shouldShow: boolean;
};

type Section = SectionBase & {
    data: OptionData[];
};

const defaultListOptions = {
    userToInvite: null,
    recentOptions: [],
    personalDetails: [],
    selectedOptions: [],
};

const memoizedGetValidOptions = memoize(getValidOptions, {maxSize: 5, monitoringName: 'SearchFiltersParticipantsSelector.getValidOptions'});

type SearchFiltersParticipantsSelectorProps = {
    initialAccountIDs: string[];
    onFiltersUpdate: (accountIDs: string[]) => void;
};

function SearchFiltersParticipantsSelector({initialAccountIDs, onFiltersUpdate}: SearchFiltersParticipantsSelectorProps) {
    const {translate} = useLocalize();
    const personalDetails = usePersonalDetails();
    const {didScreenTransitionEnd} = useScreenWrapperTransitionStatus();
    const {login} = useCurrentUserPersonalDetails();
    const {options, currentOption, areOptionsInitialized} = usePersonalDetailsOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {canBeMissing: false, initWithStoredValues: false});
    const [selectedAccountIDs, setSelectedAccountIDs] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const cleanSearchTerm = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);

    const transformedOptions = useMemo(
        () =>
            options.map((option) => ({
                ...option,
                isSelected: selectedAccountIDs.has(option.accountID.toString()),
            })),
        [options, selectedAccountIDs],
    );

    const optionsList = useMemo(() => {
        if (!areOptionsInitialized) {
            return defaultListOptions;
        }

        return memoizedGetValidOptions(transformedOptions, login ?? '', {
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            includeRecentReports: false,
            includeCurrentUser: false,
            searchString: cleanSearchTerm,
        });
    }, [areOptionsInitialized, login, cleanSearchTerm, transformedOptions]);

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
                shouldShow: listData.length > 0,
            },
        ];

        const noResultsFound = listData.length === 0;
        const message = noResultsFound ? translate('common.noResultsFound') : undefined;

        return {
            sections: newSections,
            headerMessage: message,
        };
    }, [listData, translate]);

    const resetChanges = useCallback(() => {
        setSelectedAccountIDs(new Set());
    }, []);

    const applyChanges = useCallback(() => {
        const accountIDs = Array.from(selectedAccountIDs);
        onFiltersUpdate(accountIDs);

        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    }, [onFiltersUpdate, selectedAccountIDs]);

    // This effect handles setting initial selectedOptions based on accountIDs saved in onyx form
    useEffect(() => {
        if (!initialAccountIDs || initialAccountIDs.length === 0 || !personalDetails) {
            return;
        }

        const accountIDs = new Set(initialAccountIDs);
        setSelectedAccountIDs(accountIDs);
    }, [initialAccountIDs, personalDetails]);

    const handleParticipantSelection = useCallback(
        (option: OptionData) => {
            const isSelected = selectedAccountIDs.has(option.accountID.toString());

            setSelectedAccountIDs((prev) => (isSelected ? new Set([...prev].filter((id) => id !== option.accountID.toString())) : new Set([...prev, option.accountID.toString()])));
        },
        [selectedAccountIDs],
    );

    const footerContent = useMemo(
        () => (
            <SearchFilterPageFooterButtons
                applyChanges={applyChanges}
                resetChanges={resetChanges}
            />
        ),
        [applyChanges, resetChanges],
    );

    const isLoadingNewOptions = !!isSearchingForReports;
    const showLoadingPlaceholder = !didScreenTransitionEnd || !areOptionsInitialized || !initialAccountIDs || !personalDetails;

    return (
        <SelectionList
            canSelectMultiple
            sections={sections}
            ListItem={UserSelectionListItem}
            textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
            headerMessage={headerMessage}
            textInputValue={searchTerm}
            footerContent={footerContent}
            showScrollIndicator
            shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
            onChangeText={(value) => {
                setSearchTerm(value);
            }}
            onSelectRow={handleParticipantSelection}
            isLoadingNewOptions={isLoadingNewOptions}
            showLoadingPlaceholder={showLoadingPlaceholder}
        />
    );
}

SearchFiltersParticipantsSelector.displayName = 'SearchFiltersParticipantsSelector';

export default SearchFiltersParticipantsSelector;
