// Explanation: Different Mapbox libraries are required for web and native mobile platforms.
// This is why we have separate components for web and native to handle the specific implementations.
// For the web version, we use the Mapbox Web library called react-map-gl, while for the native mobile version,
// we utilize a different Mapbox library @rnmapbox/maps tailored for mobile development.
import React from 'react';
import {Layer, Source} from 'react-map-gl';
import {View} from 'react-native';
import {MapDirectionLayerStyle} from '@styles/styles';
import useThemeStyles from '@styles/useThemeStyles';
import {DirectionProps} from './MapViewTypes';

function Direction({coordinates}: DirectionProps) {
    const styles = useThemeStyles();
    const mapDirectionLayerStyle = styles.mapDirectionLayer as MapDirectionLayerStyle;
    const layerLayoutStyle = mapDirectionLayerStyle.layout as Record<string, string>;
    const layerPointStyle = mapDirectionLayerStyle.paint as Record<string, string | number>;

    if (coordinates.length < 1) {
        return null;
    }
    return (
        <View>
            {coordinates && (
                <Source
                    id="route"
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
                        id="route"
                        type="line"
                        source="route"
                        paint={layerPointStyle}
                        layout={layerLayoutStyle}
                    />
                </Source>
            )}
        </View>
    );
}

Direction.displayName = 'Direction';

export default Direction;
