import React, {useMemo} from 'react';
import type {UpperCaseCharacters} from 'type-fest/source/internal';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import {getFullSizeAvatar} from '@libs/UserUtils';
import type {AttachmentModalBaseContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/types';
import AttachmentModalContainer from '@pages/media/AttachmentModalScreen/AttachmentModalContainer';
import type {AttachmentModalScreenParams, AttachmentModalScreenProps} from '@pages/media/AttachmentModalScreen/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type WorkspaceAvatarScreenParams = Omit<AttachmentModalScreenParams, 'policyID'> & {
    policyID: string;
    letter?: UpperCaseCharacters;
};

function WorkspaceAvatarModalContent({navigation, route}: AttachmentModalScreenProps<typeof SCREENS.WORKSPACE_AVATAR>) {
    const {policyID, letter: fallbackLetter} = route.params;

    const policy = usePolicy(policyID);
    const [isLoadingApp = false] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true, initWithStoredValues: false});

    const avatarURL = policy?.avatarURL ?? getDefaultWorkspaceAvatar(policy?.name ?? fallbackLetter);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = !Object.keys(policy ?? {}).length && !isLoadingApp && (!policyID || !fallbackLetter);

    const contentProps = useMemo<AttachmentModalBaseContentProps>(
        () => ({
            source: getFullSizeAvatar(avatarURL, 0),
            headerTitle: policy?.name,
            isWorkspaceAvatar: true,
            originalFileName: policy?.originalFileName ?? policy?.id,
            shouldShowNotFoundPage,
            isLoading: !Object.keys(policy ?? {}).length && !!isLoadingApp,
            maybeIcon: true,
        }),
        [avatarURL, isLoadingApp, policy, shouldShowNotFoundPage],
    );

    return (
        <AttachmentModalContainer
            navigation={navigation}
            contentProps={contentProps}
        />
    );
}
WorkspaceAvatarModalContent.displayName = 'WorkspaceAvatarModalContent';

export default WorkspaceAvatarModalContent;
export type {WorkspaceAvatarScreenParams};
