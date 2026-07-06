import AvatarCropModal from '@components/AvatarCropModal/AvatarCropModal';
import AvatarSelector from '@components/AvatarSelector';
import Button from '@components/ButtonComposed';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDiscardChangesConfirmation from '@hooks/useDiscardChangesConfirmation';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {USER_AVATARS} from '@libs/Avatars/UserAvatarCatalog';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import Navigation from '@libs/Navigation/Navigation';

import {updateAvatar} from '@userActions/PersonalDetails';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

import React, {useRef, useState} from 'react';
import {View} from 'react-native';

import type {AvatarCaptureHandle} from './AvatarCapture/types';
import type {ErrorData, ImageData} from './types';

import AvatarPreview from './AvatarPreview';

const EMPTY_FILE = {uri: '', name: '', type: '', file: null};

function EditUserAvatarContent() {
    const [errorData, setErrorData] = useState<ErrorData>({validationError: null, phraseParam: {}});
    const [isAvatarCropModalOpen, setIsAvatarCropModalOpen] = useState(false);

    const [selected, setSelected] = useState<string | undefined>();
    const avatarCaptureRef = useRef<AvatarCaptureHandle>(null);

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isInLandscapeMode = useIsInLandscapeMode();
    const [cropImageData, setCropImageData] = useState<ImageData>({...EMPTY_FILE});
    const [imageData, setImageData] = useState<ImageData>({...EMPTY_FILE});

    const isDirty = imageData.uri !== '' || !!selected;

    const {notifySaving} = useDiscardChangesConfirmation({
        getHasUnsavedChanges: () => isDirty,
    });

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const setError = (error: TranslationPaths | null, phraseParam: Record<string, unknown>) => {
        setErrorData({
            validationError: error,
            phraseParam,
        });
    };

    const onImageSelected = (file: File | CustomRNImageManipulatorResult) => {
        setSelected(undefined);
        setImageData({
            uri: file?.uri ?? '',
            name: file?.name,
            file,
            type: '',
        });
        setIsAvatarCropModalOpen(false);
    };

    const saveAvatar = () => {
        notifySaving();

        if (imageData.file) {
            updateAvatar(imageData.file, {
                avatar: currentUserPersonalDetails?.avatar,
                avatarThumbnail: currentUserPersonalDetails?.avatarThumbnail,
                accountID: currentUserPersonalDetails?.accountID,
            });
            setImageData({...EMPTY_FILE});
            Navigation.dismissModal();
            return;
        }

        if (selected && USER_AVATARS.isAvatarID(selected)) {
            updateAvatar(
                {
                    uri: USER_AVATARS.getURL(selected) ?? '',
                    name: selected,
                    customExpensifyAvatarID: selected,
                },
                {
                    avatar: currentUserPersonalDetails?.avatar,
                    avatarThumbnail: currentUserPersonalDetails?.avatarThumbnail,
                    accountID: currentUserPersonalDetails?.accountID,
                },
            );
            setSelected(undefined);
            Navigation.dismissModal();
            return;
        }
        if (!selected || !avatarCaptureRef.current) {
            notifySaving(false);
            return;
        }
        avatarCaptureRef.current
            .capture()
            ?.then((file) => {
                updateAvatar(file, {
                    avatar: currentUserPersonalDetails?.avatar,
                    avatarThumbnail: currentUserPersonalDetails?.avatarThumbnail,
                    accountID: currentUserPersonalDetails?.accountID,
                });
                setSelected(undefined);
                setImageData({...EMPTY_FILE});
                Navigation.dismissModal();
            })
            .catch(() => {
                notifySaving(false);
            });
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            includePaddingTop
            shouldEnableMaxHeight
            testID="ProfileAvatar"
            offlineIndicatorStyle={styles.mtAuto}
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton title={translate('avatarPage.title')} />

            {!isInLandscapeMode && (
                <AvatarPreview
                    selected={selected}
                    setSelected={setSelected}
                    avatarCaptureRef={avatarCaptureRef}
                    imageData={imageData}
                    setImageData={setImageData}
                    setError={setError}
                    setCropImageData={setCropImageData}
                    setIsAvatarCropModalOpen={setIsAvatarCropModalOpen}
                    isAvatarCropModalOpen={isAvatarCropModalOpen}
                />
            )}

            <ScrollView
                style={styles.flex1}
                contentContainerStyle={styles.flexGrow1}
                keyboardShouldPersistTaps="handled"
            >
                {isInLandscapeMode && (
                    <AvatarPreview
                        selected={selected}
                        setSelected={setSelected}
                        avatarCaptureRef={avatarCaptureRef}
                        imageData={imageData}
                        setImageData={setImageData}
                        setError={setError}
                        setCropImageData={setCropImageData}
                        setIsAvatarCropModalOpen={setIsAvatarCropModalOpen}
                        isAvatarCropModalOpen={isAvatarCropModalOpen}
                    />
                )}
                <View style={[styles.ph5, styles.pb5, styles.flexColumn, styles.flex1, styles.gap3]}>
                    <AvatarSelector
                        label={translate('avatarPage.choosePresetAvatar')}
                        name={currentUserPersonalDetails?.displayName}
                        selectedID={selected}
                        onSelect={(id) => {
                            setImageData({...EMPTY_FILE});
                            setSelected(id);
                        }}
                    />
                </View>
            </ScrollView>

            <FixedFooter style={styles.mtAuto}>
                {!!errorData.validationError && (
                    <DotIndicatorMessage
                        style={styles.mv5}
                        // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unsafe-type-assertion
                        messages={{0: translate(errorData.validationError, errorData.phraseParam as never)}}
                        type="error"
                    />
                )}
                <Button
                    size={CONST.BUTTON_SIZE.LARGE}
                    variant="success"
                    isDisabled={!isDirty}
                    onPress={saveAvatar}
                >
                    <Button.KeyboardShortcut />
                    <Button.Text>{translate('common.save')}</Button.Text>
                </Button>
            </FixedFooter>

            <AvatarCropModal
                onClose={() => {
                    if (!isAvatarCropModalOpen) {
                        return;
                    }
                    setCropImageData({...EMPTY_FILE});
                    setIsAvatarCropModalOpen(false);
                }}
                isVisible={isAvatarCropModalOpen}
                onSave={onImageSelected}
                imageUri={cropImageData.uri}
                imageName={cropImageData.name}
                imageType={cropImageData.type}
                buttonLabel={translate('avatarPage.upload')}
            />
        </ScreenWrapper>
    );
}

EditUserAvatarContent.displayName = 'EditUserAvatarContent';

export default EditUserAvatarContent;
