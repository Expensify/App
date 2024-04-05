import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useOptionsList} from '@components/OptionListContextProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BaseShareLogListOnyxProps, BaseShareLogListProps} from './types';

function BaseShareLogList({betas, onAttachLogToReport}: BaseShareLogListProps) {
    const [searchValue, setSearchValue] = useState('');
    const [searchOptions, setSearchOptions] = useState<Pick<OptionsListUtils.GetOptions, 'recentReports' | 'personalDetails' | 'userToInvite'>>({
        recentReports: [],
        personalDetails: [],
        userToInvite: null,
    });
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const isMounted = useRef(false);
    const {options, areOptionsInitialized} = useOptionsList();
    const updateOptions = useCallback(() => {
        const {
            recentReports: localRecentReports,
            personalDetails: localPersonalDetails,
            userToInvite: localUserToInvite,
        } = OptionsListUtils.getShareLogOptions(options, searchValue.trim(), betas ?? []);

        setSearchOptions({
            recentReports: localRecentReports,
            personalDetails: localPersonalDetails,
            userToInvite: localUserToInvite,
        });
    }, [betas, options, searchValue]);

    useEffect(() => {
        if (!areOptionsInitialized) {
            return;
        }

        updateOptions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options, areOptionsInitialized]);

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }

        updateOptions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchValue]);

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
    }, [searchOptions.personalDetails, searchOptions.recentReports, searchOptions.userToInvite, translate]);

    const headerMessage = OptionsListUtils.getHeaderMessage(
        searchOptions.recentReports.length + searchOptions.personalDetails.length !== 0,
        Boolean(searchOptions.userToInvite),
        searchValue,
    );

    const onChangeText = (value = '') => {
        setSearchValue(value);
    };

    const attachLogToReport = (option: ListItem) => {
        if (!option.reportID) {
            return;
        }
        const filename = FileUtils.appendTimeToFileName('logs.txt');

        onAttachLogToReport(option.reportID, filename);
    };

    return (
        <ScreenWrapper
            testID={BaseShareLogList.displayName}
            includeSafeAreaPaddingBottom={false}
        >
            <HeaderWithBackButton
                title={translate('initialSettingsPage.debugConsole.shareLog')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_CONSOLE)}
            />
            <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                <SelectionList
                    ListItem={UserListItem}
                    sections={sections}
                    onSelectRow={attachLogToReport}
                    onChangeText={onChangeText}
                    textInputValue={searchValue}
                    headerMessage={headerMessage}
                    shouldShowTooltips={areOptionsInitialized}
                    isLoadingNewOptions={!areOptionsInitialized}
                    textInputLabel={translate('optionsSelector.nameEmailOrPhoneNumber')}
                    textInputHint={isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : ''}
                />
            </View>
        </ScreenWrapper>
    );
}

BaseShareLogList.displayName = 'ShareLogPage';

export default withOnyx<BaseShareLogListProps, BaseShareLogListOnyxProps>({
    reports: {
        key: ONYXKEYS.COLLECTION.REPORT,
    },
    betas: {
        key: ONYXKEYS.BETAS,
        initialValue: [],
    },
})(BaseShareLogList);
