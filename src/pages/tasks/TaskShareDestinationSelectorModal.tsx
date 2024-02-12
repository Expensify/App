import debounce from 'lodash/debounce';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OptionsSelector from '@components/OptionsSelector';
import ScreenWrapper from '@components/ScreenWrapper';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportActions from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as Task from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Beta, PersonalDetailsList, Report} from '@src/types/onyx';

type TaskShareDestinationSelectorModalOnyxProps = {
    betas: OnyxEntry<Beta[]>;

    personalDetails: OnyxEntry<PersonalDetailsList>;

    reports: OnyxCollection<Report>;

    isSearchingForReports: OnyxEntry<boolean>;
};

type TaskShareDestinationSelectorModalProps = TaskShareDestinationSelectorModalOnyxProps;

function TaskShareDestinationSelectorModal({reports, isSearchingForReports, personalDetails, betas}: TaskShareDestinationSelectorModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [searchValue, setSearchValue] = useState('');
    const [headerMessage, setHeaderMessage] = useState('');
    const [filteredRecentReports, setFilteredRecentReports] = useState<ReportUtils.OptionData[]>([]);

    const {inputCallbackRef} = useAutoFocusInput();
    const {isOffline} = useNetwork();

    const filteredReports = useMemo(() => {
        const filtered: Record<string, Report | null> = {};

        if (!reports) {
            return filtered;
        }

        Object.keys(reports).forEach((reportKey) => {
            if (
                !ReportUtils.canUserPerformWriteAction(reports[reportKey]) ||
                !ReportUtils.canCreateTaskInReport(reports[reportKey]) ||
                ReportUtils.isCanceledTaskReport(reports[reportKey])
            ) {
                return;
            }

            filtered[reportKey] = reports[reportKey];
        });

        return filtered;
    }, [reports]);

    const updateOptions = useCallback(() => {
        const {recentReports} = OptionsListUtils.getShareDestinationOptions(filteredReports, personalDetails, betas, searchValue.trim(), [], CONST.EXPENSIFY_EMAILS, true);

        setHeaderMessage(OptionsListUtils.getHeaderMessage(recentReports?.length !== 0, false, searchValue));

        setFilteredRecentReports(recentReports);
    }, [filteredReports, personalDetails, betas, searchValue]);

    useEffect(() => {
        const debouncedSearch = debounce(updateOptions, 150);
        debouncedSearch();
        return () => {
            debouncedSearch.cancel();
        };
    }, [updateOptions]);

    const getSections = () => {
        const sections = [];
        let indexOffset = 0;

        if (filteredRecentReports?.length > 0) {
            sections.push({
                data: filteredRecentReports,
                shouldShow: true,
                indexOffset,
            });
            indexOffset += filteredRecentReports?.length;
        }

        return sections;
    };

    const selectReport = (option: ReportUtils.OptionData) => {
        if (!option) {
            return;
        }

        if (option.reportID) {
            Task.setShareDestinationValue(option.reportID);
            Navigation.goBack(ROUTES.NEW_TASK);
        }
    };

    // When search term updates we will fetch any reports
    const setSearchTermAndSearchInServer = useCallback((text = '') => {
        ReportActions.searchInServer(text);
        setSearchValue(text);
    }, []);

    const sections = getSections();

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={TaskShareDestinationSelectorModal.displayName}
        >
            {({didScreenTransitionEnd, safeAreaPaddingBottomStyle}) => (
                <>
                    <HeaderWithBackButton
                        title={translate('newTaskPage.shareSomewhere')}
                        onBackButtonPress={() => Navigation.goBack(ROUTES.NEW_TASK)}
                    />
                    <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                        <OptionsSelector
                            // @ts-expect-error TODO: Remove this once OptionsSelector (https://github.com/Expensify/App/issues/25125) is migrated to TypeScript.
                            sections={sections}
                            onSelectRow={selectReport}
                            onChangeText={setSearchTermAndSearchInServer}
                            headerMessage={headerMessage}
                            hideSection
                            Headers
                            showTitleTooltip
                            shouldShowOptions={didScreenTransitionEnd}
                            textInputLabel={translate('optionsSelector.nameEmailOrPhoneNumber')}
                            textInputAlert={isOffline ? [`${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}`, {isTranslated: true}] : ''}
                            safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                            autoFocus={false}
                            ref={inputCallbackRef}
                            isLoadingNewOptions={isSearchingForReports}
                        />
                    </View>
                </>
            )}
        </ScreenWrapper>
    );
}

TaskShareDestinationSelectorModal.displayName = 'TaskShareDestinationSelectorModal';

export default withOnyx<TaskShareDestinationSelectorModalProps, TaskShareDestinationSelectorModalProps>({
    reports: {
        key: ONYXKEYS.COLLECTION.REPORT,
    },
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    },
    betas: {
        key: ONYXKEYS.BETAS,
    },
    isSearchingForReports: {
        key: ONYXKEYS.IS_SEARCHING_FOR_REPORTS,
        initWithStoredValues: false,
    },
})(TaskShareDestinationSelectorModal);
