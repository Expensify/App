import {useNavigationState} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import HighlightableMenuItem from '@components/HighlightableMenuItem';
import * as Expensicons from '@components/Icon/Expensicons';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePrevious from '@hooks/usePrevious';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import getTopmostWorkspacesCentralPaneName from '@libs/Navigation/getTopmostWorkspacesCentralPaneName';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import type {FullScreenNavigatorParamList} from '@navigation/types';
import * as App from '@userActions/App';
import * as Policy from '@userActions/Policy';
import * as ReimbursementAccount from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';

type WorkspaceMenuItem = {
    translationKey: TranslationPaths;
    icon: IconAsset;
    action: () => void;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
    routeName?: ValueOf<typeof SCREENS.WORKSPACE>;
};

type WorkspaceInitialPageOnyxProps = {
    /** Bank account attached to free plan */
    reimbursementAccount: OnyxEntry<OnyxTypes.ReimbursementAccount>;

    /** Collection of categories attached to a policy */
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
};

type WorkspaceInitialPageProps = WithPolicyAndFullscreenLoadingProps & WorkspaceInitialPageOnyxProps & StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.INITIAL>;

function dismissError(policyID: string) {
    PolicyUtils.goBackFromInvalidPolicy();
    Policy.removeWorkspace(policyID);
}

