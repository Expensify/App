import React from 'react';
import {View} from 'react-native';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import Button from './Button';
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

    return (
        <Modal
            onClose={onSkip}
            isVisible={isVisible}
            type={shouldUseNarrowLayout ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CONFIRM}
            innerContainerStyle={styles.pv0}
        >
            <View style={[styles.m5]}>
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
                    success
                    style={[styles.mt5]}
                    onPress={onPositive}
                    pressOnEnter
                    text={translate('proactiveAppReview.positiveButton')}
                    large
                />
                <Button
                    style={[styles.mt3, styles.noSelect]}
                    onPress={onNegative}
                    text={translate('proactiveAppReview.negativeButton')}
                    large
                />
            </View>
        </Modal>
    );
}

export default ProactiveAppReviewModal;
