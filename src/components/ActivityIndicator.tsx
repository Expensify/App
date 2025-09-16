import {useEffect} from 'react';
import type {ActivityIndicatorProps as RNActivityIndicatorProps} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import {ActivityIndicator as RNActivityIndicator} from 'react-native';
import useTheme from '@hooks/useTheme';
import Log from '@libs/Log';
import CONST from '@src/CONST';

type ActivityIndicatorProps = RNActivityIndicatorProps & {
    testID?: string;
    timeoutMs?: number;
};

function ActivityIndicator({timeoutMs = CONST.TIMING.ACTIVITY_INDICATOR_TIMEOUT, ...rest}: ActivityIndicatorProps) {
    const theme = useTheme();
    const timeout = timeoutMs ?? (CONST.TIMING.ACTIVITY_INDICATOR_TIMEOUT as number);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            Log.warn('ActivityIndicator has been shown for longer than expected', {timeoutMs: timeout, context: {/** TODO: Add context */}});
        }, timeout);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [timeout]);

    return (
        <RNActivityIndicator
            color={theme.spinner}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

ActivityIndicator.displayName = 'ActivityIndicator';

export default ActivityIndicator;
