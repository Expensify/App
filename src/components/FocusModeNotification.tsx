import React, {useEffect} from 'react';
import {View} from 'react-native';
import useConfirmModal from '@hooks/useConfirmModal';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import colors from '@styles/theme/colors';
import RenderHTML from './RenderHTML';

type FocusModeNotificationProps = {
    onClose: () => void;
};

function FocusModeNotification({onClose}: FocusModeNotificationProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const illustrations = useMemoizedLazyIllustrations(['ThreeLeggedLaptopWoman']);
    const {environmentURL} = useEnvironment();
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const priorityModePageUrl = `${environmentURL}/settings/preferences/priority-mode`;

    useEffect(() => {
        showConfirmModal({
            title: translate('focusModeUpdateModal.title'),
            confirmText: translate('common.buttonConfirm'),
            onConfirm: onClose,
            shouldShowCancelButton: false,
            onBackdropPress: onClose,
            onCancel: onClose,
            prompt: (
                <View style={[styles.renderHTML, styles.flexRow]}>
                    <RenderHTML html={translate('focusModeUpdateModal.prompt', priorityModePageUrl)} />
                </View>
            ),
            image: illustrations.ThreeLeggedLaptopWoman,
            imageStyles: StyleUtils.getBackgroundColorStyle(colors.pink800),
            titleStyles: [styles.textHeadline, styles.mbn3],
        });
    }, [showConfirmModal, translate, onClose, styles, illustrations.ThreeLeggedLaptopWoman, StyleUtils, priorityModePageUrl]);

    return null;
}

export default FocusModeNotification;
