import type {AlternateDirection, Coordinate, WayPoint} from '@components/MapView/MapViewTypes';
import utils from '@components/MapView/utils';

const SINGLE_SEGMENT: Coordinate[] = [
    [0, 0],
    [1, 1],
    [2, 2],
];

const SEGMENTED: Coordinate[][] = [
    [
        [0, 0],
        [1, 1],
    ],
    [
        [5, 5],
        [6, 6],
    ],
];

const buildAlternateDirection = (coordinates: Coordinate[] | Coordinate[][]): AlternateDirection => ({
    coordinates,
    isSelected: false,
    distanceInMeters: 1500,
});

describe('MapView utils', () => {
    describe('convertSegmentedRouteToSingleSegmentRoute', () => {
        it('returns a single segment route unchanged', () => {
            expect(utils.convertSegmentedRouteToSingleSegmentRoute(SINGLE_SEGMENT)).toBe(SINGLE_SEGMENT);
        });

        it('flattens a segmented route into a single list of coordinates', () => {
            expect(utils.convertSegmentedRouteToSingleSegmentRoute(SEGMENTED)).toEqual([
                [0, 0],
                [1, 1],
                [5, 5],
                [6, 6],
            ]);
        });

        it('passes through undefined and empty routes', () => {
            expect(utils.convertSegmentedRouteToSingleSegmentRoute(undefined)).toBeUndefined();
            expect(utils.convertSegmentedRouteToSingleSegmentRoute([])).toEqual([]);
        });
    });

    describe('getCoordinatesFromAllDirections', () => {
        it('concatenates the main and alternate direction coordinates', () => {
            expect(utils.getCoordinatesFromAllDirections(SINGLE_SEGMENT, buildAlternateDirection([[9, 9]]))).toEqual([
                [0, 0],
                [1, 1],
                [2, 2],
                [9, 9],
            ]);
        });

        it('flattens segmented coordinates on both directions', () => {
            expect(utils.getCoordinatesFromAllDirections(SEGMENTED, buildAlternateDirection([[[7, 7]], [[8, 8]]]))).toEqual([
                [0, 0],
                [1, 1],
                [5, 5],
                [6, 6],
                [7, 7],
                [8, 8],
            ]);
        });

        it('returns only the main direction when there is no alternate direction', () => {
            expect(utils.getCoordinatesFromAllDirections(SINGLE_SEGMENT, undefined)).toEqual(SINGLE_SEGMENT);
        });

        it('returns only the alternate direction when there is no main direction', () => {
            expect(utils.getCoordinatesFromAllDirections(undefined, buildAlternateDirection(SINGLE_SEGMENT))).toEqual(SINGLE_SEGMENT);
        });

        it('returns an empty list when there are no directions at all', () => {
            expect(utils.getCoordinatesFromAllDirections(undefined, undefined)).toEqual([]);
        });
    });

    describe('getDistanceSymbolCoordinates', () => {
        const WAYPOINTS: Coordinate[] = [
            [0, 0],
            [1, 0],
        ];

        /** Runs straight from the first waypoint to the second one, with most of its coordinates bunched up near the start. */
        const STRAIGHT_ROUTE: Coordinate[] = [
            [0, 0],
            [0.05, 0],
            [0.1, 0],
            [0.15, 0],
            [1, 0],
        ];

        /** Shares both waypoints with the straight route, but bulges north in between. */
        const BULGING_ROUTE: Coordinate[] = [
            [0, 0],
            [0.25, 0.2],
            [0.5, 0.3],
            [0.75, 0.2],
            [1, 0],
        ];

        it('anchors the symbol at the point of the route closest to the center when there is no alternate route', () => {
            const {northEast, southWest} = utils.getBounds(WAYPOINTS, STRAIGHT_ROUTE);
            const closestToCenter = utils.findClosestCoordinateOnLineFromCenter(utils.getBoundsCenter({northEast, southWest}), STRAIGHT_ROUTE);

            expect(utils.getDistanceSymbolCoordinates(WAYPOINTS, STRAIGHT_ROUTE, undefined)).toEqual({primary: closestToCenter, alternate: null});
        });

        it('anchors each symbol at its own share of its own route', () => {
            const {primary, alternate} = utils.getDistanceSymbolCoordinates(WAYPOINTS, STRAIGHT_ROUTE, BULGING_ROUTE);

            // A third of the way along the straight route. Four of its five coordinates sit in its first sixth, so an
            // anchor picked by the number of coordinates rather than by length would land far short of this.
            expect(primary?.at(0)).toBeCloseTo(0.33);
            expect(primary?.at(1)).toBe(0);

            // Two thirds of the way along the bulging route, so past its northernmost point and on its way back down.
            expect(alternate?.at(0)).toBeGreaterThan(0.5);
            expect(alternate?.at(1)).toBeGreaterThan(0);
            expect(alternate?.at(1)).toBeLessThan(0.3);
        });

        it('walks over the coordinates a route repeats', () => {
            const repeatedRoute: Coordinate[] = [
                [0, 0],
                [0, 0],
                [0.5, 0],
                [1, 0],
                [1, 0],
            ];

            expect(utils.getDistanceSymbolCoordinates(WAYPOINTS, repeatedRoute, BULGING_ROUTE).primary?.at(0)).toBeCloseTo(0.33);
        });

        it('anchors the symbol at the start of a route that has no length at all', () => {
            const zeroLengthRoute: Coordinate[] = [
                [0.5, 0],
                [0.5, 0],
                [0.5, 0],
            ];

            expect(utils.getDistanceSymbolCoordinates(WAYPOINTS, zeroLengthRoute, BULGING_ROUTE).primary).toEqual([0.5, 0]);
        });

        it('anchors the symbols away from the waypoints the two routes share', () => {
            const {primary, alternate} = utils.getDistanceSymbolCoordinates(WAYPOINTS, STRAIGHT_ROUTE, BULGING_ROUTE);

            for (const waypoint of WAYPOINTS) {
                expect(primary).not.toEqual(waypoint);
                expect(alternate).not.toEqual(waypoint);
            }
        });

        it('keeps the symbols apart even when both routes are identical', () => {
            const {primary, alternate} = utils.getDistanceSymbolCoordinates(WAYPOINTS, STRAIGHT_ROUTE, [...STRAIGHT_ROUTE]);

            expect(primary?.at(0)).toBeCloseTo(0.33);
            expect(alternate?.at(0)).toBeCloseTo(0.66);
        });

        it('returns no coordinates when there is nothing to anchor a symbol to', () => {
            expect(utils.getDistanceSymbolCoordinates([], STRAIGHT_ROUTE, BULGING_ROUTE)).toEqual({primary: null, alternate: null});
            expect(utils.getDistanceSymbolCoordinates(WAYPOINTS, undefined, BULGING_ROUTE)).toEqual({primary: null, alternate: null});
            expect(utils.getDistanceSymbolCoordinates(WAYPOINTS, [[0, 0]], BULGING_ROUTE)).toEqual({primary: null, alternate: null});
        });

        it('ignores an alternate route that is too short to be drawn', () => {
            expect(utils.getDistanceSymbolCoordinates(WAYPOINTS, STRAIGHT_ROUTE, [[0, 0]]).alternate).toBeNull();
        });
    });

    describe('getSinglePointCoordinate', () => {
        it('returns the coordinate a trip with a single point sits on', () => {
            expect(utils.getSinglePointCoordinate([[1, 2]], [[1, 2]])).toEqual([1, 2]);
        });

        it('returns nothing for coordinates that span an area', () => {
            expect(utils.getSinglePointCoordinate([[1, 2]], SINGLE_SEGMENT)).toBeUndefined();
        });

        it('returns nothing when there are no coordinates', () => {
            expect(utils.getSinglePointCoordinate([], undefined)).toBeUndefined();
        });
    });

    describe('getBoundsCenter', () => {
        it('returns the center of the bounds as longitude and latitude', () => {
            // Given bounds spanning longitudes 10 to 30 and latitudes 40 to 50
            // When resolving their center
            const center = utils.getBoundsCenter({southWest: [10, 40], northEast: [30, 50]});

            // Then the center keeps each axis in its own field
            expect(center).toEqual({lng: 20, lat: 45});
        });
    });

    describe('findClosestCoordinateOnLineFromCenter', () => {
        it('measures the distance to the route with longitude and latitude in their own roles', () => {
            // Given a center at the equator near longitude 90, with a route that passes 0.1° east of it and then 0.2° north
            // of it. Reading the [longitude, latitude] coordinates as [latitude, longitude] would scale the north/south gap
            // by cos(90°) and make the farther northern part of the route look the closest.
            const route: Coordinate[] = [
                [89.6, -1],
                [89.6, 0.2],
                [88, 0.2],
            ];

            // When looking for the point of the route closest to the center
            const closest = utils.findClosestCoordinateOnLineFromCenter({lng: 89.5, lat: 0}, route);

            // Then it is the point 0.1° east of the center, not the one 0.2° north of it
            expect(closest?.at(0)).toBeCloseTo(89.6);
            expect(closest?.at(1)).toBeCloseTo(0);
        });
    });

    describe('getCenterTargets', () => {
        const START: WayPoint = {id: 'start', coordinate: [10, 10], markerType: 'START_WAYPOINT'};
        const STOP: WayPoint = {id: 'stop', coordinate: [20, 20], markerType: 'STOP_WAYPOINT'};

        it('offers the route when there is no real user location to alternate with', () => {
            // Given a route with two waypoints and no user location (e.g. location access was never granted)
            // When resolving what the center button can target
            const targets = utils.getCenterTargets([START, STOP], undefined, undefined);

            // Then the route is a target, so the first press frames it instead of zooming into the initialState fallback
            expect(targets.hasWaypointsTarget).toBe(true);
            expect(targets.singleWaypointCoordinate).toBeUndefined();
        });

        it('offers a lone waypoint when there is no real user location', () => {
            // Given a single waypoint and no user location
            // When resolving what the center button can target
            const targets = utils.getCenterTargets([START], undefined, undefined);

            // Then the lone waypoint is the target the button centers on
            expect(targets.hasWaypointsTarget).toBe(true);
            expect(targets.singleWaypointCoordinate).toEqual(START.coordinate);
        });

        it('does not offer a lone waypoint that sits on the user location', () => {
            // Given a single waypoint placed exactly at the user's location
            // When resolving what the center button can target
            const targets = utils.getCenterTargets([START], undefined, START.coordinate);

            // Then there is nothing to alternate with, as both targets are the same spot
            expect(targets.hasWaypointsTarget).toBe(false);
        });

        it('offers a lone waypoint that is north of the user location near longitude -90', () => {
            // Given a single waypoint ~1 km north of the user near longitude -90 (Memphis), where reading the
            // [longitude, latitude] coordinates as [latitude, longitude] shrinks north/south distances to almost nothing
            const waypoint: WayPoint = {id: 'start', coordinate: [-90.05, 35.159], markerType: 'START_WAYPOINT'};

            // When resolving what the center button can target
            const targets = utils.getCenterTargets([waypoint], undefined, [-90.05, 35.15]);

            // Then the waypoint is still a separate target the button can alternate with
            expect(targets.hasWaypointsTarget).toBe(true);
            expect(targets.singleWaypointCoordinate).toEqual(waypoint.coordinate);
        });
    });

    describe('areSameCoordinate', () => {
        it('treats points ~10 m apart as the same coordinate', () => {
            // Given two [longitude, latitude] points ~10 m apart north/south
            // When comparing them
            // Then they are the same coordinate, as they are within the 20 m threshold
            expect(utils.areSameCoordinate([-90.05, 35.15], [-90.05, 35.15009])).toBe(true);
        });

        it('treats points ~300 m apart north/south as different coordinates', () => {
            // Given two [longitude, latitude] points ~300 m apart north/south near longitude -87.6 (Chicago)
            // When comparing them
            // Then they are different coordinates, as the order is not mistaken for [latitude, longitude]
            expect(utils.areSameCoordinate([-87.63, 41.88], [-87.63, 41.8827])).toBe(false);
        });
    });

    describe('isSingleSegmentRoute', () => {
        it('detects single segment, segmented and empty routes', () => {
            expect(utils.isSingleSegmentRoute(SINGLE_SEGMENT)).toBe(true);
            expect(utils.isSingleSegmentRoute(SEGMENTED)).toBe(false);
            expect(utils.isSingleSegmentRoute([])).toBe(true);
        });
    });

    describe('getMapboxLanguage', () => {
        it('passes locales that are already valid Mapbox codes through unchanged', () => {
            // Given app locales whose values are already BCP-47 codes that Mapbox can localize labels to

            // When each locale is mapped to the language the map labels are rendered in
            const languages = [utils.getMapboxLanguage('en'), utils.getMapboxLanguage('es'), utils.getMapboxLanguage('fr'), utils.getMapboxLanguage('de')];

            // Then every locale is passed through as is, because Mapbox already understands it and the labels should match the app's language
            expect(languages).toEqual(['en', 'es', 'fr', 'de']);
        });

        it('remaps locales whose value differs from the Mapbox code', () => {
            // Given app locales whose values are not the codes Mapbox expects, so Mapbox would not recognize them as is

            // When each locale is mapped to the language the map labels are rendered in
            const languages = [utils.getMapboxLanguage('pt-BR'), utils.getMapboxLanguage('zh-hans')];

            // Then each locale is converted to the matching Mapbox code, so the labels are still shown in the user's language
            expect(languages).toEqual(['pt', 'zh-Hans']);
        });

        it('returns undefined when there is no locale', () => {
            // Given a user whose preferred locale has not loaded yet

            // When the missing locale is mapped to a Mapbox language
            const language = utils.getMapboxLanguage(undefined);

            // Then no language is returned, so the map keeps its default labels instead of being set to an invalid language
            expect(language).toBeUndefined();
        });
    });

    describe('getNativeMapboxLanguage', () => {
        it('returns the Mapbox language for locales the native SDKs can localize labels to', () => {
            // Given app locales whose Mapbox language is one of the Mapbox Streets languages the native SDKs support

            // When each locale is mapped to the language the native map labels are rendered in
            const languages = [utils.getNativeMapboxLanguage('en'), utils.getNativeMapboxLanguage('ja'), utils.getNativeMapboxLanguage('pt-BR'), utils.getNativeMapboxLanguage('zh-hans')];

            // Then the same language as on web is returned, so the native labels match the app's language
            expect(languages).toEqual(['en', 'ja', 'pt', 'zh-Hans']);
        });

        it('returns undefined for locales the native SDKs reject', () => {
            // Given app locales whose language the native Mapbox SDKs don't support, which makes iOS throw and Android log a warning

            // When each locale is mapped to the language the native map labels are rendered in
            const languages = [utils.getNativeMapboxLanguage('nl'), utils.getNativeMapboxLanguage('pl'), utils.getNativeMapboxLanguage('el')];

            // Then no language is returned, so the native map keeps its default labels without raising an error
            expect(languages).toEqual([undefined, undefined, undefined]);
        });
    });

    describe('getMapboxWorldview', () => {
        it('passes country codes Mapbox defines a worldview for through unchanged', () => {
            // Given countries that Mapbox draws disputed borders for from their own point of view

            // When each country is mapped to the worldview the map's borders are drawn from
            const worldviews = [utils.getMapboxWorldview('US'), utils.getMapboxWorldview('CN'), utils.getMapboxWorldview('IN'), utils.getMapboxWorldview('JP')];

            // Then every country is passed through as is, so users see the borders as their own country recognizes them
            expect(worldviews).toEqual(['US', 'CN', 'IN', 'JP']);
        });

        it('passes countries without a dedicated worldview through so Mapbox falls back to the style default', () => {
            // Given countries that Mapbox has no dedicated worldview for

            // When each country is mapped to the worldview the map's borders are drawn from
            const worldviews = [utils.getMapboxWorldview('DE'), utils.getMapboxWorldview('AU')];

            // Then the countries are still passed through, because Mapbox falls back to the style's default worldview and a hardcoded list of supported countries would go stale
            expect(worldviews).toEqual(['DE', 'AU']);
        });

        it('drops anything that is not a country code, which Mapbox would reject', () => {
            // Given values that are not two-letter uppercase country codes, such as a missing country or a three-letter code

            // When each value is mapped to the worldview the map's borders are drawn from
            const worldviews = [utils.getMapboxWorldview(undefined), utils.getMapboxWorldview(''), utils.getMapboxWorldview('USA'), utils.getMapboxWorldview('us')];

            // Then no worldview is returned for any of them, because Mapbox raises an error for codes it can't parse
            expect(worldviews).toEqual([undefined, undefined, undefined, undefined]);
        });
    });
});
