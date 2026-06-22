import {delegateEmailSelector} from '@selectors/Account';
import type {RefObject} from 'react';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import BlockingView from '@components/BlockingViews/BlockingView';
import FormHelpMessage from '@components/FormHelpMessage';
import {useSearchQueryContext, useSearchResultsContext} from '@components/Search/SearchContext';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/ListItem/InviteMemberListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
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
import type Policy from '@src/types/onyx/Policy';
import type Report from '@src/types/onyx/Report';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

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
    const {translate, localeCompare} = useLocalize();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [nextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${report?.reportID}`);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const [loginList] = useOnyx(ONYXKEYS.LOGINS, {selector: expensifyLoginsSelector});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const {isOffline} = useNetwork();
    const {currentSearchQueryJSON, currentSearchKey} = useSearchQueryContext();
    const {currentSearchResults} = useSearchResultsContext();
    const shouldCalculateTotals = useSearchShouldCalculateTotals(currentSearchKey, currentSearchQueryJSON?.hash, true);
    const lazyIllustrations = useMemoizedLazyIllustrations(['PaperAirplane']);
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const hasViolations = hasViolationsReportUtils(report?.reportID, transactionViolations, currentUserDetails.accountID, currentUserDetails.login ?? '');

    const prepopulatedEmail = useMemo(() => getSubmitToEmail(policy, report), [policy, report]);

    const [userSelectedManagerEmail, setUserSelectedManagerEmail] = useState<string | undefined>();
    const [extraSubmitToRecipients, setExtraSubmitToRecipients] = useState<WorkspaceMemberItem[]>([]);
    const [hasError, setHasError] = useState(false);
    const managerEmail = userSelectedManagerEmail ?? prepopulatedEmail;

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
        const details = accountID ? getPersonalDetailsByID(accountID, personalDetails) : undefined;

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
    }, [countryCode, currentUserDetails.email, searchTerm, filteredWorkspaceMembers.length, loginList, managerEmail, personalDetails]);

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
                    isOffline,
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
            expenseReport: report,
            policy,
            currentUserAccountIDParam: currentUserDetails.accountID,
            currentUserEmailParam: currentUserDetails.email ?? '',
            hasViolations,
            isASAPSubmitBetaEnabled,
            expenseReportCurrentNextStepDeprecated: nextStep,
            userBillingGracePeriodEnds,
            amountOwed,
            ownerBillingGracePeriodEnd,
            delegateEmail,
            managerEmail: trimmed,
            managerAccountID: resolvedManagerAccountID,
            onSubmitted: () => {
                if (currentSearchQueryJSON && !isOffline) {
                    search({
                        searchKey: currentSearchKey,
                        shouldCalculateTotals,
                        offset: 0,
                        queryJSON: currentSearchQueryJSON,
                        isOffline,
                        isLoading: !!currentSearchResults?.search?.isLoading,
                    });
                }
                onDismiss();
                onSubmitSuccess?.();
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
        nextStep,
        userBillingGracePeriodEnds,
        amountOwed,
        ownerBillingGracePeriodEnd,
        delegateEmail,
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

    const listEmptyContent = useMemo(() => {
        return (
            <BlockingView
                icon={lazyIllustrations.PaperAirplane}
                iconWidth={variables.iconSizeSuperLarge}
                iconHeight={variables.iconSizeSuperLarge}
                title={translate('iou.submitReportTo.sendExpense')}
                subtitle={translate('iou.submitReportTo.sendExpenseSubtitle')}
                subtitleStyle={styles.textSupporting}
                containerStyle={styles.pb10}
                contentFitImage="contain"
            />
        );
    }, [lazyIllustrations.PaperAirplane, styles.pb10, styles.textSupporting, translate]);

    const shouldShowNotFoundView = (isEmptyObject(policy) && !isLoadingReportData) || !isExpenseReport(report) || isMoneyRequestReportPendingDeletion(report);

    const confirmButtonOptions = useMemo(
        () => ({
            showButton: true,
            text: translate('common.confirm'),
            onConfirm: handleSubmit,
            confirmButtonSize: 'medium' as const,
        }),
        [handleSubmit, translate],
    );

    if (shouldShowNotFoundView) {
        return (
            <View style={[styles.ph5, styles.pv4]}>
                <Text style={[styles.textNormal]}>{translate('notFound.noAccess')}</Text>
            </View>
        );
    }

    return (
        <View style={[styles.w100, styles.flex1, styles.pt3, styles.pb3, {minHeight: CONST.POPOVER_REPORT_SUBMIT_TO_CONTENT_HEIGHT}]}>
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
                isRowMultilineSupported
                style={{containerStyle: styles.flex1}}
                disableMaintainingScrollPosition
            >
                {hasError && (
                    <FormHelpMessage
                        isError
                        style={[styles.ph5, styles.mb3]}
                        message={translate('common.error.pleaseSelectOne')}
                    />
                )}
            </SelectionList>
        </View>
    );
}

export default ReportSubmitToContent;
