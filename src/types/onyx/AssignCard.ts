import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

/** Assign card flow steps */
type AssignCardStep = ValueOf<typeof CONST.COMPANY_CARD.STEP>;

/** Data required to be sent to issue a new card */
type AssignCardData = {
    /** The email address of the cardholder */
    assigneeEmail: string;
};

/** Model of assign card flow */
type AssignCard = {
    /** The current step of the flow */
    currentStep: AssignCardStep;

    /** Data required to be sent to assign a card */
    data: AssignCardData;

    /** Whether the user is editing step */
    isEditing: boolean;
};

export type {AssignCard, AssignCardStep, AssignCardData};
