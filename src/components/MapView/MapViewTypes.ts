import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import type {Unit} from '@src/types/onyx/Policy';

type Coordinate = [number, number];

type MapViewProps = {
    // Public access token to be used to fetch map data from Mapbox.
    accessToken: string;
    // Style applied to MapView component. Note some of the View Style props are not available on ViewMap
    style: StyleProp<ViewStyle>;
    // Link to the style JSON document.
    styleURL?: string;
    // Whether map can tilt in the vertical direction.
    pitchEnabled?: boolean;
    // Padding to apply when the map is adjusted to fit waypoints and directions
    mapPadding?: number;
    // Initial coordinate and zoom level
    initialState?: InitialState;
    // Locations on which to put markers
    waypoints?: WayPoint[];
    // List of coordinates which together forms a direction.
    directionCoordinates?: Coordinate[];
    // Callback to call when the map is idle / ready.
    onMapReady?: () => void;
    // Whether the map is interactive or not
    interactive?: boolean;

    // Distance displayed on the map in meters.
    distanceInMeters?: number;

    // Unit of measurement for distance
    unit?: Unit;
};

type DirectionProps = {
    // Coordinates of points that constitute the direction
    coordinates: Coordinate[];
};

type PendingMapViewProps = {
    /** Title message below the icon */
    title?: string;

    /** Subtitle message below the title */
    subtitle?: string;

    /** Style applied to PendingMapView */
    style?: StyleProp<ViewStyle>;

    /** Whether the size of the route pending icon is smaller. */
    isSmallerIcon?: boolean;
};

// Initial state of the map
type InitialState = {
    // Coordinate on which to center the map
    location: Coordinate;
    zoom: number;
};

// Waypoint to be displayed on the map
type WayPoint = {
    id: string;
    coordinate: Coordinate;
    markerComponent: () => ReactNode;
};

// Represents a handle to interact with a map view.
type MapViewHandle = {
    // Fly to a location on the map
    flyTo: (location: Coordinate, zoomLevel: number, animationDuration?: number) => void;
    // Fit the map view to a bounding box
    fitBounds: (ne: Coordinate, sw: Coordinate, paddingConfig?: number | number[], animationDuration?: number) => void;
};

export type {WayPoint, MapViewProps, DirectionProps, PendingMapViewProps, MapViewHandle, Coordinate};
