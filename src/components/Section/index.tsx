import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import type {MenuItemWithLink} from '@components/MenuItemList';
import MenuItemList from '@components/MenuItemList';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type IconAsset from '@src/types/utils/IconAsset';
import IconSection from './IconSection';

const CARD_LAYOUT = {
    ICON_ON_TOP: 'iconOnTop',
    ICON_ON_RIGHT: 'iconOnRight',
} as const;

type SectionProps = ChildrenProps & {
    /** An array of props that are passed to individual MenuItem components */
    menuItems?: MenuItemWithLink[];

    /** The text to display in the title of the section */
    title: string;

    /** The text to display in the subtitle of the section */
    subtitle?: string;

    /** The icon to display along with the title */
    icon?: IconAsset;

    /** Card layout that affects icon positioning, margins, sizes */
    cardLayout?: ValueOf<typeof CARD_LAYOUT>;

    /** Whether the subtitle should have a muted style */
    subtitleMuted?: boolean;

    /** Customize the Section container */
    containerStyles?: StyleProp<ViewStyle>;

    /** Customize the Section container */
    titleStyles?: StyleProp<ViewStyle>;

    /** Customize the Section container */
    subtitleStyles?: StyleProp<ViewStyle>;

    /** Customize the Section container */
    childrenStyles?: StyleProp<ViewStyle>;

    /** Customize the Icon container */
    iconContainerStyles?: StyleProp<ViewStyle>;
};

function Section({
    children,
    childrenStyles,
    containerStyles,
    icon,
    cardLayout = CARD_LAYOUT.ICON_ON_RIGHT,
    iconContainerStyles,
    menuItems,
    subtitle,
    subtitleStyles,
    subtitleMuted = false,
    title,
    titleStyles,
}: SectionProps) {
    const styles = useThemeStyles();

    return (
        <>
            <View style={[styles.pageWrapper, styles.cardSection, containerStyles]}>
                {cardLayout === CARD_LAYOUT.ICON_ON_TOP && (
                    <IconSection
                        icon={icon}
                        iconContainerStyles={[iconContainerStyles, styles.alignSelfStart, styles.mb3]}
                    />
                )}
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.w100, cardLayout === CARD_LAYOUT.ICON_ON_TOP && styles.mh1, titleStyles]}>
                    <View style={[styles.flexShrink1]}>
                        <Text style={[styles.textHeadline, styles.cardSectionTitle]}>{title}</Text>
                    </View>
                    {cardLayout === CARD_LAYOUT.ICON_ON_RIGHT && (
                        <IconSection
                            icon={icon}
                            iconContainerStyles={iconContainerStyles}
                        />
                    )}
                </View>

                {!!subtitle && (
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.w100, cardLayout === CARD_LAYOUT.ICON_ON_TOP ? [styles.mt1, styles.mh1] : styles.mt4, subtitleStyles]}>
                        <Text style={[styles.textNormal, subtitleMuted && styles.colorMuted]}>{subtitle}</Text>
                    </View>
                )}

                <View style={[styles.w100, childrenStyles]}>{children}</View>

                <View style={[styles.w100]}>{!!menuItems && <MenuItemList menuItems={menuItems} />}</View>
            </View>
        </>
    );
}
Section.displayName = 'Section';

export {CARD_LAYOUT};
export default Section;
