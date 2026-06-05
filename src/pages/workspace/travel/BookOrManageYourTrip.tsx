import {emailSelector} from '@selectors/Session';
import {Str} from 'expensify-common';
import React from 'react';
import MenuItem from '@components/MenuItem';
import Section from '@components/Section';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {setPolicyTravelSettings} from '@libs/actions/Policy/Travel';
import {isEmailPublicDomain} from '@libs/LoginUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {openTravelDotLink} from '@libs/openTravelDotLink';
import {getSearchParamFromPath} from '@libs/Url';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import WorkspaceTravelInvoicingSection from './WorkspaceTravelInvoicingSection';

type GetStartedTravelProps = {
    policyID: string;
};

function GetStartedTravel({policyID}: GetStartedTravelProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const policy = usePolicy(policyID);
    const {canWrite: canWriteMoreFeatures, withReadOnlyFallback} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.MORE_FEATURES);
    const icons = useMemoizedLazyExpensifyIcons(['LuggageWithLines', 'NewWindow']);
    const illustrations = useMemoizedLazyIllustrations(['RocketDude']);
    const {isBetaEnabled} = usePermissions();
    const {showConfirmModal} = useConfirmModal();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [sessionEmail] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const primaryContactMethod = account?.primaryLogin ?? sessionEmail ?? '';
    const isPreventSpotnanaTravelEnabled = isBetaEnabled(CONST.BETAS.PREVENT_SPOTNANA_TRAVEL);

    const autoAddTripName = policy?.travelSettings?.autoAddTripName !== false;

    const toggleAutoAddTripName = (enabled: boolean) => {
        setPolicyTravelSettings(policy, {autoAddTripName: enabled});
    };

    const navigateToPublicDomainError = () => {
        const hasPolicyIDInActiveRoute = getSearchParamFromPath(Navigation.getActiveRoute(), CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID) !== null;
        const dynamicSuffix = hasPolicyIDInActiveRoute ? DYNAMIC_ROUTES.TRAVEL_PUBLIC_DOMAIN_ERROR.path : DYNAMIC_ROUTES.TRAVEL_PUBLIC_DOMAIN_ERROR.getRoute(policyID);
        Navigation.navigate(createDynamicRoute(dynamicSuffix));
    };

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

        if (!primaryContactMethod || Str.isSMSLogin(primaryContactMethod)) {
            navigateToPublicDomainError();
            return;
        }

        if (isEmailPublicDomain(primaryContactMethod)) {
            navigateToPublicDomainError();
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
                <MenuItem
                    title={translate('workspace.moreFeatures.travel.bookOrManageYourTrip.ctaText')}
                    icon={icons.LuggageWithLines}
                    onPress={withReadOnlyFallback(handleManageTravel)}
                    shouldShowRightIcon={canWriteMoreFeatures}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.TRAVEL.BOOK_TRAVEL_BUTTON}
                    iconRight={canWriteMoreFeatures ? icons.NewWindow : undefined}
                    wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt3, !canWriteMoreFeatures && styles.buttonOpacityDisabled]}
                />
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
                    pendingAction={policy?.pendingFields?.travelSettings}
                    wrapperStyle={styles.mt3}
                />
            </Section>
            <WorkspaceTravelInvoicingSection policyID={policyID} />
        </>
    );
}

export default GetStartedTravel;
