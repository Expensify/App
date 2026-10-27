import MenuItem from '@components/MenuItem';
import MenuItemSectionRoot from '@components/MenuItem/presets/MenuItemSectionRoot';
import Section from '@components/Section';

import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDefaultWorkspaceTravelGuard from '@hooks/useDefaultWorkspaceTravelGuard';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearPolicyErrorField} from '@libs/actions/Policy/Policy';
import {setPolicyTravelAutoEnableNewMembers, setPolicyTravelSettings} from '@libs/actions/Policy/Travel';
import Navigation from '@libs/Navigation/Navigation';
import {openTravelDotLink} from '@libs/openTravelDotLink';
import {canMemberRead, canMemberUseTravel, isDeletedPolicyEmployee, isExpensifyTeam, shouldFilterExpensifyTeam} from '@libs/PolicyUtils';

import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import colors from '@styles/theme/colors';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import {isEmptyValueObject} from '@src/types/utils/EmptyObject';

import React from 'react';
import {View} from 'react-native';

import WorkspaceTravelBillingSection from './WorkspaceTravelBillingSection';

type BookOrManageYourTripProps = {
    policyID: string;
};

function BookOrManageYourTrip({policyID}: BookOrManageYourTripProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const policy = usePolicy(policyID);
    const {canWrite: canWriteMoreFeatures, withReadOnlyFallback} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.MORE_FEATURES);
    const {canWrite: canWriteTravel, withReadOnlyFallback: withTravelReadOnlyFallback} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.TRAVEL);
    const icons = useMemoizedLazyExpensifyIcons(['LuggageWithLines', 'Users']);
    const illustrations = useMemoizedLazyIllustrations(['RocketDude']);
    const {isBetaEnabled} = usePermissions();
    const {showConfirmModal} = useConfirmModal();
    const {isOffline} = useNetwork();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();

    // Travel admins only see who can book travel, so the workspace settings stay with the members who can read them
    const canReadMoreFeatures = canMemberRead(policy, currentUserLogin, CONST.POLICY.POLICY_FEATURE.MORE_FEATURES);
    const blockIfDefaultWorkspaceLacksTravel = useDefaultWorkspaceTravelGuard();
    const isPreventSpotnanaTravelEnabled = isBetaEnabled(CONST.BETAS.PREVENT_SPOTNANA_TRAVEL);

    const autoAddTripName = policy?.travelSettings?.autoAddTripName !== false;

    const bookTravelText = translate('workspace.moreFeatures.travel.bookOrManageYourTrip.ctaText');

    const toggleAutoAddTripName = (enabled: boolean) => {
        setPolicyTravelSettings(policy, {autoAddTripName: enabled});
    };

    const isCodingSyncBetaEnabled = isBetaEnabled(CONST.BETAS.TRAVEL_CODING_SYNC);
    const isCodingSyncEnabled = policy?.travelSettings?.isCodingSyncEnabled ?? false;

    const toggleCodingSync = (enabled: boolean) => {
        setPolicyTravelSettings(policy, {isCodingSyncEnabled: enabled});
    };

    const autoEnableNewMembers = policy?.travelSettings?.autoEnableNewMembers ?? false;

    const toggleAutoEnableNewMembers = (enabled: boolean) => {
        setPolicyTravelAutoEnableNewMembers(policy, enabled);
    };

    // Count the same members the Members page lists
    const shouldHideExpensifyTeam = shouldFilterExpensifyTeam(policy?.owner, currentUserLogin);
    const memberLogins = Object.entries(policy?.employeeList ?? {})
        .filter(([login, employee]) => !isEmptyValueObject(employee) && !isDeletedPolicyEmployee(employee, isOffline) && !(shouldHideExpensifyTeam && isExpensifyTeam(login)))
        .map(([login]) => login);
    const membersWithTravelCount = memberLogins.filter((login) => canMemberUseTravel(policy, login)).length;

    const handleManageTravel = () => {
        if (isPreventSpotnanaTravelEnabled) {
            showConfirmModal({
                title: translate('travel.blockedFeatureModal.title'),
                titleStyles: styles.textHeadlineH1,
                titleContainerStyles: styles.mb2,
                image: illustrations.RocketDude,
                imageStyles: StyleUtils.getBackgroundColorStyle(colors.ice600),
                prompt: translate('travel.blockedFeatureModal.message'),
                promptStyles: styles.mb2,
                confirmText: translate('common.buttonConfirm'),
                shouldShowCancelButton: false,
            });
            return;
        }

        if (blockIfDefaultWorkspaceLacksTravel()) {
            return;
        }

        openTravelDotLink(policyID);
    };

    return (
        <>
            <Section
                title={translate('workspace.moreFeatures.travel.bookOrManageYourTrip.title')}
                subtitle={translate('workspace.moreFeatures.travel.bookOrManageYourTrip.subtitle')}
                titleStyles={[styles.accountSettingsSectionTitle]}
                subtitleMuted
                isCentralPane
            >
                <View style={[styles.mt3, !canWriteTravel && styles.buttonOpacityDisabled]}>
                    <MenuItemSectionRoot
                        onPress={withTravelReadOnlyFallback(handleManageTravel)}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.TRAVEL.BOOK_TRAVEL_BUTTON}
                    >
                        <MenuItem.Row>
                            <MenuItem.Icon src={icons.LuggageWithLines} />
                            <MenuItem.Content>
                                <MenuItem.Title>{bookTravelText}</MenuItem.Title>
                            </MenuItem.Content>
                            {canWriteTravel && (
                                <MenuItem.Trailing>
                                    <MenuItem.NewWindowIcon />
                                </MenuItem.Trailing>
                            )}
                        </MenuItem.Row>
                    </MenuItemSectionRoot>
                </View>
                {canReadMoreFeatures && (
                    <ToggleSettingOptionRow
                        title={translate('workspace.moreFeatures.travel.settings.autoAddTripName.title')}
                        subtitle={translate('workspace.moreFeatures.travel.settings.autoAddTripName.subtitle')}
                        shouldPlaceSubtitleBelowSwitch
                        switchAccessibilityLabel={translate('workspace.moreFeatures.travel.settings.autoAddTripName.title')}
                        isActive={autoAddTripName}
                        onToggle={toggleAutoAddTripName}
                        disabled={!canWriteMoreFeatures}
                        disabledAction={withReadOnlyFallback()}
                        showLockIcon={!canWriteMoreFeatures}
                        pendingAction={policy?.pendingFields?.autoAddTripName}
                        errors={policy?.errorFields?.autoAddTripName ?? undefined}
                        onCloseError={() => clearPolicyErrorField(policyID, 'autoAddTripName')}
                        wrapperStyle={styles.mt3}
                    />
                )}
                {canReadMoreFeatures && isCodingSyncBetaEnabled && (
                    <ToggleSettingOptionRow
                        title={translate('workspace.moreFeatures.travel.settings.codingSync.title')}
                        subtitle={translate('workspace.moreFeatures.travel.settings.codingSync.subtitle')}
                        shouldPlaceSubtitleBelowSwitch
                        switchAccessibilityLabel={translate('workspace.moreFeatures.travel.settings.codingSync.title')}
                        isActive={isCodingSyncEnabled}
                        onToggle={toggleCodingSync}
                        disabled={!canWriteMoreFeatures}
                        disabledAction={withReadOnlyFallback()}
                        showLockIcon={!canWriteMoreFeatures}
                        pendingAction={policy?.pendingFields?.isCodingSyncEnabled}
                        errors={policy?.errorFields?.isCodingSyncEnabled ?? undefined}
                        onCloseError={() => clearPolicyErrorField(policyID, 'isCodingSyncEnabled')}
                        wrapperStyle={styles.mt3}
                    />
                )}
                <ToggleSettingOptionRow
                    title={translate('workspace.moreFeatures.travel.settings.autoEnableNewMembers.title')}
                    subtitle={translate('workspace.moreFeatures.travel.settings.autoEnableNewMembers.subtitle')}
                    shouldPlaceSubtitleBelowSwitch
                    switchAccessibilityLabel={translate('workspace.moreFeatures.travel.settings.autoEnableNewMembers.title')}
                    isActive={autoEnableNewMembers}
                    onToggle={toggleAutoEnableNewMembers}
                    disabled={!canWriteTravel}
                    disabledAction={withTravelReadOnlyFallback()}
                    showLockIcon={!canWriteTravel}
                    pendingAction={policy?.pendingFields?.autoEnableNewMembers}
                    errors={policy?.errorFields?.autoEnableNewMembers ?? undefined}
                    onCloseError={() => clearPolicyErrorField(policyID, 'autoEnableNewMembers')}
                    wrapperStyle={styles.mt3}
                />
                <View style={styles.mt3}>
                    <MenuItemSectionRoot
                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID))}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.TRAVEL.MANAGE_MEMBERS_BUTTON}
                    >
                        <MenuItem.Row>
                            <MenuItem.Icon src={icons.Users} />
                            <MenuItem.Content>
                                <MenuItem.Title>{translate('workspace.moreFeatures.travel.members.manageMembers')}</MenuItem.Title>
                                <MenuItem.Description>
                                    {translate('workspace.moreFeatures.travel.members.membersWithTravelAccess', {enabledCount: membersWithTravelCount, totalCount: memberLogins.length})}
                                </MenuItem.Description>
                            </MenuItem.Content>
                            <MenuItem.Trailing>
                                <MenuItem.Chevron />
                            </MenuItem.Trailing>
                        </MenuItem.Row>
                    </MenuItemSectionRoot>
                </View>
            </Section>
            {canReadMoreFeatures && <WorkspaceTravelBillingSection policyID={policyID} />}
        </>
    );
}

export default BookOrManageYourTrip;
