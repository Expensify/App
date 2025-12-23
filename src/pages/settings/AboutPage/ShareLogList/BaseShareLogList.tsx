import React, {useEffect, useMemo} from 'react';
import type {SectionListData} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
// eslint-disable-next-line no-restricted-imports
import SelectionList from '@components/SelectionListWithSections';
import type {Section} from '@components/SelectionListWithSections/types';
import UserListItem from '@components/SelectionListWithSections/UserListItem';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useSearchSelector from '@hooks/useSearchSelector';
import {searchInServer} from '@libs/actions/Report';
import {appendTimeToFileName} from '@libs/fileDownload/FileUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getHeaderMessage} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';
import KeyboardUtils from '@src/utils/keyboard';
import type {BaseShareLogListProps} from './types';

type Sections = Array<SectionListData<OptionData, Section<OptionData>>>;

function BaseShareLogList({onAttachLogToReport}: BaseShareLogListProps) {
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});

    const {searchTerm, debouncedSearchTerm, setSearchTerm, availableOptions, areOptionsInitialized} = useSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
        searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_SHARE_LOG,
        includeUserToInvite: false,
    });
    const sections = useMemo(() => {
        if (!areOptionsInitialized) {
            return CONST.EMPTY_ARRAY;
        }
        const sectionsList: Sections = [];

        sectionsList.push({
            title: translate('common.recents'),
            data: availableOptions.recentReports,
            shouldShow: availableOptions.recentReports.length > 0,
        });

        sectionsList.push({
            title: translate('common.contacts'),
            data: availableOptions.personalDetails,
            shouldShow: availableOptions.personalDetails.length > 0,
        });

        if (availableOptions.userToInvite) {
            sectionsList.push({
                title: undefined,
                data: [availableOptions.userToInvite],
                shouldShow: true,
            });
        }

        return sectionsList;
    }, [areOptionsInitialized, translate, availableOptions.recentReports, availableOptions.personalDetails, availableOptions.userToInvite]);

    const headerMessage = useMemo(() => {
        if (!areOptionsInitialized) {
            return '';
        }

        return getHeaderMessage(
            (availableOptions.recentReports?.length || 0) + (availableOptions.personalDetails?.length || 0) !== 0,
            !!availableOptions.userToInvite,
            debouncedSearchTerm.trim(),
            countryCode,
        );
    }, [areOptionsInitialized, availableOptions.personalDetails?.length, availableOptions.recentReports?.length, availableOptions.userToInvite, countryCode, debouncedSearchTerm]);
    const attachLogToReport = (option: Report) => {
        if (!option.reportID) {
            return;
        }
        const filename = appendTimeToFileName('logs.txt');

        KeyboardUtils.dismiss().then(() => {
            onAttachLogToReport(option.reportID, filename);
        });
    };

    useEffect(() => {
        searchInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    return (
        <ScreenWrapper
            testID="BaseShareLogList"
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
                        sections={sections}
                        onSelectRow={attachLogToReport}
                        shouldSingleExecuteRowSelect
                        onChangeText={setSearchTerm}
                        textInputValue={searchTerm}
                        headerMessage={headerMessage}
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

export default BaseShareLogList;
