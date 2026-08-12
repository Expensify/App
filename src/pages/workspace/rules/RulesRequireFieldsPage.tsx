import Button from '@components/ButtonComposed';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyData from '@hooks/usePolicyData';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import {getCleanedTagName, getTagLists, hasAccountingConnections, hasDependentTags as hasDependentTagsUtil, isMultiLevelTags as isMultiLevelTagsUtil} from '@libs/PolicyUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import {enablePolicyCategories, setWorkspaceRequiresCategory} from '@userActions/Policy/Category';
import {clearPolicyErrorField} from '@userActions/Policy/Policy';
import {clearPolicyTagListErrorField, enablePolicyTags, openPolicyTagsPage, setPolicyRequiresTag, setWorkspaceTagRequired} from '@userActions/Policy/Tag';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

type RulesRequireFieldsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_REQUIRE_FIELDS>;

function RulesRequireFieldsPage({
    route: {
        params: {policyID},
    },
}: RulesRequireFieldsPageProps) {
    const policyData = usePolicyData(policyID);
    const {policy} = policyData;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isBetaEnabled} = usePermissions();
    const {showConfirmModal} = useConfirmModal();
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);

    // Match the Categories/Tags toggles on WorkspaceMoreFeaturesPage: only an accounting connection owns these
    // features. policy.connections also holds HR connections, which must not lock the Required toggles.
    const isConnectedToAccounting = hasAccountingConnections(policy);
    const hasEnabledCategories = hasEnabledOptions(policyData.categories);
    const isCategoryFeatureDisabled = !policy?.areCategoriesEnabled;
    const isCategoryToggleDisabled = isCategoryFeatureDisabled || !hasEnabledCategories || isConnectedToAccounting;

    const hasEnabledTags = hasEnabledOptions(Object.values(policyTags ?? {}).flatMap(({tags}) => Object.values(tags)));
    const isTagFeatureDisabled = !policy?.areTagsEnabled;
    const isTagToggleDisabled = isTagFeatureDisabled || !hasEnabledTags || isConnectedToAccounting;

    // Independent multi-level tags carry Required on each list, so they get a row per level. Single-level and
    // dependent tags have only the policy-wide flag, matching where the Tags table offers a per-level switch.
    const tagLists = useMemo(() => getTagLists(policyTags), [policyTags]);
    const hasPerLevelTagRequired = isMultiLevelTagsUtil(policyTags) && !hasDependentTagsUtil(policy, policyTags);
    const initialCategoryRequired = !!policy?.requiresCategory;
    const initialTagRequired = !!policy?.requiresTag;

    const [categoryRequired, setCategoryRequired] = useState(initialCategoryRequired);
    const [tagRequired, setTagRequired] = useState(initialTagRequired);
    // Only levels the user actually toggled live here. Everything else reads from the tag list, so tag lists that
    // arrive after the first render can't be mistaken for edits.
    const [tagRequiredByLevel, setTagRequiredByLevel] = useState<Record<number, boolean>>({});
    const syncedPolicyIDRef = useRef<string | undefined>(undefined);

    const getLevelRequired = useCallback((orderWeight: number, isRequiredOnList: boolean | undefined) => tagRequiredByLevel[orderWeight] ?? !!isRequiredOnList, [tagRequiredByLevel]);

    useEffect(() => {
        syncedPolicyIDRef.current = undefined;
    }, [policyID]);

    useEffect(() => {
        // The tag lists are only fetched by the Tags pages, so without this the per-level rows stay hidden until one is opened.
        openPolicyTagsPage(policyID);
    }, [policyID]);

    useEffect(() => {
        if (!policy?.id || policy.isLoading || syncedPolicyIDRef.current === policy.id) {
            return;
        }

        syncedPolicyIDRef.current = policy.id;
        setCategoryRequired(!!policy.requiresCategory);
        setTagRequired(!!policy.requiresTag);
        setTagRequiredByLevel({});
    }, [policy?.id, policy?.isLoading, policy?.requiresCategory, policy?.requiresTag]);

    const changedTagLevels = useMemo(
        () => (hasPerLevelTagRequired ? tagLists.filter((tagList) => getLevelRequired(tagList.orderWeight, tagList.required) !== !!tagList.required) : []),
        [hasPerLevelTagRequired, tagLists, getLevelRequired],
    );

    const hasChanges = useMemo(
        () => categoryRequired !== initialCategoryRequired || (hasPerLevelTagRequired ? changedTagLevels.length > 0 : tagRequired !== initialTagRequired),
        [categoryRequired, initialCategoryRequired, hasPerLevelTagRequired, changedTagLevels, tagRequired, initialTagRequired],
    );

    const handleSave = useCallback(() => {
        if (!hasChanges) {
            Navigation.goBack();
            return;
        }

        if (categoryRequired !== initialCategoryRequired) {
            setWorkspaceRequiresCategory(policyData, categoryRequired);
        }

        if (hasPerLevelTagRequired) {
            // One call per direction so a mixed change is two requests rather than one per level.
            const levelsToRequire = changedTagLevels.filter((tagList) => getLevelRequired(tagList.orderWeight, tagList.required)).map((tagList) => tagList.orderWeight);
            const levelsToMakeOptional = changedTagLevels.filter((tagList) => !getLevelRequired(tagList.orderWeight, tagList.required)).map((tagList) => tagList.orderWeight);

            if (levelsToRequire.length > 0) {
                setWorkspaceTagRequired(policyData, levelsToRequire, true);
            }
            if (levelsToMakeOptional.length > 0) {
                setWorkspaceTagRequired(policyData, levelsToMakeOptional, false);
            }
        } else if (tagRequired !== initialTagRequired) {
            setPolicyRequiresTag(policyData, tagRequired);
        }

        Navigation.setNavigationActionToMicrotaskQueue(Navigation.goBack);
    }, [hasChanges, categoryRequired, initialCategoryRequired, hasPerLevelTagRequired, changedTagLevels, getLevelRequired, tagRequired, initialTagRequired, policyData]);

    const handleToggleTagLevel = useCallback(
        async (orderWeight: number, isOn: boolean) => {
            // The Tags table blocked clearing the last required level while the workspace still requires a tag, so that
            // guard moves here with the control. It reads the pending edits rather than isMakingLastRequiredTagListOptional,
            // which only sees saved state and would miss levels switched off earlier in this same visit.
            const wouldClearLastRequiredLevel =
                !isOn && !!policy?.requiresTag && tagLists.every((tagList) => tagList.orderWeight === orderWeight || !getLevelRequired(tagList.orderWeight, tagList.required));

            if (wouldClearLastRequiredLevel) {
                await showConfirmModal({
                    title: translate('workspace.tags.cannotMakeAllTagsOptional.title'),
                    prompt: translate('workspace.tags.cannotMakeAllTagsOptional.description'),
                    confirmText: translate('common.buttonConfirm'),
                    shouldShowCancelButton: false,
                });
                return;
            }

            setTagRequiredByLevel((previous) => ({...previous, [orderWeight]: isOn}));
        },
        [getLevelRequired, policy?.requiresTag, showConfirmModal, tagLists, translate],
    );

    // Lock UX only when the feature itself is off (or categories are accounting-controlled).
    // Feature on but no enabled items: toggle stays disabled without lock/modal.
    const shouldShowCategoryLock = isCategoryFeatureDisabled || isConnectedToAccounting;
    const shouldShowTagLock = isTagFeatureDisabled || isConnectedToAccounting;

    /** Tag lists are named by the admin, so show that name and keep the generic label only for unnamed lists. */
    const getTagLevelLabel = (tagListName: string | undefined) => {
        const cleanedName = tagListName ? getCleanedTagName(tagListName) : '';
        return cleanedName || translate('workspace.rules.requireFields.tag');
    };

    // The single toggle covers every level, so a list name would only fit when there is exactly one list.
    const singleTagRowLabel = tagLists.length === 1 ? getTagLevelLabel(tagLists.at(0)?.name) : translate('workspace.rules.requireFields.tag');

    const categoryDisabledText = (() => {
        if (!shouldShowCategoryLock) {
            return undefined;
        }
        if (isConnectedToAccounting) {
            return translate('workspace.moreFeatures.connectionsWarningModal.featureEnabledText');
        }
        return translate('workspace.rules.individualExpenseRules.enableCategoriesToUnlockPrompt');
    })();

    const promptEnableCategoriesForRequireCategory = useCallback(async () => {
        if (isConnectedToAccounting) {
            const {action} = await showConfirmModal({
                title: translate('workspace.moreFeatures.connectionsWarningModal.featureEnabledTitle'),
                prompt: translate('workspace.moreFeatures.connectionsWarningModal.featureEnabledText'),
                confirmText: translate('workspace.moreFeatures.connectionsWarningModal.manageSettings'),
                cancelText: translate('common.cancel'),
            });
            if (action !== ModalActions.CONFIRM) {
                return;
            }
            Navigation.navigate(ROUTES.POLICY_ACCOUNTING.getRoute(policyID));
            return;
        }

        if (!isCategoryFeatureDisabled) {
            return;
        }

        const {action} = await showConfirmModal({
            title: translate('workspace.rules.individualExpenseRules.enableCategoriesToUnlockTitle'),
            prompt: translate('workspace.rules.individualExpenseRules.enableCategoriesAndRequirePrompt'),
            confirmText: translate('common.ok'),
            cancelText: translate('common.cancel'),
        });
        if (action !== ModalActions.CONFIRM) {
            return;
        }
        enablePolicyCategories(policyData, true, false);
        setWorkspaceRequiresCategory(policyData, true);
        setCategoryRequired(true);
    }, [isCategoryFeatureDisabled, isConnectedToAccounting, policyData, policyID, showConfirmModal, translate]);

    const tagDisabledText = (() => {
        if (!shouldShowTagLock) {
            return undefined;
        }
        if (isConnectedToAccounting) {
            return translate('workspace.moreFeatures.connectionsWarningModal.featureEnabledText');
        }
        return translate('workspace.rules.individualExpenseRules.enableTagsToUnlockPrompt');
    })();

    const promptEnableTagsForRequireTag = useCallback(async () => {
        // Accounting owns Tags while a connection is active, same as the Tags toggle on More features, so this must
        // not force the feature on from here.
        if (isConnectedToAccounting) {
            const {action} = await showConfirmModal({
                title: translate('workspace.moreFeatures.connectionsWarningModal.featureEnabledTitle'),
                prompt: translate('workspace.moreFeatures.connectionsWarningModal.featureEnabledText'),
                confirmText: translate('workspace.moreFeatures.connectionsWarningModal.manageSettings'),
                cancelText: translate('common.cancel'),
            });
            if (action !== ModalActions.CONFIRM) {
                return;
            }
            Navigation.navigate(ROUTES.POLICY_ACCOUNTING.getRoute(policyID));
            return;
        }

        if (!isTagFeatureDisabled) {
            return;
        }

        const {action} = await showConfirmModal({
            title: translate('workspace.rules.individualExpenseRules.enableTagsToUnlockTitle'),
            prompt: translate('workspace.rules.individualExpenseRules.enableTagsAndRequirePrompt'),
            confirmText: translate('common.ok'),
            cancelText: translate('common.cancel'),
        });
        if (action !== ModalActions.CONFIRM) {
            return;
        }
        enablePolicyTags(policyData, true);
        setPolicyRequiresTag(policyData, true);
        setTagRequired(true);
    }, [isConnectedToAccounting, isTagFeatureDisabled, policyData, policyID, showConfirmModal, translate]);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.RULES}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
            shouldBeBlocked={!isRulesRevampEnabled}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID="RulesRequireFieldsPage"
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.requireFields.title')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <ScrollView
                    style={[styles.flexGrow1]}
                    contentContainerStyle={[styles.ph5, styles.pb5]}
                    addBottomSafeAreaPadding
                >
                    <ToggleSettingOptionRow
                        title={translate('workspace.rules.requireFields.category')}
                        switchAccessibilityLabel={translate('workspace.rules.requireFields.category')}
                        shouldPlaceSubtitleBelowSwitch
                        wrapperStyle={styles.pv3}
                        isActive={categoryRequired}
                        disabled={isCategoryToggleDisabled}
                        showLockIcon={shouldShowCategoryLock}
                        disabledText={categoryDisabledText}
                        disabledAction={shouldShowCategoryLock ? promptEnableCategoriesForRequireCategory : undefined}
                        pendingAction={policy?.pendingFields?.requiresCategory}
                        errors={policy?.errorFields?.requiresCategory ?? undefined}
                        onCloseError={() => clearPolicyErrorField(policyID, 'requiresCategory')}
                        onToggle={setCategoryRequired}
                    />

                    {hasPerLevelTagRequired ? (
                        tagLists.map((tagList, tagListIndex) => {
                            const label = getTagLevelLabel(tagList.name);
                            const isLevelToggleDisabled = isTagToggleDisabled || (!tagList.required && !hasEnabledOptions(Object.values(tagList.tags ?? {})));
                            return (
                                <ToggleSettingOptionRow
                                    key={tagList.name}
                                    title={label}
                                    switchAccessibilityLabel={label}
                                    shouldPlaceSubtitleBelowSwitch
                                    wrapperStyle={styles.pv3}
                                    isActive={getLevelRequired(tagList.orderWeight, tagList.required)}
                                    disabled={isLevelToggleDisabled}
                                    showLockIcon={shouldShowTagLock}
                                    disabledText={tagDisabledText}
                                    disabledAction={shouldShowTagLock ? promptEnableTagsForRequireTag : undefined}
                                    pendingAction={tagList.pendingFields?.required}
                                    errors={tagList.errorFields?.required ?? undefined}
                                    onCloseError={() => clearPolicyTagListErrorField({policyID, tagListIndex, errorField: 'required', policyTags})}
                                    onToggle={(isOn) => handleToggleTagLevel(tagList.orderWeight, isOn)}
                                />
                            );
                        })
                    ) : (
                        <ToggleSettingOptionRow
                            title={singleTagRowLabel}
                            switchAccessibilityLabel={singleTagRowLabel}
                            shouldPlaceSubtitleBelowSwitch
                            wrapperStyle={styles.pv3}
                            isActive={tagRequired}
                            disabled={isTagToggleDisabled}
                            showLockIcon={shouldShowTagLock}
                            disabledText={tagDisabledText}
                            disabledAction={shouldShowTagLock ? promptEnableTagsForRequireTag : undefined}
                            pendingAction={policy?.pendingFields?.requiresTag}
                            errors={policy?.errorFields?.requiresTag ?? undefined}
                            onCloseError={() => clearPolicyErrorField(policyID, 'requiresTag')}
                            onToggle={setTagRequired}
                        />
                    )}
                </ScrollView>
                <FixedFooter
                    addBottomSafeAreaPadding
                    addOfflineIndicatorBottomSafeAreaPadding
                >
                    <Button
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        size={CONST.BUTTON_SIZE.LARGE}
                        onPress={handleSave}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.REQUIRE_FIELDS_SAVE}
                    >
                        <Button.Text>{translate('workspace.rules.requireFields.save')}</Button.Text>
                    </Button>
                </FixedFooter>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default RulesRequireFieldsPage;
