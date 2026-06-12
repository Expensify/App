import React from 'react';
import CenteredModalLayout from '@components/CenteredModalLayout';
import ChangeWorkspaceMenuSectionList from '@components/ChangeWorkspaceMenuSectionList';
import FeatureTrainingContent from '@components/FeatureTrainingContent';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {dismissChangePolicyModal} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import colors from '@styles/theme/colors';
import variables from '@styles/variables';
import CONST from '@src/CONST';

function ChangePolicyEducationalModal() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const illustrations = useMemoizedLazyIllustrations(['ReceiptFairy']);

    const handleConfirm = () => {
        dismissChangePolicyModal();
    };

    useBeforeRemove(handleConfirm);

    const handleClose = () => {
        Navigation.goBack();
    };

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, handleClose, {shouldBubble: false});

    return (
        <CenteredModalLayout
            onBackdropPress={handleClose}
            width={variables.changePolicyEducationModalWidth}
        >
            <FeatureTrainingContent
                title={translate('iou.changePolicyEducational.title')}
                description={translate('iou.changePolicyEducational.description')}
                confirmText={translate('common.buttonConfirm')}
                image={illustrations.ReceiptFairy}
                imageWidth={variables.changePolicyEducationModalIconWidth}
                imageHeight={variables.changePolicyEducationModalIconHeight}
                contentFitImage="cover"
                width={variables.changePolicyEducationModalWidth}
                illustrationAspectRatio={CONST.ILLUSTRATION_ASPECT_RATIO}
                illustrationInnerContainerStyle={[styles.alignItemsCenter, styles.justifyContentCenter, StyleUtils.getBackgroundColorStyle(colors.blue700)]}
                illustrationOuterContainerStyle={styles.p0}
                contentInnerContainerStyles={[styles.mb5, styles.gap2]}
                onClose={handleClose}
                onConfirm={handleConfirm}
                shouldUseScrollView
            >
                <ChangeWorkspaceMenuSectionList />
            </FeatureTrainingContent>
        </CenteredModalLayout>
    );
}

export default ChangePolicyEducationalModal;
