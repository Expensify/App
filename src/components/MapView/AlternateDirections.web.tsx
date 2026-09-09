import useThemeStyles from '@hooks/useThemeStyles';

import type {FilterSpecification} from 'mapbox-gl';

import React from 'react';
import {Layer, Source} from 'react-map-gl/mapbox';

import type {AlternateDirectionsProps} from './MapViewTypes';

import {getAlternateDirectionsShape, SELECTED_BORDER_ID, SELECTED_FILL_ID, SOURCE_ID, UNSELECTED_BORDER_ID, UNSELECTED_FILL_ID} from './alternateDirectionsUtils';

/** Layers that must be interactive on the map so that tapping a route selects it. */
const ALTERNATE_DIRECTIONS_LAYER_IDS = [UNSELECTED_BORDER_ID, UNSELECTED_FILL_ID, SELECTED_BORDER_ID, SELECTED_FILL_ID];

const UNSELECTED_FILTER: FilterSpecification = ['==', ['get', 'isSelected'], false];
const SELECTED_FILTER: FilterSpecification = ['==', ['get', 'isSelected'], true];

function AlternateDirections({directionCoordinates, alternateDirection}: AlternateDirectionsProps) {
    const styles = useThemeStyles();
    const layerLayoutStyle: Record<string, string> = styles.mapDirectionLayer.layout;
    const layerPaintStyle: Record<string, string | number> = styles.mapDirectionLayer.paint;
    const alternativeLayerLayoutStyle: Record<string, string> = styles.alternativeMapDirectionLayer.layout;
    const alternativeLayerPaintStyle: Record<string, string | number> = styles.alternativeMapDirectionLayer.paint;
    const layerBorderLayoutStyle: Record<string, string> = styles.mapDirectionLayerBorder.layout;
    const layerBorderPaintStyle: Record<string, string | number> = styles.mapDirectionLayerBorder.paint;

    const directionShape = getAlternateDirectionsShape(directionCoordinates, alternateDirection);

    return (
        <Source
            id={SOURCE_ID}
            type="geojson"
            data={directionShape}
        >
            <Layer
                id={UNSELECTED_BORDER_ID}
                type="line"
                source={SOURCE_ID}
                filter={UNSELECTED_FILTER}
                paint={layerBorderPaintStyle}
                layout={layerBorderLayoutStyle}
            />
            <Layer
                id={UNSELECTED_FILL_ID}
                type="line"
                source={SOURCE_ID}
                filter={UNSELECTED_FILTER}
                paint={alternativeLayerPaintStyle}
                layout={alternativeLayerLayoutStyle}
            />
            <Layer
                id={SELECTED_BORDER_ID}
                type="line"
                source={SOURCE_ID}
                filter={SELECTED_FILTER}
                paint={layerBorderPaintStyle}
                layout={layerBorderLayoutStyle}
            />
            <Layer
                id={SELECTED_FILL_ID}
                type="line"
                source={SOURCE_ID}
                filter={SELECTED_FILTER}
                paint={layerPaintStyle}
                layout={layerLayoutStyle}
            />
        </Source>
    );
}

export default AlternateDirections;
export {ALTERNATE_DIRECTIONS_LAYER_IDS};
