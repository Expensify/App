import BlockingView from '@components/BlockingViews/BlockingView';
import FormHelpMessage from '@components/FormHelpMessage';
import {useSearchQueryContext, useSearchResultsContext} from '@components/Search/SearchContext';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/ListItem/InviteMemberListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useKeyboardState from '@hooks/useKeyboardState';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePersonalDetailByLogin, {useGetPersonalDetailsByLogin, usePersonalDetailsByLogins} from '@hooks/usePersonalDetailByLogin';
import {useAllPersonalDetails} from '@hooks/usePersonalDetails';
import useReportTransactions from '@hooks/useReportTransactions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchShouldCalculateTotals from '@hooks/useSearchShouldCalculateTotals';
import useThemeStyles from '@hooks/useThemeStyles';

import {search} from '@libs/actions/Search';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import {getSearchValueForPhoneOrEmail, getUserToInviteOption} from '@libs/OptionsListUtils';
import {getLoginByAccountID, getPersonalDetailsByID} from '@libs/PersonalDetailsUtils';
import {getAccountIDForSubmitManagerEmail, getMemberAccountIDsForWorkspace, getSubmitToEmail} from '@libs/PolicyUtils';
import {hasViolations as hasViolationsReportUtils, isExpenseReport, isMoneyRequestReportPendingDeletion} from '@libs/ReportUtils';
import sortAlphabetically from '@libs/sortAlphabetically';
import tokenizedSearch from '@libs/tokenizedSearch';
import {expensifyLoginsSelector} from '@libs/UserUtils';

import variables from '@styles/variables';

import {submitReport} from '@userActions/IOU/ReportWorkflow';
import {searchUserInServer} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Policy from '@src/types/onyx/Policy';
import type Report from '@src/types/onyx/Report';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {RefObject} from 'react';
import type {OnyxEntry} from 'react-native-onyx';

import {delegateEmailSelector} from '@selectors/Account';
import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

type WorkspaceMemberItem = ListItem & {email: string; accountID?: number};

type ReportSubmitToContentProps = {
    report: OnyxEntry<Report>;
    policy: OnyxEntry<Policy>;
    isLoadingReportData: OnyxEntry<boolean>;
    onDismiss: () => void;
    /** Called after submit API path invokes success (e.g. primary-action payment animation). */
    onSubmitSuccess?: () => void;
    /** When false, skips closing the RHP stack after submit (e.g. submit-to popover on report screen). */
    shouldDismissRHPAfterSubmit?: boolean;
    /** When set (e.g. Search row submit), called with the selected submit-to email instead of `submitReport`. */
    onSubmitWithManagerEmail?: (managerEmail: string, managerAccountID?: number, shouldResolveAcknowledgedViolations?: boolean) => void;
    /** When set, blocks submit after the popover is dismissed (prevents stale confirm / click-through). */
    canSubmitRef?: RefObject<boolean>;
    /**
     * Resolved by the caller's own `confirmSubmitReportViolations` call before this popover opened (iOS can't present
     * the violations modal while this popover is still open), so this component must not run that check itself.
     */
    shouldResolveAcknowledgedViolations?: boolean;
};

