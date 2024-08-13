import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {SetWorkspaceReportTitleParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Call the API to deactivate the card and request a new one
 * @param cardID - id of the card that is going to be replaced
 * @param reason - reason for replacement
 */
function modifyExpenseReportsNames(customName: string, policyID: string) {
    console.log('modifyExpenseReportsNames ', customName, ' ', policyID);
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.RULES_CUSTOM_NAME_MODAL_FORM,
            value: {
                isLoading: true,
                errors: null,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.RULES_CUSTOM_NAME_MODAL_FORM,
            value: {
                isLoading: false,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.RULES_CUSTOM_NAME_MODAL_FORM,
            value: {
                isLoading: false,
            },
        },
    ];

    const parameters: SetWorkspaceReportTitleParams = {
        value: customName,
        policyID,
    };

    // API.write(WRITE_COMMANDS.SET_WORKSPACE_REPORT_TITLE, parameters, {
    //     optimisticData,
    //     successData,
    //     failureData,
    // });
}

// eslint-disable-next-line import/prefer-default-export
export {modifyExpenseReportsNames};
