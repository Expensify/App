import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import useNetwork from '@hooks/useNetwork';
import * as UserLocation from '@libs/actions/UserLocation';
import getCurrentPosition from '@libs/getCurrentPosition';
import type {GeolocationErrorCallback} from '@libs/getCurrentPosition/getCurrentPosition.types';
import {GeolocationErrorCode} from '@libs/getCurrentPosition/getCurrentPosition.types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {WayPoint} from './MapViewTypes';

function useCurrentPosition({
    initialPosition,
    waypoints,
    flyTo,
}: {
    initialPosition?: readonly [number, number];
    waypoints?: WayPoint[];
    flyTo: (coordinates: [number, number], zoomLevel?: number, animationDuration?: number) => void;
}) {
    const {isOffline} = useNetwork();

    const [cachedUserLocation] = useOnyx(ONYXKEYS.USER_LOCATION);

    const initialLocation = useMemo(() => initialPosition && {longitude: initialPosition[0], latitude: initialPosition[1]}, [initialPosition]);
    const [currentPosition, setCurrentPosition] = useState(cachedUserLocation ?? initialLocation);
    const [hasUserInteractedWithMap, setHasUserInteractedWithMap] = useState(false);
    const shouldInitializeCurrentPosition = useRef(true);

    // Determines if map can be panned to user's detected
    // location without bothering the user. It will return
    // false if user has already started dragging the map or
    // if there are one or more waypoints present.
    const shouldPanMapToCurrentPosition = useMemo(() => !hasUserInteractedWithMap && (!waypoints || waypoints.length === 0), [hasUserInteractedWithMap, waypoints]);

    const setCurrentPositionToInitialState: GeolocationErrorCallback = useCallback(
        (error) => {
            if (error?.code !== GeolocationErrorCode.PERMISSION_DENIED || !initialLocation) {
                return;
            }
            UserLocation.clearUserLocation();
            setCurrentPosition(initialLocation);
        },
        [initialLocation],
    );

    useFocusEffect(
        useCallback(() => {
            if (isOffline) {
                return;
            }

            if (!shouldInitializeCurrentPosition.current) {
                return;
            }

            shouldInitializeCurrentPosition.current = false;

            if (!shouldPanMapToCurrentPosition) {
                setCurrentPositionToInitialState();
                return;
            }

            getCurrentPosition((params) => {
                const currentCoords = {longitude: params.coords.longitude, latitude: params.coords.latitude};
                setCurrentPosition(currentCoords);
                UserLocation.setUserLocation(currentCoords);
            }, setCurrentPositionToInitialState);
        }, [isOffline, shouldPanMapToCurrentPosition, setCurrentPositionToInitialState]),
    );

    useEffect(() => {
        if (!currentPosition) {
            return;
        }

        if (!shouldPanMapToCurrentPosition) {
            return;
        }

        flyTo([currentPosition.longitude, currentPosition.latitude]);
    }, [currentPosition, flyTo, shouldPanMapToCurrentPosition]);

    return {currentPosition, setHasUserInteractedWithMap};
}

export default useCurrentPosition;
