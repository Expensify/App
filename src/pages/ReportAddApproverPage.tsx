import debounce from 'lodash/debounce';
import React, {useCallback, useMemo, useState} from 'react';
import Badge from '@components/Badge';
import BlockingView from '@components/BlockingViews/BlockingView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionListWithSections';
import InviteMemberListItem from '@components/SelectionListWithSections/InviteMemberListItem';
import Text from '@components/Text';
import type {SelectionListApprover} from '@components/WorkspaceMembersSelectionList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {addReportApprover} from '@libs/actions/IOU';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportChangeApproverParamList} from '@libs/Navigation/types';
import {getSearchValueForPhoneOrEmail, sortAlphabetically} from '@libs/OptionsListUtils';
import {getMemberAccountIDsForWorkspace, isPolicyAdmin} from '@libs/PolicyUtils';
import {getDisplayNameForParticipant, isAllowedToApproveExpenseReport, isMoneyRequestReport, isMoneyRequestReportPendingDeletion} from '@libs/ReportUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import NotFoundPage from './ErrorPage/NotFoundPage';
import type {WithReportOrNotFoundProps} from './home/report/withReportOrNotFound';
import withReportOrNotFound from './home/report/withReportOrNotFound';

type ReportAddApproverPageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportChangeApproverParamList, typeof SCREENS.REPORT_CHANGE_APPROVER.ADD_APPROVER>;

function ReportAddApproverPage({report, isLoadingReportData, policy}: ReportAddApproverPageProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [selectedApproverEmail, setSelectedApproverEmail] = useState<string | undefined>(undefined);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const [countryCode] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});

    const currentUserDetails = useCurrentUserPersonalDetails();

    const [allApprovers, setAllApprovers] = useState<SelectionListApprover[]>([]);
    const shouldShowTextInput = allApprovers?.length >= CONST.STANDARD_LIST_ITEM_LIMIT;

    const employeeList = policy?.employeeList;
    const sections = useMemo(() => {
        const approvers: SelectionListApprover[] = [];

        if (employeeList) {
            const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(employeeList, true, false);
            const availableApprovers = Object.values(employeeList)
                .map((employee): SelectionListApprover | null => {
                    const isAdmin = employee?.role === CONST.REPORT.ROLE.ADMIN;
                    const email = employee.email;

                    if (!email) {
                        return null;
                    }
                    const accountID = Number(policyMemberEmailsToAccountIDs[email] ?? CONST.DEFAULT_NUMBER_ID);
                    const isPendingDelete = employeeList?.[accountID]?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

                    // Filter the current report approver and members which are pending for deletion
                    if (report.managerID === accountID || isPendingDelete || !isAllowedToApproveExpenseReport(report, accountID, policy)) {
                        return null;
                    }

                    const {avatar} = personalDetails?.[accountID] ?? {};
                    const displayName = getDisplayNameForParticipant({accountID, personalDetailsData: personalDetails});
                    return {
                        text: displayName,
                        alternateText: email,
                        keyForList: email,
                        isSelected: selectedApproverEmail === email,
                        login: email,
                        value: accountID,
                        icons: [{source: avatar ?? FallbackAvatar, type: CONST.ICON_TYPE_AVATAR, name: displayName, id: accountID}],
                        rightElement: isAdmin ? <Badge text={translate('common.admin')} /> : undefined,
                    };
                })
                .filter((approver): approver is SelectionListApprover => !!approver);

            approvers.push(...availableApprovers);
            // eslint-disable-next-line react-compiler/react-compiler
            setAllApprovers(approvers);
        }

        const filteredApprovers =
            debouncedSearchTerm !== ''
                ? tokenizedSearch(approvers, getSearchValueForPhoneOrEmail(debouncedSearchTerm, countryCode), (option) => [option.text ?? '', option.login ?? ''])
                : approvers;

        const data = sortAlphabetically(filteredApprovers, 'text', localeCompare);
        return [
            {
                title: undefined,
                data,
                shouldShow: true,
            },
        ];
    }, [employeeList, debouncedSearchTerm, countryCode, localeCompare, report, policy, personalDetails, selectedApproverEmail, translate]);

    const shouldShowListEmptyContent = !debouncedSearchTerm && !sections.at(0)?.data.length;

    const addApprover = useCallback(() => {
        const employeeAccountID = allApprovers.find((approver) => approver.login === selectedApproverEmail)?.value;
        if (!selectedApproverEmail || !employeeAccountID) {
            return;
        }
        addReportApprover(report, selectedApproverEmail, Number(employeeAccountID), currentUserDetails.accountID);
        Navigation.dismissModal();
    }, [allApprovers, selectedApproverEmail, report, currentUserDetails.accountID]);

    const button = useMemo(() => {
        return (
            <FormAlertWithSubmitButton
                isDisabled={!selectedApproverEmail}
                buttonText={translate('common.save')}
                onSubmit={addApprover}
                containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                enabledWhenOffline
                shouldBlendOpacity
            />
        );
    }, [addApprover, selectedApproverEmail, styles.flexBasisAuto, styles.flexGrow0, styles.flexReset, styles.flexShrink0, translate]);

    const toggleApprover = useCallback(
        (approver: SelectionListApprover) =>
            debounce(() => {
                if (selectedApproverEmail === approver.login) {
                    setSelectedApproverEmail(undefined);
                    return;
                }
                setSelectedApproverEmail(approver.login);
            }, 200)(),
        [selectedApproverEmail],
    );

    const headerMessage = useMemo(() => (searchTerm && !sections.at(0)?.data?.length ? translate('common.noResultsFound') : ''), [searchTerm, sections, translate]);

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={Illustrations.TurtleInShell}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workflowsPage.emptyContent.title')}
                subtitle={translate('workflowsPage.emptyContent.approverSubtitle')}
                subtitleStyle={styles.textSupporting}
                containerStyle={styles.pb10}
                contentFitImage="contain"
            />
        ),
        [translate, styles.textSupporting, styles.pb10],
    );

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundView = (isEmptyObject(policy) && !isLoadingReportData) || !isPolicyAdmin(policy) || !isMoneyRequestReport(report) || isMoneyRequestReportPendingDeletion(report);

    if (shouldShowNotFoundView) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            testID={ReportAddApproverPage.displayName}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <HeaderWithBackButton
                title={translate('iou.changeApprover.actions.addApprover')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.REPORT_CHANGE_APPROVER.getRoute(report.reportID), {compareParams: false});
                }}
            />
            <Text style={[styles.ph5, styles.pb3]}>{translate('iou.changeApprover.addApprover.subtitle')}</Text>
            <SelectionList
                sections={sections}
                ListItem={InviteMemberListItem}
                textInputLabel={shouldShowListEmptyContent ? undefined : translate('selectionList.findMember')}
                textInputValue={searchTerm}
                onChangeText={setSearchTerm}
                headerMessage={headerMessage}
                onSelectRow={toggleApprover}
                showScrollIndicator
                shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                footerContent={button}
                listEmptyContent={listEmptyContent}
                shouldShowListEmptyContent={shouldShowListEmptyContent}
                initiallyFocusedOptionKey={selectedApproverEmail}
                shouldUpdateFocusedIndex
                shouldShowTextInput={shouldShowTextInput}
                addBottomSafeAreaPadding
            />
        </ScreenWrapper>
    );
}

ReportAddApproverPage.displayName = 'ReportAddApproverPage';

export default withReportOrNotFound()(ReportAddApproverPage);
