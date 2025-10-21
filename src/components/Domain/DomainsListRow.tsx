import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import TextWithTooltip from '@components/TextWithTooltip';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

type DomainsListRowProps = {
    /** Name of the domain */
    title: string;

    /** Whether the row is hovered, so we can modify its style */
    isHovered: boolean;

    /** Whether the icon at the end of the row should be displayed */
    shouldShowRightIcon: boolean;
};

function DomainsListRow({title, isHovered, shouldShowRightIcon}: DomainsListRowProps) {
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <View style={[styles.flexRow, styles.highlightBG, styles.br3, styles.p5, styles.alignItemsCenter, styles.gap3, isHovered && styles.hoveredComponentBG]}>
            <View style={[styles.flex1, styles.flexRow, styles.bgTransparent, styles.gap3, styles.alignItemsCenter]}>
                <Icon
                    src={Expensicons.Globe}
                    fill={theme.icon}
                    additionalStyles={styles.domainIcon}
                />
                <TextWithTooltip
                    text={title}
                    shouldShowTooltip
                    style={[styles.textStrong]}
                />
            </View>

            {shouldShowRightIcon && (
                <View style={styles.touchableButtonImage}>
                    <Icon
                        src={Expensicons.NewWindow}
                        fill={theme.icon}
                        isButtonIcon
                    />
                </View>
            )}
        </View>
    );
}

DomainsListRow.displayName = 'DomainsListRow';

export default DomainsListRow;
