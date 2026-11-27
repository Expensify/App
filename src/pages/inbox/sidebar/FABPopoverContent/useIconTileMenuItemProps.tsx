/**
 * Colored icon tiles of the flat navigation create menu, for its own rows and for plain popover menus that offer some of its actions.
 * The tiles ship behind the flat navigation beta.
 */
import type {MenuItemProps} from '@components/MenuItem';

import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ThemeStyles} from '@styles/index';
import type {StyleUtilsType} from '@styles/utils';
import variables from '@styles/variables';

import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import FABMenuIconTile from './FABMenuIconTile';
import getFABMenuIconTile from './getFABMenuIconTile';

type IconTileMenuItemProps = Pick<
    MenuItemProps,
    'iconWidth' | 'iconHeight' | 'displayInDefaultIconColor' | 'leftComponent' | 'innerContainerStyle' | 'style' | 'shouldIgnoreCompactStyle'
> & {
    /** Cleared, so dropdown options that take a narrower icon type can take these props too */
    icon?: undefined;
};

type IconTileContentProps = Omit<IconTileMenuItemProps, 'style' | 'shouldIgnoreCompactStyle'>;

/**
 * A tile with nothing drawn on it would be an empty colored square, so such a row keeps its regular look.
 * Takes the row ID and whether the row has an icon rather than the tile and the icon, because React Compiler assumes a function may change
 * an object passed to it and would stop the caller from caching the tile.
 */
function shouldDrawIconTile(itemID: string, hasRowIcon: boolean): boolean {
    const tile = getFABMenuIconTile(itemID);
    return !!tile && (!!tile.iconName || hasRowIcon);
}

/**
 * Takes the rendered tile rather than its colors, because React Compiler assumes a function may change an object passed to it and would
 * stop the caller from caching the colors. The row height is left to the caller, since the create menu row sets it differently.
 */
function getIconTileContentProps(iconTile: ReactNode, styles: ThemeStyles): IconTileContentProps {
    return {
        icon: undefined,
        iconWidth: undefined,
        iconHeight: undefined,
        displayInDefaultIconColor: false,
        leftComponent: iconTile,
        innerContainerStyle: styles.alignItemsCenter,
    };
}

/** Gives a tile row the height of a create menu row */
function getIconTileRowStyle(shouldUseNarrowLayout: boolean, styles: ThemeStyles, StyleUtils: StyleUtilsType): StyleProp<ViewStyle> {
    return [StyleUtils.getMinimumHeight(shouldUseNarrowLayout ? variables.optionRowHeight : variables.optionRowHeightCompact), styles.pv0, styles.alignItemsCenter];
}

/** For menus built from a list of rows, gives one function that each row calls with the ID of the create menu row it matches and its own icon */
function useIconTileMenuItemProps() {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();
    const shouldShowIconTiles = isBetaEnabled(CONST.BETAS.FLAT_NAV);

    const getIconTileMenuItemProps = (itemID: string, rowIcon: IconAsset | undefined): IconTileMenuItemProps => {
        const tile = shouldShowIconTiles && shouldDrawIconTile(itemID, !!rowIcon) ? getFABMenuIconTile(itemID) : undefined;
        if (!tile) {
            return {};
        }

        return {
            ...getIconTileContentProps(
                <FABMenuIconTile
                    tile={tile}
                    fallbackIcon={rowIcon}
                />,
                styles,
            ),
            // PopoverMenu passes its own wrapper style for the focused, selected and disabled backgrounds, so the tile height skips the compact styles and goes through the style prop instead
            shouldIgnoreCompactStyle: true,
            style: getIconTileRowStyle(shouldUseNarrowLayout, styles, StyleUtils),
        };
    };

    return getIconTileMenuItemProps;
}

export default useIconTileMenuItemProps;
export {getIconTileContentProps, getIconTileRowStyle, shouldDrawIconTile};
