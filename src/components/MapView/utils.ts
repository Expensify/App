import {LOCALES} from '@src/CONST/LOCALES';
import type {Locale} from '@src/CONST/LOCALES';

import type {AlternateDirection, Coordinate} from './MapViewTypes';

/** App locales whose value isn't already the BCP-47 code Mapbox expects for label localization. */
const LOCALE_TO_MAPBOX_LANGUAGE: Partial<Record<Locale, string>> = {
    [LOCALES.PT_BR]: 'pt',
    [LOCALES.ZH_HANS]: 'zh-Hans',
};

/**
 * Maps an app locale to the BCP-47 language code Mapbox uses to localize map labels.
 * Most app locales are already valid Mapbox codes, so only a couple need remapping.
 * Unsupported codes fall back to each label's local language on the Mapbox side.
 */
function getMapboxLanguage(locale: Locale | undefined): string | undefined {
    if (!locale) {
        return undefined;
    }
    return LOCALE_TO_MAPBOX_LANGUAGE[locale] ?? locale;
}

// cspell:ignore tileset
/**
 * Worldviews the Mapbox Streets tileset behind our map style ships boundaries for.
 * A worldview decides which side of a disputed border is drawn, so Mapbox only defines one for the
 * handful of countries that dispute borders; every other country shares Mapbox's default worldview.
 */
const MAPBOX_WORLDVIEWS = new Set<string>(['CN', 'IN', 'JP', 'US']);

/**
 * Maps the user's country to the Mapbox worldview used to draw disputed borders.
 * Returns undefined for countries Mapbox has no dedicated worldview for, which leaves the style's default in place.
 */
function getMapboxWorldview(country: string | undefined): string | undefined {
    if (!country || !MAPBOX_WORLDVIEWS.has(country)) {
        return undefined;
    }
    return country;
}

/** A geographic point as a plain longitude/latitude pair. Mapbox's `LngLat` became a class in mapbox-gl 3.x, but these helpers only read `.lng`/`.lat`, so a literal shape is all that's needed. */
type LngLatLiteral = {lng: number; lat: number};

/** Where along its own route each distance symbol sits, as a share of the route length */
const PRIMARY_ROUTE_FRACTION = 0.33;
const ALTERNATE_ROUTE_FRACTION = 0.66;

function isSingleSegmentRoute(directionCoordinates: Coordinate[] | Coordinate[][]): directionCoordinates is Coordinate[] {
    const firstElement = directionCoordinates.at(0);
    if (!firstElement) {
        return true;
    }
    return typeof firstElement.at(0) === 'number';
}

function getBounds(waypoints: Coordinate[], directionCoordinates: undefined | Coordinate[]): {southWest: Coordinate; northEast: Coordinate} {
    const longitudes = waypoints.map((waypoint) => waypoint[0]);
    const latitudes = waypoints.map((waypoint) => waypoint[1]);
    if (directionCoordinates) {
        longitudes.push(...directionCoordinates.map((coordinate) => coordinate[0]));
        latitudes.push(...directionCoordinates.map((coordinate) => coordinate[1]));
    }

    return {
        southWest: [Math.min(...longitudes), Math.min(...latitudes)],
        northEast: [Math.max(...longitudes), Math.max(...latitudes)],
    };
}

/**
 * Calculates the distance between two points on the Earth's surface given their latitude and longitude coordinates.
 */
function haversineDistance(coordinate1: Coordinate, coordinate2: Coordinate) {
    // Radius of the Earth in meters
    const R = 6371e3;
    const lat1 = ((coordinate1.at(0) ?? 0) * Math.PI) / 180;
    const lat2 = ((coordinate2.at(0) ?? 0) * Math.PI) / 180;
    const deltaLat = (((coordinate2.at(0) ?? 0) - (coordinate1.at(0) ?? 0)) * Math.PI) / 180;
    const deltaLon = (((coordinate2.at(1) ?? 0) - (coordinate1.at(1) ?? 0)) * Math.PI) / 180;

    // The square of half the chord length between the points
    const halfChordLengthSq = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

    // The angular distance in radians
    const angularDistance = 2 * Math.atan2(Math.sqrt(halfChordLengthSq), Math.sqrt(1 - halfChordLengthSq));

    // Distance in meters
    return R * angularDistance;
}

