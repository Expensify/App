import React, {useEffect} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useDismissedReferralBanners from '@hooks/useDismissedReferralBanners';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import Navigation from '@src/libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import Icon from './Icon';
import {PressableWithoutFeedback} from './Pressable';
import RenderHTML from './RenderHTML';
import Tooltip from './Tooltip';

type ReferralProgramCTAProps = {
    referralContentType: typeof CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE | typeof CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT;
    style?: StyleProp<ViewStyle>;
    onDismiss?: () => void;
};

// Width of the close button (touchableButtonImage) + the gap between text and button.
const CLOSE_BUTTON_OFFSET = variables.componentSizeNormal + 10;

function ReferralProgramCTA({referralContentType, style, onDismiss}: ReferralProgramCTAProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isDismissed, setAsDismissed} = useDismissedReferralBanners({referralContentType});
    const icons = useMemoizedLazyExpensifyIcons(['Close']);

    const handleDismissCallToAction = () => {
        setAsDismissed();
        onDismiss?.();
    };

    const shouldShowBanner = referralContentType && !isDismissed;

    useEffect(() => {
        if (shouldShowBanner) {
            return;
        }
        onDismiss?.();
    }, [onDismiss, shouldShowBanner]);

    if (!shouldShowBanner) {
        return null;
    }

    return (
        <View style={[styles.br2, styles.highlightBG, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, {gap: 10, padding: 10}, styles.pl5, style]}>
            {/* CTA pressable covers the text area only (stops before the close button) so it does not intercept close-button taps. */}
            <PressableWithoutFeedback
                sentryLabel={CONST.SENTRY_LABEL.REFERRAL_PROGRAM.CTA}
                onPress={() => {
                    Navigation.navigate(ROUTES.REFERRAL_DETAILS_MODAL.getRoute(referralContentType, Navigation.getActiveRouteWithoutParams()));
                }}
                style={[styles.pAbsolute, styles.t0, styles.b0, styles.l0, {right: CLOSE_BUTTON_OFFSET}]}
                accessibilityLabel={translate(`referralProgram.${referralContentType}.header`)}
                role={CONST.ROLE.BUTTON}
            />
            {/* Hidden from accessibility — the CTA pressable above already announces this content. */}
            <View
                aria-hidden
                pointerEvents="none"
                style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}
            >
                <RenderHTML html={translate(`referralProgram.${referralContentType}.buttonText`)} />
            </View>
            <Tooltip text={translate('common.close')}>
                <PressableWithoutFeedback
                    onPress={handleDismissCallToAction}
                    onMouseDown={(e) => {
                        e.preventDefault();
                    }}
                    style={[styles.touchableButtonImage]}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={translate(`referralProgram.${referralContentType}.closeAccessibilityLabel`)}
                    sentryLabel={CONST.SENTRY_LABEL.REFERRAL_PROGRAM.DISMISS_BUTTON}
                >
                    <Icon
                        src={icons.Close}
                        height={20}
                        width={20}
                        fill={theme.icon}
                    />
                </PressableWithoutFeedback>
            </Tooltip>
        </View>
    );
}

export default ReferralProgramCTA;
