import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

type WhyLinkProps = {
    /** Style for wrapping View */
    containerStyles?: StyleProp<ViewStyle>;
};

function WhyLink({containerStyles}: WhyLinkProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, containerStyles]}>
            <Icon
                src={Expensicons.QuestionMark}
                width={12}
                height={12}
                fill={theme.icon}
            />
            <View style={[styles.ml2, styles.dFlex, styles.flexRow]}>
                <TextLink
                    style={[styles.textMicro]}
                    // TODO add link
                    href=""
                >
                    {translate('common.whyDoWeAskForThis')}
                </TextLink>
            </View>
        </View>
    );
}

WhyLink.displayName = 'WhyLink';

export default WhyLink;
