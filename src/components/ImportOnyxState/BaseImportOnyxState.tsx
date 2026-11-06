import AttachmentPicker from '@components/AttachmentPicker';
import MenuItem from '@components/MenuItem';
import MenuItemSectionRoot from '@components/MenuItem/presets/MenuItemSectionRoot';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import type {FileObject} from '@src/types/utils/Attachment';

import React from 'react';

function BaseImportOnyxState({onFileRead}: {onFileRead: (file: FileObject) => void}) {
    const icons = useMemoizedLazyExpensifyIcons(['Upload']);
    const {translate} = useLocalize();

    return (
        <AttachmentPicker
            acceptedFileTypes={['text']}
            shouldHideCameraOption
            shouldHideGalleryOption
        >
            {({openPicker}) => {
                return (
                    <MenuItemSectionRoot
                        onPress={() => {
                            openPicker({
                                onPicked: (data) => onFileRead(data.at(0) ?? {}),
                            });
                        }}
                    >
                        <MenuItem.Row>
                            <MenuItem.Icon src={icons.Upload} />
                            <MenuItem.Content>
                                <MenuItem.Title>{translate('initialSettingsPage.troubleshoot.importOnyxState')}</MenuItem.Title>
                            </MenuItem.Content>
                        </MenuItem.Row>
                    </MenuItemSectionRoot>
                );
            }}
        </AttachmentPicker>
    );
}

export default BaseImportOnyxState;
