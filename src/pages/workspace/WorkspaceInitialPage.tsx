import {findFocusedRoute, useFocusEffect, useNavigationState} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import HighlightableMenuItem from '@components/HighlightableMenuItem';
import {
    Building,
    CalendarSolid,
    Car,
    Coins,
    CreditCard,
    ExpensifyAppIcon,
    ExpensifyCard,
    Feed,
    Folder,
    Gear,
    InvoiceGeneric,
    Pencil,
    Sync,
    Tag,
    Users,
    Workflows,
} from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import BottomTabBar from '@components/Navigation/BottomTabBar';
import BOTTOM_TABS from '@components/Navigation/BottomTabBar/BOTTOM_TABS';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import {confirmReadyToOpenApp} from '@libs/actions/App';
import {isConnectionInProgress} from '@libs/actions/connections';
import {shouldShowQBOReimbursableExportDestinationAccountError} from '@libs/actions/connections/QuickbooksOnline';
import {clearErrors, openPolicyInitialPage, removeWorkspace} from '@libs/actions/Policy/Policy';
import {checkIfFeedConnectionIsBroken, flatAllCardsList} from '@libs/CardUtils';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {
    shouldShowPolicy as checkIfShouldShowPolicy,
    goBackFromInvalidPolicy,
    hasPolicyCategoriesError,
    isPaidGroupPolicy,
    isPendingDeletePolicy,
    isPolicyAdmin,
    isPolicyFeatureEnabled,
    shouldShowEmployeeListError,
    shouldShowSyncError,
    shouldShowTaxRateError,
} from '@libs/PolicyUtils';
import {getDefaultWorkspaceAvatar, getIcons, getPolicyExpenseChat, getReportName, getReportOfflinePendingActionAndErrors} from '@libs/ReportUtils';
import type WORKSPACE_TO_RHP from '@navigation/linkingConfig/RELATIONS/WORKSPACE_TO_RHP';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type {PolicyFeatureName} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';

type WorkspaceTopLevelScreens = keyof typeof WORKSPACE_TO_RHP;

type WorkspaceMenuItem = {
    translationKey: TranslationPaths;
    icon: IconAsset;
    action: () => void;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
    screenName: WorkspaceTopLevelScreens;
    badgeText?: string;
    highlighted?: boolean;
};

type WorkspaceInitialPageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.INITIAL>;

type PolicyFeatureStates = Record<PolicyFeatureName, boolean>;

function dismissError(policyID: string | undefined, pendingAction: PendingAction | undefined) {
    if (!policyID || pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        goBackFromInvalidPolicy();
        if (policyID) {
            removeWorkspace(policyID);
        }
    } else {
        clearErrors(policyID);
    }
}

