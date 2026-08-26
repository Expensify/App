import Icon from '@components/Icon';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import type {BrickRoad} from '@libs/WorkspacesSettingsUtils';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type ListItemRBRIndicatorProps = {
    /** Brick road indicator status, which decides the dot color (info is green, everything else red) */
    brickRoadIndicator: BrickRoad;
};

/** Always renders; the parent row gates visibility (status present, selection state). */
function ListItemRBRIndicator({brickRoadIndicator}: ListItemRBRIndicatorProps) {
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator']);
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <View style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.ml3]}>
            <Icon
                testID={CONST.DOT_INDICATOR_TEST_ID}
                src={icons.DotIndicator}
                fill={brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO ? theme.iconSuccessFill : theme.danger}
            />
        </View>
    );
}

export default ListItemRBRIndicator;
