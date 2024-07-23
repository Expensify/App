import React, {useCallback, useEffect, useState} from 'react';
import DeviceInfo from 'react-native-device-info';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import {startProfiling, stopProfiling} from 'react-native-release-profiler';
import Button from '@components/Button';
import Switch from '@components/Switch';
import TestToolRow from '@components/TestToolRow';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import toggleProfileTool from '@libs/actions/ProfilingTool';
import getPlatform from '@libs/getPlatform';
import Log from '@libs/Log';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import pkg from '../../../package.json';
import RNFS from './RNFS';
import Share from './Share';

type BaseProfilingToolMenuOnyxProps = {
    isProfilingInProgress: OnyxEntry<boolean>;
};

type BaseProfilingToolMenuProps = {
    /** Path used to save the file */
    pathToBeUsed: string;
    /** Path used to display location of saved file */
    displayPath: string;
    /** Whether to show the share button */
    showShareButton?: boolean;
} & BaseProfilingToolMenuOnyxProps;

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) {
        return '0 Bytes';
    }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

// WARNING: When changing this name make sure that the "scripts/symbolicate-profile.ts" script is still working!
const newFileName = `Profile_trace_for_${pkg.version}.cpuprofile`;

function BaseProfilingToolMenu({isProfilingInProgress = false, showShareButton = false, pathToBeUsed, displayPath}: BaseProfilingToolMenuProps) {
    const styles = useThemeStyles();
    const [filePath, setFilePath] = useState('');
    const [sharePath, setSharePath] = useState('');
    const [totalMemory, setTotalMemory] = useState(0);
    const [usedMemory, setUsedMemory] = useState(0);
    const {translate} = useLocalize();

    // eslint-disable-next-line @lwc/lwc/no-async-await
    const stop = useCallback(async () => {
        const path = await stopProfiling(getPlatform() === CONST.PLATFORM.IOS || getPlatform() === CONST.PLATFORM.WEB, newFileName);
        setFilePath(path);

        const amountOfTotalMemory = await DeviceInfo.getTotalMemory();
        const amountOfUsedMemory = await DeviceInfo.getUsedMemory();
        setTotalMemory(amountOfTotalMemory);
        setUsedMemory(amountOfUsedMemory);
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

    const getAppInfo = useCallback(
        () =>
            JSON.stringify({
                appVersion: pkg.version,
                environment: CONFIG.ENVIRONMENT,
                platform: getPlatform(),
                totalMemory: formatBytes(totalMemory, 2),
                usedMemory: formatBytes(usedMemory, 2),
            }),
        [totalMemory, usedMemory],
    );

    useEffect(() => {
        if (!filePath) {
            return;
        }

        // eslint-disable-next-line @lwc/lwc/no-async-await
        const rename = async () => {
            const newFilePath = `${pathToBeUsed}/${newFileName}`;

            try {
                const fileExists = await RNFS.exists(newFilePath);
                if (fileExists) {
                    await RNFS.unlink(newFilePath);
                    Log.hmmm('[ProfilingToolMenu] existing file deleted successfully');
                }
            } catch (error) {
                const typedError = error as Error;
                Log.hmmm('[ProfilingToolMenu] error checking/deleting existing file: ', typedError.message);
            }

            // Copy the file to a new location with the desired filename
            await RNFS.copyFile(filePath, newFilePath)
                .then(() => {
                    Log.hmmm('[ProfilingToolMenu] file copied successfully');
                })
                .catch((error: Record<string, unknown>) => {
                    Log.hmmm('[ProfilingToolMenu] error copying file: ', error);
                });

            setSharePath(newFilePath);
        };

        rename();
    }, [filePath, pathToBeUsed]);

    const onDownloadProfiling = useCallback(() => {
        // eslint-disable-next-line @lwc/lwc/no-async-await
        const shareFiles = async () => {
            try {
                // Define new filename and path for the app info file
                const infoFileName = `App_Info_${pkg.version}.json`;
                const infoFilePath = `${RNFS.DocumentDirectoryPath}/${infoFileName}`;
                const actualInfoFile = `file://${infoFilePath}`;

                await RNFS.writeFile(infoFilePath, getAppInfo(), 'utf8');

                const shareOptions = {
                    urls: [`file://${sharePath}`, actualInfoFile],
                };

                await Share.open(shareOptions);
            } catch (error) {
                console.error('Error renaming and sharing file:', error);
            }
        };
        shareFiles();
    }, [getAppInfo, sharePath]);

    return (
        <>
            <TestToolRow title={translate('initialSettingsPage.troubleshoot.useProfiling')}>
                <Switch
                    accessibilityLabel={translate('initialSettingsPage.troubleshoot.useProfiling')}
                    isOn={!!isProfilingInProgress}
                    onToggle={onToggleProfiling}
                />
            </TestToolRow>
            {!!filePath && showShareButton && (
                <>
                    <Text style={[styles.textLabelSupporting, styles.mb4]}>{`path: ${displayPath}/${newFileName}`}</Text>
                    <TestToolRow title={translate('initialSettingsPage.troubleshoot.profileTrace')}>
                        <Button
                            small
                            text={translate('common.share')}
                            onPress={onDownloadProfiling}
                        />
                    </TestToolRow>
                </>
            )}
        </>
    );
}

BaseProfilingToolMenu.displayName = 'BaseProfilingToolMenu';

export default withOnyx<BaseProfilingToolMenuProps, BaseProfilingToolMenuOnyxProps>({
    isProfilingInProgress: {
        key: ONYXKEYS.APP_PROFILING_IN_PROGRESS,
    },
})(BaseProfilingToolMenu);
