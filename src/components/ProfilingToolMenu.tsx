import React, {useCallback, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import {startProfiling, stopProfiling} from 'react-native-release-profiler';
import useThemeStyles from '@hooks/useThemeStyles';
import toggleProfileToolsModal from '@libs/actions/ProfilingTool';
import ONYXKEYS from '@src/ONYXKEYS';
import Switch from './Switch';
import TestToolRow from './TestToolRow';
import Text from './Text';

type ProfilingToolMenuOnyxProps = {
    isAppProfiling: OnyxEntry<boolean>;
};

type ProfilingToolMenuProps = ProfilingToolMenuOnyxProps;

function ProfilingToolMenu({isAppProfiling = false}: ProfilingToolMenuProps) {
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
        const shouldProfiling = !isAppProfiling;
        if (shouldProfiling) {
            startProfiling();
        } else {
            stop();
        }
        toggleProfileToolsModal();
        return () => {
            stop();
        };
    }, [isAppProfiling, stop]);

    return (
        <>
            <Text
                style={[styles.textLabelSupporting, styles.mb4]}
                numberOfLines={1}
            >
                Release options
            </Text>

            <TestToolRow title="Use release Profiling">
                <Switch
                    accessibilityLabel="Use release Profiling"
                    isOn={!!isAppProfiling}
                    onToggle={onToggleProfiling}
                />
            </TestToolRow>
            <Text style={[styles.textLabelSupporting, styles.mb4]}>{!!pathIOS && `path: ${pathIOS}`}</Text>
        </>
    );
}

ProfilingToolMenu.displayName = 'ProfilingToolMenu';

export default withOnyx<ProfilingToolMenuProps, ProfilingToolMenuOnyxProps>({
    isAppProfiling: {
        key: ONYXKEYS.IS_APP_PROFILING,
    },
})(ProfilingToolMenu);
