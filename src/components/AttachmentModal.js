import Str from 'expensify-common/lib/str';
import lodashExtend from 'lodash/extend';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Animated, Keyboard, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import compose from '@libs/compose';
import fileDownload from '@libs/fileDownload';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import useNativeDriver from '@libs/useNativeDriver';
import reportPropTypes from '@pages/reportPropTypes';
import variables from '@styles/variables';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import AttachmentCarousel from './Attachments/AttachmentCarousel';
import AttachmentView from './Attachments/AttachmentView';
import BlockingView from './BlockingViews/BlockingView';
import Button from './Button';
import ConfirmModal from './ConfirmModal';
import FullScreenLoadingIndicator from './FullscreenLoadingIndicator';
import HeaderGap from './HeaderGap';
import HeaderWithBackButton from './HeaderWithBackButton';
import * as Expensicons from './Icon/Expensicons';
import * as Illustrations from './Icon/Illustrations';
import sourcePropTypes from './Image/sourcePropTypes';
import Modal from './Modal';
import SafeAreaConsumer from './SafeAreaConsumer';
import transactionPropTypes from './transactionPropTypes';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';

/**
 * Modal render prop component that exposes modal launching triggers that can be used
 * to display a full size image or PDF modally with optional confirmation button.
 */

const propTypes = {
    /** Optional source (URL, SVG function) for the image shown. If not passed in via props must be specified when modal is opened. */
    source: PropTypes.oneOfType([PropTypes.string, sourcePropTypes]),

    /** Optional callback to fire when we want to preview an image and approve it for use. */
    onConfirm: PropTypes.func,

    /** Whether the modal should be open by default */
    defaultOpen: PropTypes.bool,

    /** Optional callback to fire when we want to do something after modal show. */
    onModalShow: PropTypes.func,

    /** Optional callback to fire when we want to do something after modal hide. */
    onModalHide: PropTypes.func,

    /** Trigger when we explicity click close button in ProfileAttachment modal */
    onModalClose: PropTypes.func,

    /** Optional callback to fire when we want to do something after attachment carousel changes. */
    onCarouselAttachmentChange: PropTypes.func,

    /** Optional original filename when uploading */
    originalFileName: PropTypes.string,

    /** A function as a child to pass modal launching methods to */
    children: PropTypes.func,

    /** Whether source url requires authentication */
    isAuthTokenRequired: PropTypes.bool,

    /** Determines if download Button should be shown or not */
    allowDownload: PropTypes.bool,

    /** Title shown in the header of the modal */
    headerTitle: PropTypes.string,

    /** The report that has this attachment */
    report: reportPropTypes,

    /** The transaction associated with the receipt attachment, if any */
    transaction: transactionPropTypes,

    /** The data is loading or not */
    isLoading: PropTypes.bool,

    /** Should display not found page or not */
    shouldShowNotFoundPage: PropTypes.bool,

    ...withLocalizePropTypes,

    ...windowDimensionsPropTypes,

    /** Denotes whether it is a workspace avatar or not */
    isWorkspaceAvatar: PropTypes.bool,

    /** Whether it is a receipt attachment or not */
    isReceiptAttachment: PropTypes.bool,

    /** Whether the receipt can be replaced */
    canEditReceipt: PropTypes.bool,
};

const defaultProps = {
    source: '',
    onConfirm: null,
    defaultOpen: false,
    originalFileName: '',
    children: null,
    isAuthTokenRequired: false,
    allowDownload: false,
    headerTitle: null,
    report: {},
    transaction: {},
    onModalShow: () => {},
    onModalHide: () => {},
    onCarouselAttachmentChange: () => {},
    isWorkspaceAvatar: false,
    onModalClose: () => {},
    isLoading: false,
    shouldShowNotFoundPage: false,
    isReceiptAttachment: false,
    canEditReceipt: false,
};

