import {useNavigation} from '@react-navigation/native';
import React, {useEffect} from 'react';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import colors from '@styles/theme/colors';
import variables from '@styles/variables';
import ChangeWorkspaceMenuSectionList from './ChangeWorkspaceMenuSectionList';
import FeatureTrainingModal from './FeatureTrainingModal';
import * as Illustrations from './Icon/Illustrations';

type ChangePolicyEducationalMenuProps = {
    /** Method to trigger when pressing confirm button or outside of the popover menu to close it */
    onConfirm: () => void;
};

function ChangePolicyEducationalMenu({onConfirm}: ChangePolicyEducationalMenuProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const navigation = useNavigation();
    const StyleUtils = useStyleUtils();

    useEffect(() => {
        const unsub = navigation.addListener('beforeRemove', () => {
            onConfirm();
        });
        return unsub;
    }, [navigation, onConfirm]);

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
            onClose={onConfirm}
            onConfirm={onConfirm}
        >
            <ChangeWorkspaceMenuSectionList />
        </FeatureTrainingModal>
    );
}

ChangePolicyEducationalMenu.displayName = 'ChangePolicyEducationalMenu';

export default ChangePolicyEducationalMenu;
