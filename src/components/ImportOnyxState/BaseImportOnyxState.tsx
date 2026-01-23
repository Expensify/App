import React from 'react';
import AttachmentPicker from '@components/AttachmentPicker';
import MenuItem from '@components/MenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {FileObject} from '@src/types/utils/Attachment';

function BaseImportOnyxState({
    onFileRead,
}: {
    onFileRead: (file: FileObject) => void;
}) {
    const icons = useMemoizedLazyExpensifyIcons(['Upload']);
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <AttachmentPicker
            acceptedFileTypes={['text']}
            shouldHideCameraOption
            shouldHideGalleryOption
        >
            {({openPicker}) => {
                return (
                    <MenuItem
                        icon={icons.Upload}
                        title={translate('initialSettingsPage.troubleshoot.importOnyxState')}
                        wrapperStyle={[styles.sectionMenuItemTopDescription]}
                        onPress={() => {
                            openPicker({
                                onPicked: (data) => onFileRead(data.at(0) ?? {}),
                            });
                        }}
                    />
                );
            }}
        </AttachmentPicker>
    );
}

export default BaseImportOnyxState;
