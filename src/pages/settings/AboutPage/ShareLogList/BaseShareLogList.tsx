import React, {useEffect, useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useBetas} from '@components/OnyxListItemProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionListWithSections';
import UserListItem from '@components/SelectionListWithSections/UserListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {searchInServer} from '@libs/actions/Report';
import {appendTimeToFileName} from '@libs/fileDownload/FileUtils';
import Navigation from '@libs/Navigation/Navigation';
import {filterAndOrderOptions, getHeaderMessage, getShareLogOptions} from '@libs/OptionsListUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';
import type {BaseShareLogListProps} from './types';

function BaseShareLogList({onAttachLogToReport}: BaseShareLogListProps) {
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const betas = useBetas();
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const {options, areOptionsInitialized} = useOptionsList();
    const [draftComments] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, {canBeMissing: true});

    const defaultOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return {
                recentReports: [],
                personalDetails: [],
                userToInvite: null,
                currentUserOption: null,
                headerMessage: '',
            };
        }
        const shareLogOptions = getShareLogOptions(options, draftComments, betas ?? []);

        const header = getHeaderMessage((shareLogOptions.recentReports.length || 0) + (shareLogOptions.personalDetails.length || 0) !== 0, !!shareLogOptions.userToInvite, '', countryCode);

        return {
            ...shareLogOptions,
            headerMessage: header,
        };
    }, [areOptionsInitialized, options, draftComments, betas, countryCode]);

    const searchOptions = useMemo(() => {
        if (debouncedSearchValue.trim() === '') {
            return defaultOptions;
        }

        const filteredOptions = filterAndOrderOptions(defaultOptions, debouncedSearchValue, countryCode, {
            preferChatRoomsOverThreads: true,
            sortByReportTypeInSearch: true,
        });

        const headerMessage = getHeaderMessage(
            (filteredOptions.recentReports?.length || 0) + (filteredOptions.personalDetails?.length || 0) !== 0,
            !!filteredOptions.userToInvite,
            debouncedSearchValue.trim(),
            countryCode,
            false,
        );

        return {...filteredOptions, headerMessage};
    }, [debouncedSearchValue, defaultOptions, countryCode]);

    const sections = useMemo(() => {
        const sectionsList = [];

        sectionsList.push({
            title: translate('common.recents'),
            data: searchOptions.recentReports,
            shouldShow: searchOptions.recentReports?.length > 0,
        });

        sectionsList.push({
            title: translate('common.contacts'),
            data: searchOptions.personalDetails,
            shouldShow: searchOptions.personalDetails?.length > 0,
        });

        if (searchOptions.userToInvite) {
            sectionsList.push({
                data: [searchOptions.userToInvite],
                shouldShow: true,
            });
        }

        return sectionsList;
    }, [searchOptions?.personalDetails, searchOptions?.recentReports, searchOptions?.userToInvite, translate]);

    const attachLogToReport = (option: Report) => {
        if (!option.reportID) {
            return;
        }
        const filename = appendTimeToFileName('logs.txt');

        onAttachLogToReport(option.reportID, filename);
    };

    useEffect(() => {
        searchInServer(debouncedSearchValue);
    }, [debouncedSearchValue]);

    return (
        <ScreenWrapper
            testID={BaseShareLogList.displayName}
            includeSafeAreaPaddingBottom={false}
        >
            {({didScreenTransitionEnd}) => (
                <>
                    <HeaderWithBackButton
                        title={translate('initialSettingsPage.debugConsole.shareLog')}
                        onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_CONSOLE.getRoute())}
                    />
                    <SelectionList
                        ListItem={UserListItem}
                        sections={didScreenTransitionEnd ? sections : CONST.EMPTY_ARRAY}
                        onSelectRow={attachLogToReport}
                        shouldSingleExecuteRowSelect
                        onChangeText={setSearchValue}
                        textInputValue={searchValue}
                        headerMessage={searchOptions.headerMessage}
                        textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
                        textInputHint={isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : ''}
                        showLoadingPlaceholder={!didScreenTransitionEnd}
                        isLoadingNewOptions={!!isSearchingForReports}
                    />
                </>
            )}
        </ScreenWrapper>
    );
}

BaseShareLogList.displayName = 'ShareLogPage';

export default BaseShareLogList;
