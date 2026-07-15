import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import Mapbox from '@rnmapbox/maps';

import type {DirectionProps} from './MapViewTypes';

import utils from './utils';

function getId(idSuffix: string, idPrefix?: string) {
    if (!idPrefix) {
        return idSuffix;
    }

    return `${idPrefix}-${idSuffix}`;
}

function Direction({coordinates, belowLayerID, isSelected = true, id, onPress}: DirectionProps) {
    const styles = useThemeStyles();

    // If not a single segment route, we need to handle route split into multiple separate segments
    if (!utils.isSingleSegmentRoute(coordinates)) {
        const validSegments = coordinates.filter((segment) => segment.length >= 2);
        if (validSegments.length === 0) {
            return null;
        }

        return (
            <>
                {validSegments.map((segmentCoordinates, index) => (
                    <Mapbox.ShapeSource
                        key={getId(`${CONST.MAP_VIEW_LAYERS.ROUTE_SOURCE}-segment-${index}`, id)}
                        id={getId(`${CONST.MAP_VIEW_LAYERS.ROUTE_SOURCE}-segment-${index}`, id)}
                        shape={{
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'LineString',
                                coordinates: segmentCoordinates,
                            },
                        }}
                        onPress={onPress}
                    >
                        <Mapbox.LineLayer
                            belowLayerID={belowLayerID}
                            id={getId(`${CONST.MAP_VIEW_LAYERS.ROUTE_FILL}-segment-${index}`, id)}
                            style={isSelected ? styles.mapDirection : styles.alternativeMapDirection}
                        />
                        <Mapbox.LineLayer
                            belowLayerID={getId(`${CONST.MAP_VIEW_LAYERS.ROUTE_FILL}-segment-${index}`, id)}
                            id={getId(`${CONST.MAP_VIEW_LAYERS.ROUTE_BORDER}-segment-${index}`, id)}
                            style={styles.mapDirectionBorder}
                        />
                    </Mapbox.ShapeSource>
                ))}
            </>
        );
    }

    if (coordinates.length < 2) {
        return null;
    }

    return (
        <Mapbox.ShapeSource
            id={getId(CONST.MAP_VIEW_LAYERS.ROUTE_SOURCE, id)}
            shape={{
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates,
                },
            }}
            onPress={onPress}
        >
            <Mapbox.LineLayer
                belowLayerID={belowLayerID}
                id={getId(CONST.MAP_VIEW_LAYERS.ROUTE_FILL, id)}
                style={isSelected ? styles.mapDirection : styles.alternativeMapDirection}
            />
            <Mapbox.LineLayer
                belowLayerID={getId(CONST.MAP_VIEW_LAYERS.ROUTE_FILL, id)}
                id={getId(CONST.MAP_VIEW_LAYERS.ROUTE_BORDER, id)}
                style={styles.mapDirectionBorder}
            />
        </Mapbox.ShapeSource>
    );
}

export default Direction;
