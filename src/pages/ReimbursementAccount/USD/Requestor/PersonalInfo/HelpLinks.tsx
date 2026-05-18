import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Icon from '@components/Icon';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type HelpLinkProps = {
    /** Style for wrapping View */
    containerStyles?: StyleProp<ViewStyle>;
};

function HelpLinks({containerStyles}: HelpLinkProps) {
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
            <View style={[styles.ml2, styles.dFlex, styles.flexRow]}>
                <TextLink
                    style={[styles.textMicro]}
                    href={CONST.BANK_ACCOUNT_PERSONAL_DOCUMENTATION_INFO_URL}
                >
                    {translate('requestorStep.learnMore')}
                </TextLink>
                <Text style={[styles.textMicroSupporting]}>{' | '}</Text>
                <TextLink
                    style={[styles.textMicro]}
                    href={CONST.PERSONAL_DATA_PROTECTION_INFO_URL}
                >
                    {translate('requestorStep.isMyDataSafe')}
                </TextLink>
            </View>
        </View>
    );
}

export default HelpLinks;
