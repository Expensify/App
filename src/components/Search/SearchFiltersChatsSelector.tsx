import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import {usePersonalDetails} from '@components/OnyxProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/InviteMemberListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useScreenWrapperTranstionStatus from '@hooks/useScreenWrapperTransitionStatus';
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
    recentReports: [],
    personalDetails: [],
    userToInvite: null,
    currentUserOption: null,
    categoryOptions: [],
    tagOptions: [],
    taxRatesOptions: [],
    headerMessage: '',
};

function getSelectedOptionData(option: Option): OptionData {
    return {...option, isSelected: true, reportID: option.reportID ?? '-1'};
}

type SearchFiltersParticipantsSelectorProps = {
    initialIDs: string[];
    onFiltersUpdate: (initialIDs: string[]) => void;
    isScreenTransitionEnd: boolean;
};

function SearchFiltersChatsSelector({initialIDs, onFiltersUpdate, isScreenTransitionEnd}: SearchFiltersParticipantsSelectorProps) {
    const {translate} = useLocalize();
    const personalDetails = usePersonalDetails();
    const {didScreenTransitionEnd} = useScreenWrapperTranstionStatus();
    const {options, areOptionsInitialized} = useOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});
    const [selectedReportIDs, setSelectedReportIDs] = useState<string[]>(initialIDs);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const cleanSearchTerm = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);

    const selectedOptions = useMemo<OptionData[]>(() => {
        const selectedReports = selectedReportIDs.map((id) =>
            getSelectedOptionData(OptionsListUtils.createOptionFromReport({...reports?.[`${ONYXKEYS.COLLECTION.REPORT}${id}`], reportID: id}, personalDetails)),
        );
        return selectedReports.map((rep) => (!rep.alternateText ? {...rep, alternateText: 'Workspace'} : rep));
    }, [personalDetails, reports, selectedReportIDs]);

    const defaultOptions = useMemo(() => {
        if (!areOptionsInitialized || !isScreenTransitionEnd) {
            return defaultListOptions;
        }
        return OptionsListUtils.getSearchOptions(options, '');
    }, [areOptionsInitialized, isScreenTransitionEnd, options]);

    const chatOptions = useMemo(() => {
        return OptionsListUtils.filterOptions(defaultOptions, cleanSearchTerm, {
            selectedOptions,
            excludeLogins: CONST.EXPENSIFY_EMAILS,
            maxRecentReportsToShow: 0,
        });
    }, [defaultOptions, cleanSearchTerm, selectedOptions]);

    const {sections, headerMessage} = useMemo(() => {
        const newSections: OptionsListUtils.CategorySection[] = [];
        if (!areOptionsInitialized) {
            return {sections: [], headerMessage: undefined};
        }

        const formattedResults = OptionsListUtils.formatSectionsFromSearchTerm(
            cleanSearchTerm,
            selectedOptions,
            chatOptions.recentReports,
            chatOptions.personalDetails,
            personalDetails,
            false,
        );

        newSections.push(formattedResults.section);
        const reportsWithSearch = chatOptions.recentReports.map((report) => (selectedReportIDs.includes(report.reportID) ? getSelectedOptionData(report) : report));
        const reportsWithEmptySearch = chatOptions.recentReports.filter((report) => !selectedReportIDs.includes(report.reportID));
        const recentReportsFiltered = cleanSearchTerm === '' ? reportsWithEmptySearch : reportsWithSearch;

        newSections.push({
            title: 'recent',
            data: recentReportsFiltered,
            shouldShow: chatOptions.recentReports.length > 0,
        });

        const noResultsFound = chatOptions.personalDetails.length === 0 && chatOptions.recentReports.length === 0 && !chatOptions.currentUserOption;
        const message = noResultsFound ? translate('common.noResultsFound') : undefined;

        return {
            sections: newSections,
            headerMessage: message,
        };
    }, [
        areOptionsInitialized,
        chatOptions.currentUserOption,
        chatOptions.personalDetails,
        chatOptions.recentReports,
        cleanSearchTerm,
        personalDetails,
        selectedOptions,
        selectedReportIDs,
        translate,
    ]);

    useEffect(() => {
        Report.searchInServer(debouncedSearchTerm.trim());
    }, [debouncedSearchTerm]);

    const handleParticipantSelection = useCallback(
        (selectedOption: Option) => {
            const optionReportID = selectedOption.reportID;
            if (!optionReportID) {
                return;
            }
            const foundOptionIndex = selectedReportIDs.findIndex((reportID: string) => {
                return reportID && reportID !== '' && selectedOption.reportID === reportID;
            });

            if (foundOptionIndex < 0) {
                setSelectedReportIDs([...selectedReportIDs, optionReportID]);
            } else {
                const newSelectedReports = [...selectedReportIDs.slice(0, foundOptionIndex), ...selectedReportIDs.slice(foundOptionIndex + 1)];
                setSelectedReportIDs(newSelectedReports);
            }
        },
        [selectedReportIDs],
    );

    const footerContent = (
        <Button
            success
            text={translate('common.save')}
            pressOnEnter
            onPress={() => {
                onFiltersUpdate(selectedReportIDs);
                Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
            }}
            large
        />
    );

    const isLoadingNewOptions = !!isSearchingForReports;
    const showLoadingPlaceholder = !didScreenTransitionEnd || !areOptionsInitialized || !initialIDs || !personalDetails;

    return (
        <SelectionList
            canSelectMultiple
            sections={sections}
            ListItem={InviteMemberListItem}
            textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
            headerMessage={headerMessage}
            textInputValue={searchTerm}
            footerContent={footerContent}
            showScrollIndicator
            shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
            onChangeText={(value) => {
                setSearchTerm(value);
            }}
            onSelectRow={handleParticipantSelection}
            isLoadingNewOptions={isLoadingNewOptions}
            showLoadingPlaceholder={showLoadingPlaceholder}
        />
    );
}

SearchFiltersChatsSelector.displayName = 'SearchFiltersChatsSelector';

export default SearchFiltersChatsSelector;
