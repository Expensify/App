import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import * as Browser from '@libs/Browser';
import compose from '@libs/compose';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import getImageResolution from '@libs/fileDownload/getImageResolution';
import SpinningIndicatorAnimation from '@styles/animation/SpinningIndicatorAnimation';
import stylePropTypes from '@styles/stylePropTypes';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import AttachmentModal from './AttachmentModal';
import AttachmentPicker from './AttachmentPicker';
import Avatar from './Avatar';
import AvatarCropModal from './AvatarCropModal/AvatarCropModal';
import DotIndicatorMessage from './DotIndicatorMessage';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import OfflineWithFeedback from './OfflineWithFeedback';
import PopoverMenu from './PopoverMenu';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import Tooltip from './Tooltip/PopoverAnchorTooltip';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import withNavigationFocus from './withNavigationFocus';
import withTheme, {withThemePropTypes} from './withTheme';
import withThemeStyles, {withThemeStylesPropTypes} from './withThemeStyles';

const propTypes = {
    /** Avatar source to display */
    source: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

    /** Additional style props */
    style: stylePropTypes,

    /** Executed once an image has been selected */
    onImageSelected: PropTypes.func,

    /** Execute when the user taps "remove" */
    onImageRemoved: PropTypes.func,

    /** A default avatar component to display when there is no source */
    DefaultAvatar: PropTypes.func,

    /** Whether we are using the default avatar */
    isUsingDefaultAvatar: PropTypes.bool,

    /** The anchor position of the menu */
    anchorPosition: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }).isRequired,

    /** Flag to see if image is being uploaded */
    isUploading: PropTypes.bool,

    /** Size of Indicator */
    size: PropTypes.oneOf([CONST.AVATAR_SIZE.LARGE, CONST.AVATAR_SIZE.DEFAULT]),

    /** A fallback avatar icon to display when there is an error on loading avatar from remote URL. */
    fallbackIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),

    /** Denotes whether it is an avatar or a workspace avatar */
    type: PropTypes.oneOf([CONST.ICON_TYPE_AVATAR, CONST.ICON_TYPE_WORKSPACE]),

    /** Image crop vector mask */
    editorMaskImage: PropTypes.func,

    /** Additional style object for the error row */
    errorRowStyles: stylePropTypes,

    /** A function to run when the X button next to the error is clicked */
    onErrorClose: PropTypes.func,

    /** The type of action that's pending  */
    pendingAction: PropTypes.oneOf(['add', 'update', 'delete']),

    /** The errors to display  */
    // eslint-disable-next-line react/forbid-prop-types
    errors: PropTypes.object,

    /** Title for avatar preview modal */
    headerTitle: PropTypes.string,

    /** Avatar source for avatar preview modal */
    previewSource: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

    /** File name of the avatar */
    originalFileName: PropTypes.string,

    /** Whether navigation is focused */
    isFocused: PropTypes.bool.isRequired,

    ...withLocalizePropTypes,
    ...withThemeStylesPropTypes,
    ...withThemePropTypes,
};

const defaultProps = {
    source: '',
    onImageSelected: () => {},
    onImageRemoved: () => {},
    style: [],
    DefaultAvatar: () => {},
    isUsingDefaultAvatar: false,
    isUploading: false,
    size: CONST.AVATAR_SIZE.DEFAULT,
    fallbackIcon: Expensicons.FallbackAvatar,
    type: CONST.ICON_TYPE_AVATAR,
    editorMaskImage: undefined,
    errorRowStyles: [],
    onErrorClose: () => {},
    pendingAction: null,
    errors: null,
    headerTitle: '',
    previewSource: '',
    originalFileName: '',
};

class AvatarWithImagePicker extends React.Component {
    constructor(props) {
        super(props);
        this.animation = new SpinningIndicatorAnimation();
        this.setError = this.setError.bind(this);
        this.isValidSize = this.isValidSize.bind(this);
        this.showAvatarCropModal = this.showAvatarCropModal.bind(this);
        this.hideAvatarCropModal = this.hideAvatarCropModal.bind(this);
        this.state = {
            isMenuVisible: false,
            validationError: null,
            phraseParam: {},
            isAvatarCropModalOpen: false,
            imageName: '',
            imageUri: '',
            imageType: '',
        };
        this.anchorRef = React.createRef();
    }

