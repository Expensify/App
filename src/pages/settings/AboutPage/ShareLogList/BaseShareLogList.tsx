import React, {useEffect} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useSearchSelector from '@hooks/useSearchSelector';
import {searchInServer} from '@libs/actions/Report';
import {appendTimeToFileName} from '@libs/fileDownload/FileUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getHeaderMessage} from '@libs/OptionsListUtils';
import type {SearchOptionData} from '@libs/OptionsListUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';
import KeyboardUtils from '@src/utils/keyboard';
import type {BaseShareLogListProps} from './types';

type Sections = Array<Section<SearchOptionData>>;

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

    const sections: Sections = [];
    if (areOptionsInitialized) {
        if (availableOptions.recentReports.length > 0) {
            sections.push({
                title: translate('common.recents'),
                data: availableOptions.recentReports,
                sectionIndex: 0,
            });
        }

        if (availableOptions.personalDetails.length > 0) {
            sections.push({
                title: translate('common.contacts'),
                data: availableOptions.personalDetails,
                sectionIndex: 1,
            });
        }

        if (availableOptions.userToInvite) {
            sections.push({
                title: undefined,
                data: [availableOptions.userToInvite],
                sectionIndex: 2,
            });
        }
    }

    const headerMessage = areOptionsInitialized
        ? getHeaderMessage(
              (availableOptions.recentReports?.length || 0) + (availableOptions.personalDetails?.length || 0) !== 0,
              !!availableOptions.userToInvite,
              debouncedSearchTerm.trim(),
              countryCode,
          )
        : '';

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

    const textInputOptions = {
        value: searchTerm,
        label: translate('selectionList.nameEmailOrPhoneNumber'),
        hint: isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : '',
        onChangeText: setSearchTerm,
        headerMessage,
    };

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
                    <SelectionListWithSections
                        ListItem={UserListItem}
                        sections={sections}
                        onSelectRow={attachLogToReport}
                        shouldSingleExecuteRowSelect
                        shouldShowTextInput
                        disableMaintainingScrollPosition
                        textInputOptions={textInputOptions}
                        showLoadingPlaceholder={!didScreenTransitionEnd}
                        isLoadingNewOptions={!!isSearchingForReports}
                    />
                </>
            )}
        </ScreenWrapper>
    );
}

export default BaseShareLogList;
