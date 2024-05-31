import {cloneDeep} from 'lodash';
import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {WRITE_COMMANDS} from './API/types';
import {getAccountIDsByLogins} from './PersonalDetailsUtils';

type RequestDataProcessor = ({successData, onyxData}: {successData: OnyxUpdate[]; onyxData: OnyxUpdate[]}) => OnyxUpdate[];
type RequestDataProcessors = Record<string, RequestDataProcessor>;
type ResponseData = {
    [key: string]: any;
};
const requestDataProcessors: RequestDataProcessors = {
    [WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE]: ({successData, onyxData}) => {
        const newSuccessData = cloneDeep(successData);
        const policyID = successData.find((data) => data.key.startsWith(ONYXKEYS.COLLECTION.POLICY))?.key.replace(`${ONYXKEYS.COLLECTION.POLICY}`, '');

        const successPolicyObject = successData
            .filter((data) => data.key === `${ONYXKEYS.COLLECTION.POLICY}${policyID}`)
            .map((data) => data.value)
            .reduce((acc: Object, current) => {
                if (typeof current === 'object' && current !== null) {
                    return {...acc, ...current};
                }
                return acc;
            }, {});
        const responsePolicyObject: ResponseData = onyxData
            .filter((data) => data.key === `${ONYXKEYS.COLLECTION.POLICY}${policyID}`)
            .map((data) => data.value)
            .reduce((acc: Object, current) => {
                if (typeof current === 'object' && current !== null) {
                    return {...acc, ...current};
                }
                return acc;
            }, {});
        let employeeListEmailsToAdd: string[] = [];
        let employeeListEmailsHasError: string[] = [];
        if ('employeeList' in successPolicyObject && typeof successPolicyObject.employeeList === 'object') {
            employeeListEmailsToAdd = Object.keys(successPolicyObject.employeeList ?? {});
        }
        Object.keys(responsePolicyObject).forEach((policyKey) => {
            if ('errors' in responsePolicyObject[policyKey]) {
                employeeListEmailsHasError.push(policyKey);
            }
        });

        employeeListEmailsHasError.forEach((email) => {
            newSuccessData.push({
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {
                    employeeList: {
                        [email]: {errors: responsePolicyObject[email].errors},
                    },
                },
            });
            const personalDetailListIndex = successData.findIndex((data) => data.key === ONYXKEYS.PERSONAL_DETAILS_LIST);
            const [accountID] = getAccountIDsByLogins([email]);
            if (newSuccessData[personalDetailListIndex] && newSuccessData[personalDetailListIndex].value[accountID] === null) {
                newSuccessData[personalDetailListIndex].value[accountID] = {};
            }
        });

        return newSuccessData;
    },
};

export default requestDataProcessors;
