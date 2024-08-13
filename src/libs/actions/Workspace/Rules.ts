import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {SetPolicyDefaultReportTitleParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Call the API to deactivate the card and request a new one
 * @param customName - name pattern to be used for the reports
 * @param policyID - id of the policy to apply the naming pattern to
 */
function modifyExpenseReportsNames(customName: string, policyID: string) {
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

    const parameters: SetPolicyDefaultReportTitleParams = {
        value: customName,
        policyID,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_DEFAULT_REPORT_TITLE, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

// eslint-disable-next-line import/prefer-default-export
export {modifyExpenseReportsNames};
