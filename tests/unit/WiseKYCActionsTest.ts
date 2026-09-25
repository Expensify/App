import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import {submitWiseKYCRequirement} from '@userActions/BankAccounts/wise';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {DynamicFormField} from '@src/types/onyx';

jest.mock('@libs/API');

const mockWrite = jest.mocked(write);

const shareholderFields: DynamicFormField[] = [
    {
        key: 'legalEntityShareholders',
        label: 'Shareholders',
        group: 'Shareholders',
        type: 'list',
        required: true,
        refreshOnChange: false,
        itemFields: [{key: 'name', label: 'Name', group: 'Shareholder', type: 'text', required: true, refreshOnChange: false}],
    },
    {key: 'proof', label: 'Proof of ownership', group: 'Shareholders', type: 'file', required: true, refreshOnChange: false},
];

describe('submitWiseKYCRequirement', () => {
    beforeAll(() => {
        IntlStore.load(CONST.LOCALES.DEFAULT);
    });

    it('sends list answers inside submissionData and only file answers as multipart parts', () => {
        submitWiseKYCRequirement(
            42,
            'LEGAL_ENTITY_SHAREHOLDER',
            {legalEntityShareholders: [{id: '1', name: 'Acme Holdings'}], proof: [{name: 'proof.pdf', uri: 'file://proof.pdf', type: 'application/pdf'}]},
            shareholderFields,
        );

        const [command, parameters] = mockWrite.mock.calls.at(0) ?? [];
        expect(command).toBe(WRITE_COMMANDS.SUBMIT_WISE_KYC_REQUIREMENT);
        if (!parameters || !('submissionData' in parameters)) {
            throw new Error('submissionData missing');
        }
        const submissionData: unknown = JSON.parse(String(parameters.submissionData));
        expect(submissionData).toEqual({legalEntityShareholders: [{id: '1', name: 'Acme Holdings'}]});
        expect(parameters).not.toHaveProperty('legalEntityShareholders_0');
        expect(parameters).toHaveProperty('proof_0', expect.objectContaining({name: 'proof.pdf'}));
    });
});
