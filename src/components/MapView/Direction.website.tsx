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

function Direction({coordinates}: DirectionProps) {
    const styles = useThemeStyles();
    const layerLayoutStyle: Record<string, string> = styles.mapDirectionLayer.layout;
    const layerPointStyle: Record<string, string | number> = styles.mapDirectionLayer.paint;

    if (coordinates.length < 1) {
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
