import AttachmentPicker from '@components/AttachmentPicker';
import AvatarPageFooter from '@components/AvatarPageFooter';
import AvatarSelector from '@components/AvatarSelector';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {AvatarPreviewProps} from './AvatarPreview';

import AvatarPreview from './AvatarPreview';
import useProfileAvatarForm from './useProfileAvatarForm';

function UserProfileAvatar() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isInLandscapeMode = useIsInLandscapeMode();

    const {errorData, selected, imageData, isDirty, isRemoved, setError, onSelectPreset, onImageRemoved, openCropper, save} = useProfileAvatarForm();

    const renderPreview = (openPicker: AvatarPreviewProps['openPicker']) => (
        <AvatarPreview
            selected={selected}
            isRemoved={isRemoved}
            onImageRemoved={onImageRemoved}
            imageData={imageData}
            setError={setError}
            openCropper={openCropper}
            openPicker={openPicker}
        />
    );

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

            <AttachmentPicker
                type={CONST.ATTACHMENT_PICKER_TYPE.IMAGE}
                shouldValidateImage={false}
            >
                {({openPicker}) => (
                    <>
                        {!isInLandscapeMode && renderPreview(openPicker)}

                        <ScrollView
                            style={styles.flex1}
                            contentContainerStyle={styles.flexGrow1}
                            keyboardShouldPersistTaps="handled"
                        >
                            {isInLandscapeMode && renderPreview(openPicker)}
                            <View style={[styles.ph5, styles.pb5, styles.flexColumn, styles.flex1, styles.gap3]}>
                                <AvatarSelector
                                    label={translate('avatarPage.choosePresetAvatar')}
                                    selectedID={selected}
                                    onSelect={onSelectPreset}
                                />
                            </View>
                        </ScrollView>
                    </>
                )}
            </AttachmentPicker>

            <AvatarPageFooter
                validationError={errorData.validationError}
                phraseParam={errorData.phraseParam}
                isDirty={isDirty}
                onSave={save}
            />
        </ScreenWrapper>
    );
}

export default UserProfileAvatar;
