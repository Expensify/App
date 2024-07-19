import {useFocusEffect, useNavigationState} from '@react-navigation/native';
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
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import getTopmostRouteName from '@libs/Navigation/getTopmostRouteName';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import type {FullScreenNavigatorParamList} from '@navigation/types';
import * as App from '@userActions/App';
import * as Policy from '@userActions/Policy/Policy';
import * as ReimbursementAccount from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type {PolicyFeatureName} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';

type WorkspaceMenuItem = {
    translationKey: TranslationPaths;
    icon: IconAsset;
    action: () => void;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
    routeName?:
        | typeof SCREENS.WORKSPACE.ACCOUNTING.ROOT
        | typeof SCREENS.WORKSPACE.INITIAL
        | typeof SCREENS.WORKSPACE.CARD
        | typeof SCREENS.WORKSPACE.REIMBURSE
        | typeof SCREENS.WORKSPACE.BILLS
        | typeof SCREENS.WORKSPACE.INVOICES
        | typeof SCREENS.WORKSPACE.TRAVEL
        | typeof SCREENS.WORKSPACE.DISTANCE_RATES
        | typeof SCREENS.WORKSPACE.WORKFLOWS
        | typeof SCREENS.WORKSPACE.CATEGORIES
        | typeof SCREENS.WORKSPACE.TAGS
        | typeof SCREENS.WORKSPACE.TAXES
        | typeof SCREENS.WORKSPACE.MORE_FEATURES
        | typeof SCREENS.WORKSPACE.PROFILE
        | typeof SCREENS.WORKSPACE.MEMBERS
        | typeof SCREENS.WORKSPACE.EXPENSIFY_CARD
        | typeof SCREENS.WORKSPACE.REPORT_FIELDS;
};

type WorkspaceInitialPageOnyxProps = {
    /** Bank account attached to free plan */
    reimbursementAccount: OnyxEntry<OnyxTypes.ReimbursementAccount>;

    /** Collection of categories attached to a policy */
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
};

type WorkspaceInitialPageProps = WithPolicyAndFullscreenLoadingProps & WorkspaceInitialPageOnyxProps & StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.INITIAL>;

type PolicyFeatureStates = Record<PolicyFeatureName, boolean>;

function dismissError(policyID: string, pendingAction: PendingAction | undefined) {
    if (!policyID || pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        PolicyUtils.goBackFromInvalidPolicy();
        Policy.removeWorkspace(policyID);
    } else {
        Policy.clearErrors(policyID);
    }
}

