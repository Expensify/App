import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Breadcrumbs from '@components/Breadcrumbs';
import ConfirmModal from '@components/ConfirmModal';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import useActiveRoute from '@hooks/useActiveRoute';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {BottomTabNavigatorParamList} from '@navigation/types';
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
};

type WorkspaceInitialPageProps = WithPolicyAndFullscreenLoadingProps & WorkspaceInitialPageOnyxProps & StackScreenProps<BottomTabNavigatorParamList, typeof SCREENS.WORKSPACE.INITIAL>;

function dismissError(policyID: string) {
    PolicyUtils.goBackFromInvalidPolicy();
    Policy.removeWorkspace(policyID);
}

function WorkspaceInitialPage({policyDraft, policy: policyProp, policyMembers, reimbursementAccount}: WorkspaceInitialPageProps) {
    const styles = useThemeStyles();
    const policy = policyDraft?.id ? policyDraft : policyProp;
    const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
    const hasPolicyCreationError = !!(policy?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD && policy.errors);
    const waitForNavigate = useWaitForNavigation();
    const {singleExecution, isExecuting} = useSingleExecution();
    const activeRoute = useActiveRoute();

    const {translate} = useLocalize();

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

    const hasMembersError = PolicyUtils.hasPolicyMemberError(policyMembers);
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
            translationKey: 'workspace.common.members',
            icon: Expensicons.Users,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID)))),
            brickRoadIndicator: hasMembersError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            routeName: SCREENS.WORKSPACE.MEMBERS,
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

    const protectedCollectPolicyMenuItems: WorkspaceMenuItem[] = [
        {
            translationKey: 'workspace.common.workflows',
            icon: Expensicons.Workflows,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS.getRoute(policyID)))),
            routeName: SCREENS.WORKSPACE.WORKFLOWS,
        },
        {
            translationKey: 'workspace.common.members',
            icon: Expensicons.Users,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID)))),
            brickRoadIndicator: hasMembersError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            routeName: SCREENS.WORKSPACE.MEMBERS,
        },
        {
            translationKey: 'workspace.common.categories',
            icon: Expensicons.Folder,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_CATEGORIES.getRoute(policyID)))),
            routeName: SCREENS.WORKSPACE.CATEGORIES,
        },
    ];

    const menuItems: WorkspaceMenuItem[] = [
        {
            translationKey: 'workspace.common.profile',
            icon: Expensicons.Home,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_PROFILE.getRoute(policyID)))),
            brickRoadIndicator: hasGeneralSettingsError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            routeName: SCREENS.WORKSPACE.PROFILE,
        },
        ...(isPaidGroupPolicy && shouldShowProtectedItems ? protectedCollectPolicyMenuItems : []),
        ...(isFreeGroupPolicy && shouldShowProtectedItems ? protectedFreePolicyMenuItems : []),
    ];

    const prevPolicy = usePrevious(policy);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage =
        isEmptyObject(policy) ||
        // We check isPendingDelete for both policy and prevPolicy to prevent the NotFound view from showing right after we delete the workspace
        (PolicyUtils.isPendingDeletePolicy(policy) && PolicyUtils.isPendingDeletePolicy(prevPolicy));

    return (
        <ScreenWrapper
            testID={WorkspaceInitialPage.displayName}
            includePaddingTop={false}
            includeSafeAreaPaddingBottom={false}
            style={[styles.pb0]}
        >
            <FullPageNotFoundView
                onBackButtonPress={PolicyUtils.goBackFromInvalidPolicy}
                onLinkPress={PolicyUtils.goBackFromInvalidPolicy}
                shouldShow={shouldShowNotFoundPage}
                subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
            >
                <Breadcrumbs
                    breadcrumbs={[
                        {
                            type: CONST.BREADCRUMB_TYPE.STRONG,
                            text: policyName,
                        },
                        {
                            text: translate('common.settings'),
                        },
                    ]}
                    style={[styles.ph5, styles.mb5]}
                />
                <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexColumn, styles.justifyContentBetween]}>
                    <OfflineWithFeedback
                        pendingAction={policy?.pendingAction}
                        onClose={() => dismissError(policyID)}
                        errors={policy?.errors}
                        errorRowStyles={[styles.ph5, styles.pv2]}
                    >
                        <View style={[styles.pb4, styles.mh3]}>
                            {/*
                                Ideally we should use MenuList component for MenuItems with singleExecution/Navigation actions.
                                In this case where user can click on workspace avatar or menu items, we need to have a check for `isExecuting`. So, we are directly mapping menuItems.
                            */}
                            {menuItems.map((item) => (
                                <MenuItem
                                    key={item.translationKey}
                                    disabled={hasPolicyCreationError || isExecuting}
                                    interactive={!hasPolicyCreationError}
                                    title={translate(item.translationKey)}
                                    icon={item.icon}
                                    onPress={item.action}
                                    brickRoadIndicator={item.brickRoadIndicator}
                                    wrapperStyle={styles.sectionMenuItem}
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
    })(WorkspaceInitialPage),
);
