import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {useOnyx} from 'react-native-onyx';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import WorkspaceExpensifyCardListPage from './WorkspaceExpensifyCardListPage';
import WorkspaceExpensifyCardPageEmptyState from './WorkspaceExpensifyCardPageEmptyState';

type WorkspaceExpensifyCardPageProps = StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD>;

function WorkspaceExpensifyCardPage({route}: WorkspaceExpensifyCardPageProps) {
    const policyID = route.params.policyID ?? '-1';
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_EXPENSIFY_CARD_SETTINGS}${policyID}`);

    const paymentBankAccountID = cardSettings?.paymentBankAccountID ?? -1;

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
        >
            {/* After BE will be implemented we will probably want to have ActivityIndicator during fetch for cardsList */}
            {paymentBankAccountID ? <WorkspaceExpensifyCardListPage route={route} /> : <WorkspaceExpensifyCardPageEmptyState route={route} />}
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceExpensifyCardPage.displayName = 'WorkspaceExpensifyCardPage';

export default WorkspaceExpensifyCardPage;
