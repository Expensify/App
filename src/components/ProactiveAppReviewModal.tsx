import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import Button from './ButtonComposed';
import ImageSVG from './ImageSVG';
import Modal from './Modal';
import Text from './Text';

type ProactiveAppReviewModalProps = {
    /** Whether modal is visible */
    isVisible: boolean;

    /** Callback for when user selects "Yeah!" */
    onPositive: () => void;

    /** Callback for when user selects "Not really." */
    onNegative: () => void;

    /** Callback for closing/skipping modal */
    onSkip: () => void;
};

function ProactiveAppReviewModal({isVisible, onPositive, onNegative, onSkip}: ProactiveAppReviewModalProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['ToddWithPhones']);
    const {translate} = useLocalize();
    const bottomSafeAreaPaddingStyle = useBottomSafeSafeAreaPaddingStyle({
        addBottomSafeAreaPadding: shouldUseNarrowLayout,
        addOfflineIndicatorBottomSafeAreaPadding: false,
        style: styles.m5,
    });

    return (
        <Modal
            onClose={onSkip}
            isVisible={isVisible}
            shouldTreatModalAsCovering
            type={shouldUseNarrowLayout ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CONFIRM}
            innerContainerStyle={styles.pv0}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <View style={bottomSafeAreaPaddingStyle}>
                {/* Todd with phones illustration */}
                <View style={[styles.alignItemsCenter, styles.mb3]}>
                    <ImageSVG
                        src={illustrations.ToddWithPhones}
                        contentFit="contain"
                        width={200}
                        height={200}
                    />
                </View>

                {/* Title and prompt */}
                <View>
                    <Text style={[styles.textHeadlineH1, styles.textAlignCenter, styles.mb3]}>{translate('proactiveAppReview.title')}</Text>
                    <Text style={[styles.textAlignCenter, styles.textSupporting]}>{translate('proactiveAppReview.description')}</Text>
                </View>

                {/* Buttons */}
                <Button
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={CONST.BUTTON_SIZE.LARGE}
                    style={[styles.mt5]}
                    onPress={onPositive}
                >
                    <Button.KeyboardShortcut />
                    <Button.Text>{translate('proactiveAppReview.positiveButton')}</Button.Text>
                </Button>
                <Button
                    size={CONST.BUTTON_SIZE.LARGE}
                    style={[styles.mt3, styles.noSelect]}
                    onPress={onNegative}
                >
                    <Button.Text>{translate('proactiveAppReview.negativeButton')}</Button.Text>
                </Button>
            </View>
        </Modal>
    );
}

export default ProactiveAppReviewModal;
