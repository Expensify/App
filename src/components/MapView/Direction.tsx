import Mapbox from '@rnmapbox/maps';
import {DirectionProps} from './MapViewTypes';
import styles from '../../styles/styles';

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

export default Direction;
