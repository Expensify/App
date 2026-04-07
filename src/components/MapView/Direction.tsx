import Mapbox from '@rnmapbox/maps';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {DirectionProps} from './MapViewTypes';

function Direction({coordinates}: DirectionProps) {
    const styles = useThemeStyles();
    if (coordinates.length < 1) {
        return null;
    }

    return (
        <Mapbox.ShapeSource
            id={CONST.MAP_VIEW_LAYERS.ROUTE_SOURCE}
            shape={{
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates,
                },
            }}
        >
            <Mapbox.LineLayer
                belowLayerID={CONST.MAP_VIEW_LAYERS.USER_LOCATION}
                id={CONST.MAP_VIEW_LAYERS.ROUTE_FILL}
                style={styles.mapDirection}
            />
        </Mapbox.ShapeSource>
    );
}

export default Direction;