    componentDidMount() {
        if (!this.props.isUploading) {
            return;
        }

        this.animation.start();
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.isFocused && this.props.isFocused) {
            this.setError(null, {});
        }
        if (!prevProps.isUploading && this.props.isUploading) {
            this.animation.start();
        } else if (prevProps.isUploading && !this.props.isUploading) {
            this.animation.stop();
        }
    }

    componentWillUnmount() {
        this.animation.stop();
    }

    /**
     * @param {String} error
     * @param {Object} phraseParam
     */
    setError(error, phraseParam) {
        this.setState({validationError: error, phraseParam});
    }

    /**
     * Check if the attachment extension is allowed.
     *
     * @param {Object} image
     * @returns {Boolean}
     */
    isValidExtension(image) {
        const {fileExtension} = FileUtils.splitExtensionFromFileName(lodashGet(image, 'name', ''));
        return _.contains(CONST.AVATAR_ALLOWED_EXTENSIONS, fileExtension.toLowerCase());
    }

    /**
     * Check if the attachment size is less than allowed size.
     *
     * @param {Object} image
     * @returns {Boolean}
     */
    isValidSize(image) {
        return image && lodashGet(image, 'size', 0) < CONST.AVATAR_MAX_ATTACHMENT_SIZE;
    }

    /**
     * Check if the attachment resolution matches constraints.
     *
     * @param {Object} image
     * @returns {Promise}
     */
    isValidResolution(image) {
        return getImageResolution(image).then(
            (resolution) =>
                resolution.height >= CONST.AVATAR_MIN_HEIGHT_PX &&
                resolution.width >= CONST.AVATAR_MIN_WIDTH_PX &&
                resolution.height <= CONST.AVATAR_MAX_HEIGHT_PX &&
                resolution.width <= CONST.AVATAR_MAX_WIDTH_PX,
        );
    }

    /**
     * Validates if an image has a valid resolution and opens an avatar crop modal
     *
     * @param {Object} image
     */
    showAvatarCropModal(image) {
        if (!this.isValidExtension(image)) {
            this.setError('avatarWithImagePicker.notAllowedExtension', {allowedExtensions: CONST.AVATAR_ALLOWED_EXTENSIONS});
            return;
        }
        if (!this.isValidSize(image)) {
            this.setError('avatarWithImagePicker.sizeExceeded', {maxUploadSizeInMB: CONST.AVATAR_MAX_ATTACHMENT_SIZE / (1024 * 1024)});
            return;
        }

        this.isValidResolution(image).then((isValidResolution) => {
            if (!isValidResolution) {
                this.setError('avatarWithImagePicker.resolutionConstraints', {
                    minHeightInPx: CONST.AVATAR_MIN_HEIGHT_PX,
                    minWidthInPx: CONST.AVATAR_MIN_WIDTH_PX,
                    maxHeightInPx: CONST.AVATAR_MAX_HEIGHT_PX,
                    maxWidthInPx: CONST.AVATAR_MAX_WIDTH_PX,
                });
                return;
            }

            this.setState({
                isAvatarCropModalOpen: true,
                validationError: null,
                phraseParam: {},
                isMenuVisible: false,
                imageUri: image.uri,
                imageName: image.name,
                imageType: image.type,
            });
        });
    }

    hideAvatarCropModal() {
        this.setState({isAvatarCropModalOpen: false});
    }

    render() {
        const DefaultAvatar = this.props.DefaultAvatar;
        const additionalStyles = _.isArray(this.props.style) ? this.props.style : [this.props.style];

        return (
            <View style={[this.props.themeStyles.alignItemsCenter, ...additionalStyles]}>
                <View style={[this.props.themeStyles.pRelative, this.props.themeStyles.avatarLarge]}>
                    <OfflineWithFeedback
                        pendingAction={this.props.pendingAction}
                        errors={this.props.errors}
                        errorRowStyles={this.props.errorRowStyles}
                        onClose={this.props.onErrorClose}
                    >
                        <Tooltip text={this.props.translate('avatarWithImagePicker.editImage')}>
                            <PressableWithoutFeedback
                                onPress={() => this.setState((prev) => ({isMenuVisible: !prev.isMenuVisible}))}
                                role={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
                                accessibilityLabel={this.props.translate('avatarWithImagePicker.editImage')}
                                disabled={this.state.isAvatarCropModalOpen}
                                ref={this.anchorRef}
                            >
                                <View>
                                    {this.props.source ? (
                                        <Avatar
                                            containerStyles={this.props.themeStyles.avatarLarge}
                                            imageStyles={[this.props.themeStyles.avatarLarge, this.props.themeStyles.alignSelfCenter]}
                                            source={this.props.source}
                                            fallbackIcon={this.props.fallbackIcon}
                                            size={this.props.size}
                                            type={this.props.type}
                                        />
                                    ) : (
                                        <DefaultAvatar />
                                    )}
                                </View>
                                <View style={[this.props.themeStyles.smallEditIcon, this.props.themeStyles.smallAvatarEditIcon]}>
                                    <Icon
                                        src={Expensicons.Camera}
                                        width={variables.iconSizeSmall}
                                        height={variables.iconSizeSmall}
                                        fill={this.props.theme.textLight}
                                    />
                                </View>
                            </PressableWithoutFeedback>
                        </Tooltip>
                    </OfflineWithFeedback>
                    <AttachmentModal
                        headerTitle={this.props.headerTitle}
                        source={this.props.previewSource}
                        originalFileName={this.props.originalFileName}
                        fallbackSource={this.props.fallbackIcon}
                    >
                        {({show}) => (
                            <AttachmentPicker type={CONST.ATTACHMENT_PICKER_TYPE.IMAGE}>
                                {({openPicker}) => {
                                    const menuItems = [
                                        {
                                            icon: Expensicons.Upload,
                                            text: this.props.translate('avatarWithImagePicker.uploadPhoto'),
                                            onSelected: () => {
                                                if (Browser.isSafari()) {
                                                    return;
                                                }
                                                openPicker({
                                                    onPicked: this.showAvatarCropModal,
                                                });
                                            },
                                        },
                                    ];

                                    // If current avatar isn't a default avatar, allow Remove Photo option
                                    if (!this.props.isUsingDefaultAvatar) {
                                        menuItems.push({
                                            icon: Expensicons.Trashcan,
                                            text: this.props.translate('avatarWithImagePicker.removePhoto'),
                                            onSelected: () => {
                                                this.setError(null, {});
                                                this.props.onImageRemoved();
                                            },
                                        });

                                        menuItems.push({
                                            icon: Expensicons.Eye,
                                            text: this.props.translate('avatarWithImagePicker.viewPhoto'),
                                            onSelected: () => show(),
                                        });
                                    }
                                    return (
                                        <PopoverMenu
                                            isVisible={this.state.isMenuVisible}
                                            onClose={() => this.setState({isMenuVisible: false})}
                                            onItemSelected={(item, index) => {
                                                this.setState({isMenuVisible: false});
                                                // In order for the file picker to open dynamically, the click
                                                // function must be called from within a event handler that was initiated
                                                // by the user on Safari.
                                                if (index === 0 && Browser.isSafari()) {
                                                    openPicker({
                                                        onPicked: this.showAvatarCropModal,
                                                    });
                                                }
                                            }}
                                            menuItems={menuItems}
                                            anchorPosition={this.props.anchorPosition}
                                            withoutOverlay
                                            anchorRef={this.anchorRef}
                                            anchorAlignment={this.props.anchorAlignment}
                                        />
                                    );
                                }}
                            </AttachmentPicker>
                        )}
                    </AttachmentModal>
                </View>
                {this.state.validationError && (
                    <DotIndicatorMessage
                        style={[this.props.themeStyles.mt6]}
                        messages={{0: this.props.translate(this.state.validationError, this.state.phraseParam)}}
                        type="error"
                    />
                )}
                <AvatarCropModal
                    onClose={this.hideAvatarCropModal}
                    isVisible={this.state.isAvatarCropModalOpen}
                    onSave={this.props.onImageSelected}
                    imageUri={this.state.imageUri}
                    imageName={this.state.imageName}
                    imageType={this.state.imageType}
                    maskImage={this.props.editorMaskImage}
                />
            </View>
        );
    }
}

AvatarWithImagePicker.propTypes = propTypes;
AvatarWithImagePicker.defaultProps = defaultProps;

export default compose(withLocalize, withNavigationFocus, withThemeStyles, withTheme)(AvatarWithImagePicker);
