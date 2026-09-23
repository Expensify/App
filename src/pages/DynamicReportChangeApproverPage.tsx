import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';

import {assignReportToMe} from '@libs/actions/IOU/ReportWorkflow';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportChangeApproverParamList} from '@libs/Navigation/types';
import {isControlPolicy, isPendingDeletePolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import {hasViolations as hasViolationsReportUtils, isAllowedToApproveExpenseReport, isMoneyRequestReport, isMoneyRequestReportPendingDeletion} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {ValueOf} from 'type-fest';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';

import type {WithReportOrNotFoundProps} from './inbox/report/withReportOrNotFound';

import NotFoundPage from './ErrorPage/NotFoundPage';
import withReportOrNotFound from './inbox/report/withReportOrNotFound';

const APPROVER_TYPE = {
    ADD_APPROVER: 'addApprover',
    BYPASS_APPROVER: 'bypassApprover',
    REASSIGN_APPROVER: 'reassignApprover',
} as const;

type ApproverType = ValueOf<typeof APPROVER_TYPE>;

type DynamicReportChangeApproverPageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportChangeApproverParamList, typeof SCREENS.REPORT_CHANGE_APPROVER.DYNAMIC_ROOT>;

function DynamicReportChangeApproverPage({report, policy, isLoadingReportData}: DynamicReportChangeApproverPageProps) {
    const {translate, formatPhoneNumber} = useLocalize();
    const styles = useThemeStyles();
    const {environmentURL} = useEnvironment();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const [selectedApproverType, setSelectedApproverType] = useState<ApproverType>(APPROVER_TYPE.ADD_APPROVER);
    const {isBetaEnabled} = usePermissions();
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const hasViolations = hasViolationsReportUtils(report?.reportID, transactionViolations, currentUserDetails.accountID, currentUserDetails.login ?? '');
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.REPORT_CHANGE_APPROVER.path);

    const goBack = () => {
        Navigation.goBack(backPath);
    };

    const changeApprover = useCallback(() => {
        if (selectedApproverType === APPROVER_TYPE.ADD_APPROVER) {
            if (policy && !isControlPolicy(policy)) {
                Navigation.navigate(
                    ROUTES.WORKSPACE_UPGRADE.getRoute(
                        policy.id,
                        CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.alias,
                        ROUTES.REPORT_CHANGE_APPROVER_ADD_APPROVER.getRoute(report.reportID),
                    ),
                );
                return;
            }
            Navigation.navigate(ROUTES.REPORT_CHANGE_APPROVER_ADD_APPROVER.getRoute(report.reportID));
            return;
        }
        if (selectedApproverType === APPROVER_TYPE.REASSIGN_APPROVER) {
            Navigation.navigate(ROUTES.REPORT_CHANGE_APPROVER_REASSIGN_APPROVER.getRoute(report.reportID));
            return;
        }

        assignReportToMe(report, currentUserDetails.accountID, currentUserDetails.email ?? '', policy, hasViolations, isASAPSubmitBetaEnabled, isTrackIntentUser, formatPhoneNumber, rules);
        Navigation.dismissToPreviousRHP();
    }, [selectedApproverType, report, currentUserDetails.accountID, currentUserDetails.email, policy, hasViolations, isASAPSubmitBetaEnabled, isTrackIntentUser, formatPhoneNumber, rules]);

    const approverTypes = useMemo(() => {
        const data: Array<ListItem<ApproverType>> = [
            {
                text: translate('iou.changeApprover.actions.addApprover'),
                keyForList: APPROVER_TYPE.ADD_APPROVER,
                alternateText: translate('iou.changeApprover.actions.addApproverSubtitle'),
                isSelected: selectedApproverType === APPROVER_TYPE.ADD_APPROVER,
            },
        ];

        const isCurrentUserManager = report.managerID === currentUserDetails.accountID;
        if (!isCurrentUserManager && isAllowedToApproveExpenseReport(report, currentUserDetails.accountID, policy)) {
            data.push({
                text: translate('iou.changeApprover.actions.bypassApprovers'),
                keyForList: APPROVER_TYPE.BYPASS_APPROVER,
                alternateText: translate('iou.changeApprover.actions.bypassApproversSubtitle'),
                isSelected: selectedApproverType === APPROVER_TYPE.BYPASS_APPROVER,
            });
        }

        if (isPolicyAdmin(policy) && !isPendingDeletePolicy(policy)) {
            data.push({
                text: translate('iou.changeApprover.actions.reassignApprover'),
                keyForList: APPROVER_TYPE.REASSIGN_APPROVER,
                alternateText: translate('iou.changeApprover.actions.reassignApproverSubtitle'),
                isSelected: selectedApproverType === APPROVER_TYPE.REASSIGN_APPROVER,
            });
        }

        return data;
    }, [translate, selectedApproverType, policy, report, currentUserDetails.accountID]);

    const shouldShowNotFoundView =
        (isEmptyObject(policy) && !isLoadingReportData) ||
        !isPolicyAdmin(policy) ||
        isPendingDeletePolicy(policy) ||
        !isMoneyRequestReport(report) ||
        isMoneyRequestReportPendingDeletion(report);

    const confirmButtonOptions = useMemo(
        () => ({
            showButton: true,
            text: translate('iou.changeApprover.title'),
            onConfirm: changeApprover,
        }),
        [changeApprover, translate],
    );

    const listHeader = useMemo(
        () => (
            <View style={[styles.ph5, styles.mb5, styles.renderHTML, styles.flexRow]}>
                <RenderHTML html={translate('iou.changeApprover.header', `${environmentURL}/${ROUTES.WORKSPACE_WORKFLOWS.getRoute(policy?.id, CONST.TAB.WORKFLOWS.APPROVALS)}`)} />
            </View>
        ),
        [environmentURL, policy?.id, styles.flexRow, styles.mb5, styles.ph5, styles.renderHTML, translate],
    );

    if (shouldShowNotFoundView) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            testID="DynamicReportChangeApproverPage"
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('iou.changeApprover.title')}
                onBackButtonPress={goBack}
            />
            <SelectionList
                data={approverTypes}
                ListItem={SingleSelectListItem}
                alternateNumberOfSupportedLines={2}
                onSelectRow={(option) => {
                    if (!option.keyForList) {
                        return;
                    }
                    setSelectedApproverType(option.keyForList);
                }}
                confirmButtonOptions={confirmButtonOptions}
                shouldUpdateFocusedIndex
                customListHeader={listHeader}
                initiallyFocusedItemKey={selectedApproverType}
            />
        </ScreenWrapper>
    );
}

export default withReportOrNotFound()(DynamicReportChangeApproverPage);
export {APPROVER_TYPE};
export type {ApproverType};