function areSameCoordinate(coordinate1: Coordinate, coordinate2: Coordinate) {
    return haversineDistance(coordinate1, coordinate2) < 20;
}

function findClosestCoordinateOnLineFromCenter(center: LngLatLiteral, lineCoordinates: Coordinate[]): Coordinate | null {
    if (!lineCoordinates || lineCoordinates.length < 2) {
        return null;
    }

    let closestPointOnLine: Coordinate | null = null;
    let minDistance = Infinity;

    for (let i = 0; i < lineCoordinates.length - 1; i++) {
        const startPoint = lineCoordinates.at(i);
        const endPoint = lineCoordinates.at(i + 1);

        if (!startPoint || !endPoint) {
            break;
        }

        const closestPoint = closestPointOnSegment(center, startPoint, endPoint);

        const distance = haversineDistance([center.lng, center.lat], [closestPoint.lng, closestPoint.lat]);

        if (distance < minDistance) {
            minDistance = distance;
            closestPointOnLine = [closestPoint.lng, closestPoint.lat];
        }
    }

    return closestPointOnLine;
}

/**
 * Find the closest point on the line segment created by connecting start and endPoint
 */
function closestPointOnSegment(point: LngLatLiteral, startPoint: Coordinate, endPoint: Coordinate): LngLatLiteral {
    const x0 = point.lng;
    const y0 = point.lat;
    const x1 = startPoint[0];
    const y1 = startPoint[1];
    const x2 = endPoint[0];
    const y2 = endPoint[1];

    const dx = x2 - x1;
    const dy = y2 - y1;

    if (dx === 0 && dy === 0) {
        return {lng: x1, lat: y1};
    }

    const t = ((x0 - x1) * dx + (y0 - y1) * dy) / (dx * dx + dy * dy);

    let closestX;
    let closestY;
    if (t < 0) {
        closestX = x1;
        closestY = y1;
    } else if (t > 1) {
        closestX = x2;
        closestY = y2;
    } else {
        closestX = x1 + t * dx;
        closestY = y1 + t * dy;
    }

    return {lng: closestX, lat: closestY};
}

function areCoordinatesEqual(coordinate1: Coordinate | undefined, coordinate2: Coordinate | undefined) {
    if (!coordinate1 || !coordinate2) {
        return false;
    }
    return coordinate1[0] === coordinate2[0] && coordinate1[1] === coordinate2[1];
}

// Simple linear interpolation of a coordinate between two points
function simpleInterpolateCoordinate(start: Coordinate, end: Coordinate, progress: number): Coordinate {
    return [start[0] + (end[0] - start[0]) * progress, start[1] + (end[1] - start[1]) * progress];
}

function getBoundsCenter(bounds: {southWest: Coordinate; northEast: Coordinate}) {
    const {
        southWest: [south, west],
        northEast: [north, east],
    } = bounds;

    const latitudeCenter = (north + south) / 2;
    const longitudeCenter = (east + west) / 2;

    return {lng: latitudeCenter, lat: longitudeCenter};
}

