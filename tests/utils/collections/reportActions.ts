import {rand, randAggregation, randBoolean, randWord} from '@ngneat/falso';
import {format} from 'date-fns';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';
import type {ActionName} from '@src/types/onyx/OriginalMessage';
import type DeepRecord from '@src/types/utils/DeepRecord';

const flattenActionNamesValues = (actionNames: DeepRecord<string, ActionName>) => {
    let result: ActionName[] = [];
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

const deprecatedReportActions: ActionName[] = [
    CONST.REPORT.ACTIONS.TYPE.DELETED_ACCOUNT,
    CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_REQUESTED,
    CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_SETUP_REQUESTED,
    CONST.REPORT.ACTIONS.TYPE.DONATION,
];

export default function createRandomReportAction(index: number): ReportAction {
    return {
        // we need to add any here because of the way we are generating random values
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        actionName: rand(flattenActionNamesValues(CONST.REPORT.ACTIONS.TYPE).filter((actionType: ActionName) => !deprecatedReportActions.includes(actionType))) as any,
        reportActionID: index.toString(),
        previousReportActionID: (index === 0 ? 0 : index - 1).toString(),
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
                reactions: [
                    {
                        emoji: randWord(),
                        users: [
                            {
                                accountID: index,
                                skinTone: index,
                            },
                        ],
                    },
                ],
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
