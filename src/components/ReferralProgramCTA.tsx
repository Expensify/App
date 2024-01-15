import React from 'react';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import Navigation from '@src/libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import Icon from './Icon';
import {Info} from './Icon/Expensicons';
import {PressableWithoutFeedback} from './Pressable';
import Text from './Text';

type ReferralProgramCTAProps = {
    referralContentType:
        | typeof CONST.REFERRAL_PROGRAM.CONTENT_TYPES.MONEY_REQUEST
        | typeof CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT
        | typeof CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SEND_MONEY
        | typeof CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND;
};

function ReferralProgramCTA({referralContentType}: ReferralProgramCTAProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <PressableWithoutFeedback
            onPress={() => {
                Navigation.navigate(ROUTES.REFERRAL_DETAILS_MODAL.getRoute(referralContentType));
            }}
            style={[styles.p5, styles.w100, styles.br2, styles.highlightBG, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, {gap: 10}]}
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
            <Icon
                src={Info}
                height={20}
                width={20}
                fill={theme.icon}
            />
        </PressableWithoutFeedback>
    );
}

export default ReferralProgramCTA;
