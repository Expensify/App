import type {NullishDeep, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AddNewPersonalCardFeedData, AddNewPersonalCardFeedStep} from '@src/types/onyx/PersonalCard';
import type {OnyxData} from '@src/types/onyx/Request';

type AddNewPersonalCardFlowData = {
    /** Step to be set in Onyx */
    step?: AddNewPersonalCardFeedStep;

    /** Whether the user is editing step */
    isEditing?: boolean;

    /** Data required to be sent to issue a new card */
    data?: Partial<AddNewPersonalCardFeedData>;
};

function setAddNewPersonalCardStepAndData({data, isEditing, step}: NullishDeep<AddNewPersonalCardFlowData>) {
    Onyx.merge(ONYXKEYS.ADD_NEW_PERSONAL_CARD, {data, isEditing, currentStep: step});
}

function clearAddNewPersonalCardFlow() {
    Onyx.set(ONYXKEYS.ADD_NEW_PERSONAL_CARD, {
        currentStep: null,
        data: {},
    });
}

function updatePersonalCardConnection(cardID: string, lastScrapeResult?: number) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST | typeof ONYXKEYS.CARD_LIST>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.CARD_LIST,
            value: {
                [cardID]: {
                    lastScrapeResult: CONST.JSON_CODE.SUCCESS,
                    isLoadingLastUpdated: true,
                    pendingFields: {
                        lastScrape: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                    errorFields: {
                        lastScrape: null,
                    },
                },
            },
        },
    ];

    const finallyData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST | typeof ONYXKEYS.CARD_LIST>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.CARD_LIST,
            value: {
                [cardID]: {
                    lastScrapeResult: CONST.JSON_CODE.SUCCESS,
                    isLoadingLastUpdated: false,
                    pendingFields: {
                        lastScrape: null,
                    },
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST | typeof ONYXKEYS.CARD_LIST>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.CARD_LIST,
            value: {
                [cardID]: {
                    lastScrapeResult,
                    isLoadingLastUpdated: false,
                    pendingFields: {
                        lastScrape: null,
                    },
                    errorFields: {
                        lastScrape: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                    },
                },
            },
        },
    ];

    const parameters = {
        cardID: Number(cardID),
    };

    API.write(WRITE_COMMANDS.SYNC_CARD, parameters, {optimisticData, finallyData, failureData});
}

function deletePersonalCard(cardID: string) {
    const onyxData: OnyxData<typeof ONYXKEYS.CARD_LIST> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.CARD_LIST,
                value: {
                    [cardID]: {
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    },
                },
            },
        ],

        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.CARD_LIST,
                value: {
                    [cardID]: null,
                },
            },
        ],

        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.CARD_LIST,
                value: {
                    [cardID]: {
                        pendingAction: null,
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                    },
                },
            },
        ],
    };

    const parameters = {
        cardID: Number(cardID),
    };

    API.write(WRITE_COMMANDS.UNASSIGN_CARD, parameters, onyxData);
}

export {clearAddNewPersonalCardFlow, setAddNewPersonalCardStepAndData, updatePersonalCardConnection, deletePersonalCard};
