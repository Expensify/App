import type JSZip from 'jszip';
import type {RefObject} from 'react';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
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
import {disableLoggingAndFlushLogs, setShouldStoreLogs} from '@libs/actions/Console';
import toggleProfileTool from '@libs/actions/ProfilingTool';
import {setShouldRecordTroubleshootData} from '@libs/actions/Troubleshoot';
import {parseStringifiedMessages} from '@libs/Console';
import getPlatform from '@libs/getPlatform';
import Log from '@libs/Log';
import {Memoize} from '@libs/memoize';
import Performance from '@libs/Performance';
import {shouldShowProfileTool as shouldShowProfileToolUtil} from '@userActions/TestTool';
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
    onDisableLogging: (logs: OnyxLog[]) => Promise<void>;
    /** Action to run when enabling logging */
    onEnableLogging?: () => void;
    /** Path used to save the file */
    pathToBeUsed: string;
    /** Whether to show the share button */
    showShareButton?: boolean;
    /** Zip ref */
    zipRef: RefObject<InstanceType<typeof JSZip>>;
    /** A method to download the zip archive */
    onDownloadZip?: () => void;
    /** It's a desktop-only prop, as it's impossible to download two files simultaneously */
    showDownloadButton?: boolean;
    /** Path used to display location of saved file */
    displayPath?: string;
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
    showShareButton = false,
    pathToBeUsed,
    zipRef,
    onDownloadZip,
    showDownloadButton = false,
    displayPath,
}: BaseRecordTroubleshootDataToolMenuProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [shouldRecordTroubleshootData] = useOnyx(ONYXKEYS.SHOULD_RECORD_TROUBLESHOOT_DATA, {canBeMissing: true});
    const [capturedLogs] = useOnyx(ONYXKEYS.LOGS, {canBeMissing: true});
    const [isProfilingInProgress] = useOnyx(ONYXKEYS.APP_PROFILING_IN_PROGRESS, {canBeMissing: true});
    const [shareUrls, setShareUrls] = useState<string[]>();
    const [isDisabled, setIsDisabled] = useState<boolean>(false);

    const shouldShowProfileTool = useMemo(() => shouldShowProfileToolUtil(), []);

    const onToggleProfiling = useCallback(() => {
        const shouldProfiling = !isProfilingInProgress;
        if (shouldProfiling) {
            setShareUrls(undefined);
            Memoize.startMonitoring();
            Performance.enableMonitoring();
            startProfiling();
        } else {
            Performance.disableMonitoring();
        }
        toggleProfileTool();
        return () => {
            Performance.disableMonitoring();
        };
    }, [isProfilingInProgress]);

    const getAppInfo = useCallback(() => {
        return Promise.all([DeviceInfo.getTotalMemory(), DeviceInfo.getUsedMemory()]).then(([totalMemory, usedMemory]) => {
            return JSON.stringify({
                appVersion: pkg.version,
                environment: CONFIG.ENVIRONMENT,
                platform: getPlatform(),
                totalMemory: formatBytes(totalMemory, 2),
                usedMemory: formatBytes(usedMemory, 2),
                memoizeStats: Memoize.stopMonitoring(),
                performance: shouldShowProfileTool ? Performance.getPerformanceMeasures() : undefined,
            });
        });
    }, [shouldShowProfileTool]);

    const onToggle = () => {
        if (shouldShowProfileTool) {
            onToggleProfiling();
        }
        if (!shouldRecordTroubleshootData) {
            setShouldStoreLogs(true);
            setShouldRecordTroubleshootData(true);

            if (onEnableLogging) {
                onEnableLogging();
            }

            return;
        }

        setIsDisabled(true);

        if (!capturedLogs) {
            Alert.alert(translate('initialSettingsPage.troubleshoot.noLogsToShare'));
            disableLoggingAndFlushLogs();
            setShouldRecordTroubleshootData(false);
            return;
        }

        const logs = Object.values(capturedLogs);
        const logsWithParsedMessages = parseStringifiedMessages(logs);

        const infoFileName = `App_Info_${pkg.version}.json`;
        getAppInfo().then((appInfo) => {
            zipRef.current?.file(infoFileName, appInfo);

            onDisableLogging(logsWithParsedMessages).then(() => {
                disableLoggingAndFlushLogs();
                setShouldRecordTroubleshootData(false);
                setIsDisabled(false);
            });
        });
    };

    const onStopProfiling = useMemo(() => (shouldShowProfileTool ? stopProfiling : () => Promise.resolve()), [shouldShowProfileTool]);

    const onDisableSwitch = useCallback(() => {
        if (getPlatform() === CONST.PLATFORM.WEB) {
            onStopProfiling(true, newFileName).then(() => {
                onDownloadZip?.();
            });
        } else if (getPlatform() === CONST.PLATFORM.DESKTOP) {
            onDownloadZip?.();
        } else if (getPlatform() === CONST.PLATFORM.ANDROID) {
            onStopProfiling(true, newFileName).then((path) => {
                if (!path) {
                    return;
                }

                setShareUrls([`file://${path}`, `file://${file?.path}`]);
            });
        } else {
            onStopProfiling(true, newFileName).then((path) => {
                if (!path) {
                    return;
                }

                const newFilePath = `${pathToBeUsed}/${newFileName}`;

                RNFS.exists(newFilePath)
                    .then((fileExists) => {
                        if (!fileExists) {
                            return;
                        }

                        return RNFS.unlink(newFilePath).then(() => {
                            Log.hmmm('[ProfilingToolMenu] existing file deleted successfully');
                        });
                    })
                    .catch((error) => {
                        const typedError = error as Error;
                        Log.hmmm('[ProfilingToolMenu] error checking/deleting existing file: ', typedError.message);
                    })
                    .then(() => {
                        RNFS.copyFile(path, newFilePath)
                            .then(() => {
                                Log.hmmm('[ProfilingToolMenu] file copied successfully');
                                setShareUrls([`file://${newFilePath}`, `file://${file?.path}`]);
                            })
                            .catch((err) => {
                                console.error('[ProfilingToolMenu] error copying file: ', err);
                            });
                    })
                    .catch((error: Record<string, unknown>) => {
                        console.error('[ProfilingToolMenu] error copying file: ', error);
                        Log.hmmm('[ProfilingToolMenu] error copying file: ', error);
                    });
            });
        }
    }, [file?.path, onDownloadZip, onStopProfiling, pathToBeUsed]);

    useEffect(() => {
        if (!file) {
            return;
        }

        onDisableSwitch();
    }, [file, onDisableSwitch]);

    const onShare = () => {
        Share.open({
            urls: shareUrls,
        });
    };

    const onDownloadProfiling = () => {
        onStopProfiling(true, newFileName);
    };

    return (
        <>
            <TestToolRow title={translate('initialSettingsPage.troubleshoot.recordTroubleshootData')}>
                <Switch
                    accessibilityLabel={translate('initialSettingsPage.troubleshoot.recordTroubleshootData')}
                    isOn={!!shouldRecordTroubleshootData}
                    onToggle={onToggle}
                    disabled={isDisabled}
                />
            </TestToolRow>
            {(shareUrls?.length ?? 0) > 0 && showShareButton && (
                <>
                    <Text style={[styles.textLabelSupporting, styles.mb4]}>{`path: ${displayPath}`}</Text>
                    <TestToolRow title={translate('initialSettingsPage.troubleshoot.results')}>
                        <Button
                            small
                            text={translate('common.share')}
                            onPress={onShare}
                        />
                    </TestToolRow>
                </>
            )}
            {showDownloadButton && !!file?.path && (
                <TestToolRow title={translate('initialSettingsPage.troubleshoot.profileTrace')}>
                    <Button
                        small
                        text={translate('common.download')}
                        onPress={onDownloadProfiling}
                    />
                </TestToolRow>
            )}
        </>
    );
}

BaseRecordTroubleshootDataToolMenu.displayName = 'BaseRecordTroubleshootDataToolMenu';

export type {File};
export default BaseRecordTroubleshootDataToolMenu;
