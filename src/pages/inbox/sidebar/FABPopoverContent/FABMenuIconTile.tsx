/**
 * Colored square with a centered icon, mounted only when the menu shows tiles so other menus skip loading the tile icons.
 */
import Icon from '@components/Icon';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type IconAsset from '@src/types/utils/IconAsset';

import {View} from 'react-native';

import type {FABMenuIconTile as FABMenuIconTileStyle} from './getFABMenuIconTile';

import {FAB_MENU_TILE_ICON_NAMES} from './getFABMenuIconTile';

type FABMenuIconTileProps = {
    /** Colors and icon of the tile */
    tile: FABMenuIconTileStyle;

    /** Icon the row passes in, drawn when the tile has no icon of its own */
    fallbackIcon?: IconAsset;
};

function FABMenuIconTile({tile, fallbackIcon}: FABMenuIconTileProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const tileIcons = useMemoizedLazyExpensifyIcons(FAB_MENU_TILE_ICON_NAMES);
    const src = tile.iconName ? tileIcons[tile.iconName] : fallbackIcon;

    if (!src) {
        return null;
    }

    return (
        <View
            style={[
                StyleUtils.getWidthAndHeightStyle(variables.flatNavigationBarCreateMenuIconTileSize),
                styles.borderRadiusComponentNormal,
                styles.justifyContentCenter,
                styles.alignItemsCenter,
                StyleUtils.getBackgroundColorStyle(tile.tileColor),
            ]}
        >
            <Icon
                src={src}
                width={variables.iconSizeSmall}
                height={variables.iconSizeSmall}
                fill={tile.iconColor}
            />
        </View>
    );
}

export default FABMenuIconTile;
