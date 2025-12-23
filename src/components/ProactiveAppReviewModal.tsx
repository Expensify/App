import React from 'react';
import {View} from 'react-native';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
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
                    <Text style={[styles.textHeadlineH1, styles.textAlignCenter, styles.mb3]}>Enjoying New Expensify?</Text>
                    <Text style={[styles.textAlignCenter, styles.textSupporting]}>{'Let us know so we can help make your\nexpensing experience even better.'}</Text>
                </View>

                {/* Buttons */}
                <Button
                    success
                    style={[styles.mt5]}
                    onPress={onPositive}
                    pressOnEnter
                    text="Yeah!"
                    large
                />
                <Button
                    style={[styles.mt3, styles.noSelect]}
                    onPress={onNegative}
                    text="Not really"
                    large
                />
            </View>
        </Modal>
    );
}

export default ProactiveAppReviewModal;
