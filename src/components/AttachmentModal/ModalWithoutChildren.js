import lodashGet from 'lodash/get';
import React, {useMemo, useRef, useState} from 'react';
import {Animated, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import useLocalize from '@hooks/useLocalize';
import useWindowDimensions from '@hooks/useWindowDimensions';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import * as StyleUtils from '@styles/StyleUtils';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import AttachmentCarousel from '@components/Attachments/AttachmentCarousel';
import AttachmentView from '@components/Attachments/AttachmentView';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import HeaderGap from '@components/HeaderGap';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import Modal from '@components/Modal';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import withLocalize from '@components/withLocalize';
import withWindowDimensions from '@components/withWindowDimensions';

function ModalWithoutChildren({
  isAttachmentReceipt,
  closeModal,
  downloadAttachment,
  source,
  setIsDeleteReceiptConfirmModalVisible,
  modalType,
  submitAndClose,
  isModalOpen,
  headerTitle,
  shouldShowDownloadButton,
  shouldShowThreeDotsButton,
  onNavigate,
  updateConfirmButtonVisibility,
  setDownloadButtonVisibility,
  sourceForAttachmentView,
  isAuthTokenRequired,
  file,
  confirmButtonFadeAnimation,
  isConfirmButtonDisabled,
  isDeleteReceiptConfirmModalVisible,
  deleteAndCloseModal,
  closeConfirmModal,
  isAttachmentInvalid,
  attachmentInvalidReasonTitle,
  attachmentInvalidReason,
  ...props
}) {
  const theme = useTheme();
  const styles = useThemeStyles();
  const onModalHideCallbackRef = useRef(null);
  const [shouldLoadAttachment, setShouldLoadAttachment] = useState(false);
  const {windowWidth} = useWindowDimensions();

  const {translate} = useLocalize();

  const threeDotsMenuItems = useMemo(() => {
    if (!isAttachmentReceipt || !props.parentReport || !props.parentReportActions) {
        return [];
    }
    const menuItems = [];
    const parentReportAction = props.parentReportActions[props.report.parentReportActionID];

    const canEdit = ReportUtils.canEditFieldOfMoneyRequest(parentReportAction, props.parentReport.reportID, CONST.EDIT_REQUEST_FIELD.RECEIPT);
    if (canEdit) {
        menuItems.push({
            icon: Expensicons.Camera,
            text: props.translate('common.replace'),
            onSelected: () => {
                onModalHideCallbackRef.current = () => Navigation.navigate(ROUTES.EDIT_REQUEST.getRoute(props.report.reportID, CONST.EDIT_REQUEST_FIELD.RECEIPT));
                closeModal();
            },
        });
    }
    menuItems.push({
        icon: Expensicons.Download,
        text: props.translate('common.download'),
        onSelected: () => downloadAttachment(source),
    });
    if (TransactionUtils.hasReceipt(props.transaction) && !TransactionUtils.isReceiptBeingScanned(props.transaction) && canEdit) {
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
  }, [isAttachmentReceipt, props.parentReport, props.parentReportActions, props.policy, props.transaction, file]);


  return (
    <>
      <Modal
        type={modalType}
        onSubmit={submitAndClose}
        onClose={closeModal}
        isVisible={isModalOpen}
        backgroundColor={theme.componentBG}
        onModalShow={() => {
            props.onModalShow();
            setShouldLoadAttachment(true);
        }}
        onModalHide={(e) => {
            props.onModalHide(e);
            if (onModalHideCallbackRef.current) {
                onModalHideCallbackRef.current();
            }

            setShouldLoadAttachment(false);
        }}
        propagateSwipe
      >
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
            shouldOverlay
        />
        <View style={styles.imageModalImageCenterContainer}>
            {!_.isEmpty(props.report) ? (
                <AttachmentCarousel
                    report={props.report}
                    onNavigate={onNavigate}
                    source={props.source}
                    onClose={closeModal}
                    onToggleKeyboard={updateConfirmButtonVisibility}
                    setDownloadButtonVisibility={setDownloadButtonVisibility}
                />
            ) : (
                Boolean(sourceForAttachmentView) &&
                shouldLoadAttachment && (
                    <AttachmentView
                        containerStyles={[styles.mh5]}
                        source={sourceForAttachmentView}
                        isAuthTokenRequired={isAuthTokenRequired}
                        file={file}
                        onToggleKeyboard={updateConfirmButtonVisibility}
                        isWorkspaceAvatar={props.isWorkspaceAvatar}
                        fallbackSource={props.fallbackSource}
                        isUsedInAttachmentModal
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
        {isAttachmentReceipt && (
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
      </Modal>
      {!isAttachmentReceipt && (
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
    </>
  )
}

// Prop types and callbacks defined in `index.js` file
ModalWithoutChildren.propTypes = undefined;
ModalWithoutChildren.displayName = 'ModalWithoutChildren';

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
)(ModalWithoutChildren);
