// Explanation: Different Mapbox libraries are required for web and native mobile platforms.
// This is why we have separate components for web and native to handle the specific implementations.
// For the web version, we use the Mapbox Web library called react-map-gl, while for the native mobile version,
// we utilize a different Mapbox library @rnmapbox/maps tailored for mobile development.
import React from 'react';
import {Layer, Source} from 'react-map-gl';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {DirectionProps} from './MapViewTypes';
import utils from './utils';

function Direction({coordinates}: DirectionProps) {
    const styles = useThemeStyles();
    const layerLayoutStyle: Record<string, string> = styles.mapDirectionLayer.layout;
    const layerPointStyle: Record<string, string | number> = styles.mapDirectionLayer.paint;

    if (!utils.isSingleSegmentRoute(coordinates)) {
        const validSegments = coordinates.filter((segment) => segment.length >= 2);
        if (validSegments.length === 0) {
            return null;
        }

        return (
            <View>
                {validSegments.map((segmentCoordinates, index) => (
                    <Source
                        // Using index as key is safe because we are not reordering the routes
                        // eslint-disable-next-line react/no-array-index-key
                        key={`${CONST.MAP_VIEW_LAYERS.ROUTE_SOURCE}-segment-${index}`}
                        id={`${CONST.MAP_VIEW_LAYERS.ROUTE_SOURCE}-segment-${index}`}
                        type="geojson"
                        data={{
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'LineString',
                                coordinates: segmentCoordinates,
                            },
                        }}
                    >
                        <Layer
                            id={`${CONST.MAP_VIEW_LAYERS.ROUTE_FILL}-segment-${index}`}
                            type="line"
                            source={`${CONST.MAP_VIEW_LAYERS.ROUTE_SOURCE}-segment-${index}`}
                            paint={layerPointStyle}
                            layout={layerLayoutStyle}
                        />
                    </Source>
                ))}
            </View>
        );
    }

    if (coordinates.length < 2) {
        return null;
    }

    return (
        <View>
            {!!coordinates && (
                <Source
                    id={CONST.MAP_VIEW_LAYERS.ROUTE_SOURCE}
                    type="geojson"
                    data={{
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'LineString',
                            coordinates,
                        },
                    }}
                >
                    <Layer
                        id={CONST.MAP_VIEW_LAYERS.ROUTE_FILL}
                        type="line"
                        source={CONST.MAP_VIEW_LAYERS.ROUTE_SOURCE}
                        paint={layerPointStyle}
                        layout={layerLayoutStyle}
                    />
                </Source>
            )}
        </View>
    );
}

export default Direction;
