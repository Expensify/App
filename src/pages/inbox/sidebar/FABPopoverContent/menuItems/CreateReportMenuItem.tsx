import {groupPaidPoliciesWithExpenseChatEnabledSelector} from '@selectors/Policy';
import React, {useLayoutEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import FocusableMenuItem from '@components/FocusableMenuItem';
import useCreateEmptyReportConfirmation from '@hooks/useCreateEmptyReportConfirmation';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useHasEmptyReportsForPolicy from '@hooks/useHasEmptyReportsForPolicy';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import {createNewReport} from '@libs/actions/Report';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getDefaultChatEnabledPolicy} from '@libs/PolicyUtils';
import {hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import isOnSearchMoneyRequestReportPage from '@navigation/helpers/isOnSearchMoneyRequestReportPage';
import {useFABMenuContext} from '@pages/inbox/sidebar/FABPopoverContent/FABMenuContext';
import FAB_MENU_ITEM_IDS from '@pages/inbox/sidebar/FABPopoverContent/FABMenuItemIDs';
import useRedirectToExpensifyClassic from '@pages/inbox/sidebar/FABPopoverContent/useRedirectToExpensifyClassic';
import {clearLastSearchParams} from '@userActions/ReportNavigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

const ITEM_ID = FAB_MENU_ITEM_IDS.CREATE_REPORT;

const sessionSelector = (session: OnyxEntry<OnyxTypes.Session>) => ({email: session?.email, accountID: session?.accountID});

type CreateReportMenuItemProps = {
    activePolicyID: string | undefined;
};

function CreateReportMenuItem({activePolicyID}: CreateReportMenuItemProps) {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['Document'] as const);
    const {shouldRedirectToExpensifyClassic, showRedirectToExpensifyClassicModal} = useRedirectToExpensifyClassic();
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false, selector: sessionSelector});
    const [allBetas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const [hasDismissedEmptyReportsConfirmation] = useOnyx(ONYXKEYS.NVP_EMPTY_REPORTS_CONFIRMATION_DISMISSED, {canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations, session?.accountID ?? CONST.DEFAULT_NUMBER_ID, session?.email ?? '');
    const {focusedIndex, setFocusedIndex, onItemPress, registeredItems, registerItem, unregisterItem} = useFABMenuContext();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();

    const groupPaidPoliciesWithChatEnabled = (policies: Parameters<typeof groupPaidPoliciesWithExpenseChatEnabledSelector>[0]) =>
        groupPaidPoliciesWithExpenseChatEnabledSelector(policies, session?.email);

    // eslint-disable-next-line rulesdir/no-inline-useOnyx-selector
    const [groupPoliciesWithChatEnabled = CONST.EMPTY_ARRAY] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: groupPaidPoliciesWithChatEnabled, canBeMissing: true}, [session?.email]);

    const isVisible = shouldRedirectToExpensifyClassic || groupPoliciesWithChatEnabled.length > 0;

    useLayoutEffect(() => {
        if (!isVisible) {
            return;
        }
        registerItem(ITEM_ID);
        return () => unregisterItem(ITEM_ID);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVisible]);

    const itemIndex = registeredItems.indexOf(ITEM_ID);

    const defaultChatEnabledPolicy = getDefaultChatEnabledPolicy(groupPoliciesWithChatEnabled as Array<OnyxEntry<OnyxTypes.Policy>>, activePolicy);

    const defaultChatEnabledPolicyID = defaultChatEnabledPolicy?.id;
    const hasEmptyReport = useHasEmptyReportsForPolicy(defaultChatEnabledPolicyID);
    const shouldShowEmptyReportConfirmation = hasEmptyReport && hasDismissedEmptyReportsConfirmation !== true;

    const isReportInSearch = isOnSearchMoneyRequestReportPage();

    const handleCreateWorkspaceReport = (shouldDismissEmptyReportsConfirmation?: boolean) => {
        if (!defaultChatEnabledPolicy?.id) {
            return;
        }

        if (isReportInSearch) {
            clearLastSearchParams();
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
                {forceReplace: isReportInSearch},
            );
        });
    };

    const {openCreateReportConfirmation, CreateReportConfirmationModal} = useCreateEmptyReportConfirmation({
        policyID: defaultChatEnabledPolicyID,
        policyName: defaultChatEnabledPolicy?.name ?? '',
        onConfirm: handleCreateWorkspaceReport,
    });

    if (!isVisible) {
        return null;
    }

    return (
        <>
            <FocusableMenuItem
                pressableTestID={CONST.SENTRY_LABEL.FAB_MENU.CREATE_REPORT}
                icon={icons.Document}
                title={translate('report.newReport.createReport')}
                focused={focusedIndex === itemIndex}
                onFocus={() => setFocusedIndex(itemIndex)}
                onPress={() =>
                    onItemPress(
                        () => {
                            interceptAnonymousUser(() => {
                                if (shouldRedirectToExpensifyClassic) {
                                    showRedirectToExpensifyClassicModal();
                                    return;
                                }

                                const workspaceIDForReportCreation = defaultChatEnabledPolicyID;

                                if (!workspaceIDForReportCreation || (shouldRestrictUserBillableActions(workspaceIDForReportCreation) && groupPoliciesWithChatEnabled.length > 1)) {
                                    Navigation.navigate(ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute());
                                    return;
                                }

                                if (!shouldRestrictUserBillableActions(workspaceIDForReportCreation)) {
                                    if (shouldShowEmptyReportConfirmation) {
                                        openCreateReportConfirmation();
                                    } else {
                                        handleCreateWorkspaceReport(false);
                                    }
                                    return;
                                }

                                Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(workspaceIDForReportCreation));
                            });
                        },
                        {shouldCallAfterModalHide: shouldUseNarrowLayout},
                    )
                }
                shouldCheckActionAllowedOnPress={false}
                role={CONST.ROLE.BUTTON}
                wrapperStyle={StyleUtils.getItemBackgroundColorStyle(false, focusedIndex === itemIndex, false, theme.activeComponentBG, theme.hoverComponentBG)}
            />
            {CreateReportConfirmationModal}
        </>
    );
}

export default CreateReportMenuItem;
