import Button from '@components/Button';
import Icon from '@components/Icon';
import Text from '@components/Text';
import WidgetContainer from '@components/WidgetContainer';

import useEarlyRenewalConfirmation from '@hooks/useEarlyRenewalConfirmation';
import useEarlyRenewalPeriod from '@hooks/useEarlyRenewalPeriod';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {draftEarlyRenewalMessage} from '@libs/actions/EarlyRenewalOffer';
import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

const ICON_SIZE = variables.componentSizeNormal;

function EarlyRenewalOfferSection() {
    const [eligibility, eligibilityMetadata] = useOnyx(ONYXKEYS.EARLY_RENEWAL_OFFER_ELIGIBILITY);
    const {isNonIncentivizedPeriod, isIncentivizedPeriod} = useEarlyRenewalPeriod();
    const policy = usePolicy(eligibility?.nudgePolicyID);
    const {translate} = useLocalize();
    const showEarlyRenewalConfirmation = useEarlyRenewalConfirmation();
    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const theme = useTheme();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['SubscriptionAnnual']);

    const adminsRoomReportID = policy?.chatReportIDAdmins?.toString();
    const canClaim = !!eligibility?.canClaim && isNonIncentivizedPeriod;
    const canNudge = eligibility?.canClaim === false && isIncentivizedPeriod && !!policy?.owner && !!adminsRoomReportID && adminsRoomReportID !== '0';

    const openEarlyRenewalDraft = () => {
        if (!adminsRoomReportID || !policy?.owner) {
            return;
        }
        const message = translate('earlyRenewal.draftMessage', {
            billingOwnerEmail: policy.owner,
            subscriptionURL: `${CONST.NEW_EXPENSIFY_URL}${ROUTES.SETTINGS_SUBSCRIPTION.route}`,
        });
        draftEarlyRenewalMessage(adminsRoomReportID, message, () => {
            Navigation.navigate(
                shouldUseNarrowLayout
                    ? ROUTES.REPORT_WITH_ID.getRoute(adminsRoomReportID, undefined, undefined, ROUTES.HOME)
                    : ROUTES.SEARCH_REPORT.getRoute({reportID: adminsRoomReportID, backTo: ROUTES.HOME}),
            );
        });
    };

    if (eligibilityMetadata.status !== 'loaded' || (!canClaim && !canNudge)) {
        return null;
    }

    const copy = CONST.SUBSCRIPTION.EARLY_RENEWAL.COPY.BILLING_OWNER;

    return (
        <WidgetContainer
            title={canClaim ? copy.HOME_TITLE : translate('earlyRenewal.adminTitle')}
            containerStyles={{backgroundColor: theme.trialBannerBackgroundColor}}
        >
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.pt3, styles.pb8, shouldUseNarrowLayout ? styles.ph5 : styles.ph8]}>
                <Icon
                    src={illustrations.SubscriptionAnnual}
                    width={ICON_SIZE}
                    height={ICON_SIZE}
                />
                <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter]}>
                    <Text style={styles.widgetItemTitle}>{canClaim ? copy.HOME_SUBTITLE : translate('earlyRenewal.adminSubtitle')}</Text>
                </View>
                <Button
                    isDisabled={canClaim && isOffline}
                    onPress={canClaim ? showEarlyRenewalConfirmation : openEarlyRenewalDraft}
                    size={CONST.BUTTON_SIZE.SMALL}
                    style={styles.widgetItemButton}
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                >
                    <Button.Text>{canClaim ? copy.CTA : translate('earlyRenewal.adminCTA')}</Button.Text>
                </Button>
            </View>
        </WidgetContainer>
    );
}

export default EarlyRenewalOfferSection;
