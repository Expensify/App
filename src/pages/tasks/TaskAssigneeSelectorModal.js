/* eslint-disable es/no-optional-chaining */
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {usePersonalDetails} from '@components/OnyxProvider';
import OptionsSelector from '@components/OptionsSelector';
import ScreenWrapper from '@components/ScreenWrapper';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import reportPropTypes from '@pages/reportPropTypes';
import * as Task from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

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

    /** The policy of root parent report */
    rootParentReportPolicy: PropTypes.shape({
        /** The role of current user */
        role: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    betas: [],
    reports: {},
    session: {},
    route: {},
    task: {},
    rootParentReportPolicy: {},
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
    const allPersonalDetails = usePersonalDetails() || CONST.EMPTY_OBJECT;

    const {inputCallbackRef} = useAutoFocusInput();

    const updateOptions = useCallback(() => {
        const {recentReports, personalDetails, userToInvite, currentUserOption} = OptionsListUtils.getFilteredOptions(
            props.reports,
            allPersonalDetails,
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
            true,
        );

        setHeaderMessage(OptionsListUtils.getHeaderMessage(recentReports?.length + personalDetails?.length !== 0 || currentUserOption, Boolean(userToInvite), searchValue));

        setFilteredUserToInvite(userToInvite);
        setFilteredRecentReports(recentReports);
        setFilteredPersonalDetails(personalDetails);
        setFilteredCurrentUserOption(currentUserOption);
        if (isLoading) {
            setIsLoading(false);
        }
    }, [props, searchValue, allPersonalDetails, isLoading]);

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

    const selectReport = useCallback(
        (option) => {
            if (!option) {
                return;
            }

            // Check to see if we're editing a task and if so, update the assignee
            if (report) {
                if (option.accountID !== report.managerID) {
                    const assigneeChatReport = Task.setAssigneeValue(option.login, option.accountID, report.reportID, OptionsListUtils.isCurrentUser(option));

                    // Pass through the selected assignee
                    Task.editTaskAssignee(report, props.session.accountID, option.login, option.accountID, assigneeChatReport);
                }
                Navigation.dismissModal(report.reportID);
                // If there's no report, we're creating a new task
            } else if (option.accountID) {
                Task.setAssigneeValue(option.login, option.accountID, props.task.shareDestination, OptionsListUtils.isCurrentUser(option));
                Navigation.goBack(ROUTES.NEW_TASK);
            }
        },
        [props.session.accountID, props.task.shareDestination, report],
    );

    const isOpen = ReportUtils.isOpenTaskReport(report);
    const canModifyTask = Task.canModifyTask(report, props.currentUserPersonalDetails.accountID, lodashGet(props.rootParentReportPolicy, 'role', ''));
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
    withOnyx({
        rootParentReportPolicy: {
            key: ({reports, route}) => {
                const report = reports[`${ONYXKEYS.COLLECTION.REPORT}${route.params?.reportID || '0'}`];
                const rootParentReport = ReportUtils.getRootParentReport(report);
                return `${ONYXKEYS.COLLECTION.POLICY}${rootParentReport ? rootParentReport.policyID : '0'}`;
            },
            selector: (policy) => _.pick(policy, ['role']),
        },
    }),
)(TaskAssigneeSelectorModal);
