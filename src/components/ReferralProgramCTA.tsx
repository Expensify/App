import React from 'react';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import Navigation from '@src/libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import Icon from './Icon';
import {Close} from './Icon/Expensicons';
import {PressableWithoutFeedback} from './Pressable';
import Text from './Text';

type ReferralProgramCTAProps = {
    referralContentType:
        | typeof CONST.REFERRAL_PROGRAM.CONTENT_TYPES.MONEY_REQUEST
        | typeof CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT
        | typeof CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SEND_MONEY
        | typeof CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND;

    /** Method to trigger when pressing close button of the banner */
    onCloseButtonPress?: () => void;
};

function ReferralProgramCTA({referralContentType, onCloseButtonPress = () => {}}: ReferralProgramCTAProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <PressableWithoutFeedback
            onPress={() => {
                Navigation.navigate(ROUTES.REFERRAL_DETAILS_MODAL.getRoute(referralContentType));
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
            <PressableWithoutFeedback
                onPress={onCloseButtonPress}
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
        </PressableWithoutFeedback>
    );
}

export default ReferralProgramCTA;
