import React, {useState} from 'react';
import Icon from '@components/Icon';
import {Close} from '@components/Icon/Expensicons';
import {PressableWithoutFeedback} from '@components/Pressable';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import Navigation from '@src/libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

type MoneyRequestReferralProgramCTAProps = {
    referralContentType: typeof CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SEND_MONEY | typeof CONST.REFERRAL_PROGRAM.CONTENT_TYPES.MONEY_REQUEST;
};

function MoneyRequestReferralProgramCTA({referralContentType}: MoneyRequestReferralProgramCTAProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const [isHidden, setIsHidden] = useState(false);

    if (isHidden) {
        return null;
    }

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
            <PressableWithoutFeedback
                onPress={() => setIsHidden(true)}
                onMouseDown={(e) => {
                    e.preventDefault();
                }}
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

export default MoneyRequestReferralProgramCTA;
