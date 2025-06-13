import React, {useEffect} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import useDismissedReferralBanners from '@hooks/useDismissedReferralBanners';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import Navigation from '@src/libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import {getButtonRole} from './Button/utils';
import Icon from './Icon';
import {Close} from './Icon/Expensicons';
import {PressableWithoutFeedback} from './Pressable';
import Text from './Text';
import Tooltip from './Tooltip';

type ReferralProgramCTAProps = {
    referralContentType: typeof CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE | typeof CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT;
    style?: StyleProp<ViewStyle>;
    onDismiss?: () => void;
};

function ReferralProgramCTA({referralContentType, style, onDismiss}: ReferralProgramCTAProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isDismissed, setAsDismissed} = useDismissedReferralBanners({referralContentType});

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
        <PressableWithoutFeedback
            onPress={() => {
                Navigation.navigate(ROUTES.REFERRAL_DETAILS_MODAL.getRoute(referralContentType, Navigation.getActiveRouteWithoutParams()));
            }}
            style={[styles.br2, styles.highlightBG, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, {gap: 10, padding: 10}, styles.pl5, style]}
            isNested
            accessibilityLabel="referral"
            role={getButtonRole(true)}
        >
            <Text>
                {translate(`referralProgram.${referralContentType}.buttonText1`)}
                <Text
                    color={theme.success}
                    style={styles.textStrong}
                >
                    {translate(`referralProgram.${referralContentType}.buttonText2`)}
                </Text>
            </Text>
            <Tooltip text={translate('common.close')}>
                <PressableWithoutFeedback
                    onPress={handleDismissCallToAction}
                    onMouseDown={(e) => {
                        e.preventDefault();
                    }}
                    style={[styles.touchableButtonImage]}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={translate('common.close')}
                >
                    <Icon
                        src={Close}
                        height={20}
                        width={20}
                        fill={theme.icon}
                    />
                </PressableWithoutFeedback>
            </Tooltip>
        </PressableWithoutFeedback>
    );
}

export default ReferralProgramCTA;
