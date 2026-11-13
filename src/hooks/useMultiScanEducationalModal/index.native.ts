import MultiScanEducationalModalContent from '@components/MultiScanEducationalModalContent';

import useFeatureTrainingModal from '@hooks/useFeatureTrainingModal';
import useThemeStyles from '@hooks/useThemeStyles';

import {createElement} from 'react';

/** Opens native multi-scan education and returns the global stack's dismissal promise. */
function useMultiScanEducationalModal() {
    const styles = useThemeStyles();
    const {showFeatureTrainingModal} = useFeatureTrainingModal();

    return () =>
        showFeatureTrainingModal({
            modalInnerContainerStyle: styles.pt0,
            children: createElement(MultiScanEducationalModalContent),
        });
}

export default useMultiScanEducationalModal;
