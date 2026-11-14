import type useFeatureTrainingModal from '@hooks/useFeatureTrainingModal';

/** Multi-scan education is native-only; web must not open or dismiss the training. */
function useMultiScanEducationalModal(): () => ReturnType<ReturnType<typeof useFeatureTrainingModal>['showFeatureTrainingModal']> | undefined {
    return () => undefined;
}

export default useMultiScanEducationalModal;
