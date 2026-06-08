import React, {useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import AttachmentPicker from '@components/AttachmentPicker';
import Avatar from '@components/Avatar';
import AvatarCropModal from '@components/AvatarCropModal/AvatarCropModal';
import Button from '@components/Button';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {BotAvatar} from '@components/Icon/DefaultBotAvatars';
import {botAvatarIDs, botAvatars} from '@components/Icon/DefaultBotAvatars';
import {PressableWithFeedback} from '@components/Pressable';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useDiscardChangesConfirmation from '@hooks/useDiscardChangesConfirmation';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {resolveAvatarURI} from '@libs/Avatars/PresetAvatarCatalog';
import {validateAvatarImage} from '@libs/AvatarUtils';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import {updateAgentAvatar} from '@userActions/Agent';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {FileObject} from '@src/types/utils/Attachment';

type EditAgentAvatarPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.EDIT_AVATAR>;

type ImageData = {
    uri: string;
    name: string;
    type: string;
    file: File | CustomRNImageManipulatorResult | null;
};

const EMPTY_IMAGE_DATA: ImageData = {uri: '', name: '', type: '', file: null};

type OnSaveParams = {file: File | CustomRNImageManipulatorResult; uri: string} | {customExpensifyAvatarID: string};

type EditAgentAvatarContentProps = {
    accountID: number;
    fallbackRoute?: Route;
    onSave?: (params: OnSaveParams) => void;
    initialPresetID?: string;
};

function EditAgentAvatarContent({accountID, fallbackRoute, onSave, initialPresetID}: EditAgentAvatarContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Upload']);

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: (list) => list?.[accountID]});

    const initialBotAvatar = useMemo(() => {
        if (!initialPresetID) {
            return null;
        }
        return botAvatars.find((av) => botAvatarIDs.get(av) === initialPresetID) ?? null;
    }, [initialPresetID]);

    const [selectedBotAvatar, setSelectedBotAvatar] = useState<BotAvatar | null>(() => initialBotAvatar);
    const [imageData, setImageData] = useState<ImageData>(EMPTY_IMAGE_DATA);
    const [cropImageData, setCropImageData] = useState<ImageData>(EMPTY_IMAGE_DATA);
    const [isAvatarCropModalOpen, setIsAvatarCropModalOpen] = useState(false);
    const [errorData, setErrorData] = useState<{validationError: TranslationPaths | null; phraseParam: Record<string, unknown>}>({validationError: null, phraseParam: {}});

    const isSavingRef = useRef(false);
    const isDirty = selectedBotAvatar !== initialBotAvatar || imageData.uri !== '';

    useDiscardChangesConfirmation({
        getHasUnsavedChanges: () => !isSavingRef.current && isDirty,
    });

    let previewSource: AvatarSource = personalDetails?.avatar ?? '';
    if (selectedBotAvatar) {
        previewSource = selectedBotAvatar;
    } else if (imageData.uri) {
        previewSource = imageData.uri;
    }

    const showAvatarCropModal = (image: FileObject) => {
        validateAvatarImage(image)
            .then((result) => {
                if (!result.isValid) {
                    setErrorData({validationError: result.errorKey ?? null, phraseParam: result.errorParams ?? {}});
                    return;
                }
                setIsAvatarCropModalOpen(true);
                setErrorData({validationError: null, phraseParam: {}});
                setCropImageData({
                    uri: image.uri ?? '',
                    name: image.name ?? '',
                    type: image.type ?? '',
                    file: null,
                });
            })
            .catch(() => {
                setErrorData({validationError: 'attachmentPicker.errorWhileSelectingCorruptedAttachment', phraseParam: {}});
            });
    };

    const onImageSelected = (file: File | CustomRNImageManipulatorResult) => {
        setSelectedBotAvatar(null);
        setImageData({
            uri: file?.uri ?? '',
            name: file?.name ?? '',
            file,
            type: '',
        });
        setIsAvatarCropModalOpen(false);
    };

    const handleSave = () => {
        if (!isDirty) {
            return;
        }
        isSavingRef.current = true;

        if (imageData.file) {
            if (onSave) {
                onSave({file: imageData.file, uri: imageData.uri});
                return;
            }
            updateAgentAvatar(accountID, {file: imageData.file, uri: imageData.uri}, personalDetails?.avatar);
            Navigation.goBack(fallbackRoute);
        }

        if (selectedBotAvatar) {
            const customExpensifyAvatarID = botAvatarIDs.get(selectedBotAvatar);
            if (customExpensifyAvatarID) {
                const uri = resolveAvatarURI(customExpensifyAvatarID);
                if (onSave) {
                    onSave({customExpensifyAvatarID});
                    return;
                }
                updateAgentAvatar(accountID, {customExpensifyAvatarID, uri}, personalDetails?.avatar);
                Navigation.goBack(fallbackRoute);
            }
        }
    };

    return (
        <ScreenWrapper
            testID={EditAgentAvatarContent.displayName}
            includeSafeAreaPaddingBottom
            offlineIndicatorStyle={styles.mtAuto}
        >
            <HeaderWithBackButton
                title={translate('editAgentAvatarPage.title')}
                onBackButtonPress={() => Navigation.goBack(fallbackRoute)}
            />
            <ScrollView
                style={styles.flex1}
                contentContainerStyle={styles.flexGrow1}
                keyboardShouldPersistTaps="handled"
            >
                <View style={[styles.flexColumn, styles.gap5, styles.alignItemsCenter, styles.pb10]}>
                    <Avatar
                        containerStyles={[styles.avatarXLarge, styles.alignSelfCenter]}
                        imageStyles={[styles.avatarXLarge, styles.alignSelfCenter]}
                        source={previewSource}
                        avatarID={accountID}
                        size={CONST.AVATAR_SIZE.X_LARGE}
                        type={CONST.ICON_TYPE_AVATAR}
                    />
                    <AttachmentPicker
                        type={CONST.ATTACHMENT_PICKER_TYPE.IMAGE}
                        shouldValidateImage={false}
                    >
                        {({openPicker}) => (
                            <Button
                                icon={icons.Upload}
                                text={translate('avatarPage.uploadPhoto')}
                                accessibilityLabel={translate('avatarPage.uploadPhoto')}
                                isDisabled={isAvatarCropModalOpen}
                                onPress={() => {
                                    openPicker({
                                        onPicked: (data) => showAvatarCropModal(data.at(0) ?? {}),
                                    });
                                }}
                            />
                        )}
                    </AttachmentPicker>
                </View>
                <View style={[styles.ph5, styles.pb5, styles.flexColumn, styles.gap3]}>
                    <Text style={[styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting, styles.pre, styles.ph2]}>{translate('avatarPage.choosePresetAvatar')}</Text>
                    <View style={styles.avatarSelectorListContainer}>
                        {botAvatars.map((botAvatar) => {
                            const botAvatarID = botAvatarIDs.get(botAvatar);
                            const isSelected = selectedBotAvatar === botAvatar;
                            return (
                                <PressableWithFeedback
                                    key={botAvatarID}
                                    accessible
                                    accessibilityRole="button"
                                    accessibilityLabel={translate('avatarPage.selectAvatar')}
                                    sentryLabel="EditAgentAvatar-BotAvatarSelector"
                                    onPress={() => {
                                        setSelectedBotAvatar(() => botAvatar);
                                        setImageData(EMPTY_IMAGE_DATA);
                                    }}
                                    style={[styles.avatarSelectorWrapper, isSelected && styles.avatarSelected]}
                                >
                                    <Avatar
                                        type={CONST.ICON_TYPE_AVATAR}
                                        source={botAvatar}
                                        size={CONST.AVATAR_SIZE.MEDIUM}
                                        containerStyles={styles.avatarSelectorContainer}
                                    />
                                </PressableWithFeedback>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>
            <FixedFooter style={styles.mtAuto}>
                {!!errorData.validationError && (
                    <DotIndicatorMessage
                        style={styles.mv5}
                        messages={{validationError: translate(errorData.validationError, errorData.phraseParam as never)}}
                        type="error"
                    />
                )}
                <Button
                    large
                    success
                    text={translate('common.save')}
                    isDisabled={!isDirty}
                    onPress={handleSave}
                    pressOnEnter
                />
            </FixedFooter>
            <AvatarCropModal
                onClose={() => {
                    if (!isAvatarCropModalOpen) {
                        return;
                    }
                    setCropImageData(EMPTY_IMAGE_DATA);
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

EditAgentAvatarContent.displayName = 'EditAgentAvatarContent';

function EditAgentAvatarPage({route}: EditAgentAvatarPageProps) {
    const {accountID} = route.params;
    return (
        <EditAgentAvatarContent
            accountID={accountID}
            fallbackRoute={ROUTES.SETTINGS_AGENTS_EDIT.getRoute(accountID)}
        />
    );
}

EditAgentAvatarPage.displayName = 'EditAgentAvatarPage';

export type {OnSaveParams};
export {EditAgentAvatarContent};
export default EditAgentAvatarPage;
