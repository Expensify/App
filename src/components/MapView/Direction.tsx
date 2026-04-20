import Mapbox from '@rnmapbox/maps';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {DirectionProps} from './MapViewTypes';

function Direction({coordinates, belowLayerID}: DirectionProps) {
    const styles = useThemeStyles();
    if (coordinates.length < 2) {
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
                belowLayerID={belowLayerID}
                id={CONST.MAP_VIEW_LAYERS.ROUTE_FILL}
                style={styles.mapDirection}
            />
        </Mapbox.ShapeSource>
    );
}

export default Direction;
