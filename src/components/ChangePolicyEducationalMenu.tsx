import {useNavigation} from '@react-navigation/native';
import React, {useEffect} from 'react';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import useStyleUtils from '@hooks/useStyleUtils';
import colors from '@styles/theme/colors';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import ChangeWorkspaceMenuSectionList from './ChangeWorkspaceMenuSectionList';
import FeatureTrainingModal from './FeatureTrainingModal';
import * as Illustrations from './Icon/Illustrations';


type ChangePolicyEducationalMenuProps = {
    /** Method to trigger when pressing outside of the popover menu to close it */
    onClose: () => void;

    /** Method to trigger when pressing confirm button */
    onConfirm: () => void;
};

function ChangePolicyEducationalMenu({onClose, onConfirm}: ChangePolicyEducationalMenuProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const navigation = useNavigation();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    

    useEffect(() => {
        const unsub = navigation.addListener('beforeRemove', () => {
            onClose();
        });
        return unsub;
    }, [navigation, onClose]);

    return (
        <FeatureTrainingModal
            title={translate('iou.changePolicyEducational.title')}
            description={translate('iou.changePolicyEducational.description')}
            confirmText={translate('common.buttonConfirm')}
            image={Illustrations.ReceiptFairy}
            imageWidth={variables.changePolicyEducationModalIconWidth}
            imageHeight={variables.changePolicyEducationModalIconHeight}
            contentFitImage="cover"
            width={variables.changePolicyEducationModalWidth}
            illustrationAspectRatio={39 / 22}
            illustrationInnerContainerStyle={[styles.alignItemsCenter, styles.justifyContentCenter, styles.cardSectionIllustration, StyleUtils.getBackgroundColorStyle(colors.blue700)]}
            illustrationOuterContainerStyle={styles.p0}
            contentInnerContainerStyles={[styles.mb5, styles.gap2]}
            contentOuterContainerStyles={!shouldUseNarrowLayout && [styles.mt8, styles.mh8]}
            modalInnerContainerStyle={{...styles.pt0, ...(shouldUseNarrowLayout ? {} : styles.pb8)}}
            onClose={onClose}
            onConfirm={onConfirm}
        >
            <ChangeWorkspaceMenuSectionList />
        </FeatureTrainingModal>
    );
}

ChangePolicyEducationalMenu.displayName = 'ChangePolicyEducationalMenu';

export default ChangePolicyEducationalMenu;