function AttachmentModal(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [isModalOpen, setIsModalOpen] = useState(props.defaultOpen);
    const [shouldLoadAttachment, setShouldLoadAttachment] = useState(false);
    const [isAttachmentInvalid, setIsAttachmentInvalid] = useState(false);
    const [isDeleteReceiptConfirmModalVisible, setIsDeleteReceiptConfirmModalVisible] = useState(false);
    const [isAuthTokenRequired, setIsAuthTokenRequired] = useState(props.isAuthTokenRequired);
    const [attachmentInvalidReasonTitle, setAttachmentInvalidReasonTitle] = useState('');
    const [attachmentInvalidReason, setAttachmentInvalidReason] = useState(null);
    const [source, setSource] = useState(() => props.source);
    const [modalType, setModalType] = useState(CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE);
    const [isConfirmButtonDisabled, setIsConfirmButtonDisabled] = useState(false);
    const [confirmButtonFadeAnimation] = useState(() => new Animated.Value(1));
    const [isDownloadButtonReadyToBeShown, setIsDownloadButtonReadyToBeShown] = React.useState(true);
    const {windowWidth} = useWindowDimensions();

    const isOverlayModalVisible = (props.isReceiptAttachment && isDeleteReceiptConfirmModalVisible) || (!props.isReceiptAttachment && isAttachmentInvalid);

    const [file, setFile] = useState(
        props.originalFileName
            ? {
                  name: props.originalFileName,
              }
            : undefined,
    );
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    useEffect(() => {
        setFile(props.originalFileName ? {name: props.originalFileName} : undefined);
    }, [props.originalFileName]);

    const onCarouselAttachmentChange = props.onCarouselAttachmentChange;

    /**
     * Keeps the attachment source in sync with the attachment displayed currently in the carousel.
     * @param {{ source: String, isAuthTokenRequired: Boolean, file: { name: string }, isReceipt: Boolean }} attachment
     */
    const onNavigate = useCallback(
        (attachment) => {
            setSource(attachment.source);
            setFile(attachment.file);
            setIsAuthTokenRequired(attachment.isAuthTokenRequired);
            onCarouselAttachmentChange(attachment);
        },
        [onCarouselAttachmentChange],
    );

    /**
     * If our attachment is a PDF, return the unswipeable Modal type.
     * @param {String} sourceURL
     * @param {Object} _file
     * @returns {String}
     */
    const getModalType = useCallback(
        (sourceURL, _file) =>
            sourceURL && (Str.isPDF(sourceURL) || (_file && Str.isPDF(_file.name || translate('attachmentView.unknownFilename'))))
                ? CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE
                : CONST.MODAL.MODAL_TYPE.CENTERED,
        [translate],
    );

    const setDownloadButtonVisibility = useCallback(
        (isButtonVisible) => {
            if (isDownloadButtonReadyToBeShown === isButtonVisible) {
                return;
            }
            setIsDownloadButtonReadyToBeShown(isButtonVisible);
        },
        [isDownloadButtonReadyToBeShown],
    );

    /**
     * Download the currently viewed attachment.
     */
    const downloadAttachment = useCallback(() => {
        let sourceURL = source;
        if (isAuthTokenRequired) {
            sourceURL = addEncryptedAuthTokenToURL(sourceURL);
        }

        fileDownload(sourceURL, lodashGet(file, 'name', ''));

        // At ios, if the keyboard is open while opening the attachment, then after downloading
        // the attachment keyboard will show up. So, to fix it we need to dismiss the keyboard.
        Keyboard.dismiss();
    }, [isAuthTokenRequired, source, file]);

    /**
     * Execute the onConfirm callback and close the modal.
     */
    const submitAndClose = useCallback(() => {
        // If the modal has already been closed or the confirm button is disabled
        // do not submit.
        if (!isModalOpen || isConfirmButtonDisabled) {
            return;
        }

        if (props.onConfirm) {
            props.onConfirm(lodashExtend(file, {source}));
        }

        setIsModalOpen(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isModalOpen, isConfirmButtonDisabled, props.onConfirm, file, source]);

    /**
     * Close the confirm modals.
     */
    const closeConfirmModal = useCallback(() => {
        setIsAttachmentInvalid(false);
        setIsDeleteReceiptConfirmModalVisible(false);
    }, []);

    /**
     * Detach the receipt and close the modal.
     */
    const deleteAndCloseModal = useCallback(() => {
        IOU.detachReceipt(props.transaction.transactionID, props.report.reportID);
        setIsDeleteReceiptConfirmModalVisible(false);
        Navigation.dismissModal(props.report.reportID);
    }, [props.transaction, props.report]);

    /**
     * @param {Object} _file
     * @returns {Boolean}
     */
    const isValidFile = useCallback((_file) => {
        if (lodashGet(_file, 'size', 0) > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
            setIsAttachmentInvalid(true);
            setAttachmentInvalidReasonTitle('attachmentPicker.attachmentTooLarge');
            setAttachmentInvalidReason('attachmentPicker.sizeExceeded');
            return false;
        }

        if (lodashGet(_file, 'size', 0) < CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
            setIsAttachmentInvalid(true);
            setAttachmentInvalidReasonTitle('attachmentPicker.attachmentTooSmall');
            setAttachmentInvalidReason('attachmentPicker.sizeNotMet');
            return false;
        }

        return true;
    }, []);
    /**
     * @param {Object} _data
     * @returns {Boolean}
     */
    const isDirectoryCheck = useCallback((_data) => {
        if (typeof _data.webkitGetAsEntry === 'function' && _data.webkitGetAsEntry().isDirectory) {
            setIsAttachmentInvalid(true);
            setAttachmentInvalidReasonTitle('attachmentPicker.attachmentError');
            setAttachmentInvalidReason('attachmentPicker.folderNotAllowedMessage');
            return false;
        }
        return true;
    }, []);

    /**
     * @param {Object} _data
     */
    const validateAndDisplayFileToUpload = useCallback(
        (_data) => {
            if (!isDirectoryCheck(_data)) {
                return;
            }
            let fileObject = _data;
            if (typeof _data.getAsFile === 'function') {
                fileObject = _data.getAsFile();
            }
            if (!fileObject) {
                return;
            }

            if (!isValidFile(fileObject)) {
                return;
            }

            if (fileObject instanceof File) {
                /**
                 * Cleaning file name, done here so that it covers all cases:
                 * upload, drag and drop, copy-paste
                 */
                let updatedFile = fileObject;
                const cleanName = FileUtils.cleanFileName(updatedFile.name);
                if (updatedFile.name !== cleanName) {
                    updatedFile = new File([updatedFile], cleanName, {type: updatedFile.type});
                }
                const inputSource = URL.createObjectURL(updatedFile);
                const inputModalType = getModalType(inputSource, updatedFile);
                setIsModalOpen(true);
                setSource(inputSource);
                setFile(updatedFile);
                setModalType(inputModalType);
            } else {
                const inputModalType = getModalType(fileObject.uri, fileObject);
                setIsModalOpen(true);
                setSource(fileObject.uri);
                setFile(fileObject);
                setModalType(inputModalType);
            }
        },
        [isValidFile, getModalType, isDirectoryCheck],
    );

    /**
     * In order to gracefully hide/show the confirm button when the keyboard
     * opens/closes, apply an animation to fade the confirm button out/in. And since
     * we're only updating the opacity of the confirm button, we must also conditionally
     * disable it.
     *
     * @param {Boolean} shouldFadeOut If true, fade out confirm button. Otherwise fade in.
     */
    const updateConfirmButtonVisibility = useCallback(
        (shouldFadeOut) => {
            setIsConfirmButtonDisabled(shouldFadeOut);
            const toValue = shouldFadeOut ? 0 : 1;

            Animated.timing(confirmButtonFadeAnimation, {
                toValue,
                duration: 100,
                useNativeDriver,
            }).start();
        },
        [confirmButtonFadeAnimation],
    );

    /**
     * close the modal
     */
    const closeModal = useCallback(() => {
        setIsModalOpen(false);

        if (typeof props.onModalClose === 'function') {
            props.onModalClose();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.onModalClose]);

    /**
     *  open the modal
     */
    const openModal = useCallback(() => {
        setIsModalOpen(true);
    }, []);

    useEffect(() => {
        setSource(() => props.source);
    }, [props.source]);

    useEffect(() => {
        setIsAuthTokenRequired(props.isAuthTokenRequired);
    }, [props.isAuthTokenRequired]);

    const sourceForAttachmentView = source || props.source;

    const threeDotsMenuItems = useMemo(() => {
        if (!props.isReceiptAttachment || !props.parentReport || !props.parentReportActions) {
            return [];
        }

        const menuItems = [];
        if (props.canEditReceipt) {
            menuItems.push({
                icon: Expensicons.Camera,
                text: props.translate('common.replace'),
                onSelected: () => {
                    closeModal();
                    Navigation.navigate(
                        ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(
                            CONST.IOU.ACTION.EDIT,
                            CONST.IOU.TYPE.REQUEST,
                            props.transaction.transactionID,
                            props.report.reportID,
                            Navigation.getActiveRouteWithoutParams(),
                        ),
                    );
                },
            });
        }
        if (!isOffline) {
            menuItems.push({
                icon: Expensicons.Download,
                text: props.translate('common.download'),
                onSelected: () => downloadAttachment(source),
            });
        }
        if (TransactionUtils.hasReceipt(props.transaction) && !TransactionUtils.isReceiptBeingScanned(props.transaction) && props.canEditReceipt) {
            menuItems.push({
                icon: Expensicons.Trashcan,
                text: props.translate('receipt.deleteReceipt'),
                onSelected: () => {
                    setIsDeleteReceiptConfirmModalVisible(true);
                },
            });
        }
        return menuItems;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.isReceiptAttachment, props.parentReport, props.parentReportActions, props.policy, props.transaction, file, source]);

    // There are a few things that shouldn't be set until we absolutely know if the file is a receipt or an attachment.
    // props.isReceiptAttachment will be null until its certain what the file is, in which case it will then be true|false.
    let headerTitle = props.headerTitle;
    let shouldShowDownloadButton = false;
    let shouldShowThreeDotsButton = false;
    if (!_.isEmpty(props.report)) {
        headerTitle = translate(props.isReceiptAttachment ? 'common.receipt' : 'common.attachment');
        shouldShowDownloadButton = props.allowDownload && isDownloadButtonReadyToBeShown && !props.isReceiptAttachment && !isOffline;
        shouldShowThreeDotsButton = props.isReceiptAttachment && isModalOpen && threeDotsMenuItems.length !== 0;
    }

    return (
        <>
            <Modal
                type={modalType}
                onSubmit={submitAndClose}
                onClose={isOverlayModalVisible ? closeConfirmModal : closeModal}
                isVisible={isModalOpen}
                backgroundColor={theme.componentBG}
                onModalShow={() => {
                    props.onModalShow();
                    setShouldLoadAttachment(true);
                }}
                onModalHide={(e) => {
                    props.onModalHide(e);
                    setShouldLoadAttachment(false);
                }}
                propagateSwipe
            >
                <GestureHandlerRootView style={styles.flex1}>
                    {props.isSmallScreenWidth && <HeaderGap />}
                    <HeaderWithBackButton
                        title={headerTitle}
                        shouldShowBorderBottom
                        shouldShowDownloadButton={shouldShowDownloadButton}
                        onDownloadButtonPress={() => downloadAttachment(source)}
                        shouldShowCloseButton={!props.isSmallScreenWidth}
                        shouldShowBackButton={props.isSmallScreenWidth}
                        onBackButtonPress={closeModal}
                        onCloseButtonPress={closeModal}
                        shouldShowThreeDotsButton={shouldShowThreeDotsButton}
                        threeDotsAnchorPosition={styles.threeDotsPopoverOffsetAttachmentModal(windowWidth)}
                        threeDotsMenuItems={threeDotsMenuItems}
                        shouldOverlayDots
                    />
                    <View style={styles.imageModalImageCenterContainer}>
                        {props.isLoading && <FullScreenLoadingIndicator />}
                        {props.shouldShowNotFoundPage && !props.isLoading && (
                            <BlockingView
                                icon={Illustrations.ToddBehindCloud}
                                iconWidth={variables.modalTopIconWidth}
                                iconHeight={variables.modalTopIconHeight}
                                title={translate('notFound.notHere')}
                                subtitle={translate('notFound.pageNotFound')}
                                linkKey="notFound.goBackHome"
                                shouldShowLink
                                onLinkPress={() => Navigation.dismissModal()}
                            />
                        )}
                        {!_.isEmpty(props.report) && !props.isReceiptAttachment ? (
                            <AttachmentCarousel
                                report={props.report}
                                onNavigate={onNavigate}
                                source={props.source}
                                onToggleKeyboard={updateConfirmButtonVisibility}
                                setDownloadButtonVisibility={setDownloadButtonVisibility}
                            />
                        ) : (
                            Boolean(sourceForAttachmentView) &&
                            shouldLoadAttachment &&
                            !props.isLoading &&
                            !props.shouldShowNotFoundPage && (
                                <AttachmentView
                                    containerStyles={[styles.mh5]}
                                    source={sourceForAttachmentView}
                                    isAuthTokenRequired={isAuthTokenRequired}
                                    file={file}
                                    onToggleKeyboard={updateConfirmButtonVisibility}
                                    isWorkspaceAvatar={props.isWorkspaceAvatar}
                                    fallbackSource={props.fallbackSource}
                                    isUsedInAttachmentModal
                                    transactionID={props.transaction.transactionID}
                                />
                            )
                        )}
                    </View>
                    {/* If we have an onConfirm method show a confirmation button */}
                    {Boolean(props.onConfirm) && (
                        <SafeAreaConsumer>
                            {({safeAreaPaddingBottomStyle}) => (
                                <Animated.View style={[StyleUtils.fade(confirmButtonFadeAnimation), safeAreaPaddingBottomStyle]}>
                                    <Button
                                        success
                                        style={[styles.buttonConfirm, props.isSmallScreenWidth ? {} : styles.attachmentButtonBigScreen]}
                                        textStyles={[styles.buttonConfirmText]}
                                        text={translate('common.send')}
                                        onPress={submitAndClose}
                                        disabled={isConfirmButtonDisabled}
                                        pressOnEnter
                                    />
                                </Animated.View>
                            )}
                        </SafeAreaConsumer>
                    )}
                    {props.isReceiptAttachment && (
                        <ConfirmModal
                            title={translate('receipt.deleteReceipt')}
                            isVisible={isDeleteReceiptConfirmModalVisible}
                            onConfirm={deleteAndCloseModal}
                            onCancel={closeConfirmModal}
                            prompt={translate('receipt.deleteConfirmation')}
                            confirmText={translate('common.delete')}
                            cancelText={translate('common.cancel')}
                            danger
                        />
                    )}
                </GestureHandlerRootView>
            </Modal>
            {!props.isReceiptAttachment && (
                <ConfirmModal
                    title={attachmentInvalidReasonTitle ? translate(attachmentInvalidReasonTitle) : ''}
                    onConfirm={closeConfirmModal}
                    onCancel={closeConfirmModal}
                    isVisible={isAttachmentInvalid}
                    prompt={attachmentInvalidReason ? translate(attachmentInvalidReason) : ''}
                    confirmText={translate('common.close')}
                    shouldShowCancelButton={false}
                />
            )}

            {props.children &&
                props.children({
                    displayFileInModal: validateAndDisplayFileToUpload,
                    show: openModal,
                })}
        </>
    );
}

AttachmentModal.propTypes = propTypes;
AttachmentModal.defaultProps = defaultProps;
AttachmentModal.displayName = 'AttachmentModal';
export default compose(
    withWindowDimensions,
    withLocalize,
    withOnyx({
        transaction: {
            key: ({report}) => {
                if (!report) {
                    return undefined;
                }
                const parentReportAction = ReportActionsUtils.getReportAction(report.parentReportID, report.parentReportActionID);
                const transactionID = lodashGet(parentReportAction, ['originalMessage', 'IOUTransactionID'], 0);
                return `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`;
            },
        },
        parentReport: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT}${report ? report.parentReportID : '0'}`,
        },
        policy: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report ? report.policyID : '0'}`,
        },
        parentReportActions: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report ? report.parentReportID : '0'}`,
            canEvict: false,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(AttachmentModal);
