import Badge from '@components/Badge';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/ListItem/InviteMemberListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePressLoading from '@hooks/usePressLoading';
import useThemeStyles from '@hooks/useThemeStyles';

import {addReportApprover} from '@libs/actions/IOU/ReportWorkflow';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportChangeApproverParamList} from '@libs/Navigation/types';
import {sortAlphabetically} from '@libs/OptionsListUtils';
import {getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import {getDisplayNameForParticipant, hasViolations as hasViolationsReportUtils, isMoneyRequestReport, isMoneyRequestReportPendingDeletion} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React, {useState} from 'react';
import {View} from 'react-native';

import type {WithReportOrNotFoundProps} from './inbox/report/withReportOrNotFound';

import NotFoundPage from './ErrorPage/NotFoundPage';
import withReportOrNotFound from './inbox/report/withReportOrNotFound';

type ReportReassignApproverPageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportChangeApproverParamList, typeof SCREENS.REPORT_CHANGE_APPROVER.REASSIGN_APPROVER>;

type MemberListItem = ListItem & {
    /** Account ID of the workspace member */
    accountID: number;
};

function ReportReassignApproverPage({report, policy}: ReportReassignApproverPageProps) {
    const {translate, formatPhoneNumber, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);
    const [selectedMemberEmail, setSelectedMemberEmail] = useState<string>();
    const [hasError, setHasError] = useState(false);
    const {isLoading, startWithLoading} = usePressLoading();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const hasViolations = hasViolationsReportUtils(report?.reportID, transactionViolations, currentUserDetails.accountID, currentUserDetails.login ?? '');

    const employeeList = policy?.employeeList;
    const members = (() => {
        if (!employeeList) {
            return [];
        }

        const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(employeeList, true, false);
        const memberOptions = Object.values(employeeList)
            .map((employee): MemberListItem | null => {
                const email = employee.email;
                if (!email) {
                    return null;
                }

                const accountID = policyMemberEmailsToAccountIDs[email];

                // Filter out members pending deletion and members we cannot map to an account
                if (!accountID || employee.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                    return null;
                }

                const displayName = getDisplayNameForParticipant({accountID, personalDetailsData: personalDetails, formatPhoneNumber, translate});
                const {avatar} = personalDetails?.[accountID] ?? {};
                return {
                    text: displayName,
                    alternateText: email,
                    keyForList: email,
                    login: email,
                    accountID,
                    isSelected: selectedMemberEmail === email,
                    icons: [{source: avatar ?? icons.FallbackAvatar, type: CONST.ICON_TYPE_AVATAR, name: displayName, id: accountID}],
                    rightElement: employee.role === CONST.POLICY.ROLE.ADMIN ? <Badge text={translate('common.admin')} /> : undefined,
                };
            })
            .filter((member): member is MemberListItem => !!member);

        return sortAlphabetically(memberOptions, 'text', localeCompare);
    })();

    if (!isMoneyRequestReport(report) || isMoneyRequestReportPendingDeletion(report)) {
        return <NotFoundPage />;
    }

    const listHeader = (
        <View style={[styles.ph5, styles.mb5]}>
            <Text style={styles.textSupporting}>{translate('iou.changeApprover.actions.reassignApproverPageHeader')}</Text>
        </View>
    );

    const save = () => {
        const newApproverAccountID = members.find((member) => member.login === selectedMemberEmail)?.accountID;
        if (!selectedMemberEmail || !newApproverAccountID) {
            setHasError(true);
            return;
        }
        startWithLoading(() => {
            addReportApprover({
                report,
                newApproverEmail: selectedMemberEmail,
                newApproverAccountID,
                accountID: currentUserDetails.accountID,
                email: currentUserDetails.email ?? '',
                policy,
                hasViolations,
                isASAPSubmitBetaEnabled: isBetaEnabled(CONST.BETAS.ASAP_SUBMIT),
                isTrackIntentUser,
                formatPhoneNumber,
                isReassignment: true,
            });
            Navigation.dismissToPreviousRHP();
        });
    };

    const footerContent = (
        <FormAlertWithSubmitButton
            buttonText={translate('common.save')}
            onSubmit={save}
            isLoading={isLoading}
            isAlertVisible={hasError}
            message={translate('common.error.pleaseSelectOne')}
            shouldShowLoadingImmediatelyOnPress={false}
            containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
            enabledWhenOffline
            shouldBlendOpacity
        />
    );

    return (
        <ScreenWrapper
            testID="ReportReassignApproverPage"
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('iou.changeApprover.actions.reassignApprover')}
                onBackButtonPress={() => {
                    Navigation.goBack(createDynamicRoute(DYNAMIC_ROUTES.REPORT_CHANGE_APPROVER.path, ROUTES.REPORT_WITH_ID.getRoute(report.reportID)), {compareParams: false});
                }}
            />
            <SelectionList
                data={members}
                ListItem={InviteMemberListItem}
                customListHeader={listHeader}
                onSelectRow={(option) => {
                    setSelectedMemberEmail(option.keyForList);
                    setHasError(false);
                }}
                initiallyFocusedItemKey={selectedMemberEmail}
                footerContent={footerContent}
                shouldUpdateFocusedIndex
                isRowMultilineSupported
                showScrollIndicator
            />
        </ScreenWrapper>
    );
}

export default withReportOrNotFound()(ReportReassignApproverPage);
