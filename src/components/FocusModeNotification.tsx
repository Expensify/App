import React from 'react';
import {View} from 'react-native';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import colors from '@styles/theme/colors';
import ConfirmModal from './ConfirmModal';
import RenderHTML from './RenderHTML';

type FocusModeNotificationProps = {
    onClose: () => void;
};

function FocusModeNotification({onClose}: FocusModeNotificationProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const illustrations = useMemoizedLazyIllustrations(['ThreeLeggedLaptopWoman'] as const);
    const {environmentURL} = useEnvironment();
    const {translate} = useLocalize();
    const priorityModePageUrl = `${environmentURL}/settings/preferences/priority-mode`;

    return (
        <ConfirmModal
            title={translate('focusModeUpdateModal.title')}
            confirmText={translate('common.buttonConfirm')}
            onConfirm={onClose}
            shouldShowCancelButton={false}
            onBackdropPress={onClose}
            onCancel={onClose}
            prompt={
                <View style={[styles.renderHTML, styles.flexRow]}>
                    <RenderHTML html={translate('focusModeUpdateModal.prompt', {priorityModePageUrl})} />
                </View>
            }
            isVisible
            image={illustrations.ThreeLeggedLaptopWoman}
            imageStyles={StyleUtils.getBackgroundColorStyle(colors.pink800)}
            titleStyles={[styles.textHeadline, styles.mbn3]}
        />
    );
}

FocusModeNotification.displayName = 'FocusModeNotification';
export default FocusModeNotification;
