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
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchShouldCalculateTotals from '@hooks/useSearchShouldCalculateTotals';
import useThemeStyles from '@hooks/useThemeStyles';

import {search} from '@libs/actions/Search';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import {getSearchValueForPhoneOrEmail, getUserToInviteOption, sortAlphabetically} from '@libs/OptionsListUtils';
import {getKnownAccountIDByLogin, getPersonalDetailsByID} from '@libs/PersonalDetailsUtils';
import {getAccountIDForSubmitManagerEmail, getMemberAccountIDsForWorkspace, getSubmitToEmail} from '@libs/PolicyUtils';
import {hasViolations as hasViolationsReportUtils, isExpenseReport, isMoneyRequestReportPendingDeletion} from '@libs/ReportUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import {expensifyLoginsSelector} from '@libs/UserUtils';

import variables from '@styles/variables';

import {submitReport} from '@userActions/IOU/ReportWorkflow';
import {searchUserInServer} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {personalDetailsLoginSelector} from '@src/selectors/PersonalDetails';
import type Policy from '@src/types/onyx/Policy';
import type Report from '@src/types/onyx/Report';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {RefObject} from 'react';
import type {OnyxEntry} from 'react-native-onyx';

import {delegateEmailSelector} from '@selectors/Account';
import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
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
    onSubmitWithManagerEmail?: (managerEmail: string, managerAccountID?: number) => void;
    /** When set, blocks submit after the popover is dismissed (prevents stale confirm / click-through). */
    canSubmitRef?: RefObject<boolean>;
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
}: ReportSubmitToContentProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare, dateFnsLocale} = useLocalize();
    const {getCurrencyDecimals} = useCurrencyListActions();
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
    const [submitterLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(report?.ownerAccountID)});
    const [loginList] = useOnyx(ONYXKEYS.LOGINS, {selector: expensifyLoginsSelector});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const {isOffline} = useNetwork();
    const {currentSearchQueryJSON, currentSearchKey} = useSearchQueryContext();
    const {currentSearchResults} = useSearchResultsContext();
    const shouldCalculateTotals = useSearchShouldCalculateTotals(currentSearchKey, currentSearchQueryJSON?.hash, true);
    const lazyIllustrations = useMemoizedLazyIllustrations(['PaperAirplane']);
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const hasViolations = hasViolationsReportUtils(report?.reportID, transactionViolations, currentUserDetails.accountID, currentUserDetails.login ?? '');

    const prepopulatedEmail = getSubmitToEmail(policy, report, submitterLogin);

    const [userSelectedManagerEmail, setUserSelectedManagerEmail] = useState<string | undefined>();
    const [extraSubmitToRecipients, setExtraSubmitToRecipients] = useState<WorkspaceMemberItem[]>([]);
    const [hasError, setHasError] = useState(false);
    // Never seed the selection from the default recipient. `prepopulatedEmail` still decides which rows are listed
    // (via `isPrepopulatedSubmitToRecipient` / `prepopulatedSubmitToRecipient`), but nothing is auto-selected, so the
    // submitter is no longer pre-picked and the "nothing selected" guard in `handleSubmit` becomes reachable.
    const managerEmail = userSelectedManagerEmail ?? '';

    const workspaceMembers = useMemo((): WorkspaceMemberItem[] => {
        const employeeList = policy?.employeeList;
        if (!employeeList) {
            return [];
        }
        const prepopulatedEmailLower = prepopulatedEmail?.trim().toLowerCase();
        const emailsToAccountIDs = getMemberAccountIDsForWorkspace(employeeList, true, false);
        return Object.values(employeeList).flatMap((employee): WorkspaceMemberItem[] => {
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
    }, [policy?.employeeList, personalDetails, managerEmail, currentUserDetails.accountID, prepopulatedEmail]);

    const prepopulatedSubmitToRecipient = useMemo((): WorkspaceMemberItem | null => {
        const email = prepopulatedEmail?.trim();
        if (!email) {
            return null;
        }

        const emailLower = email.toLowerCase();
        const isAlreadyListed =
            workspaceMembers.some((member) => member.email.toLowerCase() === emailLower) || extraSubmitToRecipients.some((member) => member.email.toLowerCase() === emailLower);

        if (isAlreadyListed) {
            return null;
        }

        const accountID = getKnownAccountIDByLogin(email);
        const details = getPersonalDetailsByID(accountID, personalDetails);

        return {
            accountID,
            text: details?.displayName ?? details?.login ?? email,
            alternateText: email,
            keyForList: `prepopulated:${email}`,
            email,
            isSelected: managerEmail.trim().toLowerCase() === emailLower,
        };
    }, [prepopulatedEmail, workspaceMembers, extraSubmitToRecipients, managerEmail, personalDetails]);

    const combinedSubmitToMembers = useMemo(() => {
        const workspaceEmailSet = new Set(workspaceMembers.map((m) => m.email.toLowerCase()));
        const extrasWithSelection = extraSubmitToRecipients.map((item) => ({
            ...item,
            isSelected: managerEmail.trim().toLowerCase() === item.email.trim().toLowerCase(),
        }));
        const extrasDeduped = extrasWithSelection.filter((item) => !workspaceEmailSet.has(item.email.toLowerCase()));
        const members = prepopulatedSubmitToRecipient ? [prepopulatedSubmitToRecipient, ...workspaceMembers, ...extrasDeduped] : [...workspaceMembers, ...extrasDeduped];
        return sortAlphabetically(members, 'text', localeCompare);
    }, [workspaceMembers, extraSubmitToRecipients, managerEmail, localeCompare, prepopulatedSubmitToRecipient]);

    const filteredWorkspaceMembers = useMemo(() => {
        if (!searchTerm.trim()) {
            return combinedSubmitToMembers;
        }
        const normalized = getSearchValueForPhoneOrEmail(searchTerm, countryCode);
        return tokenizedSearch(combinedSubmitToMembers, normalized, (item) => [item.text ?? '', item.alternateText ?? '', item.email]);
    }, [combinedSubmitToMembers, searchTerm, countryCode]);

    useEffect(() => {
        searchUserInServer(debouncedSearchTerm.trim());
    }, [debouncedSearchTerm]);

    const nonWorkspaceInviteRow = useMemo((): WorkspaceMemberItem | null => {
        const trimmed = searchTerm.trim();
        if (!trimmed || filteredWorkspaceMembers.length !== 0) {
            return null;
        }

        const inviteOption = getUserToInviteOption({
            dateFnsLocale,
            searchValue: trimmed,
            personalDetails,
            loginList,
            currentUserEmail: currentUserDetails.email ?? '',
            countryCode,
            selectedOptions: [],
            loginsToExclude: CONST.EXPENSIFY_EMAILS_OBJECT,
        });

        if (!inviteOption?.login) {
            return null;
        }

        const {login} = inviteOption;
        return {
            ...inviteOption,
            email: login,
            keyForList: `nonWorkspace:${login}`,
            isSelected: managerEmail.trim().toLowerCase() === login.trim().toLowerCase(),
        };
    }, [countryCode, currentUserDetails.email, searchTerm, filteredWorkspaceMembers.length, loginList, managerEmail, personalDetails, dateFnsLocale]);

    const submitToSelectionData = useMemo(() => {
        if (!nonWorkspaceInviteRow) {
            return filteredWorkspaceMembers;
        }
        return [nonWorkspaceInviteRow, ...filteredWorkspaceMembers];
    }, [filteredWorkspaceMembers, nonWorkspaceInviteRow]);

    const selectedSubmitToMember = useMemo((): WorkspaceMemberItem | undefined => {
        if (nonWorkspaceInviteRow?.isSelected) {
            return nonWorkspaceInviteRow;
        }
        return combinedSubmitToMembers.find((item) => item.isSelected);
    }, [combinedSubmitToMembers, nonWorkspaceInviteRow]);

    const noMatchingMembers = !!searchTerm.trim() && submitToSelectionData.length === 0;

    const textInputOptions = useMemo(
        () => ({
            value: searchTerm,
            label: translate('selectionList.nameEmailOrPhoneNumber'),
            onChangeText: setSearchTerm,
            headerMessage: noMatchingMembers ? translate('common.noResultsFound') : undefined,
        }),
        [searchTerm, setSearchTerm, translate, noMatchingMembers],
    );

    const hasSelectedSubmitToMember = !!selectedSubmitToMember;

    const handleSubmit = useCallback(() => {
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

        const resolvedManagerAccountID = selectedSubmitToMember?.accountID ?? getAccountIDForSubmitManagerEmail(trimmed, policy?.employeeList);

        if (onSubmitWithManagerEmail) {
            onSubmitWithManagerEmail(trimmed, resolvedManagerAccountID);
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
            policy,
            currentUserAccountIDParam: currentUserDetails.accountID,
            currentUserEmailParam: currentUserDetails.email ?? '',
            hasViolations,
            isASAPSubmitBetaEnabled,
            betas,
            userBillingGracePeriodEnds,
            amountOwed,
            ownerBillingGracePeriodEnd,
            delegateEmail,
            delegateAccountID,
            submitterLogin,
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
    }, [
        hasSelectedSubmitToMember,
        selectedSubmitToMember?.accountID,
        managerEmail,
        report,
        policy,
        currentUserDetails.accountID,
        currentUserDetails.email,
        hasViolations,
        isASAPSubmitBetaEnabled,
        betas,
        userBillingGracePeriodEnds,
        amountOwed,
        ownerBillingGracePeriodEnd,
        delegateEmail,
        delegateAccountID,
        submitterLogin,
        currentSearchQueryJSON,
        isOffline,
        currentSearchKey,
        shouldCalculateTotals,
        currentSearchResults?.search?.isLoading,
        onDismiss,
        onSubmitSuccess,
        onSubmitWithManagerEmail,
        canSubmitRef,
        shouldDismissRHPAfterSubmit,
        isTrackIntentUser,
        getCurrencyDecimals,
    ]);

    const onSelectMember = useCallback(
        (item: WorkspaceMemberItem) => {
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
        },
        [setSearchTerm, workspaceMembers],
    );

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

    const listEmptyContent = useMemo(() => {
        return (
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
    }, [
        errorContent,
        lazyIllustrations.PaperAirplane,
        styles.b0,
        styles.flex1,
        styles.l0,
        styles.mb2,
        styles.pAbsolute,
        styles.pb10,
        styles.r0,
        styles.textSupporting,
        styles.w100,
        translate,
    ]);

    const shouldShowNotFoundView = (isEmptyObject(policy) && !isLoadingReportData) || !isExpenseReport(report) || isMoneyRequestReportPendingDeletion(report);

    const confirmButtonOptions = useMemo(
        () => ({
            showButton: !keyboardActiveHeight || !isInLandscapeMode,
            text: translate('common.confirm'),
            onConfirm: handleSubmit,
            // Use the taller 52px button on the narrow (mobile) layout to match our large primary CTA size;
            // keep the compact 40px medium button on the wide/desktop popover.
            confirmButtonSize: shouldUseNarrowLayout ? ('large' as const) : ('medium' as const),
        }),
        [handleSubmit, translate, keyboardActiveHeight, isInLandscapeMode, shouldUseNarrowLayout],
    );

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
