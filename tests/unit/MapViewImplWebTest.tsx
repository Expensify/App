import type * as ReactNavigation from '@react-navigation/native';
import {render} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MapViewImpl from '@components/MapView/MapViewImpl.web';
import type {MapViewProps} from '@components/MapView/MapViewTypes';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Capture the props react-map-gl's <Map> is rendered with so we can assert how the
// distance map configures it. The mock renders nothing (no children) so we don't have to
// stand up the marker/ImageSVG/Direction subtree just to read the <Map> props.
let capturedMapProps: Record<string, unknown> | undefined;

jest.mock('react-map-gl', () => ({
    __esModule: true,
    default: (props: Record<string, unknown>) => {
        capturedMapProps = props;
        return null;
    },
    Marker: () => null,
}));

// mapbox-gl pulls in WebGL/canvas which jsdom can't provide; the component only forwards it as a prop.
jest.mock('mapbox-gl', () => ({}));

// The component imports raw .css, which the project's jest config has no transform for; stub both.
jest.mock('mapbox-gl/dist/mapbox-gl.css', () => ({}));
jest.mock('@components/MapView/mapbox.css', () => ({}));

// The component reads the user's position from a navigation focus effect; stub both out so the
// test doesn't depend on a NavigationContainer or the geolocation API.
jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');
    return {
        ...actualNavigation,
        useFocusEffect: jest.fn(),
    };
});
jest.mock('@src/libs/getCurrentPosition', () => jest.fn());

// Direction imports @rnmapbox/maps (native), which throws at import time under jsdom.
jest.mock('@components/MapView/Direction', () => ({__esModule: true, default: () => null}));

const renderMap = (props: Partial<MapViewProps> = {}) =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <MapViewImpl
                accessToken="pk.test-access-token"
                style={{height: 100, width: 100}}
                {...props}
            />
        </ComposeProviders>,
    );

describe('MapViewImpl.web', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(() => {
        capturedMapProps = undefined;
        // The test env reports online by default, so the map (not the offline placeholder) renders.
        return Onyx.set(ONYXKEYS.USER_LOCATION, {longitude: -122.4194, latitude: 37.7749});
    });

    afterEach(() => {
        return Onyx.clear();
    });

    describe('fog', () => {
        it('disables fog on the map so the marker fog-opacity teardown crash cannot occur', async () => {
            renderMap();
            await waitForBatchedUpdatesWithAct();

            // fog must be explicitly null (not undefined): react-map-gl only calls map.setFog when the
            // prop differs from its previous value, and only null clears the style's built-in fog.
            if (!capturedMapProps) {
                throw new Error('Expected react-map-gl <Map> to be rendered');
            }
            expect('fog' in capturedMapProps).toBe(true);
            expect(capturedMapProps.fog).toBeNull();
        });
    });
});
