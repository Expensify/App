import {useRoute} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {copyPolicySettings} from '@libs/actions/Policy/CopyPolicySettings';
import type {Part} from '@libs/actions/Policy/CopyPolicySettings';
import {FEATURE_ROWS} from '@libs/CopyPolicySettingsUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {PolicyCopySettingsNavigatorParamList} from '@libs/Navigation/types';
import {getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PolicyCategories, PolicyTagLists} from '@src/types/onyx';

function CopyPolicySettingsConfirmPage() {
    const route = useRoute<PlatformStackRouteProp<PolicyCopySettingsNavigatorParamList, typeof SCREENS.POLICY_COPY_SETTINGS.CONFIRM>>();
    const sourcePolicyID = route?.params?.policyID;

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [copyPolicySettingsState] = useOnyx(ONYXKEYS.COPY_POLICY_SETTINGS);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${sourcePolicyID}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${sourcePolicyID}`);

    const sourcePolicy = sourcePolicyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${sourcePolicyID}`] : undefined;
    const targetPolicyIDs = copyPolicySettingsState?.targetPolicyIDs ?? [];
    const parts = (copyPolicySettingsState?.parts ?? []) as Part[];

    const targetPolicies = targetPolicyIDs.map((id) => policies?.[`${ONYXKEYS.COLLECTION.POLICY}${id}`]).filter((policy) => policy !== undefined);

    const translatedParts = parts
        .map((part) => {
            const row = FEATURE_ROWS.find((r) => r.part === part);
            return row ? translate(row.labelKey) : '';
        })
        .filter(Boolean)
        .join(', ');

    const handleCopy = () => {
        if (!sourcePolicy) {
            return;
        }

        const executeCopy = () => {
            copyPolicySettings(sourcePolicy, targetPolicies, parts, policyCategories as unknown as OnyxCollection<PolicyCategories>, policyTags as unknown as OnyxCollection<PolicyTagLists>);
            Navigation.dismissModal();
        };

        const isWorkflowsSelected = parts.includes('workflows');
        const isMembersSelected = parts.includes('members');
        const memberCount = Object.keys(getMemberAccountIDsForWorkspace(sourcePolicy?.employeeList, false, false)).length;
        const hasMembersToCopy = memberCount > 1;

        if (!isWorkflowsSelected || isMembersSelected || !hasMembersToCopy) {
            executeCopy();
            return;
        }

        showConfirmModal({
            title: translate('common.headsUp'),
            prompt: translate('workspace.copyPolicySettings.confirmWorkflows.description'),
            confirmText: translate('workspace.copyPolicySettings.confirmWorkflows.continue'),
            cancelText: translate('common.cancel'),
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            executeCopy();
        });
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
                    onBackButtonPress={Navigation.goBack}
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
                <FixedFooter style={[styles.mtAuto]}>
                    <Button
                        success
                        large
                        text={translate('workspace.copyPolicySettings.title')}
                        onPress={handleCopy}
                        isDisabled={parts.length === 0 || targetPolicyIDs.length === 0}
                    />
                </FixedFooter>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

CopyPolicySettingsConfirmPage.displayName = 'CopyPolicySettingsConfirmPage';

export default CopyPolicySettingsConfirmPage;
