/* eslint-disable es/no-optional-chaining */
import {useRoute} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import lodashPick from 'lodash/pick';
import PropTypes from 'prop-types';
import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useBetas, usePersonalDetails, useSession} from '@components/OnyxProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/UserListItem';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
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
    /** All reports shared with the user */
    reports: PropTypes.objectOf(reportPropTypes),

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
};

const defaultProps = {
    reports: {},
    task: {},
    rootParentReportPolicy: {},
};

function useOptions({reports}) {
    const allPersonalDetails = usePersonalDetails() || CONST.EMPTY_OBJECT;
    const betas = useBetas();
    const [isLoading, setIsLoading] = useState(true);
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');

    const options = useMemo(() => {
        const {recentReports, personalDetails, userToInvite, currentUserOption} = OptionsListUtils.getFilteredOptions(
            reports,
            allPersonalDetails,
            betas,
            debouncedSearchValue.trim(),
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

        const headerMessage = OptionsListUtils.getHeaderMessage(
            (recentReports.length || 0 + personalDetails.length || 0) !== 0 || currentUserOption,
            Boolean(userToInvite),
            debouncedSearchValue,
        );

        if (isLoading) {
            setIsLoading(false);
        }

        return {
            userToInvite,
            recentReports,
            personalDetails,
            currentUserOption,
            headerMessage,
        };
    }, [debouncedSearchValue, allPersonalDetails, isLoading, betas, reports]);

    return {...options, isLoading, searchValue, debouncedSearchValue, setSearchValue};
}

function TaskAssigneeSelectorModal({reports, task, rootParentReportPolicy}) {
    const styles = useThemeStyles();
    const route = useRoute();
    const {translate} = useLocalize();
    const session = useSession();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {userToInvite, recentReports, personalDetails, currentUserOption, isLoading, searchValue, setSearchValue, headerMessage} = useOptions({reports, task});

    const onChangeText = (newSearchTerm = '') => {
        setSearchValue(newSearchTerm);
    };

    const report = useMemo(() => {
        if (!route.params || !route.params.reportID) {
            return null;
        }
        if (report && !ReportUtils.isTaskReport(report)) {
            Navigation.isNavigationReady().then(() => {
                Navigation.dismissModal(report.reportID);
            });
        }
        return reports[`${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`];
    }, [reports, route]);

    const sections = useMemo(() => {
        const sectionsList = [];
        let indexOffset = 0;

        if (currentUserOption) {
            sectionsList.push({
                title: translate('newTaskPage.assignMe'),
                data: [currentUserOption],
                shouldShow: true,
                indexOffset,
            });
            indexOffset += 1;
        }

        sectionsList.push({
            title: translate('common.recents'),
            data: recentReports,
            shouldShow: recentReports?.length > 0,
            indexOffset,
        });
        indexOffset += recentReports?.length || 0;

        sectionsList.push({
            title: translate('common.contacts'),
            data: personalDetails,
            shouldShow: personalDetails?.length > 0,
            indexOffset,
        });
        indexOffset += personalDetails?.length || 0;

        if (userToInvite) {
            sectionsList.push({
                data: [userToInvite],
                shouldShow: true,
                indexOffset,
            });
        }

        return sectionsList;
    }, [currentUserOption, personalDetails, recentReports, userToInvite, translate]);

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
                    Task.editTaskAssignee(report, session.accountID, option.login, option.accountID, assigneeChatReport);
                }
                Navigation.dismissModal(report.reportID);
                // If there's no report, we're creating a new task
            } else if (option.accountID) {
                Task.setAssigneeValue(option.login, option.accountID, task.shareDestination, OptionsListUtils.isCurrentUser(option));
                Navigation.goBack(ROUTES.NEW_TASK);
            }
        },
        [session.accountID, task.shareDestination, report],
    );

    const handleBackButtonPress = useCallback(() => (lodashGet(route.params, 'reportID') ? Navigation.dismissModal() : Navigation.goBack(ROUTES.NEW_TASK)), [route.params]);

    const isOpen = ReportUtils.isOpenTaskReport(report);
    const canModifyTask = Task.canModifyTask(report, currentUserPersonalDetails.accountID, lodashGet(rootParentReportPolicy, 'role', ''));
    const isTaskNonEditable = ReportUtils.isTaskReport(report) && (!canModifyTask || !isOpen);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={TaskAssigneeSelectorModal.displayName}
        >
            {({didScreenTransitionEnd, safeAreaPaddingBottomStyle}) => (
                <FullPageNotFoundView shouldShow={isTaskNonEditable}>
                    <HeaderWithBackButton
                        title={translate('task.assignee')}
                        onBackButtonPress={handleBackButtonPress}
                    />
                    <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                        <SelectionList
                            sections={didScreenTransitionEnd && !isLoading ? sections : CONST.EMPTY_ARRAY}
                            ListItem={UserListItem}
                            onSelectRow={selectReport}
                            onChangeText={onChangeText}
                            textInputValue={searchValue}
                            headerMessage={headerMessage}
                            textInputLabel={translate('optionsSelector.nameEmailOrPhoneNumber')}
                            safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                            showLoadingPlaceholder={isLoading || !didScreenTransitionEnd}
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
    withOnyx({
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
        task: {
            key: ONYXKEYS.TASK,
        },
    }),
    withOnyx({
        rootParentReportPolicy: {
            key: ({reports, route}) => {
                const report = reports[`${ONYXKEYS.COLLECTION.REPORT}${route.params?.reportID || '0'}`];
                const rootParentReport = ReportUtils.getRootParentReport(report);
                return `${ONYXKEYS.COLLECTION.POLICY}${rootParentReport ? rootParentReport.policyID : '0'}`;
            },
            selector: (policy) => lodashPick(policy, ['role']),
        },
    }),
)(TaskAssigneeSelectorModal);
