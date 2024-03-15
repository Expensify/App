import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {usePersonalDetails} from '@components/OnyxProvider';
import OptionsSelector from '@components/OptionsSelector';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';
import type {BaseShareLogListOnyxProps, BaseShareLogListProps} from './types';

function BaseShareLogList({betas, reports, onAttachLogToReport}: BaseShareLogListProps) {
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
    const personalDetails = usePersonalDetails();

    const updateOptions = useCallback(() => {
        const {
            recentReports: localRecentReports,
            personalDetails: localPersonalDetails,
            userToInvite: localUserToInvite,
        } = OptionsListUtils.getShareLogOptions(reports, personalDetails, searchValue.trim(), betas ?? []);

        setSearchOptions({
            recentReports: localRecentReports,
            personalDetails: localPersonalDetails,
            userToInvite: localUserToInvite,
        });
    }, [betas, personalDetails, reports, searchValue]);

    const isOptionsDataReady = ReportUtils.isReportDataReady() && OptionsListUtils.isPersonalDetailsReady(personalDetails);

    useEffect(() => {
        updateOptions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        let indexOffset = 0;

        sectionsList.push({
            title: translate('common.recents'),
            data: searchOptions.recentReports,
            shouldShow: searchOptions.recentReports?.length > 0,
            indexOffset,
        });
        indexOffset += searchOptions.recentReports.length;

        sectionsList.push({
            title: translate('common.contacts'),
            data: searchOptions.personalDetails,
            shouldShow: searchOptions.personalDetails?.length > 0,
            indexOffset,
        });
        indexOffset += searchOptions.personalDetails.length;

        if (searchOptions.userToInvite) {
            sectionsList.push({
                data: [searchOptions.userToInvite],
                shouldShow: true,
                indexOffset,
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

    const attachLogToReport = (option: Report) => {
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
            {({safeAreaPaddingBottomStyle}) => (
                <>
                    <HeaderWithBackButton
                        title={translate('initialSettingsPage.debugConsole.shareLog')}
                        onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_CONSOLE)}
                    />
                    <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                        <OptionsSelector
                            // @ts-expect-error TODO: remove this comment once OptionsSelector (https://github.com/Expensify/App/issues/25125) is migrated to TS
                            sections={sections}
                            onSelectRow={attachLogToReport}
                            onChangeText={onChangeText}
                            value={searchValue}
                            headerMessage={headerMessage}
                            showTitleTooltip
                            shouldShowOptions={isOptionsDataReady}
                            textInputLabel={translate('optionsSelector.nameEmailOrPhoneNumber')}
                            textInputAlert={isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : ''}
                            safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                            autoFocus
                        />
                    </View>
                </>
            )}
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
