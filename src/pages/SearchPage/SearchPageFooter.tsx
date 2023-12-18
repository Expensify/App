import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import {Info} from '@components/Icon/Expensicons';
import {PressableWithoutFeedback} from '@components/Pressable';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function SearchPageFooter() {
    const themeStyles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    return (
        <View style={[themeStyles.pb5, themeStyles.flexShrink0]}>
            <PressableWithoutFeedback
                onPress={() => {
                    Navigation.navigate(ROUTES.REFERRAL_DETAILS_MODAL.getRoute(CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND));
                }}
                style={[
                    themeStyles.p5,
                    themeStyles.w100,
                    themeStyles.br2,
                    themeStyles.highlightBG,
                    themeStyles.flexRow,
                    themeStyles.justifyContentBetween,
                    themeStyles.alignItemsCenter,
                    {gap: 10},
                ]}
                accessibilityLabel="referral"
                role={CONST.ACCESSIBILITY_ROLE.BUTTON}
            >
                <Text>
                    {translate(`referralProgram.${CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND}.buttonText1`)}
                    <Text
                        color={theme.success}
                        style={themeStyles.textStrong}
                    >
                        {translate(`referralProgram.${CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND}.buttonText2`)}
                    </Text>
                </Text>
                <Icon
                    src={Info}
                    height={20}
                    width={20}
                />
            </PressableWithoutFeedback>
        </View>
    );
}

SearchPageFooter.displayName = 'SearchPageFooter';

export default SearchPageFooter;
