import type JSZip from 'jszip';
import type {RefObject} from 'react';
import React, {useEffect, useState} from 'react';
import {Alert} from 'react-native';
import Button from '@components/Button';
import Switch from '@components/Switch';
import TestToolRow from '@components/TestToolRow';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {cleanupAfterDisable, disableRecording, enableRecording, stopProfilingAndGetData} from '@libs/actions/Troubleshoot';
import type {ProfilingData} from '@libs/actions/Troubleshoot';
import getPlatform from '@libs/getPlatform';
import getMemoryInfo from '@libs/telemetry/getMemoryInfo';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import pkg from '../../../package.json';
import handleStopRecording from './handleStopRecording';
import type StopRecordingParams from './handleStopRecording.types';
import Share from './Share';

type File = {
    path: string;
    newFileName: string;
    size: number;
};

type BaseRecordTroubleshootDataToolMenuProps = {
    /** Locally created file */
    file?: File;
    /** Action to run when disabling recording */
    onDisableRecording: () => Promise<void>;
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

function formatBytes(bytes: number, decimals = 2): string {
    if (!+bytes) {
        return '0 Bytes';
    }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const sizeIndex = Math.min(i, sizes.length - 1);

    return `${parseFloat((bytes / k ** sizeIndex).toFixed(dm))} ${sizes.at(sizeIndex)}`;
}

// WARNING: When changing this name make sure that the "scripts/symbolicate-profile.ts" script is still working!
const newFileName = `Profile_trace_for_${pkg.version}.cpuprofile`;

function BaseRecordTroubleshootDataToolMenu({
    file,
    onDisableRecording,
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
    const [shareUrls, setShareUrls] = useState<string[]>();
    const [isDisabled, setIsDisabled] = useState<boolean>(false);
    const [profileTracePath, setProfileTracePath] = useState<string>();

    const getAppInfo = async (profilingData: ProfilingData) => {
        const memoryInfo = await getMemoryInfo();
        return JSON.stringify({
            appVersion: pkg.version,
            environment: CONFIG.ENVIRONMENT,
            platform: getPlatform(),
            totalMemory: memoryInfo.totalMemoryBytes !== null ? formatBytes(memoryInfo.totalMemoryBytes, 2) : null,
            usedMemory: memoryInfo.usedMemoryBytes !== null ? formatBytes(memoryInfo.usedMemoryBytes, 2) : null,
            memoizeStats: profilingData.memoizeStats,
            performance: profilingData.performanceMeasures,
        });
    };

    const onToggle = async () => {
        if (!shouldRecordTroubleshootData) {
            enableRecording();

            if (onEnableLogging) {
                onEnableLogging();
            }

            return;
        }

        setIsDisabled(true);

        const infoFileName = `App_Info_${pkg.version}.json`;

        try {
            const profilingData = await stopProfilingAndGetData(newFileName);
            const appInfo = await getAppInfo(profilingData);

            const params: StopRecordingParams = {
                profilingData,
                infoFileName,
                profileFileName: newFileName,
                appInfo,
                onDisableRecording,
                cleanupAfterDisable,
                zipRef,
                pathToBeUsed,
                onDownloadZip,
                setProfileTracePath,
            };

            await handleStopRecording(params);
        } catch (error) {
            console.error('[ProfilingToolMenu] error handling stop recording', error);
        }

        setIsDisabled(false);
    };

    useEffect(() => {
        if (!profileTracePath || !file) {
            return;
        }

        setShareUrls([`file://${profileTracePath}`, `file://${file?.path}`]);
    }, [profileTracePath, file]);

    const onShare = () => {
        Share.open({
            urls: shareUrls,
        });
    };

    return (
        <>
            <TestToolRow title={translate('initialSettingsPage.troubleshoot.recordTroubleshootData')}>
                <Switch
                    accessibilityLabel={translate('initialSettingsPage.troubleshoot.recordTroubleshootData')}
                    isOn={!!shouldRecordTroubleshootData}
                    onToggle={() => {
                        onToggle().catch((error) => console.error('[ProfilingToolMenu] toggle failed', error));
                    }}
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
                        onPress={onDownloadZip}
                    />
                </TestToolRow>
            )}
        </>
    );
}

export type {File};
export default BaseRecordTroubleshootDataToolMenu;
