import Mapbox from '@rnmapbox/maps';
import styles from '@styles/styles';
import {DirectionProps} from './MapViewTypes';

function Direction({coordinates}: DirectionProps) {
    if (coordinates.length < 1) {
        return null;
    }

    return (
        <Mapbox.ShapeSource
            id="routeSource"
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
                id="routeFill"
                style={styles.mapDirection}
            />
        </Mapbox.ShapeSource>
    );
}

Direction.displayName = 'Direction';

export default Direction;
