import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type Policy from '@src/types/onyx/Policy';

import type {OnyxEntry} from 'react-native-onyx';

/**
 * Returns a guard function that blocks manual/odometer distance entry for policies
 * that have commuter exclusions configured.
 *
 * When a block occurs, it surfaces a modal explaining that only map/GPS distance
 * is supported (because exclusions are computed from the mapped route) and returns
 * true so callers can early return.
 */
function useCommuterExclusionGuard(policy: OnyxEntry<Policy> | undefined) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {showConfirmModal} = useConfirmModal();
    const illustrations = useMemoizedLazyIllustrations(['HouseWithMap']);

    return () => {
        if (!policy?.commuterExclusions) {
            return false;
        }

        showConfirmModal({
            title: translate('distance.error.mapOrGpsDistanceRequired.title'),
            titleStyles: styles.textHeadline,
            prompt: translate('distance.error.mapOrGpsDistanceRequired.description'),
            promptStyles: styles.textSupporting,
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
            shouldShowDismissIcon: true,
            image: illustrations.HouseWithMap,
            shouldUseSuccessStyleForConfirm: true,
            shouldFitImageToContainer: true,
            imageStyles: styles.commuterExclusionStaticIllustration,
        });

        return true;
    };
}

export default useCommuterExclusionGuard;
