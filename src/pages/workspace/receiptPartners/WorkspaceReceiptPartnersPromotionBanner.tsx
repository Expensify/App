import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import {Close} from '@components/Icon/Expensicons';
import useDismissedUberBanners from '@hooks/useDismissedUberBanners';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {enablePolicyReceiptPartners} from '@libs/actions/Policy/Policy';
import BillingBanner from '@pages/settings/Subscription/CardSection/BillingBanner/BillingBanner';
import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

type WorkspaceReceiptPartnersBannerProps = {
    policy: OnyxEntry<Policy>;
    readOnly?: boolean;
};

function WorkspaceReceiptPartnersPromotionBanner({policy, readOnly}: WorkspaceReceiptPartnersBannerProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();
    const policyID = policy?.id;
    const {setAsDismissed, isDismissed} = useDismissedUberBanners({policyID});
    const shouldDismissBanner = !!policy?.receiptPartners?.enabled || !isBetaEnabled(CONST.BETAS.UBER_FOR_BUSINESS) || isDismissed || readOnly;

    const illustrations = useMemoizedLazyIllustrations(['PinkCar'] as const);

    const handleConnectUber = useCallback(() => {
        if (!policyID) {
            return;
        }

        enablePolicyReceiptPartners(policyID, true, true);
    }, [policyID]);

    const rightComponent = useMemo(() => {
        const smallScreenStyle = shouldUseNarrowLayout ? [styles.flex0, styles.flexBasis100, styles.justifyContentCenter] : [];
        return (
            <View style={[styles.flexRow, styles.gap2, smallScreenStyle]}>
                <Button
                    success
                    onPress={handleConnectUber}
                    style={shouldUseNarrowLayout && styles.flex1}
                    text={translate('workspace.receiptPartners.connect')}
                />
            </View>
        );
    }, [styles, shouldUseNarrowLayout, translate, handleConnectUber]);

    if (shouldDismissBanner) {
        return null;
    }

    return (
        <View style={[styles.ph4, styles.mb4]}>
            <BillingBanner
                icon={illustrations.PinkCar}
                title={translate('workspace.receiptPartners.uber.bannerTitle')}
                titleStyle={StyleUtils.getTextColorStyle(theme.text)}
                subtitle={translate('workspace.receiptPartners.uber.bannerDescription')}
                subtitleStyle={[styles.mt1, styles.textLabel]}
                style={[styles.borderRadiusComponentLarge]}
                rightComponent={rightComponent}
                rightIcon={Close}
                rightIconAccessibilityLabel={translate('common.close')}
                onRightIconPress={setAsDismissed}
            />
        </View>
    );
}

export default WorkspaceReceiptPartnersPromotionBanner;
