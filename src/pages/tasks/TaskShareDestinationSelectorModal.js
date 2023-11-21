/* eslint-disable es/no-optional-chaining */
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OptionsSelector from '@components/OptionsSelector';
import ScreenWrapper from '@components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useNetwork from '@hooks/useNetwork';
import * as Report from '@libs/actions/Report';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import personalDetailsPropType from '@pages/personalDetailsPropType';
import reportPropTypes from '@pages/reportPropTypes';
import useThemeStyles from '@styles/useThemeStyles';
import * as Task from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    /* Onyx Props */

    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** All of the personal details for everyone */
    personalDetails: PropTypes.objectOf(personalDetailsPropType),

    /** All reports shared with the user */
    reports: PropTypes.objectOf(reportPropTypes),

    /** Whether we are searching for reports in the server */
    isSearchingForReports: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    betas: [],
    personalDetails: {},
    reports: {},
    isSearchingForReports: false,
};

function TaskShareDestinationSelectorModal(props) {
    const styles = useThemeStyles();
    const [searchValue, setSearchValue] = useState('');
    const [headerMessage, setHeaderMessage] = useState('');
    const [filteredRecentReports, setFilteredRecentReports] = useState([]);

    const {inputCallbackRef} = useAutoFocusInput();
    const {isSearchingForReports} = props;
    const {isOffline} = useNetwork();

    const filteredReports = useMemo(() => {
        const reports = {};
        _.keys(props.reports).forEach((reportKey) => {
            if (
                !ReportUtils.canUserPerformWriteAction(props.reports[reportKey]) ||
                !ReportUtils.canCreateTaskInReport(props.reports[reportKey]) ||
                ReportUtils.isCanceledTaskReport(props.reports[reportKey])
            ) {
                return;
            }
            reports[reportKey] = props.reports[reportKey];
        });
        return reports;
    }, [props.reports]);
    const updateOptions = useCallback(() => {
        const {recentReports} = OptionsListUtils.getShareDestinationOptions(filteredReports, props.personalDetails, props.betas, searchValue.trim(), [], CONST.EXPENSIFY_EMAILS, true);

        setHeaderMessage(OptionsListUtils.getHeaderMessage(recentReports?.length !== 0, false, searchValue));

        setFilteredRecentReports(recentReports);
    }, [props, searchValue, filteredReports]);

    useEffect(() => {
        const debouncedSearch = _.debounce(updateOptions, 150);
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

    const selectReport = (option) => {
        if (!option) {
            return;
        }

        if (option.reportID) {
            // Clear out the state value, set the assignee and navigate back to the NewTaskPage
            setSearchValue('');
            Task.setShareDestinationValue(option.reportID);
            Navigation.goBack(ROUTES.NEW_TASK);
        }
    };

    // When search term updates we will fetch any reports
    const setSearchTermAndSearchInServer = useCallback((text = '') => {
        if (text.length) {
            Report.searchInServer(text);
        }
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
                        title={props.translate('newTaskPage.shareSomewhere')}
                        onBackButtonPress={() => Navigation.goBack(ROUTES.NEW_TASK)}
                    />
                    <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                        <OptionsSelector
                            sections={sections}
                            value={searchValue}
                            onSelectRow={selectReport}
                            onChangeText={setSearchTermAndSearchInServer}
                            headerMessage={headerMessage}
                            hideSection
                            Headers
                            showTitleTooltip
                            shouldShowOptions={didScreenTransitionEnd}
                            textInputLabel={props.translate('optionsSelector.nameEmailOrPhoneNumber')}
                            textInputAlert={isOffline ? `${props.translate('common.youAppearToBeOffline')} ${props.translate('search.resultsAreLimited')}` : ''}
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
TaskShareDestinationSelectorModal.propTypes = propTypes;
TaskShareDestinationSelectorModal.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
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
    }),
)(TaskShareDestinationSelectorModal);
