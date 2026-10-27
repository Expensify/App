import ActivityIndicator from '@components/ActivityIndicator';
import BlockingView from '@components/BlockingViews/BlockingView';
import FullPageErrorView from '@components/BlockingViews/FullPageErrorView';
import EmbeddedWisePage from '@components/EmbeddedWisePage';
import Header from '@components/Header';
import Modal from '@components/Modal';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearWiseKYCReviewEmbeddedLink, getWiseKYCReviewEmbeddedLink} from '@userActions/Wise';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';

type WiseKYCReviewOverlayProps = {
    /** The business bank account Wise is reviewing */
    bankAccountID: number;

    isVisible: boolean;

    /** Closes the overlay and leaves the user where they were */
    onClose: () => void;

    /** The user finished Wise's flow */
    onDone: () => void;
};

/** Wise's hosted KYC page as a full-screen overlay. Our header shows only until Wise's page is ready, because from then on Wise's page owns the whole screen. */
function WiseKYCReviewOverlay({bankAccountID, isVisible, onClose, onDone}: WiseKYCReviewOverlayProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['OfflineCloud']);
    const [embeddedLink] = useOnyx(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK);
    const [isWisePageReady, setIsWisePageReady] = useState(false);
    const [hasWisePageFailed, setHasWisePageFailed] = useState(false);

    const requestLink = () => {
        setIsWisePageReady(false);
        setHasWisePageFailed(false);
        getWiseKYCReviewEmbeddedLink(bankAccountID);
    };

    const {isOffline} = useNetwork({
        onReconnect: () => {
            if (!isVisible || !!embeddedLink?.url) {
                return;
            }
            requestLink();
        },
    });

    const handleModalShow = () => {
        if (isOffline) {
            return;
        }
        requestLink();
    };

    const handleModalHide = () => {
        clearWiseKYCReviewEmbeddedLink();
        setIsWisePageReady(false);
        setHasWisePageFailed(false);
    };

    const hasError = hasWisePageFailed || !isEmptyObject(embeddedLink?.errors);

    // Once Wise's page is showing it stays up while offline, since reloading it would need a new link
    const isBlockedOffline = isOffline && !isWisePageReady;
    const isShowingWisePage = isWisePageReady && !hasError;

    const renderContent = () => {
        if (isBlockedOffline) {
            return (
                <BlockingView
                    icon={icons.OfflineCloud}
                    iconColor={theme.offline}
                    title={translate('common.youAppearToBeOffline')}
                    subtitle={translate('common.thisFeatureRequiresInternet')}
                />
            );
        }

        if (hasError) {
            return (
                <FullPageErrorView
                    shouldShow
                    title={translate('walletPage.wiseKYCReview.errorTitle')}
                    subtitle={translate('walletPage.wiseKYCReview.errorSubtitle')}
                    buttonTranslationKey="common.tryAgain"
                    onButtonPress={requestLink}
                />
            );
        }

        return (
            <View style={styles.flex1}>
                {!!embeddedLink?.url && (
                    <EmbeddedWisePage
                        // A new link replaces the page instead of navigating the old one
                        key={embeddedLink.url}
                        url={embeddedLink.url}
                        title={translate('walletPage.wiseKYCReview.embeddedPageTitle')}
                        onReady={() => setIsWisePageReady(true)}
                        onDone={onDone}
                        onCancel={onClose}
                        onError={() => setHasWisePageFailed(true)}
                    />
                )}
                {!isWisePageReady && (
                    <View style={[StyleSheet.absoluteFill, styles.fullScreenLoading]}>
                        <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
                    </View>
                )}
            </View>
        );
    };

    return (
        <Modal
            isVisible={isVisible}
            onClose={onClose}
            onModalShow={handleModalShow}
            onModalHide={handleModalHide}
            type={CONST.MODAL.MODAL_TYPE.FULLSCREEN}
            style={styles.appBG}
            innerContainerStyle={styles.flex1}
        >
            <View style={[styles.flex1, styles.appBG, StyleUtils.getPlatformSafeAreaPadding(insets)]}>
                {!isShowingWisePage && (
                    <Header>
                        <Header.Title title={translate('walletPage.wiseKYCReview.headerTitle')} />
                        <Header.Right>
                            <Header.CloseButton onPress={onClose} />
                        </Header.Right>
                    </Header>
                )}
                {renderContent()}
            </View>
        </Modal>
    );
}

export default WiseKYCReviewOverlay;
