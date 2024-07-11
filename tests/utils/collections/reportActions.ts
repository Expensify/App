import {rand, randAggregation, randBoolean, randWord} from '@ngneat/falso';
import {format} from 'date-fns';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';
import type ReportActionName from '@src/types/onyx/ReportActionName';
import type DeepRecord from '@src/types/utils/DeepRecord';

const flattenActionNamesValues = (actionNames: DeepRecord<string, ReportActionName>): ReportActionName[] => {
    let result: ReportActionName[] = [];
    Object.values(actionNames).forEach((value) => {
        if (typeof value === 'object') {
            result = result.concat(flattenActionNamesValues(value));
        } else {
            result.push(value);
        }
    });
    return result;
};

const getRandomDate = (): string => {
    const randomTimestamp = Math.random() * new Date().getTime();
    const randomDate = new Date(randomTimestamp);

    const formattedDate = format(randomDate, CONST.DATE.FNS_DB_FORMAT_STRING);

    return formattedDate;
};

const deprecatedReportActions: ReportActionName[] = [
    CONST.REPORT.ACTIONS.TYPE.DELETED_ACCOUNT,
    CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_REQUESTED,
    CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_SETUP_REQUESTED,
    CONST.REPORT.ACTIONS.TYPE.DONATION,
] as const;

export default function createRandomReportAction(index: number): ReportAction {
    return {
        // We need to assert the type of actionName so that rest of the properties are inferred correctly
        actionName: rand(
            flattenActionNamesValues(CONST.REPORT.ACTIONS.TYPE).filter((actionType: ReportActionName) => !deprecatedReportActions.includes(actionType)),
        ) as typeof CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        reportActionID: index.toString(),
        actorAccountID: index,
        person: [
            {
                type: randWord(),
                style: randWord(),
                text: randWord(),
            },
        ],
        created: getRandomDate(),
        message: [
            {
                type: randWord(),
                html: randWord(),
                style: randWord(),
                text: randWord(),
                isEdited: randBoolean(),
                isDeletedParentAction: randBoolean(),
                whisperedTo: randAggregation(),
            },
        ],
        originalMessage: {
            html: randWord(),
            lastModified: getRandomDate(),
            whisperedTo: randAggregation(),
        },
        avatar: randWord(),
        automatic: randBoolean(),
        shouldShow: randBoolean(),
        lastModified: getRandomDate(),
        pendingAction: rand(Object.values(CONST.RED_BRICK_ROAD_PENDING_ACTION)),
        delegateAccountID: index,
        errors: {},
        isAttachment: randBoolean(),
    };
}

export {getRandomDate};
