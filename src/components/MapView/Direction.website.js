"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Explanation: Different Mapbox libraries are required for web and native mobile platforms.
// This is why we have separate components for web and native to handle the specific implementations.
// For the web version, we use the Mapbox Web library called react-map-gl, while for the native mobile version,
// we utilize a different Mapbox library @rnmapbox/maps tailored for mobile development.
var react_1 = require("react");
var react_map_gl_1 = require("react-map-gl");
var react_native_1 = require("react-native");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function Direction(_a) {
    var coordinates = _a.coordinates;
    var styles = (0, useThemeStyles_1.default)();
    var layerLayoutStyle = styles.mapDirectionLayer.layout;
    var layerPointStyle = styles.mapDirectionLayer.paint;
    if (coordinates.length < 1) {
        return null;
    }
    return (<react_native_1.View>
            {!!coordinates && (<react_map_gl_1.Source id="route" type="geojson" data={{
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: coordinates,
                },
            }}>
                    <react_map_gl_1.Layer id="route" type="line" source="route" paint={layerPointStyle} layout={layerLayoutStyle}/>
                </react_map_gl_1.Source>)}
        </react_native_1.View>);
}
Direction.displayName = 'Direction';
exports.default = Direction;