function WorkspaceInitialPage({policyDraft, policy: policyProp, reimbursementAccount, policyCategories}: WorkspaceInitialPageProps) {
    const styles = useThemeStyles();
    const policy = policyDraft?.id ? policyDraft : policyProp;
    const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
    const hasPolicyCreationError = !!(policy?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD && policy.errors);
    const waitForNavigate = useWaitForNavigation();
    const {singleExecution, isExecuting} = useSingleExecution();
    const activeRoute = useNavigationState(getTopmostWorkspacesCentralPaneName);
    const {translate} = useLocalize();
    const {canUseAccountingIntegrations} = usePermissions();

    const policyID = policy?.id ?? '';
    const policyName = policy?.name ?? '';

    useEffect(() => {
        const policyDraftId = policyDraft?.id;

        if (!policyDraftId) {
            return;
        }

        App.savePolicyDraftByNewWorkspace(policyDraft.id, policyDraft.name, '', policyDraft.makeMeAdmin);
        // We only care when the component renders the first time
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!isCurrencyModalOpen || policy?.outputCurrency !== CONST.CURRENCY.USD) {
            return;
        }
        setIsCurrencyModalOpen(false);
    }, [policy?.outputCurrency, isCurrencyModalOpen]);

    /** Call update workspace currency and hide the modal */
    const confirmCurrencyChangeAndHideModal = useCallback(() => {
        Policy.updateGeneralSettings(policyID, policyName, CONST.CURRENCY.USD);
        setIsCurrencyModalOpen(false);
        ReimbursementAccount.navigateToBankAccountRoute(policyID);
    }, [policyID, policyName]);

    const hasMembersError = PolicyUtils.hasEmployeeListError(policy);
    const hasPolicyCategoryError = PolicyUtils.hasPolicyCategoriesError(policyCategories);
    const hasGeneralSettingsError = !isEmptyObject(policy?.errorFields?.generalSettings ?? {}) || !isEmptyObject(policy?.errorFields?.avatar ?? {});
    const shouldShowProtectedItems = PolicyUtils.isPolicyAdmin(policy);
    const isPaidGroupPolicy = PolicyUtils.isPaidGroupPolicy(policy);
    const isFreeGroupPolicy = PolicyUtils.isFreeGroupPolicy(policy);

    const protectedFreePolicyMenuItems: WorkspaceMenuItem[] = [
        {
            translationKey: 'workspace.common.card',
            icon: Expensicons.ExpensifyCard,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_CARD.getRoute(policyID)))),
            routeName: SCREENS.WORKSPACE.CARD,
        },
        {
            translationKey: 'workspace.common.reimburse',
            icon: Expensicons.Receipt,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_REIMBURSE.getRoute(policyID)))),
            routeName: SCREENS.WORKSPACE.REIMBURSE,
        },
        {
            translationKey: 'workspace.common.bills',
            icon: Expensicons.Bill,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_BILLS.getRoute(policyID)))),
            routeName: SCREENS.WORKSPACE.BILLS,
        },
        {
            translationKey: 'workspace.common.invoices',
            icon: Expensicons.Invoice,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_INVOICES.getRoute(policyID)))),
            routeName: SCREENS.WORKSPACE.INVOICES,
        },
        {
            translationKey: 'workspace.common.travel',
            icon: Expensicons.Luggage,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_TRAVEL.getRoute(policyID)))),
            routeName: SCREENS.WORKSPACE.TRAVEL,
        },
        {
            translationKey: 'workspace.common.bankAccount',
            icon: Expensicons.Bank,
            action: () =>
                policy?.outputCurrency === CONST.CURRENCY.USD
                    ? singleExecution(waitForNavigate(() => ReimbursementAccount.navigateToBankAccountRoute(policyID, Navigation.getActiveRouteWithoutParams())))()
                    : setIsCurrencyModalOpen(true),
            brickRoadIndicator: !isEmptyObject(reimbursementAccount?.errors) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
        },
    ];

    const protectedCollectPolicyMenuItems: WorkspaceMenuItem[] = [];

    if (policy?.areDistanceRatesEnabled) {
        protectedCollectPolicyMenuItems.push({
            translationKey: 'workspace.common.distanceRates',
            icon: Expensicons.Car,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_DISTANCE_RATES.getRoute(policyID)))),
            routeName: SCREENS.WORKSPACE.DISTANCE_RATES,
        });
    }

    if (policy?.areWorkflowsEnabled) {
        protectedCollectPolicyMenuItems.push({
            translationKey: 'workspace.common.workflows',
            icon: Expensicons.Workflows,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS.getRoute(policyID)))),
            routeName: SCREENS.WORKSPACE.WORKFLOWS,
            brickRoadIndicator: !isEmptyObject(policy?.errorFields?.reimburser ?? {}) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
        });
    }

    if (policy?.areCategoriesEnabled) {
        protectedCollectPolicyMenuItems.push({
            translationKey: 'workspace.common.categories',
            icon: Expensicons.Folder,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_CATEGORIES.getRoute(policyID)))),
            brickRoadIndicator: hasPolicyCategoryError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            routeName: SCREENS.WORKSPACE.CATEGORIES,
        });
    }

    if (policy?.areTagsEnabled) {
        protectedCollectPolicyMenuItems.push({
            translationKey: 'workspace.common.tags',
            icon: Expensicons.Tag,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_TAGS.getRoute(policyID)))),
            routeName: SCREENS.WORKSPACE.TAGS,
        });
    }

    if (policy?.tax?.trackingEnabled) {
        protectedCollectPolicyMenuItems.push({
            translationKey: 'workspace.common.taxes',
            icon: Expensicons.Tax,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_TAXES.getRoute(policyID)))),
            routeName: SCREENS.WORKSPACE.TAXES,
            brickRoadIndicator: PolicyUtils.hasTaxRateError(policy) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
        });
    }

    if (policy?.areConnectionsEnabled && canUseAccountingIntegrations) {
        protectedCollectPolicyMenuItems.push({
            translationKey: 'workspace.common.accounting',
            icon: Expensicons.Sync,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING.getRoute(policyID)))),
            // brickRoadIndicator should be set when API will be ready
            brickRoadIndicator: undefined,
            routeName: SCREENS.WORKSPACE.ACCOUNTING,
        });
    }

    protectedCollectPolicyMenuItems.push({
        translationKey: 'workspace.common.moreFeatures',
        icon: Expensicons.Gear,
        action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID)))),
        routeName: SCREENS.WORKSPACE.MORE_FEATURES,
    });

    const menuItems: WorkspaceMenuItem[] = [
        {
            translationKey: 'workspace.common.profile',
            icon: Expensicons.Home,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_PROFILE.getRoute(policyID)))),
            brickRoadIndicator: hasGeneralSettingsError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            routeName: SCREENS.WORKSPACE.PROFILE,
        },
        {
            translationKey: 'workspace.common.members',
            icon: Expensicons.Users,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID)))),
            brickRoadIndicator: hasMembersError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            routeName: SCREENS.WORKSPACE.MEMBERS,
        },
        ...(isPaidGroupPolicy && shouldShowProtectedItems ? protectedCollectPolicyMenuItems : []),
        ...(isFreeGroupPolicy && shouldShowProtectedItems ? protectedFreePolicyMenuItems : []),
    ];

    const prevPolicy = usePrevious(policy);
    const prevProtectedMenuItems = usePrevious(protectedCollectPolicyMenuItems);
    const enabledItem = protectedCollectPolicyMenuItems.find((curItem) => !prevProtectedMenuItems.some((prevItem) => curItem.routeName === prevItem.routeName));

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage =
        isEmptyObject(policy) ||
        // We check isPendingDelete for both policy and prevPolicy to prevent the NotFound view from showing right after we delete the workspace
        (PolicyUtils.isPendingDeletePolicy(policy) && PolicyUtils.isPendingDeletePolicy(prevPolicy));

    // We are checking if the user can access the route.
    // If user can't access the route, we are dismissing any modals that are open when the NotFound view is shown
    const canAccessRoute = activeRoute && menuItems.some((item) => item.routeName === activeRoute);

    useEffect(() => {
        if (!shouldShowNotFoundPage && canAccessRoute) {
            return;
        }
        // We are dismissing any modals that are open when the NotFound view is shown
        Navigation.isNavigationReady().then(() => {
            Navigation.dismissRHP();
        });
    }, [canAccessRoute, policy, shouldShowNotFoundPage]);

    const policyAvatar = useMemo(() => {
        if (!policy) {
            return {source: Expensicons.ExpensifyAppIcon, name: CONST.WORKSPACE_SWITCHER.NAME, type: CONST.ICON_TYPE_AVATAR};
        }

        const avatar = policy?.avatar ? policy.avatar : getDefaultWorkspaceAvatar(policy?.name);
        return {
            source: avatar,
            name: policy?.name ?? '',
            type: CONST.ICON_TYPE_WORKSPACE,
        };
    }, [policy]);

    return (
        <ScreenWrapper
            testID={WorkspaceInitialPage.displayName}
            includeSafeAreaPaddingBottom={false}
        >
            <FullPageNotFoundView
                onBackButtonPress={Navigation.dismissModal}
                onLinkPress={Navigation.resetToHome}
                shouldShow={shouldShowNotFoundPage}
                subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
            >
                <HeaderWithBackButton
                    title={policyName}
                    onBackButtonPress={Navigation.dismissModal}
                    policyAvatar={policyAvatar}
                    style={styles.headerBarDesktopHeight}
                />

                <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexColumn, styles.justifyContentBetween]}>
                    <OfflineWithFeedback
                        pendingAction={policy?.pendingAction}
                        onClose={() => dismissError(policyID)}
                        errors={policy?.errors}
                        errorRowStyles={[styles.ph5, styles.pv2]}
                    >
                        <View style={[styles.pb4, styles.mh3, styles.mt3]}>
                            {/*
                                Ideally we should use MenuList component for MenuItems with singleExecution/Navigation actions.
                                In this case where user can click on workspace avatar or menu items, we need to have a check for `isExecuting`. So, we are directly mapping menuItems.
                            */}
                            {menuItems.map((item) => (
                                <HighlightableMenuItem
                                    key={item.translationKey}
                                    disabled={hasPolicyCreationError || isExecuting}
                                    interactive={!hasPolicyCreationError}
                                    title={translate(item.translationKey)}
                                    icon={item.icon}
                                    onPress={item.action}
                                    brickRoadIndicator={item.brickRoadIndicator}
                                    wrapperStyle={styles.sectionMenuItem}
                                    highlighted={enabledItem?.routeName === item.routeName}
                                    focused={!!(item.routeName && activeRoute?.startsWith(item.routeName))}
                                    hoverAndPressStyle={styles.hoveredComponentBG}
                                    isPaneMenu
                                />
                            ))}
                        </View>
                    </OfflineWithFeedback>
                </ScrollView>
                <ConfirmModal
                    title={translate('workspace.bankAccount.workspaceCurrency')}
                    isVisible={isCurrencyModalOpen}
                    onConfirm={confirmCurrencyChangeAndHideModal}
                    onCancel={() => setIsCurrencyModalOpen(false)}
                    prompt={translate('workspace.bankAccount.updateCurrencyPrompt')}
                    confirmText={translate('workspace.bankAccount.updateToUSD')}
                    cancelText={translate('common.cancel')}
                    danger
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

WorkspaceInitialPage.displayName = 'WorkspaceInitialPage';

export default withPolicyAndFullscreenLoading(
    withOnyx<WorkspaceInitialPageProps, WorkspaceInitialPageOnyxProps>({
        // @ts-expect-error: ONYXKEYS.REIMBURSEMENT_ACCOUNT is conflicting with ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
        policyCategories: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${route.params?.policyID ?? '0'}`,
        },
    })(WorkspaceInitialPage),
);
