import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Icon from '@components/Icon';
import TextLink from '@components/TextLink';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type PatriotActLinkProps = {
    /** Optional container styles to control spacing/alignment */
    containerStyles?: StyleProp<ViewStyle>;
};

function PatriotActLink({containerStyles}: PatriotActLinkProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['QuestionMark']);

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, containerStyles]}>
            <Icon
                src={icons.QuestionMark}
                width={12}
                height={12}
                fill={theme.icon}
            />
            <TextLink
                style={[styles.textMicro, styles.ml2]}
                href={CONST.HELP_LINK_URL}
            >
                {translate('additionalDetailsStep.helpLink')}
            </TextLink>
        </View>
    );
}

export default PatriotActLink;
