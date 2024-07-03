import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import type {WorkspaceCardsList} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import WorkspaceCardPageEmptyState from './WorkspaceCardPageEmptyState';
import WorkspaceExpensifyCardPage from './WorkspaceExpensifyCardPage';

type WorkspaceCardPageFeedProps = StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD>;

// TODO: remove when Onyx data is available
const cardsList: OnyxEntry<WorkspaceCardsList> = {};

function WorkspaceCardPageFeed({route}: WorkspaceCardPageFeedProps) {
    // const policyID = route.params.policyID ?? '-1';
    // const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${policyID}_${CONST.EXPENSIFY_CARD.BANK}`);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
        >
            {/* After BE will be implemented we will probably want to have ActivityIndicator during fetch for cardsList */}
            {isEmptyObject(cardsList) && <WorkspaceCardPageEmptyState route={route} />}
            {!isEmptyObject(cardsList) && <WorkspaceExpensifyCardPage route={route} />}
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceCardPageFeed.displayName = 'WorkspaceCardPageFeed';

export default WorkspaceCardPageFeed;
