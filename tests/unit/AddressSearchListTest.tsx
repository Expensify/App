import {act, fireEvent, render, screen} from '@testing-library/react-native';

import Text from '@components/Text';

import type {Place} from 'react-native-google-places-autocomplete';

import React from 'react';
import {TextInput} from 'react-native';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';

/**
 * Guards the address-search list behavior that AddressSearch depends on. All of it comes from
 * `react-native-google-places-autocomplete` and is held in place by the patches in
 * `patches/react-native-google-places-autocomplete`, because the 2.6.x rewrite changed it:
 *
 * - the loader shows only while searching AND there are no previous results
 * - previous results stay visible (no loader) while the next search is in flight
 * - the "no results" empty state shows when a search comes back empty
 * - the list reacts to `predefinedPlaces` (recent destinations) changing after mount
 *
 * These are silent regressions. They produce no crash, type error, or console warning, so
 * they are only caught by asserting on what the list actually renders.
 */

type FakeRequest = {
    readyState: number;
    status: number;
    responseText: string;
    onreadystatechange: (() => void) | null;
};

const inFlight: FakeRequest[] = [];

class MockXMLHttpRequest {
    readyState = 0;

    status = 200;

    responseText = '';

    onreadystatechange: (() => void) | null = null;

    ontimeout: (() => void) | null = null;

    withCredentials = false;

    timeout = 0;

    open() {}

    setRequestHeader() {}

    abort() {}

    send() {
        inFlight.push(this);
    }
}

function buildPredictions(descriptions: string[]) {
    return JSON.stringify({
        predictions: descriptions.map((description, index) => ({
            // eslint-disable-next-line @typescript-eslint/naming-convention -- mirrors the Google Places API response shape
            place_id: `place-${index}`,
            description,
            // eslint-disable-next-line @typescript-eslint/naming-convention -- mirrors the Google Places API response shape
            structured_formatting: {main_text: description, secondary_text: 'secondary'},
        })),
    });
}

function latestRequest() {
    const request = inFlight.at(-1);
    if (!request) {
        throw new Error('expected a search request to be in flight');
    }
    return request;
}

/** Put the in-flight request into its loading phase (readyState < 4). */
function beginLoading() {
    const request = latestRequest();
    act(() => {
        request.readyState = 1;
        request.onreadystatechange?.();
    });
}

/** Complete the in-flight request with the given results. */
function respondWith(descriptions: string[]) {
    const request = latestRequest();
    act(() => {
        request.readyState = 4;
        request.status = 200;
        request.responseText = buildPredictions(descriptions);
        request.onreadystatechange?.();
    });
}

function typeAddress(text: string) {
    fireEvent.changeText(screen.UNSAFE_getByType(TextInput), text);
    // The library debounces before firing the request.
    act(() => {
        jest.advanceTimersByTime(100);
    });
}

function buildTree(predefinedPlaces: Place[] = []) {
    return (
        <GooglePlacesAutocomplete
            listViewDisplayed
            placeholder=""
            minLength={0}
            predefinedPlaces={predefinedPlaces}
            query={{key: 'test-key', language: 'en'}}
            requestUrl={{useOnPlatform: 'all', url: 'https://example.com'}}
            listLoaderComponent={<Text>LOADER</Text>}
            listEmptyComponent={<Text>NO_RESULTS</Text>}
            renderRow={(data) => <Text>{data.description}</Text>}
            onPress={() => {}}
        />
    );
}

function place(description: string): Place {
    return {description, geometry: {location: {lat: 0, lng: 0, latitude: 0, longitude: 0}}};
}

describe('AddressSearch list', () => {
    let originalXMLHttpRequest: typeof XMLHttpRequest;

    beforeEach(() => {
        jest.useFakeTimers();
        inFlight.length = 0;
        originalXMLHttpRequest = global.XMLHttpRequest;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- a minimal stub is enough to drive the request lifecycle
        global.XMLHttpRequest = MockXMLHttpRequest as unknown as typeof XMLHttpRequest;
    });

    afterEach(() => {
        global.XMLHttpRequest = originalXMLHttpRequest;
        jest.useRealTimers();
    });

    describe('loading state', () => {
        it('shows the loader while searching when there are no previous results', () => {
            render(buildTree());

            typeAddress('a');
            beginLoading();

            expect(screen.getByText('LOADER')).toBeTruthy();
        });

        it('keeps previous results visible and hides the loader while the next search runs', () => {
            render(buildTree());

            typeAddress('a');
            beginLoading();
            respondWith(['Alpha Street', 'Apple Road']);
            expect(screen.getByText('Alpha Street')).toBeTruthy();

            typeAddress('ap');
            beginLoading();

            expect(screen.getByText('Alpha Street')).toBeTruthy();
            expect(screen.queryByText('LOADER')).toBeNull();

            respondWith(['Apple Road']);
            expect(screen.getByText('Apple Road')).toBeTruthy();
            expect(screen.queryByText('Alpha Street')).toBeNull();
        });

        it('shows the empty state when a search returns no results', () => {
            render(buildTree());

            typeAddress('zzzz');
            beginLoading();
            respondWith([]);

            expect(screen.queryByText('LOADER')).toBeNull();
            expect(screen.getByText('NO_RESULTS')).toBeTruthy();
        });
    });

    describe('predefined places (recent destinations)', () => {
        it('re-renders the list when the predefinedPlaces prop changes after mount', () => {
            const {rerender} = render(buildTree([place('Recent A')]));
            expect(screen.getByText('Recent A')).toBeTruthy();

            rerender(buildTree([place('Recent B')]));

            expect(screen.getByText('Recent B')).toBeTruthy();
            expect(screen.queryByText('Recent A')).toBeNull();
        });

        it('clears stale search results when the predefinedPlaces prop changes', () => {
            const {rerender} = render(buildTree([place('Recent A')]));

            typeAddress('x');
            respondWith(['Result 1']);
            expect(screen.getByText('Result 1')).toBeTruthy();

            rerender(buildTree([place('Recent B')]));

            expect(screen.queryByText('Result 1')).toBeNull();
        });
    });
});
