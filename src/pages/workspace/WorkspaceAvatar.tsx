import React from 'react';
import AttachmentModal from '@components/AttachmentModal';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import {getFullSizeAvatar} from '@libs/UserUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type WorkspaceAvatarProps = PlatformStackScreenProps<AuthScreensParamList, typeof SCREENS.WORKSPACE_AVATAR>;

function WorkspaceAvatar({route}: WorkspaceAvatarProps) {
    const {policyID, letter: fallbackLetter} = route?.params ?? {};
    const policy = usePolicy(policyID);
    const [isLoadingApp = false] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true, initWithStoredValues: false});
    const policyAvatarURL = policy?.avatarURL;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const avatarURL = policyAvatarURL || getDefaultWorkspaceAvatar(policy?.name ?? fallbackLetter);
    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = !Object.keys(policy ?? {}).length && !isLoadingApp && (!policyID || !fallbackLetter);

    return (
        <AttachmentModal
            headerTitle={policy?.name ?? ''}
            defaultOpen
            source={getFullSizeAvatar(avatarURL, 0)}
            onModalClose={Navigation.goBack}
            isWorkspaceAvatar
            originalFileName={policy?.originalFileName ?? policy?.id ?? policyID}
            shouldShowNotFoundPage={shouldShowNotFoundPage}
            isLoading={!Object.keys(policy ?? {}).length && !!isLoadingApp}
            maybeIcon
        />
    );
}

WorkspaceAvatar.displayName = 'WorkspaceAvatar';

export default WorkspaceAvatar;
