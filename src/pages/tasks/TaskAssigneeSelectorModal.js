/* eslint-disable es/no-optional-chaining */
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OptionsSelector from '@components/OptionsSelector';
import ScreenWrapper from '@components/ScreenWrapper';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
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
    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** All of the personal details for everyone */
    personalDetails: PropTypes.objectOf(personalDetailsPropType),

    /** All reports shared with the user */
    reports: PropTypes.objectOf(reportPropTypes),

    /** URL Route params */
    route: PropTypes.shape({
        /** Params from the URL path */
        params: PropTypes.shape({
            /** reportID passed via route: /r/:reportID/title */
            reportID: PropTypes.string,
        }),
    }),

    // /** The report currently being looked at */
    // report: reportPropTypes.isRequired,

    /** Current user session */
    session: PropTypes.shape({
        email: PropTypes.string.isRequired,
    }),

    /** Grab the Share destination of the Task */
    task: PropTypes.shape({
        /** Share destination of the Task */
        shareDestination: PropTypes.string,

        /** The task report if it's currently being edited */
        report: reportPropTypes,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    betas: [],
    personalDetails: {},
    reports: {},
    session: {},
    route: {},
    task: {},
};

function TaskAssigneeSelectorModal(props) {
    const styles = useThemeStyles();
    const [searchValue, setSearchValue] = useState('');
    const [headerMessage, setHeaderMessage] = useState('');
    const [filteredRecentReports, setFilteredRecentReports] = useState([]);
    const [filteredPersonalDetails, setFilteredPersonalDetails] = useState([]);
    const [filteredUserToInvite, setFilteredUserToInvite] = useState(null);
    const [filteredCurrentUserOption, setFilteredCurrentUserOption] = useState(null);
    const [isLoading, setIsLoading] = React.useState(true);

    const {inputCallbackRef} = useAutoFocusInput();

    const updateOptions = useCallback(() => {
        const {recentReports, personalDetails, userToInvite, currentUserOption} = OptionsListUtils.getFilteredOptions(
            props.reports,
            props.personalDetails,
            props.betas,
            searchValue.trim(),
            [],
            CONST.EXPENSIFY_EMAILS,
            false,
            true,
            false,
            {},
            [],
            false,
            {},
            [],
            false,
        );

        setHeaderMessage(OptionsListUtils.getHeaderMessage(recentReports?.length + personalDetails?.length !== 0 || currentUserOption, Boolean(userToInvite), searchValue));

        setFilteredUserToInvite(userToInvite);
        setFilteredRecentReports(recentReports);
        setFilteredPersonalDetails(personalDetails);
        setFilteredCurrentUserOption(currentUserOption);
        if (isLoading) {
            setIsLoading(false);
        }
    }, [props, searchValue, isLoading]);

    useEffect(() => {
        const debouncedSearch = _.debounce(updateOptions, 200);
        debouncedSearch();
        return () => {
            debouncedSearch.cancel();
        };
    }, [updateOptions]);

    const onChangeText = (newSearchTerm = '') => {
        setSearchValue(newSearchTerm);
    };

    const report = useMemo(() => {
        if (!props.route.params || !props.route.params.reportID) {
            return null;
        }
        return props.reports[`${ONYXKEYS.COLLECTION.REPORT}${props.route.params.reportID}`];
    }, [props.reports, props.route.params]);

    if (report && !ReportUtils.isTaskReport(report)) {
        Navigation.isNavigationReady().then(() => {
            Navigation.dismissModal(report.reportID);
        });
    }

    const sections = useMemo(() => {
        const sectionsList = [];
        let indexOffset = 0;

        if (filteredCurrentUserOption) {
            sectionsList.push({
                title: props.translate('newTaskPage.assignMe'),
                data: [filteredCurrentUserOption],
                shouldShow: true,
                indexOffset,
            });
            indexOffset += 1;
        }

        sectionsList.push({
            title: props.translate('common.recents'),
            data: filteredRecentReports,
            shouldShow: filteredRecentReports?.length > 0,
            indexOffset,
        });
        indexOffset += filteredRecentReports?.length;

        sectionsList.push({
            title: props.translate('common.contacts'),
            data: filteredPersonalDetails,
            shouldShow: filteredPersonalDetails?.length > 0,
            indexOffset,
        });
        indexOffset += filteredPersonalDetails?.length;

        if (filteredUserToInvite) {
            sectionsList.push({
                data: [filteredUserToInvite],
                shouldShow: true,
                indexOffset,
            });
        }

        return sectionsList;
    }, [filteredCurrentUserOption, filteredPersonalDetails, filteredRecentReports, filteredUserToInvite, props]);

    const selectReport = (option) => {
        if (!option) {
            return;
        }

        // Check to see if we're creating a new task
        // If there's no route params, we're creating a new task
        if (!props.route.params && option.accountID) {
            // Clear out the state value, set the assignee and navigate back to the NewTaskPage
            setSearchValue('');
            Task.setAssigneeValue(option.login, option.accountID, props.task.shareDestination, OptionsListUtils.isCurrentUser(option));
            return Navigation.goBack(ROUTES.NEW_TASK);
        }

        // Check to see if we're editing a task and if so, update the assignee
        if (report) {
            const assigneeChatReport = Task.setAssigneeValue(option.login, option.accountID, props.route.params.reportID, OptionsListUtils.isCurrentUser(option));

            // Pass through the selected assignee
            Task.editTaskAssigneeAndNavigate(report, props.session.accountID, option.login, option.accountID, assigneeChatReport);
        }
    };

    const isOpen = ReportUtils.isOpenTaskReport(report);
    const canModifyTask = Task.canModifyTask(report, props.currentUserPersonalDetails.accountID);
    const isTaskNonEditable = ReportUtils.isTaskReport(report) && (!canModifyTask || !isOpen);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={TaskAssigneeSelectorModal.displayName}
        >
            {({didScreenTransitionEnd, safeAreaPaddingBottomStyle}) => (
                <FullPageNotFoundView shouldShow={isTaskNonEditable}>
                    <HeaderWithBackButton
                        title={props.translate('task.assignee')}
                        onBackButtonPress={() => (lodashGet(props.route.params, 'reportID') ? Navigation.dismissModal() : Navigation.goBack(ROUTES.NEW_TASK))}
                    />
                    <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                        <OptionsSelector
                            sections={sections}
                            value={searchValue}
                            onSelectRow={selectReport}
                            onChangeText={onChangeText}
                            headerMessage={headerMessage}
                            showTitleTooltip
                            shouldShowOptions={didScreenTransitionEnd && !isLoading}
                            textInputLabel={props.translate('optionsSelector.nameEmailOrPhoneNumber')}
                            safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                            autoFocus={false}
                            ref={inputCallbackRef}
                        />
                    </View>
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
    );
}

TaskAssigneeSelectorModal.displayName = 'TaskAssigneeSelectorModal';
TaskAssigneeSelectorModal.propTypes = propTypes;
TaskAssigneeSelectorModal.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withCurrentUserPersonalDetails,
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
        task: {
            key: ONYXKEYS.TASK,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(TaskAssigneeSelectorModal);
