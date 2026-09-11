import Button from '@components/Button';
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
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import {getTagListLabel, getTagLists, hasAccountingConnections, hasPerTagListRequired} from '@libs/PolicyUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import {enablePolicyCategories, setWorkspaceRequiresCategory} from '@userActions/Policy/Category';
import {clearPolicyErrorField} from '@userActions/Policy/Policy';
import {clearPolicyTagListErrorField, enablePolicyTags, openPolicyTagsPage, setPolicyRequiresTag, setPolicyTagLevelsRequired, setPolicyTagsRequired} from '@userActions/Policy/Tag';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PolicyTagLists} from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

import React, {useEffect, useRef, useState} from 'react';

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
    // The self-heal below writes to the server, so it needs the same Tags write check the Tags table uses.
    const {canWrite: canWriteTags} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.TAGS);
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);

    // Per WorkspaceMoreFeaturesPage: only accounting connections own these features, not the HR ones in policy.connections.
    const isConnectedToAccounting = hasAccountingConnections(policy);
    const hasEnabledCategories = hasEnabledOptions(policyData.categories);
    const isCategoryFeatureDisabled = !policy?.areCategoriesEnabled;
    const isCategoryToggleDisabled = isCategoryFeatureDisabled || !hasEnabledCategories || isConnectedToAccounting;

    const hasEnabledTags = hasEnabledOptions(Object.values(policyTags ?? {}).flatMap(({tags}) => Object.values(tags ?? {})));
    const isTagFeatureDisabled = !policy?.areTagsEnabled;
    // A connection owns the tag lists, not whether an expense must carry one, so unlike Categories it doesn't lock this.
    const isTagToggleDisabled = isTagFeatureDisabled || !hasEnabledTags;

    // Independent multi-level tags carry Required per list, so a row each. Single-level and dependent have only the policy-wide flag.
    const tagLists = getTagLists(policyTags);
    const hasPerLevelTagRequired = hasPerTagListRequired(policy, policyTags);
    const initialCategoryRequired = !!policy?.requiresCategory;
    const initialTagRequired = !!policy?.requiresTag;

    const [categoryRequired, setCategoryRequired] = useState(initialCategoryRequired);
    const [tagRequired, setTagRequired] = useState(initialTagRequired);
    // Pending per-level edits until Save, keyed by orderWeight. Only toggled levels are here, so late-arriving tag lists aren't edits.
    const [tagRequiredByLevel, setTagRequiredByLevel] = useState<Record<number, boolean>>({});
    const syncedPolicyIDRef = useRef<string | undefined>(undefined);
    const hasRequestedTagsRef = useRef(false);

    const getLevelRequired = (tagList: ValueOf<PolicyTagLists>) => tagRequiredByLevel[tagList.orderWeight] ?? !!tagList.required;

    useEffect(() => {
        syncedPolicyIDRef.current = undefined;
    }, [policyID]);

    useEffect(() => {
        // The General tab hydrates the tag lists, but it only mounts when it is the last selected Rules tab, so the
        // per-level rows would stay hidden when this page is opened directly. Fetch only when nothing loaded them.
        if (policyTags || hasRequestedTagsRef.current) {
            return;
        }

        hasRequestedTagsRef.current = true;
        openPolicyTagsPage(policyID);
    }, [policyID, policyTags]);

    useEffect(() => {
        // Same self-heal as the Tags table: a required level with no enabled tags can never be satisfied, and it still
        // fires a violation, so clear it. Pending edits are skipped so this can't fight a toggle the admin just flipped.
        if (!canWriteTags || !hasPerLevelTagRequired) {
            return;
        }

        for (const tagList of tagLists) {
            const isAlreadyHandled = !tagList.required || !!tagList.pendingFields?.required || tagRequiredByLevel[tagList.orderWeight] !== undefined;
            if (isAlreadyHandled || hasEnabledOptions(Object.values(tagList.tags ?? {}))) {
                continue;
            }

            setPolicyTagsRequired(policyData, false, tagList.orderWeight);
        }
    }, [canWriteTags, hasPerLevelTagRequired, policyData, tagLists, tagRequiredByLevel]);

    useEffect(() => {
        if (!policy?.id || policy.isLoading || syncedPolicyIDRef.current === policy.id) {
            return;
        }

        syncedPolicyIDRef.current = policy.id;
        setCategoryRequired(!!policy.requiresCategory);
        setTagRequired(!!policy.requiresTag);
        setTagRequiredByLevel({});
    }, [policy?.id, policy?.isLoading, policy?.requiresCategory, policy?.requiresTag]);

    const changedTagLevels = hasPerLevelTagRequired ? tagLists.filter((tagList) => getLevelRequired(tagList) !== !!tagList.required) : [];

    const hasChanges = categoryRequired !== initialCategoryRequired || (hasPerLevelTagRequired ? changedTagLevels.length > 0 : tagRequired !== initialTagRequired);

    const handleSave = () => {
        if (!hasChanges) {
            Navigation.goBack();
            return;
        }

        const hasCategoryChange = categoryRequired !== initialCategoryRequired;
        const hasTagLevelChanges = hasPerLevelTagRequired && changedTagLevels.length > 0;
        const hasSingleTagChange = !hasPerLevelTagRequired && tagRequired !== initialTagRequired;
        const categoryUpdateForTagRecompute = hasCategoryChange ? {requiresCategory: categoryRequired} : {};

        if (hasCategoryChange) {
            // With a tag change in the same save, the tag action owns the one violation recompute and carries requiresCategory into it.
            setWorkspaceRequiresCategory(policyData, categoryRequired, !hasTagLevelChanges && !hasSingleTagChange);
        }

        if (hasTagLevelChanges) {
            // One call for every changed level, so violations are recomputed once from the combined end state.
            setPolicyTagLevelsRequired(policyData, Object.fromEntries(changedTagLevels.map((tagList) => [tagList.orderWeight, !tagList.required])), categoryUpdateForTagRecompute);
        } else if (hasSingleTagChange) {
            setPolicyRequiresTag(policyData, tagRequired, categoryUpdateForTagRecompute);
        }

        Navigation.setNavigationActionToMicrotaskQueue(Navigation.goBack);
    };

    const showAllTagsOptionalWarning = () => {
        showConfirmModal({
            title: translate('workspace.tags.cannotMakeAllTagsOptional.title'),
            prompt: translate('workspace.tags.cannotMakeAllTagsOptional.description'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    };

    // setPolicyTagsRequired doesn't write policy.requiresTag, so it stays false until a refresh. A saved required level means
    // the same thing, and reading it saved (not pending) lets a level toggled on this visit still be switched back off.
    const doesWorkspaceRequireTag = !!policy?.requiresTag || tagLists.some((tagList) => tagList.required);

    // isMakingLastRequiredTagListOptional over pending edits, since it only sees saved state and would miss levels switched off this visit.
    const isLastRequiredLevel = (tagList: ValueOf<PolicyTagLists>) =>
        doesWorkspaceRequireTag && getLevelRequired(tagList) && tagLists.filter((currentTagList) => getLevelRequired(currentTagList)).length === 1;

    const handleTagListRequiredToggle = (required: boolean, tagList: ValueOf<PolicyTagLists>) => {
        if (!required && isLastRequiredLevel(tagList)) {
            showAllTagsOptionalWarning();
            return;
        }

        setTagRequiredByLevel((previous) => ({...previous, [tagList.orderWeight]: required}));
    };

    // Lock only when the feature is off (or categories are accounting-controlled). No enabled items just disables, no lock/modal.
    const shouldShowCategoryLock = isCategoryFeatureDisabled || isConnectedToAccounting;
    const shouldShowTagLock = isTagFeatureDisabled;

    const genericTagLabel = translate('workspace.rules.requireFields.tag');

    // One toggle covers every level, so a list name only fits when there is exactly one list.
    const singleTagRowLabel = tagLists.length === 1 ? getTagListLabel(tagLists.at(0)?.name, genericTagLabel) : genericTagLabel;

    const categoryDisabledText = (() => {
        if (!shouldShowCategoryLock) {
            return undefined;
        }
        if (isConnectedToAccounting) {
            return translate('workspace.moreFeatures.connectionsWarningModal.featureEnabledText');
        }
        return translate('workspace.rules.individualExpenseRules.enableCategoriesToUnlockPrompt');
    })();

    const promptEnableCategoriesForRequireCategory = async () => {
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
    };

    const tagDisabledText = (() => {
        if (!shouldShowTagLock) {
            return undefined;
        }
        if (isConnectedToAccounting) {
            return translate('workspace.moreFeatures.connectionsWarningModal.featureEnabledText');
        }
        return translate('workspace.rules.individualExpenseRules.enableTagsToUnlockPrompt');
    })();

    /** Pass orderWeight from a per-level row so only that level is required; omit it for the policy-wide row. */
    const promptEnableTagsForRequireTag = async (orderWeight?: number) => {
        if (!isTagFeatureDisabled) {
            return;
        }

        // The connection owns turning Tags on, so route to Accounting instead of calling enablePolicyTags.
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

        if (orderWeight !== undefined) {
            // setPolicyRequiresTag would require every list, not just this level.
            setPolicyTagsRequired(policyData, true, orderWeight);
            return;
        }

        setPolicyRequiresTag(policyData, true);
        setTagRequired(true);
    };

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
                            const label = getTagListLabel(tagList.name, genericTagLabel);
                            // Per the Tags table row: only this level's own tags gate its switch.
                            const areLevelTagsEnabled = hasEnabledOptions(Object.values(tagList.tags ?? {}));
                            const isLevelToggleDisabled = isTagFeatureDisabled || (!tagList.required && !areLevelTagsEnabled);
                            return (
                                <ToggleSettingOptionRow
                                    key={tagList.name}
                                    title={label}
                                    switchAccessibilityLabel={label}
                                    shouldPlaceSubtitleBelowSwitch
                                    wrapperStyle={styles.pv3}
                                    isActive={getLevelRequired(tagList)}
                                    disabled={isLevelToggleDisabled}
                                    showLockIcon={shouldShowTagLock || isLastRequiredLevel(tagList)}
                                    disabledText={tagDisabledText}
                                    disabledAction={shouldShowTagLock ? () => promptEnableTagsForRequireTag(tagList.orderWeight) : undefined}
                                    pendingAction={tagList.pendingFields?.required}
                                    errors={tagList.errorFields?.required ?? undefined}
                                    onCloseError={() => clearPolicyTagListErrorField({policyID, tagListIndex, errorField: 'required', policyTags})}
                                    onToggle={(isOn) => handleTagListRequiredToggle(isOn, tagList)}
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
