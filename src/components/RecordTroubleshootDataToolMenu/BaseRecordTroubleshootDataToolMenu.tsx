import type JSZip from 'jszip';
import type {MutableRefObject} from 'react';
import React, {useCallback, useEffect, useState} from 'react';
import {Alert} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {useOnyx} from 'react-native-onyx';
import {startProfiling, stopProfiling} from 'react-native-release-profiler';
import Button from '@components/Button';
import Switch from '@components/Switch';
import TestToolRow from '@components/TestToolRow';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Console from '@libs/actions/Console';
import toggleProfileTool from '@libs/actions/ProfilingTool';
import * as Troubleshoot from '@libs/actions/Troubleshoot';
import {parseStringifiedMessages} from '@libs/Console';
import getPlatform from '@libs/getPlatform';
import Log from '@libs/Log';
import {Memoize} from '@libs/memoize';
import Performance from '@libs/Performance';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Log as OnyxLog} from '@src/types/onyx';
import pkg from '../../../package.json';
import RNFS from './RNFS';
import Share from './Share';

type File = {
    path: string;
    newFileName: string;
    size: number;
};

type BaseRecordTroubleshootDataToolMenuProps = {
    /** Locally created file */
    file?: File;
    /** Action to run when disabling the switch */
    onDisableLogging: (logs: OnyxLog[]) => void;
    /** Action to run when enabling logging */
    onEnableLogging?: () => void;
    /** Path used to display location of saved file */
    displayPath?: string;
    /** Path used to save the file */
    pathToBeUsed: string;
    /** Path used to display location of saved file */
    displayPath2: string;
    /** Whether to show the share button */
    showShareButton?: boolean;
    /** Zip ref */
    zipRef: MutableRefObject<InstanceType<typeof JSZip>>;
    /** A method to download the zip archive */
    onDownloadZip: () => void;
};

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) {
        return '0 Bytes';
    }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes.at(i)}`;
}

// WARNING: When changing this name make sure that the "scripts/symbolicate-profile.ts" script is still working!
const newFileName = `Profile_trace_for_${pkg.version}.cpuprofile`;

function BaseRecordTroubleshootDataToolMenu({
    file,
    onDisableLogging,
    onEnableLogging,
    displayPath,
    showShareButton = false,
    pathToBeUsed,
    displayPath2,
    zipRef,
    onDownloadZip,
}: BaseRecordTroubleshootDataToolMenuProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [shouldRecordTroubleshootData] = useOnyx(ONYXKEYS.SHOULD_RECORD_TROUBLESHOOT_DATA, {canBeMissing: true});
    const [capturedLogs] = useOnyx(ONYXKEYS.LOGS, {canBeMissing: true});
    const [isProfilingInProgress] = useOnyx(ONYXKEYS.APP_PROFILING_IN_PROGRESS, {canBeMissing: true});
    const [filePath, setFilePath] = useState('');
    const [sharePath, setSharePath] = useState('');
    const [totalMemory, setTotalMemory] = useState(0);
    const [usedMemory, setUsedMemory] = useState(0);
    const [memoizeStats, setMemoizeStats] = useState<ReturnType<typeof Memoize.stopMonitoring>>();

    // eslint-disable-next-line @lwc/lwc/no-async-await
    const stop = useCallback(async () => {
        const path = await stopProfiling(getPlatform() === CONST.PLATFORM.IOS || getPlatform() === CONST.PLATFORM.WEB, newFileName);
        setFilePath(path);

        const amountOfTotalMemory = await DeviceInfo.getTotalMemory();
        const amountOfUsedMemory = await DeviceInfo.getUsedMemory();
        setTotalMemory(amountOfTotalMemory);
        setUsedMemory(amountOfUsedMemory);
        setMemoizeStats(Memoize.stopMonitoring());
        Performance.disableMonitoring();
    }, []);

    const onToggleProfiling = useCallback(() => {
        const shouldProfiling = !isProfilingInProgress;
        if (shouldProfiling) {
            Memoize.startMonitoring();
            Performance.enableMonitoring();
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
                memoizeStats,
                performance: Performance.getPerformanceMeasures(),
            }),
        [memoizeStats, totalMemory, usedMemory],
    );

    const onToggle = () => {
        onToggleProfiling();
        if (!shouldRecordTroubleshootData) {
            Console.setShouldStoreLogs(true);
            Troubleshoot.setShouldRecordTroubleshootData(true);

            if (onEnableLogging) {
                onEnableLogging();
            }

            return;
        }

        if (!capturedLogs) {
            Alert.alert(translate('initialSettingsPage.troubleshoot.noLogsToShare'));
            Console.disableLoggingAndFlushLogs();
            Troubleshoot.setShouldRecordTroubleshootData(false);
            return;
        }

        const logs = Object.values(capturedLogs);
        const logsWithParsedMessages = parseStringifiedMessages(logs);

        const infoFileName = `App_Info_${pkg.version}.json`;
        zipRef.current.file(infoFileName, getAppInfo());

        onDisableLogging(logsWithParsedMessages);
        Console.disableLoggingAndFlushLogs();
        Troubleshoot.setShouldRecordTroubleshootData(false);
    };

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

                const shareOptions = {
                    urls: [`file://${sharePath}`, actualInfoFile],
                };

                await Share.open(shareOptions);
            } catch (error) {
                console.error('Error renaming and sharing file:', error);
            }
        };
        shareFiles();
    }, [sharePath]);

    return (
        <>
            <TestToolRow title={translate('initialSettingsPage.troubleshoot.recordTroubleshootData')}>
                <Switch
                    accessibilityLabel={translate('initialSettingsPage.troubleshoot.recordTroubleshootData')}
                    isOn={!!shouldRecordTroubleshootData}
                    onToggle={onToggle}
                />
            </TestToolRow>
            {!!file && (
                <>
                    <Text style={[styles.textLabelSupporting, styles.mb4]}>{`path: ${displayPath}`}</Text>
                    <TestToolRow title="Download troubleshoot data">
                        <Button
                            small
                            text={translate('common.share')}
                            onPress={onDownloadZip}
                        />
                    </TestToolRow>
                </>
            )}
            {/* {!!file && (
                <>
                    <Text style={[styles.textLabelSupporting, styles.mb4]}>{`path: ${displayPath}`}</Text>
                    <TestToolRow title={translate('initialSettingsPage.debugConsole.logs')}>
                        <Button
                            small
                            text={translate('common.share')}
                            onPress={onShareLogs}
                        />
                    </TestToolRow>
                </>
            )}
            {!!filePath && showShareButton && (
                <>
                    <Text style={[styles.textLabelSupporting, styles.mb4]}>{`path: ${displayPath2}/${newFileName}`}</Text>
                    <TestToolRow title={translate('initialSettingsPage.troubleshoot.profileTrace')}>
                        <Button
                            small
                            text={translate('common.share')}
                            onPress={onDownloadProfiling}
                        />
                    </TestToolRow>
                </>
            )} */}
        </>
    );
}

BaseRecordTroubleshootDataToolMenu.displayName = 'BaseRecordTroubleshootDataToolMenu';

export type {File};
export default BaseRecordTroubleshootDataToolMenu;
