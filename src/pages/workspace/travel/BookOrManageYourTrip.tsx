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
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {setPolicyTravelSettings} from '@libs/actions/Policy/Travel';
import {isEmailPublicDomain} from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import {openTravelDotLink} from '@libs/openTravelDotLink';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import WorkspaceTravelInvoicingSection from './WorkspaceTravelInvoicingSection';

type GetStartedTravelProps = {
    policyID: string;
};

function GetStartedTravel({policyID}: GetStartedTravelProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {showConfirmModal} = useConfirmModal();
    const StyleUtils = useStyleUtils();
    const policy = usePolicy(policyID);
    const icons = useMemoizedLazyExpensifyIcons(['LuggageWithLines', 'NewWindow'] as const);
    const illustrations = useMemoizedLazyIllustrations(['RocketDude'] as const);
    const {isBetaEnabled} = usePermissions();
    const isTravelInvoicingEnabled = isBetaEnabled(CONST.BETAS.TRAVEL_INVOICING);
    const isPreventSpotnanaTravelEnabled = isBetaEnabled(CONST.BETAS.PREVENT_SPOTNANA_TRAVEL);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [sessionEmail] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const primaryContactMethod = account?.primaryLogin ?? sessionEmail ?? '';

    const autoAddTripName = policy?.travelSettings?.autoAddTripName !== false;

    const toggleAutoAddTripName = (enabled: boolean) => {
        setPolicyTravelSettings(policyID, {autoAddTripName: enabled});
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
            Navigation.navigate(ROUTES.TRAVEL_PUBLIC_DOMAIN_ERROR.getRoute(Navigation.getActiveRoute()));
            return;
        }

        if (isEmailPublicDomain(primaryContactMethod)) {
            Navigation.navigate(ROUTES.TRAVEL_PUBLIC_DOMAIN_ERROR.getRoute(Navigation.getActiveRoute()));
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
                    onPress={handleManageTravel}
                    shouldShowRightIcon
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.TRAVEL.BOOK_TRAVEL_BUTTON}
                    iconRight={icons.NewWindow}
                    wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt3]}
                />
                <ToggleSettingOptionRow
                    title={translate('workspace.moreFeatures.travel.settings.autoAddTripName.title')}
                    subtitle={translate('workspace.moreFeatures.travel.settings.autoAddTripName.subtitle')}
                    shouldPlaceSubtitleBelowSwitch
                    switchAccessibilityLabel={translate('workspace.moreFeatures.travel.settings.autoAddTripName.title')}
                    isActive={autoAddTripName}
                    onToggle={toggleAutoAddTripName}
                    pendingAction={policy?.pendingFields?.travelSettings}
                    wrapperStyle={styles.mt3}
                />
            </Section>
            {isTravelInvoicingEnabled && <WorkspaceTravelInvoicingSection policyID={policyID} />}
        </>
    );
}

export default GetStartedTravel;
