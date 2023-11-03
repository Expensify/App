import PropTypes from 'prop-types';

const propTypes = {
    // Public access token to be used to fetch map data from Mapbox.
    accessToken: PropTypes.string.isRequired,

    // Style applied to MapView component. Note some of the View Style props are not available on ViewMap
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    // Link to the style JSON document.
    styleURL: PropTypes.string,

    // Whether map can tilt in the vertical direction.
    pitchEnabled: PropTypes.bool,

    // Padding to apply when the map is adjusted to fit waypoints and directions
    mapPadding: PropTypes.number,

    // Initial coordinate and zoom level
    initialState: PropTypes.shape({
        location: PropTypes.arrayOf(PropTypes.number).isRequired,
        zoom: PropTypes.number.isRequired,
    }),

    // Locations on which to put markers
    waypoints: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string,
            coordinate: PropTypes.arrayOf(PropTypes.number),
            markerComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
        }),
    ),

    // List of coordinates which together forms a direction.
    directionCoordinates: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),

    // Callback to call when the map is idle / ready
    onMapReady: PropTypes.func,

    // Optional additional styles to be applied to the overlay
    overlayStyle: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),
};

const defaultProps = {
    styleURL: undefined,
    pitchEnabled: false,
    mapPadding: 0,
    initialState: undefined,
    waypoints: undefined,
    directionCoordinates: undefined,
    onMapReady: () => {},
    overlayStyle: undefined,
};

export {propTypes, defaultProps};
