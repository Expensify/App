import Button from '@components/ButtonComposed';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyData from '@hooks/usePolicyData';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {hasEnabledOptions} from '@libs/OptionsListUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import {setWorkspaceRequiresCategory} from '@userActions/Policy/Category';
import {clearPolicyErrorField} from '@userActions/Policy/Policy';
import {setPolicyRequiresTag} from '@userActions/Policy/Tag';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
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
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);

    const isConnectedToAccounting = Object.keys(policy?.connections ?? {}).length > 0;
    const hasEnabledCategories = hasEnabledOptions(policyData.categories);
    const isCategoryToggleDisabled = !policy?.areCategoriesEnabled || !hasEnabledCategories || isConnectedToAccounting;

    const hasEnabledTags = hasEnabledOptions(Object.values(policyTags ?? {}).flatMap(({tags}) => Object.values(tags)));
    const isTagToggleDisabled = !policy?.areTagsEnabled || !hasEnabledTags;

    const initialCategoryRequired = !!policy?.requiresCategory;
    const initialTagRequired = !!policy?.requiresTag;

    const [categoryRequired, setCategoryRequired] = useState(initialCategoryRequired);
    const [tagRequired, setTagRequired] = useState(initialTagRequired);
    const syncedPolicyIDRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        syncedPolicyIDRef.current = undefined;
    }, [policyID]);

    useEffect(() => {
        if (!policy?.id || policy.isLoading || syncedPolicyIDRef.current === policy.id) {
            return;
        }

        syncedPolicyIDRef.current = policy.id;
        setCategoryRequired(!!policy.requiresCategory);
        setTagRequired(!!policy.requiresTag);
    }, [policy?.id, policy?.isLoading, policy?.requiresCategory, policy?.requiresTag]);

    const hasChanges = useMemo(
        () => categoryRequired !== initialCategoryRequired || tagRequired !== initialTagRequired,
        [categoryRequired, initialCategoryRequired, tagRequired, initialTagRequired],
    );

    const handleSave = useCallback(() => {
        if (!hasChanges) {
            Navigation.goBack();
            return;
        }

        if (categoryRequired !== initialCategoryRequired) {
            setWorkspaceRequiresCategory(policyData, categoryRequired);
        }
        if (tagRequired !== initialTagRequired) {
            setPolicyRequiresTag(policyData, tagRequired);
        }
        Navigation.setNavigationActionToMicrotaskQueue(Navigation.goBack);
    }, [hasChanges, categoryRequired, initialCategoryRequired, tagRequired, initialTagRequired, policyData]);

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
                        showLockIcon={isCategoryToggleDisabled}
                        pendingAction={policy?.pendingFields?.requiresCategory}
                        errors={policy?.errorFields?.requiresCategory ?? undefined}
                        onCloseError={() => clearPolicyErrorField(policyID, 'requiresCategory')}
                        onToggle={setCategoryRequired}
                    />

                    <ToggleSettingOptionRow
                        title={translate('workspace.rules.requireFields.tag')}
                        switchAccessibilityLabel={translate('workspace.rules.requireFields.tag')}
                        shouldPlaceSubtitleBelowSwitch
                        wrapperStyle={styles.pv3}
                        isActive={tagRequired}
                        disabled={isTagToggleDisabled}
                        showLockIcon={isTagToggleDisabled}
                        pendingAction={policy?.pendingFields?.requiresTag}
                        errors={policy?.errorFields?.requiresTag ?? undefined}
                        onCloseError={() => clearPolicyErrorField(policyID, 'requiresTag')}
                        onToggle={setTagRequired}
                    />
                </ScrollView>
                <FixedFooter
                    addBottomSafeAreaPadding
                    addOfflineIndicatorBottomSafeAreaPadding
                >
                    <Button
                        variant="success"
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
