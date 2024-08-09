import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import {usePersonalDetails} from '@components/OnyxProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/InviteMemberListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import type {Option} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const defaultListOptions = {
    userToInvite: null,
    recentReports: [],
    personalDetails: [],
    currentUserOption: null,
    headerMessage: '',
    categoryOptions: [],
    tagOptions: [],
    taxRatesOptions: [],
};

function getSelectedOptionData(option: Option): OptionData {
    return {...option, selected: true, reportID: option.reportID ?? '-1'};
}

type SearchFiltersParticipantsSelectorProps = {
    initialAccountIDs: string[];
    onFiltersUpdate: (accountIDs: string[]) => void;
};

function SearchFiltersParticipantsSelector({initialAccountIDs, onFiltersUpdate}: SearchFiltersParticipantsSelectorProps) {
    const {translate} = useLocalize();
    const personalDetails = usePersonalDetails();
    const {options, areOptionsInitialized} = useOptionsList();

    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});
    const [selectedOptions, setSelectedOptions] = useState<OptionData[]>([]);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const cleanSearchTerm = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);

    const defaultOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return defaultListOptions;
        }

        return OptionsListUtils.getFilteredOptions(
            options.reports,
            options.personalDetails,
            betas,
            '',
            selectedOptions,
            CONST.EXPENSIFY_EMAILS,
            true,
            true,
            false,
            {},
            [],
            false,
            {},
            [],
            true,
            false,
            false,
            0,
            undefined,
            true,
        );
    }, [areOptionsInitialized, betas, options.personalDetails, options.reports, selectedOptions]);

    const chatOptions = useMemo(() => {
        return OptionsListUtils.filterOptions(defaultOptions, cleanSearchTerm, {
            betas,
            selectedOptions,
            excludeLogins: CONST.EXPENSIFY_EMAILS,
        });
    }, [defaultOptions, cleanSearchTerm, betas, selectedOptions]);

    const sections = useMemo(() => {
        const newSections: OptionsListUtils.CategorySection[] = [];
        if (!areOptionsInitialized) {
            return newSections;
        }

        const formatResults = OptionsListUtils.formatSectionsFromSearchTerm(cleanSearchTerm, selectedOptions, chatOptions.recentReports, chatOptions.personalDetails, personalDetails, true);

        newSections.push(formatResults.section);

        newSections.push({
            title: translate('common.recents'),
            data: chatOptions.recentReports,
            shouldShow: chatOptions.recentReports.length > 0,
        });

        newSections.push({
            title: translate('common.contacts'),
            data: chatOptions.personalDetails,
            shouldShow: chatOptions.personalDetails.length > 0,
        });

        return newSections;
    }, [areOptionsInitialized, chatOptions, cleanSearchTerm, selectedOptions, personalDetails, translate]);

    // This effect handles setting initial selectedOptions based on accountIDs saved in onyx form
    useEffect(() => {
        if (!initialAccountIDs || initialAccountIDs.length === 0) {
            return;
        }

        const [, recents = {data: []}, contacts = {data: []}] = sections;
        const allOptions = [...recents.data, ...contacts.data];
        const preSelectedOptions: OptionData[] = allOptions
            .filter((option) => {
                if (!option.accountID) {
                    return false;
                }
                return initialAccountIDs.includes(option.accountID.toString());
            })
            .map(getSelectedOptionData);

        setSelectedOptions(preSelectedOptions);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- this should react only to changes in form data
    }, [initialAccountIDs]);

    useEffect(() => {
        Report.searchInServer(debouncedSearchTerm.trim());
    }, [debouncedSearchTerm]);

    const handleParticipantSelection = useCallback(
        (option: Option) => {
            const foundOptionIndex = selectedOptions.findIndex((selectedOption: Option) => {
                if (selectedOption.accountID && selectedOption.accountID === option?.accountID) {
                    return true;
                }

                if (selectedOption.reportID && selectedOption.reportID === option?.reportID) {
                    return true;
                }

                return false;
            });

            if (foundOptionIndex < 0) {
                setSelectedOptions([...selectedOptions, getSelectedOptionData(option)]);
            } else {
                const newSelectedOptions = [...selectedOptions.slice(0, foundOptionIndex), ...selectedOptions.slice(foundOptionIndex + 1)];
                setSelectedOptions(newSelectedOptions);
            }
        },
        [selectedOptions],
    );

    const footerContent = (
        <Button
            success
            text={translate('common.save')}
            pressOnEnter
            onPress={() => {
                const selectedAccountIDs = selectedOptions.map((option) => (option.accountID ? option.accountID.toString() : undefined)).filter(Boolean) as string[];
                onFiltersUpdate(selectedAccountIDs);

                Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
            }}
            large
        />
    );

    return (
        <SelectionList
            canSelectMultiple
            sections={sections}
            ListItem={InviteMemberListItem}
            textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
            textInputValue={searchTerm}
            footerContent={footerContent}
            showScrollIndicator
            showLoadingPlaceholder={false}
            shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
            onChangeText={(value) => {
                setSearchTerm(value);
            }}
            onSelectRow={handleParticipantSelection}
            isLoadingNewOptions={!!isSearchingForReports}
        />
    );
}

SearchFiltersParticipantsSelector.displayName = 'SearchFiltersParticipantsSelector';

export default SearchFiltersParticipantsSelector;
