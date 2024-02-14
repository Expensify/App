import React, {useCallback, useState} from 'react';
import RNFS from 'react-native-fs';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import {startProfiling, stopProfiling} from 'react-native-release-profiler';
import Share from 'react-native-share';
import Button from '@components/Button';
import Switch from '@components/Switch';
import TestToolRow from '@components/TestToolRow';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import toggleProfileTool from '@libs/actions/ProfilingTool';
import getPlatform from '@libs/getPlatform';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import pkg from '../../../package.json';

type ProfilingToolMenuOnyxProps = {
    isProfilingInProgress: OnyxEntry<boolean>;
};

type ProfilingToolMenuProps = ProfilingToolMenuOnyxProps;

function ProfilingToolMenu({isProfilingInProgress = false}: ProfilingToolMenuProps) {
    const styles = useThemeStyles();
    const [pathIOS, setPathIOS] = useState('');

    // eslint-disable-next-line @lwc/lwc/no-async-await
    const stop = useCallback(async () => {
        const path = await stopProfiling(getPlatform() === CONST.PLATFORM.IOS);
        setPathIOS(path);
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

    // eslint-disable-next-line @lwc/lwc/no-async-await
    const onDownloadProfiling = useCallback(async () => {
        const newFileName = `Profile_trace_for_${pkg.version}.json`;
        const newFilePath = `${RNFS.DocumentDirectoryPath}/${newFileName}`;

        // Copy the file to a new location with the desired filename
        await RNFS.copyFile(pathIOS, newFilePath)
            .then(() => {
                Log.hmmm('[ProfilingToolMenu] file copied successfully');
            })
            .catch((error) => {
                Log.hmmm('[ProfilingToolMenu] error copying file: ', error);
            });

        const actualPath = `file://${newFilePath}`;

        await Share.open({
            url: actualPath,
            title: `Profile_trace_for_${pkg.version}`,
            type: 'application/json',
        });
    }, [pathIOS]);

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
            {!!pathIOS && (
                <TestToolRow title="Profile trace">
                    <Button
                        small
                        text="Share"
                        onPress={onDownloadProfiling}
                    />
                </TestToolRow>
            )}
        </>
    );
}

ProfilingToolMenu.displayName = 'ProfilingToolMenu';

export default withOnyx<ProfilingToolMenuProps, ProfilingToolMenuOnyxProps>({
    isProfilingInProgress: {
        key: ONYXKEYS.APP_PROFILING_IN_PROGRESS,
    },
})(ProfilingToolMenu);
