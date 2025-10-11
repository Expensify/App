import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionListWithSections';
import RadioListItem from '@components/SelectionListWithSections/RadioListItem';
import type {ListItem} from '@components/SelectionListWithSections/types';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {assignReportToMe} from '@libs/actions/IOU';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportChangeApproverParamList} from '@libs/Navigation/types';
import Permissions from '@libs/Permissions';
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
    const [allBetas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const isASAPSubmitBetaEnabled = Permissions.isBetaEnabled(CONST.BETAS.ASAP_SUBMIT, allBetas);
    const hasViolations = hasViolationsReportUtils(report?.reportID, transactionViolations);

    const changeApprover = useCallback(() => {
        if (!selectedApproverType) {
            setHasError(true);
            return;
        }
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
        assignReportToMe(report, currentUserDetails.accountID, currentUserDetails.email ?? '', policy, hasViolations, isASAPSubmitBetaEnabled);
        Navigation.goBack(ROUTES.REPORT_WITH_ID.getRoute(reportID));
    }, [selectedApproverType, report, currentUserDetails.accountID, currentUserDetails.email, policy, hasViolations, isASAPSubmitBetaEnabled, reportID]);

    const sections = useMemo(() => {
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

        return [{data}];
    }, [translate, selectedApproverType, policy, report, currentUserDetails.accountID]);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundView = (isEmptyObject(policy) && !isLoadingReportData) || !isPolicyAdmin(policy) || !isMoneyRequestReport(report) || isMoneyRequestReportPendingDeletion(report);

    if (shouldShowNotFoundView) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            testID={ReportChangeApproverPage.displayName}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('iou.changeApprover.title')}
                onBackButtonPress={Navigation.goBack}
            />
            <SelectionList
                ListItem={RadioListItem}
                sections={sections}
                isAlternateTextMultilineSupported
                onSelectRow={(option) => {
                    if (!option.keyForList) {
                        return;
                    }
                    setSelectedApproverType(option.keyForList);
                    setHasError(false);
                }}
                showConfirmButton
                confirmButtonText={translate('iou.changeApprover.title')}
                onConfirm={changeApprover}
                customListHeader={
                    <>
                        <Text style={[styles.ph5, styles.mb5]}>{translate('iou.changeApprover.subtitle')}</Text>
                        <View style={[styles.ph5, styles.mb5, styles.renderHTML, styles.flexRow]}>
                            <RenderHTML html={translate('iou.changeApprover.description', {workflowSettingLink: `${environmentURL}/${ROUTES.WORKSPACE_WORKFLOWS.getRoute(policy?.id)}`})} />
                        </View>
                    </>
                }
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

ReportChangeApproverPage.displayName = 'ReportChangeApproverPage';

export default withReportOrNotFound()(ReportChangeApproverPage);
