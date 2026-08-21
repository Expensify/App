import useTheme from '@hooks/useTheme';

import logAppStateOnLongLoading from '@libs/AppState';
import type {ExtraLoadingContext} from '@libs/AppState';

import CONST from '@src/CONST';

import type {ActivityIndicatorProps as RNActivityIndicatorProps} from 'react-native';

import React, {useEffect} from 'react';
// eslint-disable-next-line no-restricted-imports
import {ActivityIndicator as RNActivityIndicator} from 'react-native';

type ActivityIndicatorProps = RNActivityIndicatorProps & {
    /** The ID of the test to be used for testing */
    testID?: string;

    /** Timeout for the activity indicator after which we fire a log about abnormally long loading */
    timeout?: number;

    /** Extra loading context to be passed to the logAppStateOnLongLoading function */
    extraLoadingContext?: ExtraLoadingContext;
};

function ActivityIndicator({timeout = CONST.TIMING.ACTIVITY_INDICATOR_TIMEOUT, extraLoadingContext, ...rest}: ActivityIndicatorProps) {
    const theme = useTheme();

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            logAppStateOnLongLoading(extraLoadingContext, timeout);
        }, timeout);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [extraLoadingContext, timeout]);

    return (
        <RNActivityIndicator
            color={theme.spinner}
            {...rest}
        />
    );
}

export default ActivityIndicator;
