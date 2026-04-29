import {emailSelector} from '@selectors/Session';
import {validTransactionDraftIDsSelector} from '@selectors/TransactionDraft';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import PopoverMenu from '@components/PopoverMenu';
import useConfirmModal from '@hooks/useConfirmModal';
import useCreateEmptyReportConfirmation from '@hooks/useCreateEmptyReportConfirmation';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useHasEmptyReportsForPolicy from '@hooks/useHasEmptyReportsForPolicy';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import usePopoverPosition from '@hooks/usePopoverPosition';
import useThemeStyles from '@hooks/useThemeStyles';
import {startDistanceRequest, startMoneyRequest} from '@libs/actions/IOU';
import {openOldDotLink} from '@libs/actions/Link';
import {createNewReport} from '@libs/actions/Report';
import getIconForAction from '@libs/getIconForAction';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation from '@libs/Navigation/Navigation';
import {areAllGroupPoliciesExpenseChatDisabled, getDefaultChatEnabledPolicy} from '@libs/PolicyUtils';
import {generateReportID, hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {groupPaidPoliciesWithExpenseChatEnabledSelector} from '@src/selectors/Policy';
import type * as OnyxTypes from '@src/types/onyx';

function SearchActionsBarCreateButton() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Plus', 'Location', 'Document', 'Receipt', 'Coins', 'Cash', 'Transfer', 'MoneyCircle']);

    const createButtonRef = useRef<View>(null);
    const [isCreateMenuActive, setIsCreateMenuActive] = useState(false);
    const [createMenuPosition, setCreateMenuPosition] = useState<{horizontal: number; vertical: number}>({horizontal: 0, vertical: 0});
    const {calculatePopoverPosition} = usePopoverPosition();

    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [email] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const [allBetas] = useOnyx(ONYXKEYS.BETAS);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const groupPaidPoliciesWithChatEnabledSelector = useCallback((policies: OnyxCollection<OnyxTypes.Policy>) => groupPaidPoliciesWithExpenseChatEnabledSelector(policies, email), [email]);
    const [groupPoliciesWithChatEnabled = CONST.EMPTY_ARRAY] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: groupPaidPoliciesWithChatEnabledSelector}, [email]);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations, session?.accountID ?? CONST.DEFAULT_NUMBER_ID, session?.email ?? '');
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const {policyForMovingExpensesID, shouldSelectPolicy} = usePolicyForMovingExpenses();
    const shouldNavigateToUpgradePath = !policyForMovingExpensesID && !shouldSelectPolicy;
    const {showConfirmModal} = useConfirmModal();

    const shouldRedirectToExpensifyClassic = useMemo(() => {
        return areAllGroupPoliciesExpenseChatDisabled((allPolicies as OnyxCollection<OnyxTypes.Policy>) ?? {});
    }, [allPolicies]);

    const defaultChatEnabledPolicy = useMemo(
        () => getDefaultChatEnabledPolicy(groupPoliciesWithChatEnabled as Array<OnyxEntry<OnyxTypes.Policy>>, activePolicy),
        [activePolicy, groupPoliciesWithChatEnabled],
    );
    const defaultChatEnabledPolicyID = defaultChatEnabledPolicy?.id;

    const hasEmptyReport = useHasEmptyReportsForPolicy(defaultChatEnabledPolicyID);
    const [hasDismissedEmptyReportsConfirmation] = useOnyx(ONYXKEYS.NVP_EMPTY_REPORTS_CONFIRMATION_DISMISSED);
    const shouldShowEmptyReportConfirmationForDefaultChatEnabledPolicy = hasEmptyReport && hasDismissedEmptyReportsConfirmation !== true;

    const showRedirectToExpensifyClassicModal = useCallback(async () => {
        const {action} = await showConfirmModal({
            title: translate('sidebarScreen.redirectToExpensifyClassicModal.title'),
            prompt: translate('sidebarScreen.redirectToExpensifyClassicModal.description'),
            confirmText: translate('exitSurvey.goToExpensifyClassic'),
            cancelText: translate('common.cancel'),
        });
        if (action === ModalActions.CONFIRM) {
            openOldDotLink(CONST.OLDDOT_URLS.INBOX);
        }
    }, [showConfirmModal, translate]);

    const handleCreateWorkspaceReport = useCallback(
        (shouldDismissEmptyReportsConfirmation?: boolean) => {
            if (!defaultChatEnabledPolicy?.id) {
                return;
            }

            const {reportID: createdReportID} = createNewReport(
                currentUserPersonalDetails,
                hasViolations,
                isASAPSubmitBetaEnabled,
                defaultChatEnabledPolicy,
                allBetas,
                false,
                shouldDismissEmptyReportsConfirmation,
            );
            Navigation.setNavigationActionToMicrotaskQueue(() => {
                Navigation.navigate(
                    isSearchTopmostFullScreenRoute()
                        ? ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: createdReportID, backTo: Navigation.getActiveRoute()})
                        : ROUTES.REPORT_WITH_ID.getRoute(createdReportID, undefined, undefined, Navigation.getActiveRoute()),
                );
            });
        },
        [currentUserPersonalDetails, hasViolations, defaultChatEnabledPolicy, isASAPSubmitBetaEnabled, allBetas],
    );

    const {openCreateReportConfirmation} = useCreateEmptyReportConfirmation({
        policyID: defaultChatEnabledPolicyID,
        policyName: defaultChatEnabledPolicy?.name ?? '',
        onConfirm: handleCreateWorkspaceReport,
    });

    const hideCreateMenu = useCallback(() => setIsCreateMenuActive(false), []);
    const showCreateMenu = useCallback(() => {
        if (!createButtonRef.current) {
            return;
        }
        calculatePopoverPosition(createButtonRef, {
            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
        }).then((position) => {
            setCreateMenuPosition(position);
            setIsCreateMenuActive(true);
        });
    }, [calculatePopoverPosition]);

    const createMenuItems = useMemo(
        (): PopoverMenuItem[] => [
            {
                icon: getIconForAction(CONST.IOU.TYPE.CREATE, expensifyIcons),
                text: translate('iou.createExpense'),
                onSelected: () =>
                    interceptAnonymousUser(() => {
                        startMoneyRequest(CONST.IOU.TYPE.CREATE, generateReportID(), draftTransactionIDs);
                    }),
            },
            {
                icon: expensifyIcons.Location,
                text: translate('iou.trackDistance'),
                onSelected: () =>
                    interceptAnonymousUser(() => {
                        startDistanceRequest(CONST.IOU.TYPE.CREATE, generateReportID(), draftTransactionIDs);
                    }),
            },
            {
                icon: expensifyIcons.Document,
                text: translate('report.newReport.createReport'),
                onSelected: () =>
                    interceptAnonymousUser(() => {
                        if (shouldRedirectToExpensifyClassic) {
                            showRedirectToExpensifyClassicModal();
                            return;
                        }

                        // No valid policy at all → upgrade + create workspace flow
                        if (shouldNavigateToUpgradePath) {
                            const freshReportID = generateReportID();
                            const freshTransactionID = generateReportID();
                            Navigation.navigate(
                                ROUTES.MONEY_REQUEST_UPGRADE.getRoute({
                                    action: CONST.IOU.ACTION.CREATE,
                                    iouType: CONST.IOU.TYPE.CREATE,
                                    transactionID: freshTransactionID,
                                    reportID: freshReportID,
                                    upgradePath: CONST.UPGRADE_PATHS.REPORTS,
                                }),
                            );
                            return;
                        }

                        const workspaceIDForReportCreation = defaultChatEnabledPolicyID;

                        // No default or restricted with multiple workspaces → workspace selector
                        if (
                            !workspaceIDForReportCreation ||
                            (shouldRestrictUserBillableActions(
                                defaultChatEnabledPolicy,
                                ownerBillingGracePeriodEnd,
                                userBillingGracePeriodEnds,
                                amountOwed,
                                currentUserPersonalDetails.accountID,
                            ) &&
                                groupPoliciesWithChatEnabled.length > 1)
                        ) {
                            Navigation.navigate(ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute());
                            return;
                        }

                        // Default workspace is not restricted → create report directly
                        if (
                            !shouldRestrictUserBillableActions(
                                defaultChatEnabledPolicy,
                                ownerBillingGracePeriodEnd,
                                userBillingGracePeriodEnds,
                                amountOwed,
                                currentUserPersonalDetails.accountID,
                            )
                        ) {
                            // Check if empty report confirmation should be shown
                            if (shouldShowEmptyReportConfirmationForDefaultChatEnabledPolicy) {
                                openCreateReportConfirmation();
                            } else {
                                handleCreateWorkspaceReport(false);
                            }
                            return;
                        }

                        Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(workspaceIDForReportCreation));
                    }),
            },
        ],
        [
            translate,
            expensifyIcons,
            draftTransactionIDs,
            shouldRedirectToExpensifyClassic,
            showRedirectToExpensifyClassicModal,
            shouldNavigateToUpgradePath,
            groupPoliciesWithChatEnabled.length,
            defaultChatEnabledPolicyID,
            shouldShowEmptyReportConfirmationForDefaultChatEnabledPolicy,
            ownerBillingGracePeriodEnd,
            userBillingGracePeriodEnds,
            openCreateReportConfirmation,
            handleCreateWorkspaceReport,
            amountOwed,
            currentUserPersonalDetails.accountID,
            defaultChatEnabledPolicy,
        ],
    );

    return (
        <View style={[styles.searchActionsBarCreateButton]}>
            <PopoverMenu
                onClose={hideCreateMenu}
                isVisible={isCreateMenuActive}
                menuItems={createMenuItems}
                onItemSelected={hideCreateMenu}
                anchorRef={createButtonRef}
                anchorPosition={createMenuPosition}
                anchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                }}
            />
            <Button
                ref={createButtonRef}
                success
                small
                icon={expensifyIcons.Plus}
                text={translate('common.create')}
                onPress={showCreateMenu}
            />
        </View>
    );
}

SearchActionsBarCreateButton.displayName = 'SearchActionsBarCreateButton';

export default SearchActionsBarCreateButton;
