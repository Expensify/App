import {useNavigation} from '@react-navigation/native';
import React, {useEffect} from 'react';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import FeatureTrainingModal from './FeatureTrainingModal';
import HoldMenuSectionList from './HoldMenuSectionList';
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
            contentFitImage="cover"
            width={variables.changePolicyEducationModalWidth}
            illustrationAspectRatio={39 / 22}
            contentInnerContainerStyles={styles.mb5}
            modalInnerContainerStyle={styles.pt0}
            illustrationOuterContainerStyle={styles.p0}
            onClose={onClose}
            onConfirm={onConfirm}
        >
            <HoldMenuSectionList />
        </FeatureTrainingModal>
    );
}

ChangePolicyEducationalMenu.displayName = 'ChangePolicyEducationalMenu';

export default ChangePolicyEducationalMenu;
