import {fireEvent, render, screen} from '@testing-library/react-native';

import LabelledFileUploadAdapter from '@components/DynamicForm/adapters/LabelledFileUploadAdapter';

import type {DynamicFormListItem} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';

import React from 'react';

let mockPickedFiles: FileObject[] = [];

jest.mock('@components/AttachmentPicker', () => ({
    __esModule: true,
    default: ({children}: {children: (props: {openPicker: (options: {onPicked: (files: FileObject[]) => void}) => void}) => React.ReactNode}) =>
        children({openPicker: ({onPicked}) => onPicked(mockPickedFiles)}),
}));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

const loanFile: FileObject = {name: 'loan.pdf', uri: 'file://loan.pdf'};
const statementFile: FileObject = {name: 'statement.pdf', uri: 'file://statement.pdf'};

const UPLOADS = [
    {types: [{value: 'LOAN_AGREEMENT', label: 'Loan agreement'}], buttonText: 'Upload loan agreement'},
    {types: [{value: 'BANK_STATEMENT', label: 'Bank statement'}], buttonText: 'Upload bank statement'},
];

function renderAdapter(value: DynamicFormListItem[], onInputChange: (value: DynamicFormListItem[]) => void, fileLimit = 0) {
    render(
        <LabelledFileUploadAdapter
            value={value}
            onInputChange={onInputChange}
            uploads={UPLOADS}
            acceptedFileTypes={['pdf']}
            fileLimit={fileLimit}
        />,
    );
}

describe('LabelledFileUploadAdapter', () => {
    it('takes a file under a second button when another button already holds it', () => {
        // Given the loan agreement uploaded, since one PDF can show both the agreement and the funds received
        const onInputChange = jest.fn();
        renderAdapter([{id: 'LOAN_AGREEMENT', fileType: 'LOAN_AGREEMENT', files: [loanFile]}], onInputChange);

        // When the user picks the same file as the bank statement
        mockPickedFiles = [loanFile];
        fireEvent.press(screen.getByText('Upload bank statement'));

        // Then the file is added under the bank statement too
        expect(onInputChange).toHaveBeenCalledWith([
            {id: 'LOAN_AGREEMENT', fileType: 'LOAN_AGREEMENT', files: [loanFile]},
            {id: 'BANK_STATEMENT', fileType: 'BANK_STATEMENT', files: [loanFile]},
        ]);
    });

    it('leaves out a file the same button already holds', () => {
        // Given the loan agreement uploaded
        const onInputChange = jest.fn();
        renderAdapter([{id: 'LOAN_AGREEMENT', fileType: 'LOAN_AGREEMENT', files: [loanFile]}], onInputChange);

        // When the user picks it again under the same button
        mockPickedFiles = [loanFile];
        fireEvent.press(screen.getByText('Upload loan agreement'));

        // Then nothing is added, since the same document twice proves nothing more
        expect(onInputChange).not.toHaveBeenCalled();
    });

    it('counts only the files of the picked button against the file limit', () => {
        // Given a field that takes one file per button, with the loan agreement uploaded
        const onInputChange = jest.fn();
        renderAdapter([{id: 'LOAN_AGREEMENT', fileType: 'LOAN_AGREEMENT', files: [loanFile]}], onInputChange, 1);

        // When the user picks a file under the bank statement button
        mockPickedFiles = [statementFile];
        fireEvent.press(screen.getByText('Upload bank statement'));

        // Then the file is added, since the loan agreement does not count against the bank statement button
        expect(onInputChange).toHaveBeenCalledWith([
            {id: 'LOAN_AGREEMENT', fileType: 'LOAN_AGREEMENT', files: [loanFile]},
            {id: 'BANK_STATEMENT', fileType: 'BANK_STATEMENT', files: [statementFile]},
        ]);
    });
});
