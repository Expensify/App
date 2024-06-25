import React, {useEffect, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useBetas} from '@components/OnyxProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/UserListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import * as ReportActions from '@libs/actions/Report';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
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
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});
    const {options, areOptionsInitialized} = useOptionsList();

    const defaultOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return {
                recentReports: [],
                personalDetails: [],
                userToInvite: null,
                currentUserOption: null,
                categoryOptions: [],
                tagOptions: [],
                taxRatesOptions: [],
                headerMessage: '',
            };
        }
        const shareLogOptions = OptionsListUtils.getShareLogOptions(options, '', betas ?? []);

        const header = OptionsListUtils.getHeaderMessage(
            (shareLogOptions.recentReports.length || 0) + (shareLogOptions.personalDetails.length || 0) !== 0,
            !!shareLogOptions.userToInvite,
            '',
        );

        return {
            ...shareLogOptions,
            headerMessage: header,
        };
    }, [areOptionsInitialized, options, betas]);

    const searchOptions = useMemo(() => {
        if (debouncedSearchValue.trim() === '') {
            return defaultOptions;
        }

        const filteredOptions = OptionsListUtils.filterOptions(defaultOptions, debouncedSearchValue, {
            includeChatRoomsByParticipants: true,
            preferChatroomsOverThreads: true,
            sortByReportTypeInSearch: true,
        });

        const headerMessage = OptionsListUtils.getHeaderMessage(
            (filteredOptions.recentReports?.length || 0) + (filteredOptions.personalDetails?.length || 0) !== 0,
            !!filteredOptions.userToInvite,
            debouncedSearchValue.trim(),
        );

        return {...filteredOptions, headerMessage};
    }, [debouncedSearchValue, defaultOptions]);

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
        const filename = FileUtils.appendTimeToFileName('logs.txt');

        onAttachLogToReport(option.reportID, filename);
    };

    useEffect(() => {
        ReportActions.searchInServer(debouncedSearchValue);
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
                        shouldDebounceRowSelect
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
