import {hasAcceptedTravelTerms} from '@libs/PolicyUtils';

import colors from '@styles/theme/colors';

import ONYXKEYS from '@src/ONYXKEYS';

import useConfirmModal from './useConfirmModal';
import {useMemoizedLazyIllustrations} from './useLazyAsset';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import usePolicy from './usePolicy';
import useStyleUtils from './useStyleUtils';
import useThemeStyles from './useThemeStyles';

type DefaultWorkspaceTravelGuardOptions = {
    /** Whether the default workspace must have finished travel setup, rather than only having the feature switched on */
    shouldRequireCompletedSetup?: boolean;
};

/**
 * A traveler is provisioned against their default workspace, so booking from any other workspace opens a session they
 * have no travel profile for. Returns a function that shows the blocking modal and reports whether it blocked.
 *
 * Callers that offer their own travel setup path pass shouldRequireCompletedSetup: false, so a default workspace with
 * unfinished setup reaches that path instead of a modal telling the user to enable what they already enabled.
 */
function useDefaultWorkspaceTravelGuard({shouldRequireCompletedSetup = true}: DefaultWorkspaceTravelGuardOptions = {}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const illustrations = useMemoizedLazyIllustrations(['RocketDude']);
    const {showConfirmModal} = useConfirmModal();
    const [defaultPolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const defaultPolicy = usePolicy(defaultPolicyID);
    const [travelSettings] = useOnyx(ONYXKEYS.NVP_TRAVEL_SETTINGS);

    const blockIfDefaultWorkspaceLacksTravel = () => {
        if (!defaultPolicy) {
            return false;
        }

        const isDefaultWorkspaceBookable = shouldRequireCompletedSetup
            ? defaultPolicy.isTravelEnabled && hasAcceptedTravelTerms(defaultPolicy, travelSettings)
            : defaultPolicy.isTravelEnabled;
        if (isDefaultWorkspaceBookable) {
            return false;
        }

        showConfirmModal({
            title: translate('travel.defaultWorkspaceTravelDisabled.title'),
            titleStyles: styles.textHeadlineH1,
            titleContainerStyles: styles.mb2,
            prompt: translate('travel.defaultWorkspaceTravelDisabled.message'),
            promptStyles: styles.mb2,
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
            image: illustrations.RocketDude,
            imageStyles: StyleUtils.getBackgroundColorStyle(colors.ice600),
        });

        return true;
    };

    return blockIfDefaultWorkspaceLacksTravel;
}

export default useDefaultWorkspaceTravelGuard;
