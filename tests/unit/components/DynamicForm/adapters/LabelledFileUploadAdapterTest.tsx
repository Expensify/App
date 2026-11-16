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

function renderAdapter(value: DynamicFormListItem[], onInputChange: (value: DynamicFormListItem[]) => void, fileLimit = 0, errorText = '') {
    render(
        <LabelledFileUploadAdapter
            value={value}
            onInputChange={onInputChange}
            uploads={UPLOADS}
            acceptedFileTypes={['pdf']}
            fileLimit={fileLimit}
            errorText={errorText}
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

    it('leaves out a file the same button already holds and says why', () => {
        // Given the loan agreement uploaded
        const onInputChange = jest.fn();
        renderAdapter([{id: 'LOAN_AGREEMENT', fileType: 'LOAN_AGREEMENT', files: [loanFile]}], onInputChange);

        // When the user picks it again under the same button
        mockPickedFiles = [loanFile];
        fireEvent.press(screen.getByText('Upload loan agreement'));

        // Then nothing is added, since the same document twice proves nothing more, and the user is told the file is already there
        expect(onInputChange).not.toHaveBeenCalled();
        expect(screen.getByText('attachmentPicker.fileAlreadyAdded')).toBeOnTheScreen();
    });

    it('tells a saved file apart from a new one by the name the server gives it', () => {
        // Given a saved file, which the server names in lowercase with its spaces and dots replaced
        const onInputChange = jest.fn();
        const savedFile: FileObject = {name: 'loan_agreement_v1.pdf', uri: 'kyc/1/loan_agreement_v1.pdf'};
        renderAdapter([{id: 'LOAN_AGREEMENT', fileType: 'LOAN_AGREEMENT', files: [savedFile]}], onInputChange);

        // When the user picks the same file again under its original name
        mockPickedFiles = [{name: 'Loan Agreement v1.pdf', uri: 'file://Loan Agreement v1.pdf'}];
        fireEvent.press(screen.getByText('Upload loan agreement'));

        // Then it is left out as the file the button already holds
        expect(onInputChange).not.toHaveBeenCalled();
        expect(screen.getByText('attachmentPicker.fileAlreadyAdded')).toBeOnTheScreen();
    });

    it('counts the files of every button against the file limit', () => {
        // Given a field that takes two files, with the loan agreement uploaded
        const onInputChange = jest.fn();
        renderAdapter([{id: 'LOAN_AGREEMENT', fileType: 'LOAN_AGREEMENT', files: [loanFile]}], onInputChange, 2);

        // When the user picks two files under the bank statement button, which holds none yet
        mockPickedFiles = [statementFile, {name: 'statement-2.pdf', uri: 'file://statement-2.pdf'}];
        fireEvent.press(screen.getByText('Upload bank statement'));

        // Then nothing is added and the limit is shown, since the limit is on the source's documents as a whole, not on each button
        expect(onInputChange).not.toHaveBeenCalled();
        expect(screen.getByText('attachmentPicker.tooManyFiles')).toBeOnTheScreen();
    });

    it('takes files under a second button while the field stays within the file limit', () => {
        // Given a field that takes two files, with the loan agreement uploaded
        const onInputChange = jest.fn();
        renderAdapter([{id: 'LOAN_AGREEMENT', fileType: 'LOAN_AGREEMENT', files: [loanFile]}], onInputChange, 2);

        // When the user picks one file under the bank statement button
        mockPickedFiles = [statementFile];
        fireEvent.press(screen.getByText('Upload bank statement'));

        // Then the file is added, since the field holds two files in all
        expect(onInputChange).toHaveBeenCalledWith([
            {id: 'LOAN_AGREEMENT', fileType: 'LOAN_AGREEMENT', files: [loanFile]},
            {id: 'BANK_STATEMENT', fileType: 'BANK_STATEMENT', files: [statementFile]},
        ]);
    });
});
it('shows an error under the last button when every button has a file', () => {
    // Given both buttons holding a file, and an error about the field as a whole, such as too many files for one save
    // When the field renders
    renderAdapter(
        [
            {id: 'LOAN_AGREEMENT', fileType: 'LOAN_AGREEMENT', files: [loanFile]},
            {id: 'BANK_STATEMENT', fileType: 'BANK_STATEMENT', files: [statementFile]},
        ],
        jest.fn(),
        0,
        'Too many files',
    );

    // Then the error shows once, so the user sees why Next does not go on
    expect(screen.getAllByText('Too many files')).toHaveLength(1);
});
