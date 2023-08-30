import Mapbox from '@rnmapbox/maps';
import {DirectionProps} from './MapViewTypes';

function Direction({coordinates, directionStyle}: DirectionProps) {
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
                style={{
                    lineColor: directionStyle?.color ?? '#000000',
                    lineWidth: directionStyle?.width ?? 1,
                }}
            />
        </Mapbox.ShapeSource>
    );
}

export default Direction;
