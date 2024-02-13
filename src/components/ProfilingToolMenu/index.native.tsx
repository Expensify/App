import React, {useCallback, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import {startProfiling, stopProfiling} from 'react-native-release-profiler';
import Switch from '@components/Switch';
import TestToolRow from '@components/TestToolRow';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import toggleProfileTool from '@libs/actions/ProfilingTool';
import ONYXKEYS from '@src/ONYXKEYS';

type ProfilingToolMenuOnyxProps = {
    isProfilingInProgress: OnyxEntry<boolean>;
};

type ProfilingToolMenuProps = ProfilingToolMenuOnyxProps;

function ProfilingToolMenu({isProfilingInProgress = false}: ProfilingToolMenuProps) {
    const styles = useThemeStyles();
    const [pathIOS, setPathIOS] = useState('');

    // eslint-disable-next-line @lwc/lwc/no-async-await
    const stop = useCallback(async () => {
        const path = await stopProfiling(true);
        if (path) {
            setPathIOS(path);
        }
        return path;
    }, []);

    const onToggleProfiling = useCallback(() => {
        const shouldProfiling = !isProfilingInProgress;
        if (shouldProfiling) {
            startProfiling();
        } else {
            stop();
        }
        toggleProfileTool();
        return () => {
            stop();
        };
    }, [isProfilingInProgress, stop]);

    return (
        <>
            <Text
                style={[styles.textLabelSupporting, styles.mb4]}
                numberOfLines={1}
            >
                Release options
            </Text>

            <TestToolRow title="Use Profiling">
                <Switch
                    accessibilityLabel="Use Profiling"
                    isOn={!!isProfilingInProgress}
                    onToggle={onToggleProfiling}
                />
            </TestToolRow>
            <Text style={[styles.textLabelSupporting, styles.mb4]}>{!!pathIOS && `path: ${pathIOS}`}</Text>
        </>
    );
}

ProfilingToolMenu.displayName = 'ProfilingToolMenu';

export default withOnyx<ProfilingToolMenuProps, ProfilingToolMenuOnyxProps>({
    isProfilingInProgress: {
        key: ONYXKEYS.APP_PROFILING_IN_PROGRESS,
    },
})(ProfilingToolMenu);
