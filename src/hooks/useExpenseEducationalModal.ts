import variables from '@styles/variables';

import type {ReactNode} from 'react';

import useFeatureTrainingModal from './useFeatureTrainingModal';
import useThemeStyles from './useThemeStyles';

/** Shows an expense educational modal and returns the global stack's dismissal promise. */
function useExpenseEducationalModal() {
    const styles = useThemeStyles();
    const {showFeatureTrainingModal} = useFeatureTrainingModal();

    const showModal = (children: ReactNode) => {
        return showFeatureTrainingModal({
            width: variables.holdEducationModalWidth,
            modalInnerContainerStyle: styles.pt0,
            shouldCloseOnConfirm: false,
            shouldUseScrollView: true,
            shouldHandleNavigationBack: true,
            children,
        });
    };

    return showModal;
}

export default useExpenseEducationalModal;
