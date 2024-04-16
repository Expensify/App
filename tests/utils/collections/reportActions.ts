import {rand, randAggregation, randBoolean, randWord} from '@ngneat/falso';
import {format} from 'date-fns';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';

type ActionType = keyof typeof CONST.REPORT.ACTIONS.TYPE;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const flattenActionNamesValues = (actionNames: any) => {
    let result = [] as ActionType[];
    Object.keys(actionNames).forEach((key) => {
        if (typeof actionNames[key] === 'object') {
            result = result.concat(flattenActionNamesValues(actionNames[key]));
        } else {
            result.push(actionNames[key]);
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

export default function createRandomReportAction(index: number): ReportAction {
    return {
        // we need to add any here because of the way we are generating random values
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        actionName: rand(flattenActionNamesValues(CONST.REPORT.ACTIONS.TYPE)) as any,
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
        },
        whisperedToAccountIDs: randAggregation(),
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
