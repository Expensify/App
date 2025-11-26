import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Icon from '@components/Icon';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import type IconAsset from '@src/types/utils/IconAsset';

type BankAccountCellProps = {
    /** Bank icon */
    icon: IconAsset;

    /** Icon size */
    iconSize?: number;

    /** Icon styles */
    iconStyles?: StyleProp<ViewStyle>;

    /** Primary text label */
    title: string;

    /** Optional secondary text */
    subtitle?: string;
};

function BankAccountCell({icon, iconSize, iconStyles, title, subtitle}: BankAccountCellProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.flexRow, styles.flex1, styles.gap3, styles.alignItemsCenter]}>
            <Icon
                src={icon}
                width={iconSize}
                height={iconSize}
                additionalStyles={iconStyles}
            />
            <View style={[styles.gapHalf, styles.flexShrink1]}>
                <TextWithTooltip
                    text={title}
                    style={[styles.optionDisplayName, styles.sidebarLinkTextBold, styles.pre, styles.fontWeightNormal]}
                />
                {subtitle ? (
                    <TextWithTooltip
                        text={subtitle}
                        style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                    />
                ) : null}
            </View>
        </View>
    );
}

BankAccountCell.displayName = 'BankAccountCell';

export default BankAccountCell;
