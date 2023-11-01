import {ComponentType} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

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
    directionCoordinates?: Array<[number, number]>;
    // Callback to call when the map is idle / ready.
    onMapReady?: () => void;
};

type DirectionProps = {
    // Coordinates of points that constitute the direction
    coordinates: Array<[number, number]>;
};

type PendingMapViewProps = {
    /** Title message below the icon */
    title?: string;

    /** Subtitle message below the title */
    subtitle?: string;

    /** Style applied to PendingMapView */
    style?: StyleProp<ViewStyle>;
};

// Initial state of the map
type InitialState = {
    // Coordinate on which to center the map
    location: [number, number];
    zoom: number;
};

// Waypoint to be displayed on the map
type WayPoint = {
    id: string;
    coordinate: [number, number];
    markerComponent: ComponentType;
};

// Style used for the line that displays direction
type DirectionStyle = {
    width?: number;
    color?: string;
};

// Represents a handle to interact with a map view.
type MapViewHandle = {
    // Fly to a location on the map
    flyTo: (location: [number, number], zoomLevel: number, animationDuration?: number) => void;
    // Fit the map view to a bounding box
    fitBounds: (ne: [number, number], sw: [number, number], paddingConfig?: number | number[], animationDuration?: number) => void;
};

export type {DirectionStyle, WayPoint, MapViewProps, DirectionProps, PendingMapViewProps, MapViewHandle};
