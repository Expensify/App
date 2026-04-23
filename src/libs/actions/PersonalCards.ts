import type {NullishDeep, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AddNewPersonalCard, AddNewPersonalCardFeedData, AddNewPersonalCardFeedStep} from '@src/types/onyx/PersonalCard';

type AddNewPersonalCardFlowData = {
    /** Step to be set in Onyx */
    step?: AddNewPersonalCardFeedStep;

    /** Whether the user is editing step */
    isEditing?: boolean;

    /** Data required to be sent to issue a new card */
    data?: Partial<AddNewPersonalCardFeedData>;
};

function setAddNewPersonalCardStepAndData({data, isEditing, step}: NullishDeep<AddNewPersonalCardFlowData>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- false positive when AddNewPersonalCard includes `errors`; merge fields are NullishDeep<AddNewPersonalCardFlowData>
    Onyx.merge(ONYXKEYS.ADD_NEW_PERSONAL_CARD, {data, isEditing, currentStep: step} as Partial<AddNewPersonalCard>);
}

function clearAddNewPersonalCardFlow() {
    Onyx.set(ONYXKEYS.ADD_NEW_PERSONAL_CARD, {
        currentStep: null,
        data: {},
    });
}

function clearAddNewPersonalCardErrors() {
    Onyx.merge(ONYXKEYS.ADD_NEW_PERSONAL_CARD, {errors: null});
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

export {clearAddNewPersonalCardErrors, clearAddNewPersonalCardFlow, setAddNewPersonalCardStepAndData, updatePersonalCardConnection};
