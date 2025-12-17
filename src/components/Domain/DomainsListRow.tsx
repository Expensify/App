import React from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Badge from '@components/Badge';
import Icon from '@components/Icon';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import TextWithTooltip from '@components/TextWithTooltip';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type DomainsListRowProps = {
    /** Name of the domain */
    title: string;

    /** Whether the row is hovered, so we can modify its style */
    isHovered: boolean;

    /** The text to display inside a badge next to the title */
    badgeText?: string;

    /** Items for the three dots menu */
    menuItems?: PopoverMenuItem[];

    /** The type of brick road indicator to show */
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
};

function DomainsListRow({title, isHovered, badgeText, brickRoadIndicator, menuItems}: DomainsListRowProps) {
    const styles = useThemeStyles();
    const theme = useTheme();

    const icons = useMemoizedLazyExpensifyIcons(['Globe', 'ArrowRight', 'DotIndicator']);

    return (
        <View style={[styles.flexRow, styles.highlightBG, styles.br3, styles.p5, styles.pr3, styles.alignItemsCenter, styles.gap3, isHovered && styles.hoveredComponentBG]}>
            <View style={[styles.flex1, styles.flexRow, styles.bgTransparent, styles.gap3, styles.alignItemsCenter, styles.justifyContentStart]}>
                <Icon
                    src={icons.Globe}
                    fill={theme.icon}
                    additionalStyles={styles.domainIcon}
                />
                <TextWithTooltip
                    text={title}
                    shouldShowTooltip
                    style={styles.textStrong}
                />

                {!!badgeText && (
                    <View style={[styles.flexRow, styles.gap2, styles.alignItemsCenter, styles.justifyContentEnd]}>
                        <Badge
                            text={badgeText}
                            textStyles={styles.textStrong}
                            badgeStyles={[styles.alignSelfCenter, styles.badgeBordered]}
                        />
                    </View>
                )}
            </View>

            <View style={[styles.flexRow, styles.alignItemsCenter]}>
                <View style={[styles.flexRow, styles.justifyContentEnd]}>
                    <View style={[styles.flexRow, styles.ml2, styles.alignItemsCenter]}>
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.workspaceListRBR, styles.pr3, styles.mt0]}>
                            {!!brickRoadIndicator && (
                                <Icon
                                    src={icons.DotIndicator}
                                    fill={brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR ? theme.danger : theme.iconSuccessFill}
                                />
                            )}
                        </View>
                        {!!menuItems?.length && (
                            <ThreeDotsMenu
                                shouldSelfPosition
                                menuItems={menuItems}
                                anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP}}
                                shouldOverlay
                                isNested
                            />
                        )}
                    </View>
                </View>
                <View style={styles.touchableButtonImage}>
                    <Icon
                        src={icons.ArrowRight}
                        fill={theme.icon}
                        additionalStyles={[styles.alignSelfCenter, !isHovered && styles.opacitySemiTransparent]}
                        isButtonIcon
                        medium
                    />
                </View>
            </View>
        </View>
    );
}

export default DomainsListRow;