function ReportSubmitToContent({
    report,
    policy,
    isLoadingReportData,
    onDismiss,
    onSubmitSuccess,
    shouldDismissRHPAfterSubmit = true,
    onSubmitWithManagerEmail,
    canSubmitRef,
    shouldResolveAcknowledgedViolations,
}: ReportSubmitToContentProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare, dateFnsLocale, formatPhoneNumber} = useLocalize();
    const {getCurrencyDecimals, convertToDisplayString} = useCurrencyListActions();
    const isInLandscapeMode = useIsInLandscapeMode();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {keyboardActiveHeight, isKeyboardActive} = useKeyboardState();

    const currentUserDetails = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const delegateAccountID = useDelegateAccountID();
    const [loginList] = useOnyx(ONYXKEYS.LOGINS, {selector: expensifyLoginsSelector});
    const [personalDetails] = useAllPersonalDetails();
    const submitterLogin = getLoginByAccountID(report?.ownerAccountID, personalDetails);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const getPersonalDetailsByLogin = useGetPersonalDetailsByLogin();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const {isOffline} = useNetwork();
    const {currentSearchQueryJSON, currentSearchKey} = useSearchQueryContext();
    const {currentSearchResults} = useSearchResultsContext();
    const shouldCalculateTotals = useSearchShouldCalculateTotals(currentSearchKey, true);
    const lazyIllustrations = useMemoizedLazyIllustrations(['PaperAirplane']);
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const hasViolations = hasViolationsReportUtils(report?.reportID, transactionViolations, currentUserDetails.accountID, currentUserDetails.login ?? '');
    const reportTransactions = useReportTransactions(report?.reportID);

    const prepopulatedEmail = getSubmitToEmail(policy, report, submitterLogin, rules);
    const prepopulatedAccountID = usePersonalDetailByLogin(prepopulatedEmail?.trim(), (details) => details?.accountID);

    const [userSelectedManagerEmail, setUserSelectedManagerEmail] = useState<string | undefined>();
    const [extraSubmitToRecipients, setExtraSubmitToRecipients] = useState<WorkspaceMemberItem[]>([]);
    const [hasError, setHasError] = useState(false);
    // Never seed the selection from the default recipient. `prepopulatedEmail` still decides which rows are listed
    // (via `isPrepopulatedSubmitToRecipient` / `prepopulatedSubmitToRecipient`), but nothing is auto-selected, so the
    // submitter is no longer pre-picked and the "nothing selected" guard in `handleSubmit` becomes reachable.
    const managerEmail = userSelectedManagerEmail ?? '';

    const employeePersonalDetails = usePersonalDetailsByLogins([...Object.keys(policy?.employeeList ?? {}), managerEmail]);

    let workspaceMembers: WorkspaceMemberItem[];
    const employeeList = policy?.employeeList;
    if (!employeeList) {
        workspaceMembers = [];
    } else {
        const prepopulatedEmailLower = prepopulatedEmail?.trim().toLowerCase();
        const emailsToAccountIDs = getMemberAccountIDsForWorkspace(employeeList, employeePersonalDetails, true, false);
        workspaceMembers = Object.values(employeeList).flatMap((employee): WorkspaceMemberItem[] => {
            const email = employee.email?.trim();
            if (!email || employee.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                return [];
            }
            const accountID = emailsToAccountIDs[email];
            const isPrepopulatedSubmitToRecipient = !!prepopulatedEmailLower && email.toLowerCase() === prepopulatedEmailLower;
            const isCurrentUser = accountID === currentUserDetails.accountID;
            if (!accountID || (isCurrentUser && !isPrepopulatedSubmitToRecipient)) {
                return [];
            }
            const details = personalDetails?.[accountID];
            const displayName = details?.displayName ?? details?.login ?? email;
            return [
                {
                    accountID,
                    text: displayName,
                    alternateText: email,
                    keyForList: email,
                    email,
                    isSelected: managerEmail.trim().toLowerCase() === email.toLowerCase(),
                },
            ];
        });
    }

    let prepopulatedSubmitToRecipient: WorkspaceMemberItem | null;
    const email = prepopulatedEmail?.trim();
    if (!email) {
        prepopulatedSubmitToRecipient = null;
    } else {
        const emailLower = email.toLowerCase();
        const isAlreadyListed =
            workspaceMembers.some((member) => member.email.toLowerCase() === emailLower) || extraSubmitToRecipients.some((member) => member.email.toLowerCase() === emailLower);
        if (isAlreadyListed) {
            prepopulatedSubmitToRecipient = null;
        } else {
            const details = getPersonalDetailsByID(prepopulatedAccountID, personalDetails);
            prepopulatedSubmitToRecipient = {
                accountID: prepopulatedAccountID,
                text: details?.displayName ?? details?.login ?? email,
                alternateText: email,
                keyForList: `prepopulated:${email}`,
                email,
                isSelected: managerEmail.trim().toLowerCase() === emailLower,
            };
        }
    }

    const workspaceEmailSet = new Set(workspaceMembers.map((m) => m.email.toLowerCase()));
    const extrasWithSelection = extraSubmitToRecipients.map((item) => ({
        ...item,
        isSelected: managerEmail.trim().toLowerCase() === item.email.trim().toLowerCase(),
    }));
    const extrasDeduped = extrasWithSelection.filter((item) => !workspaceEmailSet.has(item.email.toLowerCase()));
    const members = prepopulatedSubmitToRecipient ? [prepopulatedSubmitToRecipient, ...workspaceMembers, ...extrasDeduped] : [...workspaceMembers, ...extrasDeduped];
    const combinedSubmitToMembers = sortAlphabetically(members, 'text', localeCompare);

    let filteredWorkspaceMembers;
    if (!searchTerm.trim()) {
        filteredWorkspaceMembers = combinedSubmitToMembers;
    } else {
        const normalized = getSearchValueForPhoneOrEmail(searchTerm, countryCode);
        filteredWorkspaceMembers = tokenizedSearch(combinedSubmitToMembers, normalized, (item) => [item.text ?? '', item.alternateText ?? '', item.email]);
    }

    useEffect(() => {
        searchUserInServer(debouncedSearchTerm.trim());
    }, [debouncedSearchTerm]);

    let nonWorkspaceInviteRow: WorkspaceMemberItem | null;
    const trimmedSearchTerm = searchTerm.trim();
    if (!trimmedSearchTerm || filteredWorkspaceMembers.length !== 0) {
        nonWorkspaceInviteRow = null;
    } else {
        const inviteOption = getUserToInviteOption({
            dateFnsLocale,
            convertToDisplayString,
            searchValue: trimmedSearchTerm,
            personalDetails,
            loginList,
            currentUserEmail: currentUserDetails.email ?? '',
            currentUserAccountID: currentUserDetails.accountID,
            countryCode,
            selectedOptions: [],
            loginsToExclude: CONST.EXPENSIFY_EMAILS_OBJECT,
            rules,
            formatPhoneNumber,
        });
        if (!inviteOption?.login) {
            nonWorkspaceInviteRow = null;
        } else {
            const {login} = inviteOption;
            nonWorkspaceInviteRow = {
                ...inviteOption,
                email: login,
                keyForList: `nonWorkspace:${login}`,
                isSelected: managerEmail.trim().toLowerCase() === login.trim().toLowerCase(),
            };
        }
    }

    const submitToSelectionData = !nonWorkspaceInviteRow ? filteredWorkspaceMembers : [nonWorkspaceInviteRow, ...filteredWorkspaceMembers];

    const selectedSubmitToMember: WorkspaceMemberItem | undefined = nonWorkspaceInviteRow?.isSelected ? nonWorkspaceInviteRow : combinedSubmitToMembers.find((item) => item.isSelected);

    const noMatchingMembers = !!searchTerm.trim() && submitToSelectionData.length === 0;

    const textInputOptions = {
        value: searchTerm,
        label: translate('selectionList.nameEmailOrPhoneNumber'),
        onChangeText: setSearchTerm,
        headerMessage: noMatchingMembers ? translate('common.noResultsFound') : undefined,
    };

    const hasSelectedSubmitToMember = !!selectedSubmitToMember;

    const handleSubmit = () => {
        if (canSubmitRef && !canSubmitRef.current) {
            return;
        }

        if (!hasSelectedSubmitToMember) {
            setHasError(true);
            return;
        }

        const trimmed = managerEmail.trim();
        if (!report || !trimmed) {
            return;
        }

        setHasError(false);

        const resolvedManagerAccountID = selectedSubmitToMember?.accountID ?? getAccountIDForSubmitManagerEmail(trimmed, policy?.employeeList, employeePersonalDetails);

        if (onSubmitWithManagerEmail) {
            onSubmitWithManagerEmail(trimmed, resolvedManagerAccountID, shouldResolveAcknowledgedViolations);
            if (currentSearchQueryJSON && !isOffline) {
                search({
                    searchKey: currentSearchKey,
                    shouldCalculateTotals,
                    offset: 0,
                    queryJSON: currentSearchQueryJSON,
                    isLoading: !!currentSearchResults?.search?.isLoading,
                });
            }
            onDismiss();
            onSubmitSuccess?.();
            if (shouldDismissRHPAfterSubmit) {
                Navigation.dismissToPreviousRHP();
            }
            return;
        }

        submitReport({
            getCurrencyDecimals,
            expenseReport: report,
            expenseReportTransactions: reportTransactions,
            policy,
            rules,
            currentUserAccountIDParam: currentUserDetails.accountID,
            currentUserEmailParam: currentUserDetails.email ?? '',
            hasViolations,
            isASAPSubmitBetaEnabled,
            userBillingGracePeriodEnds,
            amountOwed,
            shouldResolveAcknowledgedViolations,
            ownerBillingGracePeriodEnd,
            delegateEmail,
            delegateAccountID,
            submitterLogin,
            personalDetailsByLogins: getPersonalDetailsByLogin(),
            managerEmail: trimmed,
            managerAccountID: resolvedManagerAccountID,
            isTrackIntentUser,
            onSubmitted: () => {
                if (currentSearchQueryJSON && !isOffline) {
                    search({
                        searchKey: currentSearchKey,
                        shouldCalculateTotals,
                        offset: 0,
                        queryJSON: currentSearchQueryJSON,
                        isLoading: !!currentSearchResults?.search?.isLoading,
                    });
                }
                onSubmitSuccess?.();
                onDismiss();
                if (shouldDismissRHPAfterSubmit) {
                    Navigation.dismissToPreviousRHP();
                }
            },
        });
    };

    const onSelectMember = (item: WorkspaceMemberItem) => {
        setHasError(false);
        setUserSelectedManagerEmail(item.email);
        setSearchTerm('');

        const itemEmailLower = item.email.trim().toLowerCase();
        const isAlreadyWorkspaceMember = workspaceMembers.some((member) => member.email.toLowerCase() === itemEmailLower);
        if (isAlreadyWorkspaceMember) {
            return;
        }

        setExtraSubmitToRecipients((previous) => {
            if (previous.some((member) => member.email.toLowerCase() === itemEmailLower)) {
                return previous;
            }
            const {isSelected, ...memberWithoutSelection} = item;
            return [
                ...previous,
                {
                    ...memberWithoutSelection,
                    keyForList: item.keyForList?.startsWith('nonWorkspace:') ? item.keyForList : `nonWorkspace:${item.email}`,
                },
            ];
        });
    };

    // Extracted so the same error can render both here (as `SelectionList` children, shown on the non-empty state)
    // and inside `listEmptyContent` below (shown on the empty / "No results found" state). `BaseSelectionList`
    // only renders `{children}` in its non-empty branch, so children alone would vanish when a search filters
    // every recipient out while Confirm stays live.
    const errorContent = hasError && (
        <FormHelpMessage
            isError
            style={[styles.ph5, styles.mb3]}
            message={translate('iou.submitReportTo.selectRecipientError')}
        />
    );

    const listEmptyContent = (
        <View style={[styles.flex1, styles.w100]}>
            <BlockingView
                icon={lazyIllustrations.PaperAirplane}
                iconWidth={variables.iconSizeSuperLarge}
                iconHeight={variables.iconSizeSuperLarge}
                title={translate('iou.submitReportTo.sendExpense')}
                subtitle={translate('iou.submitReportTo.sendExpenseSubtitle')}
                subtitleStyle={styles.textSupporting}
                // `notFoundTextHeader` spaces the title with `marginVertical: 20`, which is wider than the 8px gap
                // used between a headline and its paragraph elsewhere. Only the bottom edge is narrowed here.
                titleStyles={styles.mb2}
                containerStyle={styles.pb10}
                contentFitImage="contain"
            />
            {/* Taken out of the layout flow so revealing the error can't shrink the centred BlockingView above and
                    shove the illustration upwards. The 40px `pb10` already reserves the room this occupies. */}
            <View style={[styles.pAbsolute, styles.b0, styles.l0, styles.r0]}>{errorContent}</View>
        </View>
    );

    const shouldShowNotFoundView = (isEmptyObject(policy) && !isLoadingReportData) || !isExpenseReport(report) || isMoneyRequestReportPendingDeletion(report);

    const confirmButtonOptions = {
        showButton: !keyboardActiveHeight || !isInLandscapeMode,
        text: translate('common.confirm'),
        onConfirm: handleSubmit,
        // Use the taller 52px button on the narrow (mobile) layout to match our large primary CTA size;
        // keep the compact 40px medium button on the wide/desktop popover.
        confirmButtonSize: shouldUseNarrowLayout ? ('large' as const) : ('medium' as const),
    };

    // `flex1` fills the popover height owned by the wrapper `View` in `useReportSubmitToPopover`, so the recipient list
    // scrolls inside a constant-size popover rather than resizing it on the empty state. No bottom padding here because
    // `FixedFooter` already pads below the Confirm button.
    const containerStyle = [styles.w100, styles.flex1, styles.pt3];

    if (shouldShowNotFoundView) {
        return (
            <View style={[styles.ph5, styles.pv4]}>
                <Text style={[styles.textNormal]}>{translate('notFound.noAccess')}</Text>
            </View>
        );
    }

    return (
        <View style={containerStyle}>
            <SelectionList
                data={submitToSelectionData}
                ListItem={InviteMemberListItem}
                onSelectRow={onSelectMember}
                confirmButtonOptions={confirmButtonOptions}
                listEmptyContent={listEmptyContent}
                textInputOptions={textInputOptions}
                shouldShowTextInput
                shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                shouldSingleExecuteRowSelect
                initiallyFocusedItemKey={submitToSelectionData.find((m) => m.isSelected)?.keyForList}
                style={{containerStyle: styles.flex1}}
                disableMaintainingScrollPosition
                addBottomSafeAreaPadding={!isInLandscapeMode && !isKeyboardActive}
            >
                {errorContent}
            </SelectionList>
        </View>
    );
}

export default ReportSubmitToContent;