function WorkspaceInitialPage({policyDraft, policy: policyProp, reimbursementAccount, policyCategories, route}: WorkspaceInitialPageProps) {
    const styles = useThemeStyles();
    const policy = policyDraft?.id ? policyDraft : policyProp;
    const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
    const hasPolicyCreationError = !!(policy?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD && !isEmptyObject(policy.errors));
    const waitForNavigate = useWaitForNavigation();
    const {singleExecution, isExecuting} = useSingleExecution();
    const activeRoute = useNavigationState(getTopmostRouteName);
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const prevPendingFields = usePrevious(policy?.pendingFields);
    const policyFeatureStates = useMemo(
        () => ({
            [CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED]: policy?.areDistanceRatesEnabled,
            [CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED]: policy?.areWorkflowsEnabled,
            [CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED]: policy?.areCategoriesEnabled,
            [CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED]: policy?.areTagsEnabled,
            [CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED]: policy?.tax?.trackingEnabled,
            [CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED]: policy?.areConnectionsEnabled,
            [CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED]: policy?.areExpensifyCardsEnabled,
            [CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED]: policy?.areReportFieldsEnabled,
        }),
        [policy],
    ) as PolicyFeatureStates;

    const fetchPolicyData = useCallback(() => {
        if (policyDraft?.id) {
            return;
        }
        Policy.openPolicyInitialPage(route.params.policyID);
    }, [policyDraft?.id, route.params.policyID]);

    useNetwork({onReconnect: fetchPolicyData});

    useFocusEffect(
        useCallback(() => {
            fetchPolicyData();
        }, [fetchPolicyData]),
    );

    const policyID = policy?.id ?? '-1';
    const policyName = policy?.name ?? '';

    useEffect(() => {
        const policyDraftId = policyDraft?.id;

        if (!policyDraftId) {
            return;
        }

        App.savePolicyDraftByNewWorkspace(policyDraft.id, policyDraft.name, '', policyDraft.makeMeAdmin);
        // We only care when the component renders the first time
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
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
    const hasGeneralSettingsError = !isEmptyObject(policy?.errorFields?.generalSettings ?? {}) || !isEmptyObject(policy?.errorFields?.avatarURL ?? {});
    const {login} = useCurrentUserPersonalDetails();
    const shouldShowProtectedItems = PolicyUtils.isPolicyAdmin(policy, login);
    const isPaidGroupPolicy = PolicyUtils.isPaidGroupPolicy(policy);
    const isFreeGroupPolicy = PolicyUtils.isFreeGroupPolicy(policy);
    const [featureStates, setFeatureStates] = useState(policyFeatureStates);

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

    // We only update feature states if they aren't pending.
    // These changes are made to synchronously change feature states along with AccessOrNotFoundWrapperComponent.
    useEffect(() => {
        setFeatureStates((currentFeatureStates) => {
            const newFeatureStates = {} as PolicyFeatureStates;
            (Object.keys(policy?.pendingFields ?? {}) as PolicyFeatureName[]).forEach((key) => {
                const isFeatureEnabled = PolicyUtils.isPolicyFeatureEnabled(policy, key);
                newFeatureStates[key] =
                    prevPendingFields?.[key] !== policy?.pendingFields?.[key] || isOffline || !policy?.pendingFields?.[key] ? isFeatureEnabled : currentFeatureStates[key];
            });
            return {
                ...policyFeatureStates,
                ...newFeatureStates,
            };
        });
    }, [policy, isOffline, policyFeatureStates, prevPendingFields]);

    if (featureStates?.[CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED]) {
        protectedCollectPolicyMenuItems.push({
            translationKey: 'workspace.common.distanceRates',
            icon: Expensicons.Car,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_DISTANCE_RATES.getRoute(policyID)))),
            routeName: SCREENS.WORKSPACE.DISTANCE_RATES,
        });
    }

    if (featureStates?.[CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED]) {
        protectedCollectPolicyMenuItems.push({
            translationKey: 'workspace.common.expensifyCard',
            icon: Expensicons.CreditCard,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID)))),
            routeName: SCREENS.WORKSPACE.EXPENSIFY_CARD,
        });
    }

    if (featureStates?.[CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED]) {
        protectedCollectPolicyMenuItems.push({
            translationKey: 'workspace.common.workflows',
            icon: Expensicons.Workflows,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS.getRoute(policyID)))),
            routeName: SCREENS.WORKSPACE.WORKFLOWS,
            brickRoadIndicator: !isEmptyObject(policy?.errorFields?.reimburser ?? {}) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
        });
    }

    if (featureStates?.[CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED]) {
        protectedCollectPolicyMenuItems.push({
            translationKey: 'workspace.common.categories',
            icon: Expensicons.Folder,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_CATEGORIES.getRoute(policyID)))),
            brickRoadIndicator: hasPolicyCategoryError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            routeName: SCREENS.WORKSPACE.CATEGORIES,
        });
    }

    if (featureStates?.[CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED]) {
        protectedCollectPolicyMenuItems.push({
            translationKey: 'workspace.common.tags',
            icon: Expensicons.Tag,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_TAGS.getRoute(policyID)))),
            routeName: SCREENS.WORKSPACE.TAGS,
        });
    }

    if (featureStates?.[CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED]) {
        protectedCollectPolicyMenuItems.push({
            translationKey: 'workspace.common.taxes',
            icon: Expensicons.Coins,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_TAXES.getRoute(policyID)))),
            routeName: SCREENS.WORKSPACE.TAXES,
            brickRoadIndicator: PolicyUtils.hasTaxRateError(policy) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
        });
    }

    if (featureStates?.[CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED]) {
        protectedCollectPolicyMenuItems.push({
            translationKey: 'workspace.common.reportFields',
            icon: Expensicons.Pencil,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_REPORT_FIELDS.getRoute(policyID)))),
            routeName: SCREENS.WORKSPACE.REPORT_FIELDS,
        });
    }

    if (featureStates?.[CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED]) {
        protectedCollectPolicyMenuItems.push({
            translationKey: 'workspace.common.accounting',
            icon: Expensicons.Sync,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING.getRoute(policyID)))),
            // brickRoadIndicator should be set when API will be ready
            brickRoadIndicator: undefined,
            routeName: SCREENS.WORKSPACE.ACCOUNTING.ROOT,
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

    useEffect(() => {
        if (isEmptyObject(prevPolicy) || PolicyUtils.isPendingDeletePolicy(prevPolicy) || !PolicyUtils.isPendingDeletePolicy(policy)) {
            return;
        }
        PolicyUtils.goBackFromInvalidPolicy();
    }, [policy, prevPolicy]);

    const policyAvatar = useMemo(() => {
        if (!policy) {
            return {source: Expensicons.ExpensifyAppIcon, name: CONST.WORKSPACE_SWITCHER.NAME, type: CONST.ICON_TYPE_AVATAR};
        }

        const avatar = policy?.avatarURL ? policy.avatarURL : getDefaultWorkspaceAvatar(policy?.name);
        return {
            source: avatar,
            name: policy?.name ?? '',
            type: CONST.ICON_TYPE_WORKSPACE,
            id: policy.id ?? '-1',
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
            key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${route.params?.policyID ?? '-1'}`,
        },
    })(WorkspaceInitialPage),
);
