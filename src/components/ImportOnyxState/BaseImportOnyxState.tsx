import React from 'react';
import AttachmentPicker from '@components/AttachmentPicker';
import Button from '@components/Button';
import DecisionModal from '@components/DecisionModal';
import MenuItem from '@components/MenuItem';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type {FileObject} from '@src/types/utils/Attachment';

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
    const styles = useThemeStyles();

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
            <DecisionModal
                isVisible={isErrorModalVisible}
                onClose={() => setIsErrorModalVisible(false)}
                isSmallScreenWidth={isSmallScreenWidth}
            >
                <DecisionModal.Header title={translate('initialSettingsPage.troubleshoot.invalidFile')} />
                <Text>{translate('initialSettingsPage.troubleshoot.invalidFileDescription')}</Text>
                <DecisionModal.Footer>
                    <Button
                        text={translate('common.ok')}
                        onPress={() => setIsErrorModalVisible(false)}
                        large
                    />
                </DecisionModal.Footer>
            </DecisionModal>
        </>
    );
}

export default BaseImportOnyxState;
