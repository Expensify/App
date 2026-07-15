import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {Feature, FeatureCollection, LineString, MultiLineString} from 'geojson';

import Mapbox from '@rnmapbox/maps';

import type {Coordinate, DirectionsProps} from './MapViewTypes';

import utils from './utils';

type DirectionFeatureProperties = {
    isAlternative: boolean;
    isSelected: boolean;
};

type AlternateDirectionsProps = Required<Pick<DirectionsProps, 'directionCoordinates' | 'alternativeDirection'>> & Pick<DirectionsProps, 'setIsAlternativeDirectionSelected'>;

const SOURCE_ID = `alternate-directions-${CONST.MAP_VIEW_LAYERS.ROUTE_SOURCE}`;
const UNSELECTED_FILL_ID = `alternate-directions-unselected-${CONST.MAP_VIEW_LAYERS.ROUTE_FILL}`;
const UNSELECTED_BORDER_ID = `alternate-directions-unselected-${CONST.MAP_VIEW_LAYERS.ROUTE_BORDER}`;
const SELECTED_FILL_ID = `alternate-directions-selected-${CONST.MAP_VIEW_LAYERS.ROUTE_FILL}`;
const SELECTED_BORDER_ID = `alternate-directions-selected-${CONST.MAP_VIEW_LAYERS.ROUTE_BORDER}`;

function getDirectionFeature(
    coordinates: Coordinate[] | Coordinate[][],
    isAlternative: boolean,
    isSelected: boolean,
): Feature<LineString | MultiLineString, DirectionFeatureProperties> | undefined {
    if (utils.isSingleSegmentRoute(coordinates)) {
        if (coordinates.length < 2) {
            return undefined;
        }

        return {
            type: 'Feature',
            properties: {isAlternative, isSelected},
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
        properties: {isAlternative, isSelected},
        geometry: {
            type: 'MultiLineString',
            coordinates: validSegments,
        },
    };
}

function AlternateDirections({directionCoordinates, alternativeDirection, setIsAlternativeDirectionSelected}: AlternateDirectionsProps) {
    const styles = useThemeStyles();
    const directionShape: FeatureCollection<LineString | MultiLineString, DirectionFeatureProperties> = {
        type: 'FeatureCollection',
        features: [
            getDirectionFeature(directionCoordinates, false, !alternativeDirection.isSelected),
            getDirectionFeature(alternativeDirection.coordinates, true, alternativeDirection.isSelected),
        ].filter((feature): feature is Feature<LineString | MultiLineString, DirectionFeatureProperties> => !!feature),
    };

    return (
        <Mapbox.ShapeSource
            id={SOURCE_ID}
            shape={directionShape}
            onPress={({features}) => {
                const properties = features.at(0)?.properties;
                if (typeof properties?.isAlternative !== 'boolean') {
                    return;
                }
                setIsAlternativeDirectionSelected?.(properties.isAlternative);
            }}
        >
            <Mapbox.LineLayer
                id={UNSELECTED_FILL_ID}
                filter={['==', ['get', 'isSelected'], false]}
                style={styles.alternativeMapDirection}
            />
            <Mapbox.LineLayer
                id={UNSELECTED_BORDER_ID}
                belowLayerID={UNSELECTED_FILL_ID}
                filter={['==', ['get', 'isSelected'], false]}
                style={styles.mapDirectionBorder}
            />
            <Mapbox.LineLayer
                id={SELECTED_FILL_ID}
                filter={['==', ['get', 'isSelected'], true]}
                style={styles.mapDirection}
            />
            <Mapbox.LineLayer
                id={SELECTED_BORDER_ID}
                belowLayerID={SELECTED_FILL_ID}
                filter={['==', ['get', 'isSelected'], true]}
                style={styles.mapDirectionBorder}
            />
        </Mapbox.ShapeSource>
    );
}

export default AlternateDirections;
