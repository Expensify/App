import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import RNFS from 'react-native-fs';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

function formatFileSize(bytes: number): string {
    if (bytes === 0) {
        return '0 Bytes';
    }

    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formattedSize = (bytes / k ** i).toFixed(2);

    return `${formattedSize} ${units.at(i)}`;
}

function getFolderSize(folderPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
        console.debug('[dev] getFolderSize', folderPath);

        RNFS.readDir(folderPath)
            .then((files) => {
                console.debug('[dev] getFolderSize files', files);
                const promises = files.map((file) => RNFS.stat(file.path));
                Promise.all(promises)
                    .then((stats) => {
                        console.debug('[dev] getFolderSize stats', stats);
                        const totalSize = stats.reduce((acc, stat) => acc + stat.size, 0);
                        console.debug('[dev] getFolderSize totalSize', totalSize);
                        resolve(totalSize);
                    })
                    .catch(reject);
            })
            .catch(reject);
    });
}
function checkDiskUsage(): Promise<{
    totalDiskSpace: number;
    freeDiskSpace: number;
}> {
    return Promise.all([DeviceInfo.getTotalDiskCapacity(), DeviceInfo.getFreeDiskStorage()]).then(([totalDiskSpace, freeDiskSpace]) => ({
        totalDiskSpace,
        freeDiskSpace,
    }));
}

function clearFolder(folderPath: string): Promise<void> {
    return RNFS.readDir(folderPath)
        .then((files) => {
            const promises = files.map((file) => RNFS.unlink(file.path));
            return Promise.all(promises);
        })
        .then(() => {
            console.debug('[dev] Folder cleared successfully', folderPath);
        })
        .catch((error) => {
            console.error('Error clearing documents folder:', error);
            throw error;
        });
}

function StoragePage() {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const [documentDirectorySize, setDocumentDirectorySize] = useState<number | null>(null);
    const [cachesDirectorySize, setCachesDirectorySize] = useState<number | null>(null);

    const [totalDiskSpace, setTotalDiskSpace] = useState<number | null>(null);
    const [freeDiskSpace, setFreeDiskSpace] = useState<number | null>(null);

    useEffect(() => {
        getFolderSize(RNFS.DocumentDirectoryPath)
            .then((size) => {
                console.debug('[dev] Document Directory Size:', size);
                setDocumentDirectorySize(size);
            })
            .catch((error) => {
                console.error('Error getting Document Directory size:', error);
            });

        getFolderSize(RNFS.CachesDirectoryPath)
            .then((size) => {
                console.debug('[dev] Caches Directory Size:', size);
                setCachesDirectorySize(size);
            })
            .catch((error) => {
                console.error('Error getting Caches Directory size:', error);
            });

        checkDiskUsage()
            .then((result) => {
                console.debug('[dev] Total Disk Space:', result.totalDiskSpace);
                console.debug('[dev] Free Disk Space:', result.freeDiskSpace);
                setTotalDiskSpace(result.totalDiskSpace);
                setFreeDiskSpace(result.freeDiskSpace);
            })
            .catch((error) => {
                console.error('Error getting checkDiskUsage:', error);
            });
    }, []);

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            testID={StoragePage.displayName}
        >
            <HeaderWithBackButton
                title={translate('initialSettingsPage.storage')}
                shouldShowBackButton={shouldUseNarrowLayout}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS)}
                icon={Illustrations.BigVault}
                shouldUseHeadlineHeader
            />

            <View
                style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                }}
            >
                <Text
                    style={{
                        fontWeight: 'bold',
                    }}
                >
                    Device storage
                </Text>
                <Text>Total Disk Space: {totalDiskSpace !== null ? `${formatFileSize(totalDiskSpace)} bytes` : 'Loading...'}</Text>
                <Text>Free Disk Space: {freeDiskSpace !== null ? `${formatFileSize(freeDiskSpace)} bytes` : 'Loading...'}</Text>
                <Text
                    style={{
                        marginTop: 16,
                        fontWeight: 'bold',
                    }}
                >
                    Application storage
                </Text>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Text>Document Directory Size: {documentDirectorySize !== null ? `${formatFileSize(documentDirectorySize)}` : 'Loading...'}</Text>
                    <Button
                        text="Clear Documents"
                        onPress={() => clearFolder(RNFS.DocumentDirectoryPath)}
                    />
                </View>
                <View
                    style={{
                        marginTop: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Text>Caches Directory Size: {cachesDirectorySize !== null ? `${formatFileSize(cachesDirectorySize)}` : 'Loading...'}</Text>
                    <Button
                        text="Clear Cache"
                        onPress={() => clearFolder(RNFS.CachesDirectoryPath)}
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
}

StoragePage.displayName = 'StoragePage';

export default StoragePage;
