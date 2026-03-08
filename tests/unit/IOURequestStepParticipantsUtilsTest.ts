import getUISelectedParticipants from '@pages/iou/request/step/IOURequestStepParticipantsUtils';
import CONST from '@src/CONST';

describe('IOURequestStepParticipantsUtils', () => {
    it('keeps selected non-sender participants for selector UI', () => {
        expect(
            getUISelectedParticipants(
                [
                    {
                        accountID: 1,
                        login: 'receiver@test.com',
                        selected: true,
                        iouType: CONST.IOU.TYPE.INVOICE,
                    },
                    {
                        policyID: 'policyID',
                        isSender: true,
                        selected: false,
                        iouType: CONST.IOU.TYPE.INVOICE,
                    },
                ],
                CONST.IOU.TYPE.INVOICE,
            ),
        ).toEqual([
            expect.objectContaining({
                accountID: 1,
                login: 'receiver@test.com',
                selected: true,
            }),
        ]);
    });

    it('falls back to the invoice receiver when the draft participants only contain the sender helper row', () => {
        expect(
            getUISelectedParticipants(
                [
                    {
                        policyID: 'policyID',
                        isSender: true,
                        selected: false,
                        iouType: CONST.IOU.TYPE.INVOICE,
                    },
                ],
                CONST.IOU.TYPE.INVOICE,
                {
                    type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
                    accountID: 7,
                },
            ),
        ).toEqual([
            expect.objectContaining({
                accountID: 7,
                selected: true,
                iouType: CONST.IOU.TYPE.INVOICE,
            }),
        ]);
    });

    it('supports business invoice receivers as a fallback selector participant', () => {
        expect(
            getUISelectedParticipants([], CONST.IOU.TYPE.INVOICE, {
                type: CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS,
                policyID: 'receiverPolicyID',
            }),
        ).toEqual([
            expect.objectContaining({
                policyID: 'receiverPolicyID',
                selected: true,
                iouType: CONST.IOU.TYPE.INVOICE,
            }),
        ]);
    });
});
