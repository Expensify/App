import Button from '@components/ButtonComposed';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {copyPolicySettings} from '@libs/actions/Policy/CopyPolicySettings';
import {FEATURE_ROWS, isSourceProvisionedForTravel, shouldShowCopyPolicySettingsUpgradeStep} from '@libs/CopyPolicySettingsUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {PolicyCopySettingsNavigatorParamList} from '@libs/Navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

function CopyPolicySettingsConfirmPage() {
    const route = useRoute<PlatformStackRouteProp<PolicyCopySettingsNavigatorParamList, typeof SCREENS.POLICY_COPY_SETTINGS.CONFIRM>>();
    const sourcePolicyID = route?.params?.policyID;

    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [policies, policiesMetadata] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [copyPolicySettingsState, copyPolicySettingsMetadata] = useOnyx(ONYXKEYS.COPY_POLICY_SETTINGS);
    const [allPolicyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES);
    const [allPolicyTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS);

    const sourcePolicy = sourcePolicyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${sourcePolicyID}`] : undefined;
    const targetPolicyIDs = copyPolicySettingsState?.targetPolicyIDs ?? [];
    const parts = copyPolicySettingsState?.parts ?? [];
    const isDataLoaded = !isLoadingOnyxValue(policiesMetadata, copyPolicySettingsMetadata);

    const targetPolicies = targetPolicyIDs.map((id) => policies?.[`${ONYXKEYS.COLLECTION.POLICY}${id}`]).filter((policy): policy is Policy => policy !== undefined);

    const areAllTargetPoliciesResolved = targetPolicyIDs.every((id) => !!policies?.[`${ONYXKEYS.COLLECTION.POLICY}${id}`]);

    // Copying travel from a provisioned source re-provisions each target with its own Spotnana
    // entity, which requires accepting Expensify Travel terms. Capture that consent here.
    const requiresTravelTermsConsent = parts.includes('travel') && isSourceProvisionedForTravel(sourcePolicy);
    const [hasAcceptedTravelTerms, setHasAcceptedTravelTerms] = useState(false);

    useEffect(() => {
        if (!sourcePolicyID || !isDataLoaded) {
            return;
        }

        if (!parts.length && !targetPolicyIDs.length) {
            Navigation.navigate(ROUTES.POLICY_COPY_SETTINGS.getRoute(sourcePolicyID));
            return;
        }

        if (!parts.length && targetPolicyIDs.length) {
            Navigation.navigate(ROUTES.POLICY_COPY_SETTINGS_SELECT_FEATURES.getRoute(sourcePolicyID));
        }
    }, [isDataLoaded, parts.length, sourcePolicyID, targetPolicyIDs.length]);

    const translatedParts = parts
        .map((part) => {
            const row = FEATURE_ROWS.find((r) => r.part === part);
            return row ? translate(row.labelKey) : '';
        })
        .filter(Boolean)
        .join(', ');

    const handleCopyPolicySettings = () => {
        if (!sourcePolicy || !sourcePolicyID || !isDataLoaded || !areAllTargetPoliciesResolved) {
            return;
        }
        // Editing the workspace selection from this screen can introduce a Collect (Team) target that
        // requires an upgrade for the already-selected Control-only settings, bypassing the Upgrade step.
        // Re-gate at submit time and route to the Upgrade step instead of copying when one is still required.
        if (shouldShowCopyPolicySettingsUpgradeStep(targetPolicies, parts)) {
            Navigation.navigate(ROUTES.POLICY_COPY_SETTINGS_UPGRADE.getRoute(sourcePolicyID));
            return;
        }
        copyPolicySettings(sourcePolicy, targetPolicies, parts, allPolicyCategories, allPolicyTags);
        Navigation.dismissModal();
    };

    const navigateToSelectFeatures = () => {
        if (!sourcePolicyID) {
            return;
        }
        Navigation.navigate(ROUTES.POLICY_COPY_SETTINGS_SELECT_FEATURES.getRoute(sourcePolicyID));
    };

    const navigateToSelectWorkspaces = () => {
        if (!sourcePolicyID) {
            return;
        }
        Navigation.navigate(ROUTES.POLICY_COPY_SETTINGS.getRoute(sourcePolicyID));
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={sourcePolicyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID={CopyPolicySettingsConfirmPage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('workspace.copyPolicySettings.title')}
                    onBackButtonPress={() => Navigation.goBack(sourcePolicyID ? ROUTES.POLICY_COPY_SETTINGS_SELECT_FEATURES.getRoute(sourcePolicyID) : undefined)}
                />
                <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                    <View style={[styles.ph5, styles.pv3]}>
                        <Text style={[styles.textHeadline]}>{translate('workspace.copyPolicySettings.confirmSettings.title')}</Text>
                        <View style={styles.mt1}>
                            <RenderHTML
                                html={`<muted-text>${translate('workspace.copyPolicySettings.confirmSettings.description', {workspaceName: sourcePolicy?.name ?? ''})}</muted-text>`}
                            />
                        </View>
                    </View>
                    <View style={[styles.mt4]}>
                        <MenuItemWithTopDescription
                            title={translatedParts}
                            description={translate('common.settings')}
                            onPress={navigateToSelectFeatures}
                            shouldShowRightIcon
                            numberOfLinesTitle={0}
                        />
                        <MenuItemWithTopDescription
                            title={targetPolicies.map((policy) => policy?.name).join(', ')}
                            description={translate('common.workspaces')}
                            onPress={navigateToSelectWorkspaces}
                            shouldShowRightIcon
                            numberOfLinesTitle={0}
                        />
                    </View>
                </ScrollView>
                <FixedFooter
                    style={[styles.mtAuto]}
                    addBottomSafeAreaPadding
                >
                    {requiresTravelTermsConsent && (
                        <>
                            <View style={[styles.renderHTML, styles.flexRow, styles.mb3]}>
                                <RenderHTML html={translate('travel.termsAndConditions.subtitle')} />
                            </View>
                            <CheckboxWithLabel
                                style={[styles.mb3]}
                                accessibilityLabel={translate('travel.termsAndConditions.label')}
                                isChecked={hasAcceptedTravelTerms}
                                onInputChange={() => setHasAcceptedTravelTerms((prev) => !prev)}
                                label={translate('travel.termsAndConditions.label')}
                            />
                        </>
                    )}
                    <Button
                        variant="success"
                        size={CONST.BUTTON_SIZE.LARGE}
                        onPress={handleCopyPolicySettings}
                        isDisabled={parts.length === 0 || targetPolicyIDs.length === 0 || (requiresTravelTermsConsent && !hasAcceptedTravelTerms)}
                    >
                        <Button.Text>{translate('workspace.copyPolicySettings.title')}</Button.Text>
                    </Button>
                </FixedFooter>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

CopyPolicySettingsConfirmPage.displayName = 'CopyPolicySettingsConfirmPage';

export default CopyPolicySettingsConfirmPage;
