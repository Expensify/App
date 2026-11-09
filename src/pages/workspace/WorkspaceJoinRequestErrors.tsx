/**
 * Shows why a request to join a workspace failed, because the failed request leaves no workspace row behind.
 */
import ErrorMessageRow from '@components/ErrorMessageRow';

import useLayoutSpacing from '@hooks/useLayoutSpacing';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearJoinRequestErrors} from '@libs/actions/Policy/Member';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

function WorkspaceJoinRequestErrors() {
    const styles = useThemeStyles();
    const {pageGutter} = useLayoutSpacing();
    const [joinRequests] = useOnyx(ONYXKEYS.COLLECTION.POLICY_JOIN_MEMBER);

    return (
        <>
            {Object.entries(joinRequests ?? {}).map(([key, joinRequest]) => {
                const policyID = key.replace(ONYXKEYS.COLLECTION.POLICY_JOIN_MEMBER, '');
                return (
                    <ErrorMessageRow
                        key={key}
                        errors={joinRequest?.errors}
                        onDismiss={() => clearJoinRequestErrors(policyID)}
                        errorRowStyles={[pageGutter, styles.pb3]}
                    />
                );
            })}
        </>
    );
}

export default WorkspaceJoinRequestErrors;
