import React from 'react';
import {View} from 'react-native';
import AvatarPageFooter from '@components/AvatarPageFooter';
import AvatarSelector from '@components/AvatarSelector';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import AvatarPreview from './AvatarPreview';
import useProfileAvatarForm from './useProfileAvatarForm';

function UserProfileAvatar() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isInLandscapeMode = useIsInLandscapeMode();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const {errorData, selected, setSelected, imageData, setImageData, avatarCaptureRef, isDirty, setError, onSelectPreset, openCropper, save} = useProfileAvatarForm();

    const renderPreview = () => (
        <AvatarPreview
            selected={selected}
            setSelected={setSelected}
            avatarCaptureRef={avatarCaptureRef}
            imageData={imageData}
            setImageData={setImageData}
            setError={setError}
            openCropper={openCropper}
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

            {!isInLandscapeMode && renderPreview()}

            <ScrollView
                style={styles.flex1}
                contentContainerStyle={styles.flexGrow1}
                keyboardShouldPersistTaps="handled"
            >
                {isInLandscapeMode && renderPreview()}
                <View style={[styles.ph5, styles.pb5, styles.flexColumn, styles.flex1, styles.gap3]}>
                    <AvatarSelector
                        label={translate('avatarPage.choosePresetAvatar')}
                        name={currentUserPersonalDetails?.displayName}
                        selectedID={selected}
                        onSelect={onSelectPreset}
                    />
                </View>
            </ScrollView>

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
