import React from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as NumberFormatUtils from '@libs/NumberFormatUtils';
import Button from './Button';
import * as Expensicons from './Icon/Expensicons';
import Text from './Text';

type ShowMoreButtonProps = {
    /** Additional styles for container */
    containerStyle?: StyleProp<ViewStyle>;

    /** The number of currently shown items */
    currentCount?: number;

    /** The total number of items that could be shown */
    totalCount?: number;

    /** A handler that fires when button has been pressed */
    onPress: () => void;
};

function ShowMoreButton({containerStyle, currentCount, totalCount, onPress}: ShowMoreButtonProps) {
    const {translate, preferredLocale} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();

    const shouldShowCounter = !!(currentCount && totalCount);

    return (
        <View style={[styles.alignItemsCenter, containerStyle]}>
            {shouldShowCounter && (
                <Text style={[styles.mb2, styles.textLabelSupporting]}>
                    {`${translate('common.showing')} `}
                    <Text style={styles.textStrong}>{currentCount}</Text>
                    {` ${translate('common.of')} `}
                    <Text style={styles.textStrong}>{NumberFormatUtils.format(preferredLocale, totalCount)}</Text>
                </Text>
            )}
            <View style={[styles.w100, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                <View style={[styles.shortTermsHorizontalRule, styles.flex1, styles.mr0]} />
                <Button
                    style={styles.mh0}
                    small
                    shouldShowRightIcon
                    iconFill={theme.icon}
                    iconRight={Expensicons.DownArrow}
                    text={translate('common.showMore')}
                    accessibilityLabel={translate('common.showMore')}
                    onPress={onPress}
                />
                <View style={[styles.shortTermsHorizontalRule, styles.flex1, styles.ml0]} />
            </View>
        </View>
    );
}

ShowMoreButton.displayName = 'ShowMoreButton';

export default ShowMoreButton;