/** Coordinate that lies `fraction` of the way along a route, measured by length rather than by index, as the density of the coordinates varies along a route. */
function findCoordinateAtRouteFraction(lineCoordinates: Coordinate[], fraction: number): Coordinate | null {
    let totalLength = 0;

    for (let i = 0; i < lineCoordinates.length - 1; i++) {
        const startPoint = lineCoordinates.at(i);
        const endPoint = lineCoordinates.at(i + 1);

        if (!startPoint || !endPoint) {
            break;
        }

        // map Coordinates are [long, lat], but haversineDistance treats [0] as latitude and [1] as longitude
        totalLength += haversineDistance([startPoint[1], startPoint[0]], [endPoint[1], endPoint[0]]);
    }

    const targetLength = totalLength * fraction;
    let walkedLength = 0;

    for (let i = 0; i < lineCoordinates.length - 1; i++) {
        const startPoint = lineCoordinates.at(i);
        const endPoint = lineCoordinates.at(i + 1);

        if (!startPoint || !endPoint) {
            break;
        }

        const segmentLength = haversineDistance([startPoint[1], startPoint[0]], [endPoint[1], endPoint[0]]);

        if (walkedLength + segmentLength >= targetLength) {
            return simpleInterpolateCoordinate(startPoint, endPoint, segmentLength > 0 ? (targetLength - walkedLength) / segmentLength : 0);
        }

        walkedLength += segmentLength;
    }

    return lineCoordinates.at(-1) ?? null;
}

/**
 * Coordinates at which the distance symbols of the primary and the alternate route should be anchored.
 * Each symbol is anchored at a different share of its own route, so that the two always sit at a
 * different point of the trip.
 */
function getDistanceSymbolCoordinates(
    waypoints: Coordinate[],
    primaryRouteCoordinates: Coordinate[] | undefined,
    alternateRouteCoordinates: Coordinate[] | undefined,
): {primary: Coordinate | null; alternate: Coordinate | null} {
    const primaryRoute = primaryRouteCoordinates ?? [];
    const alternateRoute = alternateRouteCoordinates ?? [];

    if (!waypoints.length || primaryRoute.length < 2) {
        return {primary: null, alternate: null};
    }

    // A single set of bounds is shared by both symbols, so that they are placed relative to the same map.
    const bounds = getBounds(waypoints, [...primaryRoute, ...alternateRoute]);
    const center = getBoundsCenter(bounds);

    // A lone symbol has nothing to overlap with, so it stays at the point of its route closest to the center of the map.
    if (alternateRoute.length < 2) {
        return {primary: findClosestCoordinateOnLineFromCenter(center, primaryRoute), alternate: null};
    }

    return {
        primary: findCoordinateAtRouteFraction(primaryRoute, PRIMARY_ROUTE_FRACTION),
        alternate: findCoordinateAtRouteFraction(alternateRoute, ALTERNATE_ROUTE_FRACTION),
    };
}

/** Flattens a route made of several segments into a single list of coordinates, leaving a single segment route as is. */
function convertSegmentedRouteToSingleSegmentRoute(directionCoordinates: Coordinate[] | Coordinate[][]): Coordinate[];
function convertSegmentedRouteToSingleSegmentRoute(directionCoordinates: Coordinate[] | Coordinate[][] | undefined): Coordinate[] | undefined;
function convertSegmentedRouteToSingleSegmentRoute(directionCoordinates: Coordinate[] | Coordinate[][] | undefined) {
    return !directionCoordinates || isSingleSegmentRoute(directionCoordinates) ? directionCoordinates : directionCoordinates.flat();
}

function getCoordinatesFromAllDirections(directionCoordinates: Coordinate[] | Coordinate[][] | undefined, alternateDirection: AlternateDirection | undefined) {
    const directionCoordinatesFlattened = convertSegmentedRouteToSingleSegmentRoute(directionCoordinates);

    const alternateDirectionCoordinates = alternateDirection?.coordinates;
    const alternateDirectionCoordinatesFlattened = convertSegmentedRouteToSingleSegmentRoute(alternateDirectionCoordinates);

    return [...(directionCoordinatesFlattened ?? []), ...(alternateDirectionCoordinatesFlattened ?? [])];
}

export default {
    getBounds,
    areSameCoordinate,
    areCoordinatesEqual,
    findClosestCoordinateOnLineFromCenter,
    getBoundsCenter,
    getDistanceSymbolCoordinates,
    simpleInterpolateCoordinate,
    isSingleSegmentRoute,
    convertSegmentedRouteToSingleSegmentRoute,
    getCoordinatesFromAllDirections,
    getMapboxLanguage,
    getMapboxWorldview,
};
