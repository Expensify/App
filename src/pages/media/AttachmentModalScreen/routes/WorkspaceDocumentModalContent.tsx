import React, {useMemo} from 'react';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import {getRulesDocumentSourceURL} from '@libs/PolicyUtils';
import type {AttachmentModalBaseContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/types';
import AttachmentModalContainer from '@pages/media/AttachmentModalScreen/AttachmentModalContainer';
import type {AttachmentModalScreenProps} from '@pages/media/AttachmentModalScreen/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

function WorkspaceDocumentModalContent({navigation, route}: AttachmentModalScreenProps<typeof SCREENS.WORKSPACE_DOCUMENT>) {
    const {policyID} = route.params;
    const {translate} = useLocalize();

    const [session] = useOnyx(ONYXKEYS.SESSION);
    const policy = usePolicy(policyID);
    const [isLoadingApp = false] = useOnyx(ONYXKEYS.IS_LOADING_APP, {initWithStoredValues: false});

    const policyKeysLength = Object.keys(policy ?? {}).length;

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = (policyKeysLength === 0 && !isLoadingApp) || !policy?.rulesDocumentURL;
    const isLoading = policyKeysLength === 0 && !!isLoadingApp;

    const rulesDocumentSourceURL = useMemo(
        () => getRulesDocumentSourceURL(policy?.rulesDocumentURL, policyID, session?.encryptedAuthToken ?? ''),
        [policy?.rulesDocumentURL, policyID, session?.encryptedAuthToken],
    );

    const contentProps = useMemo<AttachmentModalBaseContentProps>(
        () => ({
            source: rulesDocumentSourceURL,
            headerTitle: translate('workspace.rules.customRules.policyDocument'),
            originalFileName: `${policyID}-policy-document.pdf`,
            shouldShowNotFoundPage,
            isLoading,
            shouldCloseOnSwipeDown: true,
        }),
        [rulesDocumentSourceURL, translate, policyID, shouldShowNotFoundPage, isLoading],
    );

    return (
        <AttachmentModalContainer
            navigation={navigation}
            contentProps={contentProps}
        />
    );
}

export default WorkspaceDocumentModalContent;