function WorkspaceInitialPage({policyDraft, policy: policyProp, route}: WorkspaceInitialPageProps) {
    const styles = useThemeStyles();
    const policy = policyDraft?.id ? policyDraft : policyProp;
    const workspaceAccountID = policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const hasPolicyCreationError = policy?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD && !isEmptyObject(policy.errors);
    const [allFeedsCards] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}`);
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policy?.id}`);
    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.email});
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${route.params?.policyID}`);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const {login, accountID} = useCurrentUserPersonalDetails();
    const hasSyncError = shouldShowSyncError(policy, isConnectionInProgress(connectionSyncProgress, policy));
    const waitForNavigate = useWaitForNavigation();
    const {singleExecution, isExecuting} = useSingleExecution();
    const activeRoute = useNavigationState((state) => findFocusedRoute(state)?.name);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const wasRendered = useRef(false);
    const currentUserPolicyExpenseChatReportID = getPolicyExpenseChat(accountID, policy?.id)?.reportID;
    const [currentUserPolicyExpenseChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${currentUserPolicyExpenseChatReportID}`);
    const {reportPendingAction} = getReportOfflinePendingActionAndErrors(currentUserPolicyExpenseChat);
    const isPolicyExpenseChatEnabled = !!policy?.isPolicyExpenseChatEnabled;
    const prevPendingFields = usePrevious(policy?.pendingFields);
    const policyFeatureStates = useMemo(
        () => ({
            [CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED]: policy?.areDistanceRatesEnabled,
            [CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED]: policy?.areWorkflowsEnabled,
            [CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED]: policy?.areCategoriesEnabled,
            [CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED]: policy?.areTagsEnabled,
            [CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED]: policy?.tax?.trackingEnabled,
            [CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED]: policy?.areCompanyCardsEnabled,
            [CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED]: !!policy?.areConnectionsEnabled || !isEmptyObject(policy?.connections),
            [CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED]: policy?.areExpensifyCardsEnabled,
            [CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED]: policy?.areReportFieldsEnabled,
            [CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED]: policy?.areRulesEnabled,
            [CONST.POLICY.MORE_FEATURES.ARE_INVOICES_ENABLED]: policy?.areInvoicesEnabled,
            [CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED]: policy?.arePerDiemRatesEnabled,
        }),
        [policy],
    ) as PolicyFeatureStates;

    const fetchPolicyData = useCallback(() => {
        if (policyDraft?.id) {
            return;
        }
        openPolicyInitialPage(route.params.policyID);
    }, [policyDraft?.id, route.params.policyID]);

    useNetwork({onReconnect: fetchPolicyData});

    useFocusEffect(
        useCallback(() => {
            fetchPolicyData();
        }, [fetchPolicyData]),
    );

    const policyID = policy?.id;
    const policyName = policy?.name ?? '';

    const hasMembersError = shouldShowEmployeeListError(policy);
    const hasPolicyCategoryError = hasPolicyCategoriesError(policyCategories);
    const hasGeneralSettingsError =
        !isEmptyObject(policy?.errorFields?.name ?? {}) ||
        !isEmptyObject(policy?.errorFields?.avatarURL ?? {}) ||
        !isEmptyObject(policy?.errorFields?.ouputCurrency ?? {}) ||
        !isEmptyObject(policy?.errorFields?.address ?? {});
    const shouldShowProtectedItems = isPolicyAdmin(policy, login);
    const [featureStates, setFeatureStates] = useState(policyFeatureStates);

    const [highlightedFeature, setHighlightedFeature] = useState<string | undefined>(undefined);

    const workspaceMenuItems: WorkspaceMenuItem[] = useMemo(() => {
        const protectedMenuItems: WorkspaceMenuItem[] = [];

        if (featureStates?.[CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED]) {
            protectedMenuItems.push({
                translationKey: 'workspace.common.distanceRates',
                icon: Car,
                action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_DISTANCE_RATES.getRoute(policyID)))),
                screenName: SCREENS.WORKSPACE.DISTANCE_RATES,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED,
            });
        }

        if (featureStates?.[CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED]) {
            protectedMenuItems.push({
                translationKey: 'workspace.common.expensifyCard',
                icon: ExpensifyCard,
                action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID)))),
                screenName: SCREENS.WORKSPACE.EXPENSIFY_CARD,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED,
            });
        }

        if (featureStates?.[CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED]) {
            const hasBrokenFeedConnection = checkIfFeedConnectionIsBroken(flatAllCardsList(allFeedsCards, workspaceAccountID));

            protectedMenuItems.push({
                translationKey: 'workspace.common.companyCards',
                icon: CreditCard,
                action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID)))),
                screenName: SCREENS.WORKSPACE.COMPANY_CARDS,
                brickRoadIndicator: hasBrokenFeedConnection ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED,
            });
        }

        if (featureStates?.[CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED]) {
            protectedMenuItems.push({
                translationKey: 'common.perDiem',
                icon: CalendarSolid,
                action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_PER_DIEM.getRoute(policyID)))),
                screenName: SCREENS.WORKSPACE.PER_DIEM,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED,
            });
        }

        if (featureStates?.[CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED]) {
            protectedMenuItems.push({
                translationKey: 'workspace.common.accounting',
                icon: Sync,
                action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING.getRoute(policyID)))),
                brickRoadIndicator: hasSyncError || shouldShowQBOReimbursableExportDestinationAccountError(policy) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                screenName: SCREENS.WORKSPACE.ACCOUNTING.ROOT,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED,
            });
        }

        if (featureStates?.[CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED]) {
            protectedMenuItems.push({
                translationKey: 'workspace.common.categories',
                icon: Folder,
                action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_CATEGORIES.getRoute(policyID)))),
                brickRoadIndicator: hasPolicyCategoryError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                screenName: SCREENS.WORKSPACE.CATEGORIES,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED,
            });
        }

        if (featureStates?.[CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED]) {
            protectedMenuItems.push({
                translationKey: 'workspace.common.tags',
                icon: Tag,
                action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_TAGS.getRoute(policyID)))),
                screenName: SCREENS.WORKSPACE.TAGS,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED,
            });
        }

        if (featureStates?.[CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED]) {
            protectedMenuItems.push({
                translationKey: 'workspace.common.taxes',
                icon: Coins,
                action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_TAXES.getRoute(policyID)))),
                screenName: SCREENS.WORKSPACE.TAXES,
                brickRoadIndicator: shouldShowTaxRateError(policy) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED,
            });
        }

        if (featureStates?.[CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED]) {
            protectedMenuItems.push({
                translationKey: 'workspace.common.reportFields',
                icon: Pencil,
                action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_REPORT_FIELDS.getRoute(policyID)))),
                screenName: SCREENS.WORKSPACE.REPORT_FIELDS,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED,
            });
        }

        if (featureStates?.[CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED]) {
            protectedMenuItems.push({
                translationKey: 'workspace.common.workflows',
                icon: Workflows,
                action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS.getRoute(policyID)))),
                screenName: SCREENS.WORKSPACE.WORKFLOWS,
                brickRoadIndicator: !isEmptyObject(policy?.errorFields?.reimburser ?? {}) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED,
            });
        }

        if (featureStates?.[CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED]) {
            protectedMenuItems.push({
                translationKey: 'workspace.common.rules',
                icon: Feed,
                action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_RULES.getRoute(policyID)))),
                screenName: SCREENS.WORKSPACE.RULES,
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED,
            });
        }

        if (featureStates?.[CONST.POLICY.MORE_FEATURES.ARE_INVOICES_ENABLED]) {
            const currencyCode = policy?.outputCurrency ?? CONST.CURRENCY.USD;
            protectedMenuItems.push({
                translationKey: 'workspace.common.invoices',
                icon: InvoiceGeneric,
                action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_INVOICES.getRoute(policyID)))),
                screenName: SCREENS.WORKSPACE.INVOICES,
                badgeText: convertToDisplayString(policy?.invoice?.bankAccount?.stripeConnectAccountBalance ?? 0, currencyCode),
                highlighted: highlightedFeature === CONST.POLICY.MORE_FEATURES.ARE_INVOICES_ENABLED,
            });
        }

        protectedMenuItems.push({
            translationKey: 'workspace.common.moreFeatures',
            icon: Gear,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID)))),
            screenName: SCREENS.WORKSPACE.MORE_FEATURES,
        });

        const menuItems: WorkspaceMenuItem[] = [
            {
                translationKey: 'workspace.common.profile',
                icon: Building,
                action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW.getRoute(policyID)))),
                brickRoadIndicator: hasGeneralSettingsError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                screenName: SCREENS.WORKSPACE.PROFILE,
            },
            {
                translationKey: 'workspace.common.members',
                icon: Users,
                action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID)))),
                brickRoadIndicator: hasMembersError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                screenName: SCREENS.WORKSPACE.MEMBERS,
            },
            ...(isPaidGroupPolicy(policy) && shouldShowProtectedItems ? protectedMenuItems : []),
        ];

        return menuItems;
    }, [
        featureStates,
        hasGeneralSettingsError,
        hasMembersError,
        hasPolicyCategoryError,
        hasSyncError,
        highlightedFeature,
        policy,
        policyID,
        shouldShowProtectedItems,
        singleExecution,
        waitForNavigate,
        allFeedsCards,
        workspaceAccountID,
    ]);

    // We only update feature states if they aren't pending.
    // These changes are made to synchronously change feature states along with AccessOrNotFoundWrapperComponent.
    useEffect(() => {
        setFeatureStates((currentFeatureStates) => {
            const newFeatureStates = {} as PolicyFeatureStates;
            let newlyEnabledFeature: PolicyFeatureName | null = null;
            (Object.keys(policy?.pendingFields ?? {}) as PolicyFeatureName[]).forEach((key) => {
                const isFeatureEnabled = isPolicyFeatureEnabled(policy, key);
                // Determine if this feature is newly enabled (wasn't enabled before but is now)
                if (isFeatureEnabled && !currentFeatureStates[key]) {
                    newlyEnabledFeature = key;
                }
                newFeatureStates[key] =
                    prevPendingFields?.[key] !== policy?.pendingFields?.[key] || isOffline || !policy?.pendingFields?.[key] ? isFeatureEnabled : currentFeatureStates[key];
            });

            // Only highlight the newly enabled feature
            if (newlyEnabledFeature) {
                setHighlightedFeature(newlyEnabledFeature);
            }

            return {
                ...policyFeatureStates,
                ...newFeatureStates,
            };
        });
    }, [policy, isOffline, policyFeatureStates, prevPendingFields]);

    useEffect(() => {
        confirmReadyToOpenApp();
    }, []);

    const prevPolicy = usePrevious(policy);

    const shouldShowPolicy = useMemo(() => checkIfShouldShowPolicy(policy, isOffline, currentUserLogin), [policy, isOffline, currentUserLogin]);
    const isPendingDelete = isPendingDeletePolicy(policy);
    const prevIsPendingDelete = isPendingDeletePolicy(prevPolicy);
    // We check isPendingDelete and prevIsPendingDelete to prevent the NotFound view from showing right after we delete the workspace
    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = !shouldShowPolicy && (!isPendingDelete || prevIsPendingDelete);

    useEffect(() => {
        if (isEmptyObject(prevPolicy) || prevIsPendingDelete || !isPendingDelete) {
            return;
        }
        goBackFromInvalidPolicy();
    }, [isPendingDelete, policy, prevIsPendingDelete, prevPolicy]);

    // We are checking if the user can access the route.
    // If user can't access the route, we are dismissing any modals that are open when the NotFound view is shown
    const canAccessRoute = activeRoute && (workspaceMenuItems.some((item) => item.screenName === activeRoute) || activeRoute === SCREENS.WORKSPACE.INITIAL);

    useEffect(() => {
        if (!shouldShowNotFoundPage && canAccessRoute) {
            return;
        }
        if (wasRendered.current) {
            return;
        }
        wasRendered.current = true;
        // We are dismissing any modals that are open when the NotFound view is shown
        Navigation.isNavigationReady().then(() => {
            Navigation.closeRHPFlow();
        });
    }, [canAccessRoute, shouldShowNotFoundPage]);

    const policyAvatar = useMemo(() => {
        if (!policy) {
            return {source: ExpensifyAppIcon, name: CONST.WORKSPACE_SWITCHER.NAME, type: CONST.ICON_TYPE_AVATAR};
        }

        const avatar = policy?.avatarURL ? policy.avatarURL : getDefaultWorkspaceAvatar(policy?.name);
        return {
            source: avatar,
            name: policy?.name ?? '',
            type: CONST.ICON_TYPE_WORKSPACE,
            id: policy.id,
        };
    }, [policy]);

    const shouldShowBottomTab = !shouldShowNotFoundPage;

    return (
        <ScreenWrapper
            testID={WorkspaceInitialPage.displayName}
            includeSafeAreaPaddingBottom
            bottomContent={shouldShowBottomTab ? <BottomTabBar selectedTab={BOTTOM_TABS.SETTINGS} /> : null}
        >
            <FullPageNotFoundView
                onBackButtonPress={Navigation.dismissModal}
                onLinkPress={Navigation.goBackToHome}
                shouldShow={shouldShowNotFoundPage}
                subtitleKey={shouldShowPolicy ? 'workspace.common.notAuthorized' : undefined}
            >
                <HeaderWithBackButton
                    title={policyName}
                    onBackButtonPress={() => Navigation.goBack(route.params?.backTo ?? ROUTES.SETTINGS_WORKSPACES.route)}
                    policyAvatar={policyAvatar}
                    style={styles.headerBarDesktopHeight}
                    shouldDisplayHelpButton={shouldUseNarrowLayout}
                />

                <ScrollView contentContainerStyle={[styles.flexColumn]}>
                    <OfflineWithFeedback
                        pendingAction={policy?.pendingAction}
                        onClose={() => dismissError(policyID, policy?.pendingAction)}
                        errors={policy?.errors}
                        errorRowStyles={[styles.ph5, styles.pv2]}
                        shouldDisableStrikeThrough={false}
                        shouldHideOnDelete={false}
                    >
                        <View style={[styles.pb4, styles.mh3, styles.mt3]}>
                            {/*
                                Ideally we should use MenuList component for MenuItems with singleExecution/Navigation actions.
                                In this case where user can click on workspace avatar or menu items, we need to have a check for `isExecuting`. So, we are directly mapping menuItems.
                            */}
                            {workspaceMenuItems.map((item) => (
                                <HighlightableMenuItem
                                    key={item.translationKey}
                                    disabled={hasPolicyCreationError || isExecuting}
                                    interactive={!hasPolicyCreationError}
                                    title={translate(item.translationKey)}
                                    icon={item.icon}
                                    onPress={item.action}
                                    brickRoadIndicator={item.brickRoadIndicator}
                                    wrapperStyle={styles.sectionMenuItem}
                                    highlighted={!!item?.highlighted}
                                    focused={!!(item.screenName && activeRoute?.startsWith(item.screenName))}
                                    badgeText={item.badgeText}
                                    shouldIconUseAutoWidthStyle
                                />
                            ))}
                        </View>
                    </OfflineWithFeedback>
                    {isPolicyExpenseChatEnabled && (
                        <View style={[styles.pb4, styles.mh3, styles.mt3]}>
                            <Text style={[styles.textSupporting, styles.fontSizeLabel, styles.ph2]}>{translate('workspace.common.submitExpense')}</Text>
                            <OfflineWithFeedback pendingAction={reportPendingAction}>
                                <MenuItem
                                    title={getReportName(currentUserPolicyExpenseChat)}
                                    description={translate('workspace.common.workspace')}
                                    icon={getIcons(currentUserPolicyExpenseChat, personalDetails)}
                                    onPress={() => Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(currentUserPolicyExpenseChat?.reportID))}
                                    shouldShowRightIcon
                                    wrapperStyle={[styles.br2, styles.pl2, styles.pr0, styles.pv3, styles.mt1, styles.alignItemsCenter]}
                                    shouldShowSubscriptAvatar
                                />
                            </OfflineWithFeedback>
                        </View>
                    )}
                </ScrollView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

WorkspaceInitialPage.displayName = 'WorkspaceInitialPage';

export default withPolicyAndFullscreenLoading(WorkspaceInitialPage);
