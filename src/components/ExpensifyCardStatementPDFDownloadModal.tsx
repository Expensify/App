import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {downloadExpensifyCardStatementPDF} from '@libs/ExpensifyCardStatementUtils';
import type {ExpensifyCardStatementParams} from '@libs/ExpensifyCardStatementUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ActivityIndicator from './ActivityIndicator';
import Button from './Button';
import Header from './Header';
import Icon from './Icon';
import Modal from './Modal';
import {PressableWithFeedback} from './Pressable';
import Text from './Text';

type ExpensifyCardStatementPDFDownloadModalProps = {
    statementParams: ExpensifyCardStatementParams;
    isVisible: boolean;
    onClose: () => void;
    onModalHide?: () => void;
};

function ExpensifyCardStatementPDFDownloadModal({statementParams, isVisible, onClose, onModalHide}: ExpensifyCardStatementPDFDownloadModalProps) {
    const shouldAutoDownloadPDF = useRef(false);

    const [expensifyCardStatement] = useOnyx(ONYXKEYS.EXPENSIFY_CARD_STATEMENT);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const {translate} = useLocalize();
    // We need to use isSmallScreenWidth here because the Modal breaks in RHP with shouldUseNarrowLayout.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();
    const theme = useTheme();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Close']);

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserLogin = currentUserPersonalDetails?.login ?? '';
    const encryptedAuthToken = session?.encryptedAuthToken ?? '';
    const isGeneratingPDF = expensifyCardStatement?.isGenerating === true;
    const statementFileName = expensifyCardStatement?.[statementParams.statementKey];
    const hasFinishedPDFDownload = !isGeneratingPDF && typeof statementFileName === 'string' && statementFileName.length > 0;

    const messagePDF = hasFinishedPDFDownload ? translate('reportDetailsPage.successPDF') : translate('reportDetailsPage.waitForPDF');

    useEffect(() => {
        shouldAutoDownloadPDF.current = isVisible;
    }, [isVisible]);

    useEffect(() => {
        if (!isVisible || !shouldAutoDownloadPDF.current || !hasFinishedPDFDownload) {
            return;
        }

        downloadExpensifyCardStatementPDF(translate, statementFileName, statementParams.statementKey, currentUserLogin, encryptedAuthToken);
        shouldAutoDownloadPDF.current = false;
    }, [currentUserLogin, encryptedAuthToken, hasFinishedPDFDownload, isGeneratingPDF, isVisible, statementFileName, statementParams.statementKey, translate]);

    const pdfLoadingReasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'SearchBulkActions.ExpensifyCardStatementPDFModal',
    };

    return (
        <Modal
            onClose={onClose}
            onModalHide={onModalHide}
            isVisible={isVisible}
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CONFIRM}
            innerContainerStyle={styles.pv0}
        >
            <View style={[styles.flexRow, styles.m5]}>
                <View style={[styles.flex1]}>
                    <View style={[styles.flexRow, styles.mb4]}>
                        <View style={[styles.flex1]}>
                            <View style={[styles.flexRow]}>
                                <Header title={translate('reportDetailsPage.generatingPDF')} />
                            </View>
                            <Text style={[styles.mt5, styles.textAlignLeft]}>{messagePDF}</Text>
                        </View>

                        {!hasFinishedPDFDownload && (
                            <View style={[styles.dFlex, styles.justifyContentEnd]}>
                                <ActivityIndicator
                                    size={CONST.ACTIVITY_INDICATOR_SIZE.SMALL}
                                    color={theme.textSupporting}
                                    style={styles.ml3}
                                    reasonAttributes={pdfLoadingReasonAttributes}
                                />
                            </View>
                        )}
                    </View>
                    <Button
                        style={[styles.mt3, styles.noSelect]}
                        onPress={() => {
                            if (!hasFinishedPDFDownload) {
                                onClose();
                                return;
                            }

                            downloadExpensifyCardStatementPDF(translate, statementFileName, statementParams.statementKey, currentUserLogin, encryptedAuthToken);
                        }}
                        text={hasFinishedPDFDownload ? translate('common.download') : translate('common.cancel')}
                    />
                </View>
                <PressableWithFeedback
                    onPress={onClose}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={translate('common.close')}
                    wrapperStyle={[styles.pAbsolute, styles.r0]}
                    sentryLabel={CONST.SENTRY_LABEL.MORE_MENU.CLOSE_PDF_MODAL}
                >
                    <Icon
                        src={expensifyIcons.Close}
                        fill={theme.icon}
                    />
                </PressableWithFeedback>
            </View>
        </Modal>
    );
}

export default ExpensifyCardStatementPDFDownloadModal;
