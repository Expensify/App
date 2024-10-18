import React from 'react';
import type {FileObject} from '@components/AttachmentModal';
import AttachmentPicker from '@components/AttachmentPicker';
import DecisionModal from '@components/DecisionModal';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

function BaseImportOnyxState({
    onFileRead,
    isErrorModalVisible,
    setIsErrorModalVisible,
}: {
    onFileRead: (file: FileObject) => void;
    isErrorModalVisible: boolean;
    setIsErrorModalVisible: (value: boolean) => void;
}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
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
                        <MenuItem
                            icon={Expensicons.Upload}
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
