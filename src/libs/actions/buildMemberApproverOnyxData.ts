/** Feedback for saves started from a member's First approver row, including saves that only write rules. */
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

function buildMemberApproverOnyxData(policyID: string, memberEmail?: string) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [];
    if (!memberEmail) {
        return {optimisticData, successData, failureData};
    }
    const key = `${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const;
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key,
        value: {employeeList: {[memberEmail]: {pendingFields: {submitsTo: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}, errorFields: {submitsTo: null}}}},
    });
    successData.push({onyxMethod: Onyx.METHOD.MERGE, key, value: {employeeList: {[memberEmail]: {pendingFields: {submitsTo: null}}}}});
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key,
        value: {
            employeeList: {
                [memberEmail]: {pendingFields: {submitsTo: null}, errorFields: {submitsTo: getMicroSecondOnyxErrorWithTranslationKey('workflowsApproverPage.genericErrorMessage')}},
            },
        },
    });
    return {optimisticData, successData, failureData};
}

export default buildMemberApproverOnyxData;
