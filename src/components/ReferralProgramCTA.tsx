import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as User from '@userActions/User';
import CONST from '@src/CONST';
import Navigation from '@src/libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import Icon from './Icon';
import {Close} from './Icon/Expensicons';
import {PressableWithoutFeedback} from './Pressable';
import Text from './Text';
import Tooltip from './Tooltip';

type ReferralProgramCTAOnyxProps = {
    dismissedReferralBanners: OnyxEntry<OnyxTypes.DismissedReferralBanners>;
};

type ReferralProgramCTAProps = ReferralProgramCTAOnyxProps & {
    referralContentType:
        | typeof CONST.REFERRAL_PROGRAM.CONTENT_TYPES.MONEY_REQUEST
        | typeof CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT
        | typeof CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SEND_MONEY
        | typeof CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND;
};

function ReferralProgramCTA({referralContentType, dismissedReferralBanners}: ReferralProgramCTAProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();

    const handleDismissCallToAction = () => {
        User.dismissReferralBanner(referralContentType);
    };

    if (!referralContentType || dismissedReferralBanners?.[referralContentType]) {
        return null;
    }

    return (
        <PressableWithoutFeedback
            onPress={() => {
                Navigation.navigate(ROUTES.REFERRAL_DETAILS_MODAL.getRoute(referralContentType, Navigation.getActiveRouteWithoutParams()));
            }}
            style={[styles.w100, styles.br2, styles.highlightBG, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, {gap: 10, padding: 10}, styles.pl5]}
            accessibilityLabel="referral"
            role={CONST.ACCESSIBILITY_ROLE.BUTTON}
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
                    role={CONST.ACCESSIBILITY_ROLE.BUTTON}
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

export default withOnyx<ReferralProgramCTAProps, ReferralProgramCTAOnyxProps>({
    dismissedReferralBanners: {
        key: ONYXKEYS.NVP_DISMISSED_REFERRAL_BANNERS,
    },
})(ReferralProgramCTA);
