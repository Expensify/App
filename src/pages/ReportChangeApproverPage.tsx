import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import {assignReportToMe} from '@libs/actions/IOU';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportChangeApproverParamList} from '@libs/Navigation/types';
import {isControlPolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import {hasViolations as hasViolationsReportUtils, isAllowedToApproveExpenseReport, isMoneyRequestReport, isMoneyRequestReportPendingDeletion} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import NotFoundPage from './ErrorPage/NotFoundPage';
import type {WithReportOrNotFoundProps} from './home/report/withReportOrNotFound';
import withReportOrNotFound from './home/report/withReportOrNotFound';

const APPROVER_TYPE = {
    ADD_APPROVER: 'addApprover',
    BYPASS_APPROVER: 'bypassApprover',
} as const;

type ApproverType = ValueOf<typeof APPROVER_TYPE>;

type ReportChangeApproverPageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportChangeApproverParamList, typeof SCREENS.REPORT_CHANGE_APPROVER.ROOT>;

function ReportChangeApproverPage({report, policy, isLoadingReportData}: ReportChangeApproverPageProps) {
    const reportID = report?.reportID;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {environmentURL} = useEnvironment();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const [selectedApproverType, setSelectedApproverType] = useState<ApproverType>();
    const [hasError, setHasError] = useState(false);
    const {isBetaEnabled} = usePermissions();
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const hasViolations = hasViolationsReportUtils(report?.reportID, transactionViolations, currentUserDetails.accountID, currentUserDetails.login ?? '');
    const [reportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`, {canBeMissing: true});
    const hasAutoAppliedRef = useRef(false);
    const hasNavigatedToAddApproverRef = useRef(false);

    const changeApprover = useCallback(() => {
        if (!selectedApproverType) {
            setHasError(true);
            return;
        }
        if (selectedApproverType === APPROVER_TYPE.ADD_APPROVER) {
            hasNavigatedToAddApproverRef.current = true;
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
        assignReportToMe(report, currentUserDetails.accountID, currentUserDetails.email ?? '', policy, hasViolations, isASAPSubmitBetaEnabled, reportNextStep);
        Navigation.dismissToPreviousRHP();
    }, [selectedApproverType, report, currentUserDetails.accountID, currentUserDetails.email, policy, hasViolations, isASAPSubmitBetaEnabled, reportNextStep]);

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

        return data;
    }, [translate, selectedApproverType, policy, report, currentUserDetails.accountID]);

    useEffect(() => {
        if (selectedApproverType === undefined && approverTypes.length > 0) {
            setSelectedApproverType(approverTypes.at(0)?.keyForList);
            return;
        }

        if (!hasAutoAppliedRef.current && approverTypes.length === 1 && selectedApproverType === approverTypes.at(0)?.keyForList && !hasNavigatedToAddApproverRef.current) {
            hasAutoAppliedRef.current = true;
            changeApprover();
        }
    }, [approverTypes, selectedApproverType, changeApprover]);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundView = (isEmptyObject(policy) && !isLoadingReportData) || !isPolicyAdmin(policy) || !isMoneyRequestReport(report) || isMoneyRequestReportPendingDeletion(report);

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
                <RenderHTML
                    html={translate('iou.changeApprover.header', {
                        workflowSettingLink: `${environmentURL}/${ROUTES.WORKSPACE_WORKFLOWS.getRoute(policy?.id)}`,
                    })}
                />
            </View>
        ),
        [environmentURL, policy?.id, styles.flexRow, styles.mb5, styles.ph5, styles.renderHTML, translate],
    );

    if (shouldShowNotFoundView) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            testID="ReportChangeApproverPage"
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('iou.changeApprover.title')}
                onBackButtonPress={Navigation.goBack}
            />
            <SelectionList
                data={approverTypes}
                ListItem={RadioListItem}
                alternateNumberOfSupportedLines={2}
                onSelectRow={(option) => {
                    if (!option.keyForList) {
                        return;
                    }
                    setSelectedApproverType(option.keyForList);
                    setHasError(false);
                }}
                confirmButtonOptions={confirmButtonOptions}
                shouldUpdateFocusedIndex
                customListHeader={listHeader}
                initiallyFocusedItemKey={selectedApproverType}
            >
                {hasError && (
                    <FormHelpMessage
                        isError
                        style={[styles.ph5, styles.mb3]}
                        message={translate('common.error.pleaseSelectOne')}
                    />
                )}
            </SelectionList>
        </ScreenWrapper>
    );
}

export default withReportOrNotFound()(ReportChangeApproverPage);
