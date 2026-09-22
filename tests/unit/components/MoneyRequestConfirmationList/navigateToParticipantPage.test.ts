import navigateToParticipantPage from '@components/MoneyRequestConfirmationList/navigateToParticipantPage';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

const mockNavigate = jest.fn();
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: (...args: unknown[]) => mockNavigate(...args) as unknown,
}));

type Params = Parameters<typeof navigateToParticipantPage>[0];

function makeBase(overrides: Partial<Params> = {}): Params {
    return {
        canEditParticipant: true,
        isManualRequest: false,
        iouType: CONST.IOU.TYPE.TRACK,
        action: CONST.IOU.ACTION.CREATE,
        transactionID: 'txn1',
        reportID: 'report1',
        onOpenParticipantPicker: jest.fn(),
        ...overrides,
    };
}

describe('navigateToParticipantPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('opens the in-page picker for manual requests', () => {
        // Given a manual expense whose participant row is editable
        const params = makeBase({isManualRequest: true});

        // When the participant row is selected
        navigateToParticipantPage(params);

        // Then the page-owned picker opens and we do not leave confirmation
        expect(params.onOpenParticipantPicker).toHaveBeenCalledWith();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('navigates to the participants step for track requests so reportID can update on return', () => {
        // Given a track (distance) expense from global create
        const params = makeBase({iouType: CONST.IOU.TYPE.TRACK});

        // When the participant row is selected
        navigateToParticipantPage(params);

        // Then we open the participants step with CREATE so returning updates the confirmation reportID
        expect(params.onOpenParticipantPicker).not.toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith(
            createDynamicRoute(
                DYNAMIC_ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute({
                    action: CONST.IOU.ACTION.CREATE,
                    iouType: CONST.IOU.TYPE.CREATE,
                    transactionID: 'txn1',
                    reportID: 'report1',
                }),
            ),
        );
    });

    it('does nothing when the participant row is not editable', () => {
        // Given a confirmation where the participant cannot be edited
        const params = makeBase({canEditParticipant: false});

        // When the participant row is selected
        navigateToParticipantPage(params);

        // Then neither the picker nor navigation runs
        expect(params.onOpenParticipantPicker).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
