import {useRoute} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
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
import type {Part} from '@libs/actions/Policy/CopyPolicySettings';
import {FEATURE_ROWS} from '@libs/CopyPolicySettingsUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {PolicyCopySettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

function CopyPolicySettingsConfirmPage() {
    const route = useRoute<PlatformStackRouteProp<PolicyCopySettingsNavigatorParamList, typeof SCREENS.POLICY_COPY_SETTINGS.CONFIRM>>();
    const sourcePolicyID = route?.params?.policyID;

    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [copyPolicySettingsState] = useOnyx(ONYXKEYS.COPY_POLICY_SETTINGS);
    const [allPolicyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES);
    const [allPolicyTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS);

    const sourcePolicy = sourcePolicyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${sourcePolicyID}`] : undefined;
    const targetPolicyIDs = copyPolicySettingsState?.targetPolicyIDs ?? [];
    const parts = (copyPolicySettingsState?.parts ?? []) as Part[];
    const hasLoadedCopyPolicySettings = copyPolicySettingsState !== undefined;
    const hasLoadedPolicies = policies !== undefined;

    const targetPolicies = targetPolicyIDs.map((id) => policies?.[`${ONYXKEYS.COLLECTION.POLICY}${id}`]).filter((policy) => policy !== undefined);

    useEffect(() => {
        if (!sourcePolicyID || !hasLoadedCopyPolicySettings || !hasLoadedPolicies || parts.length || targetPolicyIDs.length) {
            return;
        }

        Navigation.navigate(ROUTES.POLICY_COPY_SETTINGS.getRoute(sourcePolicyID));
    }, [hasLoadedCopyPolicySettings, hasLoadedPolicies, parts.length, sourcePolicyID, targetPolicyIDs.length]);

    const translatedParts = parts
        .map((part) => {
            const row = FEATURE_ROWS.find((r) => r.part === part);
            return row ? translate(row.labelKey) : '';
        })
        .filter(Boolean)
        .join(', ');

    const handleCopyPolicySettings = () => {
        if (!sourcePolicy) {
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
                    <Button
                        success
                        large
                        text={translate('workspace.copyPolicySettings.title')}
                        onPress={handleCopyPolicySettings}
                        isDisabled={parts.length === 0 || targetPolicyIDs.length === 0}
                    />
                </FixedFooter>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

CopyPolicySettingsConfirmPage.displayName = 'CopyPolicySettingsConfirmPage';

export default CopyPolicySettingsConfirmPage;
