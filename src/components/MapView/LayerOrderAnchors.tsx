import CONST from '@src/CONST';

import Mapbox from '@rnmapbox/maps';

// The source has no features, so the anchor layers never render anything - they only exist as positions in the layer stack
const EMPTY_SHAPE = {
    type: 'FeatureCollection' as const,
    features: [],
};

/**
 * Empty layers whose only purpose is to give other layers a stable position to anchor to via `belowLayerID`/`aboveLayerID`.
 * This is needed as `belowLayerID` and `aboveLayerID` don't work well on native when they target layers that may not be
 * mounted yet and on GPSMapView we have to keep LocationPuck > Waypoints > Route order.
 */
function LayerOrderAnchors() {
    return (
        <Mapbox.ShapeSource
            id={CONST.MAP_VIEW_LAYERS.LAYER_ORDER_ANCHOR_SOURCE}
            shape={EMPTY_SHAPE}
        >
            <Mapbox.CircleLayer id={CONST.MAP_VIEW_LAYERS.ROUTE_ANCHOR} />
            <Mapbox.CircleLayer id={CONST.MAP_VIEW_LAYERS.WAYPOINTS_ANCHOR} />
        </Mapbox.ShapeSource>
    );
}

export default LayerOrderAnchors;
