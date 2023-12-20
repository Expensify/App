import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import sourcePropTypes from '@components/Image/sourcePropTypes';
import MenuItemList from '@components/MenuItemList';
import menuItemPropTypes from '@components/menuItemPropTypes';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import IconSection from './IconSection';

const CARD_LAYOUT = {
    ICON_ON_TOP: 'iconOnTop',
    ICON_ON_RIGHT: 'iconOnRight',
};

const propTypes = {
    /** An array of props that are pass to individual MenuItem components */
    menuItems: PropTypes.arrayOf(PropTypes.shape(menuItemPropTypes)),

    /** The text to display in the title of the section */
    title: PropTypes.string.isRequired,

    /** The text to display in the subtitle of the section */
    subtitle: PropTypes.string,

    /** The icon to display along with the title */
    icon: sourcePropTypes,

    /** Icon component */
    IconComponent: PropTypes.func,

    /** Card layout that affects icon positioning, margins, sizes. */
    // eslint-disable-next-line rulesdir/prefer-underscore-method
    cardLayout: PropTypes.oneOf(Object.values(CARD_LAYOUT)),

    /** Contents to display inside the section */
    children: PropTypes.node,

    /** Customize the Section container */
    // eslint-disable-next-line react/forbid-prop-types
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Customize the Section container */
    // eslint-disable-next-line react/forbid-prop-types
    titleStyles: PropTypes.arrayOf(PropTypes.object),

    /** Customize the Section container */
    // eslint-disable-next-line react/forbid-prop-types
    subtitleStyles: PropTypes.arrayOf(PropTypes.object),

    /** Whether the subtitle should have a muted style */
    subtitleMuted: PropTypes.bool,

    /** Customize the Section container */
    // eslint-disable-next-line react/forbid-prop-types
    childrenStyles: PropTypes.arrayOf(PropTypes.object),

    /** Customize the Icon container */
    // eslint-disable-next-line react/forbid-prop-types
    iconContainerStyles: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    menuItems: null,
    children: null,
    icon: null,
    IconComponent: null,
    cardLayout: CARD_LAYOUT.ICON_ON_RIGHT,
    containerStyles: [],
    iconContainerStyles: [],
    titleStyles: [],
    subtitleStyles: [],
    subtitleMuted: false,
    childrenStyles: [],
    subtitle: null,
};

function Section({children, childrenStyles, containerStyles, icon, IconComponent, cardLayout, iconContainerStyles, menuItems, subtitle, subtitleStyles, subtitleMuted, title, titleStyles}) {
    const styles = useThemeStyles();

    return (
        <>
            <View style={[styles.pageWrapper, styles.cardSection, ...containerStyles]}>
                {cardLayout === CARD_LAYOUT.ICON_ON_TOP && (
                    <IconSection
                        icon={icon}
                        IconComponent={IconComponent}
                        iconContainerStyles={[...iconContainerStyles, styles.alignSelfStart, styles.mb3]}
                    />
                )}
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.w100, cardLayout === CARD_LAYOUT.ICON_ON_TOP && styles.mh1, ...titleStyles]}>
                    <View style={[styles.flexShrink1]}>
                        <Text style={[styles.textHeadline, styles.cardSectionTitle]}>{title}</Text>
                    </View>
                    {cardLayout === CARD_LAYOUT.ICON_ON_RIGHT && (
                        <IconSection
                            icon={icon}
                            IconComponent={IconComponent}
                            iconContainerStyles={iconContainerStyles}
                        />
                    )}
                </View>

                {Boolean(subtitle) && (
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.w100, cardLayout === CARD_LAYOUT.ICON_ON_TOP ? [styles.mt1, styles.mh1] : styles.mt4, ...subtitleStyles]}>
                        <Text style={[styles.textNormal, subtitleMuted && styles.colorMuted]}>{subtitle}</Text>
                    </View>
                )}

                <View style={[styles.w100, ...childrenStyles]}>{children}</View>

                <View style={[styles.w100]}>{Boolean(menuItems) && <MenuItemList menuItems={menuItems} />}</View>
            </View>
        </>
    );
}
Section.displayName = 'Section';
Section.propTypes = propTypes;
Section.defaultProps = defaultProps;

export {CARD_LAYOUT};
export default Section;
