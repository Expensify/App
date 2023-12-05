import Mapbox from '@rnmapbox/maps';
import useThemeStyles from '@styles/useThemeStyles';
import {DirectionProps} from './MapViewTypes';

function Direction({coordinates}: DirectionProps) {
    const styles = useThemeStyles();
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
