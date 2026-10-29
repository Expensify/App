import Checkbox from '@components/Checkbox';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import {PressableWithFeedback} from '@components/Pressable';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ConfirmButtonOptions, ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';

import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicyCopySettingsSelection from '@hooks/usePolicyCopySettingsSelection';
import useThemeStyles from '@hooks/useThemeStyles';

import {setCopyPolicySettingsData} from '@libs/actions/Policy/CopyPolicySettings';
import {shouldShowCopyPolicySettingsUpgradeStep} from '@libs/CopyPolicySettingsUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {PolicyCopySettingsNavigatorParamList} from '@libs/Navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {useRoute} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';

function CopyPolicySettingsSelectFeaturesPage() {
    const route = useRoute<PlatformStackRouteProp<PolicyCopySettingsNavigatorParamList, typeof SCREENS.POLICY_COPY_SETTINGS.SELECT_FEATURES>>();
    const sourcePolicyID = route?.params?.policyID;

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [copyPolicySettings] = useOnyx(ONYXKEYS.COPY_POLICY_SETTINGS);
    const sourcePolicy = sourcePolicyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${sourcePolicyID}`] : undefined;
    const targetPolicies = (copyPolicySettings?.targetPolicyIDs ?? []).map((id) => policies?.[`${ONYXKEYS.COLLECTION.POLICY}${id}`]);
    const {listItems, selectableFeatures, effectiveSelectedFeatures, selectedAvailableFeatures, availablePartSet, isWorkflowsSelected, toggleFeature, toggleAll} =
        usePolicyCopySettingsSelection(sourcePolicy, targetPolicies, copyPolicySettings?.parts ?? []);

    const saveAndNavigate = () => {
        if (!sourcePolicyID) {
            return;
        }
        const parts = effectiveSelectedFeatures.slice();
        setCopyPolicySettingsData({parts}).then(() => {
            // Copying Control-only settings onto a Collect (Team) target requires upgrading it first,
            // so insert the upgrade step before Confirm; otherwise skip straight to Confirm.
            const nextRoute = shouldShowCopyPolicySettingsUpgradeStep(targetPolicies, parts, sourcePolicy)
                ? ROUTES.POLICY_COPY_SETTINGS_UPGRADE.getRoute(sourcePolicyID)
                : ROUTES.POLICY_COPY_SETTINGS_CONFIRM.getRoute(sourcePolicyID);
            Navigation.navigate(nextRoute);
        });
    };

    const onConfirm = () => {
        const isMembersSelected = effectiveSelectedFeatures.includes(CONST.POLICY.POLICY_FEATURE.MEMBERS);
        const isMembersPartAvailable = availablePartSet.has(CONST.POLICY.POLICY_FEATURE.MEMBERS);

        if (!isWorkflowsSelected || isMembersSelected || !isMembersPartAvailable) {
            saveAndNavigate();
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
            saveAndNavigate();
        });
    };

    const confirmButtonOptions: ConfirmButtonOptions<ListItem> = {
        showButton: true,
        text: translate('common.next'),
        onConfirm,
        isDisabled: effectiveSelectedFeatures.length === 0,
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={sourcePolicyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID={CopyPolicySettingsSelectFeaturesPage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('workspace.copyPolicySettings.title')}
                    onBackButtonPress={() => Navigation.goBack(sourcePolicyID ? ROUTES.POLICY_COPY_SETTINGS.getRoute(sourcePolicyID) : undefined)}
                />
                <View style={[styles.ph5, styles.pv3]}>
                    <Text style={[styles.textHeadline]}>{translate('workspace.copyPolicySettings.selectSettings.title')}</Text>
                    <Text style={[styles.textSupporting]}>{translate('workspace.copyPolicySettings.selectSettings.description')}</Text>
                </View>
                <View style={[styles.flex1]}>
                    <View style={[styles.searchListHeaderContainerStyle, styles.pv3, styles.ph5, styles.flexRow, styles.alignItemsCenter]}>
                        <Checkbox
                            accessibilityLabel={translate('accessibilityHints.selectAllFeatures')}
                            isChecked={selectableFeatures.length > 0 && selectableFeatures.every((part) => selectedAvailableFeatures.includes(part))}
                            isIndeterminate={selectedAvailableFeatures.length > 0 && selectedAvailableFeatures.length < selectableFeatures.length}
                            onPress={toggleAll}
                            disabled={selectableFeatures.length === 0}
                            shouldSelectOnPressEnter
                        />
                        <PressableWithFeedback
                            style={[styles.userSelectNone, styles.alignItemsCenter]}
                            onPress={toggleAll}
                            accessible={false}
                            accessibilityElementsHidden
                            importantForAccessibility="no-hide-descendants"
                            tabIndex={-1}
                            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.COPY_SETTINGS_SELECT_FEATURES_SELECT_ALL}
                        >
                            <Text style={[styles.textLabelSupporting, styles.ph3]}>{translate('workspace.common.selectAll')}</Text>
                        </PressableWithFeedback>
                    </View>
                    <SelectionList
                        data={listItems}
                        shouldSingleExecuteRowSelect
                        ListItem={MultiSelectListItem}
                        onSelectRow={toggleFeature}
                        alternateNumberOfSupportedLines={2}
                        addBottomSafeAreaPadding
                        confirmButtonOptions={confirmButtonOptions}
                    />
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

CopyPolicySettingsSelectFeaturesPage.displayName = 'CopyPolicySettingsSelectFeaturesPage';

export default CopyPolicySettingsSelectFeaturesPage;
