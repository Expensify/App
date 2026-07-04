import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import HighlightableMenuItem from '@components/HighlightableMenuItem';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TabBarBottomContent from '@components/Navigation/TabBarBottomContent';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import useCardFeedErrors from '@hooks/useCardFeedErrors';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useGetReceiptPartnersIntegrationData from '@hooks/useGetReceiptPartnersIntegrationData';
import useIsWorkspacesTabFocused from '@hooks/useIsWorkspacesTabFocused';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';

import {isConnectionInProgress} from '@libs/actions/connections';
import {clearErrors, openPolicyInitialPage, removeWorkspace} from '@libs/actions/Policy/Policy';
import goBackFromWorkspaceSettingPages from '@libs/Navigation/helpers/goBackFromWorkspaceSettingPages';
import WorkspaceCreationReveal from '@libs/Navigation/helpers/WorkspaceCreationReveal';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {shouldShowPolicy as checkIfShouldShowPolicy, goBackFromInvalidPolicy, isPendingDeletePolicy} from '@libs/PolicyUtils';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';

import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {LayoutChangeEvent} from 'react-native';

import {findFocusedRoute, useFocusEffect, useIsFocused, useNavigationState} from '@react-navigation/native';
import {emailSelector} from '@selectors/Session';
import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';

import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';

import getWorkspaceMenuItems from './getWorkspaceMenuItems';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';

type WorkspaceInitialPageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.INITIAL>;

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
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {isBetaEnabled} = usePermissions();

    const isFocused = useIsFocused();
    const isWorkspacesTabFocused = useIsWorkspacesTabFocused();
    const activeRoute = useNavigationState((state) => findFocusedRoute(state)?.name);
    const waitForNavigate = useWaitForNavigation();
    const {singleExecution, isExecuting} = useSingleExecution();
    const wasRendered = useRef(false);

    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const policy = policyDraft?.id ? policyDraft : policyProp;
    const policyID = policy?.id;
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${route.params?.policyID}`);
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const {shouldShowEnterCredentialsError} = useGetReceiptPartnersIntegrationData(policyID);
    const {shouldShowRbrForWorkspaceAccountID} = useCardFeedErrors();
    const expensifyIcons = useMemoizedLazyExpensifyIcons([
        'Building',
        'CalendarSolid',
        'Car',
        'Coins',
        'CreditCard',
        'Document',
        'ExpensifyAppIcon',
        'ExpensifyCard',
        'Feed',
        'Folder',
        'Gear',
        'Hashtag',
        'InvoiceGeneric',
        'Receipt',
        'Sync',
        'Tag',
        'Users',
        'Workflows',
        'LuggageWithLines',
        'Clock',
        'Bolt',
    ]);

    const policyName = policy?.name ?? '';
    const hasPolicyCreationError = policy?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD && !isEmptyObject(policy.errors);
    const shouldShowRBR = shouldShowRbrForWorkspaceAccountID[workspaceAccountID];

    const policyAvatar = !policy
        ? {source: expensifyIcons.ExpensifyAppIcon, name: CONST.EXPENSIFY_ICON_NAME, type: CONST.ICON_TYPE_AVATAR}
        : {
              source: policy.avatarURL ? policy.avatarURL : getDefaultWorkspaceAvatar(policy.name),
              name: policy.name ?? '',
              type: CONST.ICON_TYPE_WORKSPACE,
              id: policy.id,
          };

    const prevPendingFields = usePrevious(policy?.pendingFields);

    const prevPolicy = usePrevious(policy);
    const shouldShowPolicy = checkIfShouldShowPolicy(policy, true, currentUserLogin);
    const isPendingDelete = isPendingDeletePolicy(policy);
    const prevIsPendingDelete = isPendingDeletePolicy(prevPolicy);
    // While the policy is being fetched (e.g., right after joinAccessiblePolicy), the role is not yet populated,
    // so checkIfShouldShowPolicy returns false. Suppress NotFound during this loading window.
    const computedShouldShowNotFoundPage = isWorkspacesTabFocused && !shouldShowPolicy && !policy?.isLoading && (!isPendingDelete || prevIsPendingDelete);
    // Latch to true: once the not-found state is detected, keep showing it so the normal
    // workspace content doesn't flash during the exit animation when navigation state
    // changes (e.g., isWorkspacesTabFocused becomes false after StackActions.pop()).
    const prevShouldShowNotFoundPage = usePrevious(computedShouldShowNotFoundPage);
    const shouldShowNotFoundPage = computedShouldShowNotFoundPage || !!prevShouldShowNotFoundPage;
    const fetchPolicyData = () => {
        if (policyDraft?.id || !isFocused) {
            return;
        }
        openPolicyInitialPage(route.params.policyID);
    };
    useNetwork({onReconnect: fetchPolicyData});
    useFocusEffect(
        useCallback(() => {
            fetchPolicyData();
        }, [fetchPolicyData]),
    );

    // Navigate away when workspace is deleted
    useEffect(() => {
        if (!isFocused || isEmptyObject(prevPolicy) || prevIsPendingDelete || !isPendingDelete) {
            return;
        }
        goBackFromInvalidPolicy();
    }, [isFocused, isPendingDelete, policy, prevIsPendingDelete, prevPolicy]);

    const workspaceMenuItems = getWorkspaceMenuItems({
        policy,
        policyID,
        currentUserLogin: currentUserLogin ?? '',
        icons: {
            Building: expensifyIcons.Building,
            Users: expensifyIcons.Users,
            Hashtag: expensifyIcons.Hashtag,
            Document: expensifyIcons.Document,
            Sync: expensifyIcons.Sync,
            Receipt: expensifyIcons.Receipt,
            Folder: expensifyIcons.Folder,
            Tag: expensifyIcons.Tag,
            Coins: expensifyIcons.Coins,
            Workflows: expensifyIcons.Workflows,
            Feed: expensifyIcons.Feed,
            Car: expensifyIcons.Car,
            LuggageWithLines: expensifyIcons.LuggageWithLines,
            ExpensifyCard: expensifyIcons.ExpensifyCard,
            CreditCard: expensifyIcons.CreditCard,
            CalendarSolid: expensifyIcons.CalendarSolid,
            Clock: expensifyIcons.Clock,
            InvoiceGeneric: expensifyIcons.InvoiceGeneric,
            Gear: expensifyIcons.Gear,
            Bolt: expensifyIcons.Bolt,
        },
        isRoomsPageBetaEnabled: isBetaEnabled(CONST.BETAS.WORKSPACE_ROOMS_PAGE),
        isRulesRevampBetaEnabled: isBetaEnabled(CONST.BETAS.RULES_REVAMP),
        isConnectionInProgress: isConnectionInProgress(connectionSyncProgress, policy),
        policyCategories,
        previousPendingFields: prevPendingFields,
        shouldShowEnterCredentialsError,
        shouldShowRBR,
        convertToDisplayString,
    }).map((item) => ({
        ...item,
        action: singleExecution(waitForNavigate(() => Navigation.navigate(item.route))),
    }));

    // Close RHP if we land on a route that no longer exists in the menu
    const canAccessRoute = activeRoute && (workspaceMenuItems.some((item) => item.screenName === activeRoute) || activeRoute === SCREENS.WORKSPACE.INITIAL);
    useEffect(() => {
        if (!shouldShowNotFoundPage && canAccessRoute) {
            return;
        }
        if (wasRendered.current) {
            return;
        }
        wasRendered.current = true;
        Navigation.isNavigationReady().then(() => {
            Navigation.closeRHPFlow();
        });
    }, [canAccessRoute, shouldShowNotFoundPage]);

    // When this page is revealed from under the RHP during workspace creation (#90985), the RHP
    // slide-out is held until the page has painted. Signal readiness from the first non-empty layout
    // of the actual content (not the navigator container, which lays out at full height before this
    // lazy page mounts) and defer one frame so paint completes before the RHP slides away.
    // notifyRevealUnderRHPReady is a no-op unless a reveal is pending, so this costs nothing on
    // normal navigation.
    const hasReportedRevealReadinessRef = useRef(false);
    const handleRevealContentLayout = (event: LayoutChangeEvent) => {
        if (hasReportedRevealReadinessRef.current || event.nativeEvent.layout.height === 0) {
            return;
        }
        hasReportedRevealReadinessRef.current = true;
        requestAnimationFrame(() => WorkspaceCreationReveal.notifyRevealUnderRHPReady());
    };

    return (
        <ScreenWrapper
            testID="WorkspaceInitialPage"
            enableEdgeToEdgeBottomSafeAreaPadding={false}
            bottomContent={<TabBarBottomContent selectedTab={NAVIGATION_TABS.WORKSPACES} />}
            bottomContentStyle={styles.overflowVisible}
        >
            <FullPageNotFoundView
                onBackButtonPress={goBackFromWorkspaceSettingPages}
                onLinkPress={Navigation.goBackToHome}
                shouldShow={shouldShowNotFoundPage}
                subtitleKey={shouldShowPolicy ? 'workspace.common.notAuthorized' : undefined}
                addBottomSafeAreaPadding
                shouldForceFullScreen
                shouldDisplaySearchRouter
            >
                <HeaderWithBackButton
                    title={policyName}
                    onBackButtonPress={() => Navigation.goBack(route.params?.backTo ?? ROUTES.WORKSPACES_LIST.route)}
                    policyAvatar={policyAvatar}
                    shouldDisplayHelpButton={shouldUseNarrowLayout}
                />

                <ScrollView contentContainerStyle={[styles.flexColumn, styles.pb14]}>
                    <OfflineWithFeedback
                        pendingAction={policy?.pendingAction}
                        onClose={() => dismissError(policyID, policy?.pendingAction)}
                        errors={policy?.errors}
                        errorRowStyles={[styles.ph5, styles.pv2]}
                        shouldDisableStrikeThrough={false}
                        shouldHideOnDelete={false}
                        shouldShowErrorMessages={false}
                    >
                        <View
                            style={[styles.pb4, styles.mh3, styles.mt3]}
                            onLayout={handleRevealContentLayout}
                        >
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
                                    wrapperStyle={styles.sectionMenuItem(shouldUseNarrowLayout)}
                                    highlighted={!!item?.highlighted}
                                    focused={!!(item.screenName && activeRoute?.startsWith(item.screenName))}
                                    role={CONST.ROLE.TAB}
                                    badgeText={item.badgeText}
                                    shouldIconUseAutoWidthStyle
                                    sentryLabel={item.sentryLabel}
                                />
                            ))}
                        </View>
                    </OfflineWithFeedback>
                </ScrollView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceInitialPage);
