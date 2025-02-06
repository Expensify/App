import {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AttachmentModalBaseContentProps} from './BaseContent';
import type {AttachmentModalContent} from './types';

const WorkspaceAvatarModalContent: AttachmentModalContent = ({params, children}) => {
    const policyID = params.policyID ?? '-1';
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {initialValue: true});

    const contentProps = useMemo(
        () =>
            ({
                source: policy?.avatarURL ?? '' ? policy?.avatarURL ?? '' : getDefaultWorkspaceAvatar(policy?.name ?? ''),
                headerTitle: policy?.name ?? '',
                isWorkspaceAvatar: true,
                originalFileName: policy?.originalFileName ?? policy?.id,
                shouldShowNotFoundPage: !Object.keys(policy ?? {}).length && !isLoadingApp,
                isLoading: !Object.keys(policy ?? {}).length && !!isLoadingApp,
                maybeIcon: true,
            } satisfies Partial<AttachmentModalBaseContentProps>),
        [isLoadingApp, policy],
    );

    const wrapperProps = useMemo(() => ({}), []);

    // eslint-disable-next-line react-compiler/react-compiler
    return children({contentProps, wrapperProps});
};

export default WorkspaceAvatarModalContent;
