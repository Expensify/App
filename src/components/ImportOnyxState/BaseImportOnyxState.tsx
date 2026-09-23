import AttachmentPicker from '@components/AttachmentPicker';
import DecisionModal from '@components/DecisionModal';
import MenuItem from '@components/MenuItem';
import MenuItemSectionRow from '@components/MenuItem/presets/MenuItemSectionRow';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import type {FileObject} from '@src/types/utils/Attachment';

import React from 'react';

function BaseImportOnyxState({
    onFileRead,
    isErrorModalVisible,
    setIsErrorModalVisible,
}: {
    onFileRead: (file: FileObject) => void;
    isErrorModalVisible: boolean;
    setIsErrorModalVisible: (value: boolean) => void;
}) {
    const icons = useMemoizedLazyExpensifyIcons(['Upload']);
    const {translate} = useLocalize();

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply the correct modal type for the decision modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    return (
        <>
            <AttachmentPicker
                acceptedFileTypes={['text']}
                shouldHideCameraOption
                shouldHideGalleryOption
            >
                {({openPicker}) => {
                    return (
                        <MenuItemSectionRow
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
                        </MenuItemSectionRow>
                    );
                }}
            </AttachmentPicker>
            <DecisionModal
                title={translate('initialSettingsPage.troubleshoot.invalidFile')}
                prompt={translate('initialSettingsPage.troubleshoot.invalidFileDescription')}
                isSmallScreenWidth={isSmallScreenWidth}
                onSecondOptionSubmit={() => setIsErrorModalVisible(false)}
                secondOptionText={translate('common.ok')}
                isVisible={isErrorModalVisible}
                onClose={() => setIsErrorModalVisible(false)}
            />
        </>
    );
}

export default BaseImportOnyxState;
