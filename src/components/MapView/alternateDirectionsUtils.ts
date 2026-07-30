import CONST from '@src/CONST';

import type {Feature, FeatureCollection, LineString, MultiLineString} from 'geojson';

import type {AlternateDirection, Coordinate} from './MapViewTypes';

import utils from './utils';

type DirectionFeatureProperties = {
    isAlternate: boolean;
    isSelected: boolean;
};

type DirectionFeature = Feature<LineString | MultiLineString, DirectionFeatureProperties>;

const {
    SOURCE: SOURCE_ID,
    UNSELECTED_FILL: UNSELECTED_FILL_ID,
    UNSELECTED_BORDER: UNSELECTED_BORDER_ID,
    SELECTED_FILL: SELECTED_FILL_ID,
    SELECTED_BORDER: SELECTED_BORDER_ID,
} = CONST.ALTERNATE_DIRECTIONS_MAP_VIEW_LAYERS;

function getDirectionFeature(coordinates: Coordinate[] | Coordinate[][], isAlternate: boolean, isSelected: boolean): DirectionFeature | undefined {
    if (utils.isSingleSegmentRoute(coordinates)) {
        if (coordinates.length < 2) {
            return undefined;
        }

        return {
            type: 'Feature',
            properties: {isAlternate, isSelected},
            geometry: {
                type: 'LineString',
                coordinates,
            },
        };
    }

    const validSegments = coordinates.filter((segment) => segment.length >= 2);
    if (validSegments.length === 0) {
        return undefined;
    }

    return {
        type: 'Feature',
        properties: {isAlternate, isSelected},
        geometry: {
            type: 'MultiLineString',
            coordinates: validSegments,
        },
    };
}

/** Builds the GeoJSON shape holding both the main and the alternate route, each flagged with whether it is the selected one. */
function getAlternateDirectionsShape(
    directionCoordinates: Coordinate[] | Coordinate[][],
    alternateDirection: AlternateDirection,
): FeatureCollection<LineString | MultiLineString, DirectionFeatureProperties> {
    return {
        type: 'FeatureCollection',
        features: [
            getDirectionFeature(directionCoordinates, false, !alternateDirection.isSelected),
            getDirectionFeature(alternateDirection.coordinates, true, alternateDirection.isSelected),
        ].filter((feature): feature is DirectionFeature => !!feature),
    };
}

export {SOURCE_ID, UNSELECTED_FILL_ID, UNSELECTED_BORDER_ID, SELECTED_FILL_ID, SELECTED_BORDER_ID, getAlternateDirectionsShape};
