import keys from 'lodash/keys';
import reduce from 'lodash/reduce';
import PropTypes from 'prop-types';
import React, {useEffect, useMemo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {usePersonalDetails} from '@components/OnyxProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/UserListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Report from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import reportPropTypes from '@pages/reportPropTypes';
import * as Task from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    /** All reports shared with the user */
    reports: PropTypes.objectOf(reportPropTypes),
    /** Whether or not we are searching for reports on the server */
    isSearchingForReports: PropTypes.bool,
};

const defaultProps = {
    reports: {},
    isSearchingForReports: false,
};

const selectReportHandler = (option) => {
    if (!option || !option.reportID) {
        return;
    }

    Task.setShareDestinationValue(option.reportID);
    Navigation.goBack(ROUTES.NEW_TASK);
};

const reportFilter = (reports) =>
    reduce(
        keys(reports),
        (filtered, reportKey) => {
            const report = reports[reportKey];
            if (ReportUtils.canUserPerformWriteAction(report) && ReportUtils.canCreateTaskInReport(report) && !ReportUtils.isCanceledTaskReport(report)) {
                return {...filtered, [reportKey]: report};
            }
            return filtered;
        },
        {},
    );

function TaskShareDestinationSelectorModal({reports, isSearchingForReports}) {
    const styles = useThemeStyles();
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const {translate} = useLocalize();
    const personalDetails = usePersonalDetails();
    const {isOffline} = useNetwork();

    const textInputHint = useMemo(() => (isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : ''), [isOffline, translate]);

    const options = useMemo(() => {
        const filteredReports = reportFilter(reports);

        const {recentReports} = OptionsListUtils.getShareDestinationOptions(filteredReports, personalDetails, [], debouncedSearchValue.trim(), [], CONST.EXPENSIFY_EMAILS, true);

        const headerMessage = OptionsListUtils.getHeaderMessage(recentReports && recentReports.length !== 0, false, debouncedSearchValue);

        const sections = recentReports && recentReports.length > 0 ? [{data: recentReports, shouldShow: true}] : [];

        return {sections, headerMessage};
    }, [personalDetails, reports, debouncedSearchValue]);

    useEffect(() => {
        Report.searchInServer(debouncedSearchValue);
    }, [debouncedSearchValue]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="TaskShareDestinationSelectorModal"
        >
            {({didScreenTransitionEnd, safeAreaPaddingBottomStyle}) => (
                <>
                    <HeaderWithBackButton
                        title={translate('newTaskPage.shareSomewhere')}
                        onBackButtonPress={() => Navigation.goBack(ROUTES.NEW_TASK)}
                    />
                    <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                        <SelectionList
                            ListItem={UserListItem}
                            sections={didScreenTransitionEnd ? options.sections : CONST.EMPTY_ARRAY}
                            onSelectRow={selectReportHandler}
                            onChangeText={setSearchValue}
                            textInputValue={searchValue}
                            headerMessage={options.headerMessage}
                            textInputLabel={translate('optionsSelector.nameEmailOrPhoneNumber')}
                            safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                            showLoadingPlaceholder={!didScreenTransitionEnd}
                            isLoadingNewOptions={isSearchingForReports}
                            textInputHint={textInputHint}
                        />
                    </View>
                </>
            )}
        </ScreenWrapper>
    );
}

TaskShareDestinationSelectorModal.displayName = 'TaskShareDestinationSelectorModal';
TaskShareDestinationSelectorModal.propTypes = propTypes;
TaskShareDestinationSelectorModal.defaultProps = defaultProps;

export default withOnyx({
    reports: {
        key: ONYXKEYS.COLLECTION.REPORT,
    },
    isSearchingForReports: {
        key: ONYXKEYS.IS_SEARCHING_FOR_REPORTS,
        initWithStoredValues: false,
    },
})(TaskShareDestinationSelectorModal);
