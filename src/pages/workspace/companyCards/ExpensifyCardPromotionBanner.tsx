import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import {CreditCardsNew} from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {enableExpensifyCard} from '@libs/actions/Policy/Policy';
import {goToExpensifyCardPage} from '@libs/PolicyUtils';
import BillingBanner from '@pages/settings/Subscription/CardSection/BillingBanner/BillingBanner';
import type {Policy} from '@src/types/onyx';

function ExpensifyCardPromotionBanner({policy}: {policy: OnyxEntry<Policy>}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const policyID = policy?.id;
    const areExpensifyCardsEnabled = policy?.areExpensifyCardsEnabled;

    const handleLearnMore = useCallback(() => {
        if (!policyID) {
            return;
        }

        if (areExpensifyCardsEnabled) {
            goToExpensifyCardPage(policyID);
            return;
        }

        enableExpensifyCard(policyID, true, true);
    }, [policyID, areExpensifyCardsEnabled]);

    const rightComponent = useMemo(() => {
        const smallScreenStyle = shouldUseNarrowLayout ? [styles.flex0, styles.flexBasis100, styles.justifyContentCenter] : [];

        return (
            <View style={[styles.flexRow, styles.gap2, smallScreenStyle]}>
                <Button
                    success
                    style={shouldUseNarrowLayout && styles.flex1}
                    text="Learn more"
                    onPress={handleLearnMore}
                />
            </View>
        );
    }, [shouldUseNarrowLayout, styles, translate]);

    return (
        <View style={[styles.ph4, styles.mb4]}>
            <BillingBanner
                title="Get the Expensify Card"
                titleStyle={styles.themeTextReversedColor}
                style={[styles.promotionBannerBG, styles.borderRadiusComponentLarge]}
                subtitle="Enjoy cash back on every US purchase, up to 50% off your Expensify bill, unlimited virtual cards, and so much more."
                subtitleStyle={[styles.mt1, styles.darkMutedTextLabel]}
                icon={CreditCardsNew}
                rightComponent={rightComponent}
            />
        </View>
    );
}

export default ExpensifyCardPromotionBanner;
