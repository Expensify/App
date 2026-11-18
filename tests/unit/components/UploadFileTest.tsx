import {fireEvent, render, screen} from '@testing-library/react-native';

import UploadFile from '@components/UploadFile';

import type {FileObject} from '@src/types/utils/Attachment';

import React from 'react';

let mockPickedFiles: FileObject[] = [];

jest.mock('@components/AttachmentPicker', () => ({
    __esModule: true,
    default: ({children}: {children: (props: {openPicker: (options: {onPicked: (files: FileObject[]) => void}) => void}) => React.ReactNode}) =>
        children({openPicker: ({onPicked}) => onPicked(mockPickedFiles)}),
}));

jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

const passport: FileObject = {name: 'passport.pdf', uri: 'file://passport.pdf'};
const bankStatement: FileObject = {name: 'statement.pdf', uri: 'file://statement.pdf'};

function renderUploadFile(props: Partial<React.ComponentProps<typeof UploadFile>> = {}) {
    render(
        <UploadFile
            buttonText="Choose files"
            uploadedFiles={[passport, bankStatement]}
            onUpload={() => {}}
            onRemove={() => {}}
            acceptedFileTypes={['pdf']}
            setError={() => {}}
            {...props}
        />,
    );
}

describe('UploadFile', () => {
    it('names each remove button after its file for screen readers', () => {
        // Given two uploaded files
        const files = [passport, bankStatement];

        // When the uploader renders them
        renderUploadFile({uploadedFiles: files});

        // Then each remove button says which file it removes, rather than every button reading "Remove"
        expect(screen.getByLabelText('common.remove, passport.pdf')).toBeOnTheScreen();
        expect(screen.getByLabelText('common.remove, statement.pdf')).toBeOnTheScreen();
    });

    it('reads the upload button by its label when given one, and by its text otherwise', () => {
        // Given an uploader whose button should also name the document it asks for
        const accessibilityLabel = 'Choose files, Source of funds document';

        // When it renders with and without that label
        renderUploadFile({accessibilityLabel});
        const isLabelRead = screen.queryByLabelText(accessibilityLabel) !== null;
        renderUploadFile();

        // Then the label is read when given, and the button text when not, as on existing screens
        expect(isLabelRead).toBe(true);
        expect(screen.getByLabelText('Choose files')).toBeOnTheScreen();
    });

    it('takes a file whose name differs from an uploaded one only in case', () => {
        // Given a contract uploaded under an upper case name
        const onUpload = jest.fn();
        renderUploadFile({uploadedFiles: [{name: 'Contract.PDF', uri: 'file://Contract.PDF'}], onUpload});

        // When the user picks a file with the same name in lower case
        const lowerCaseContract: FileObject = {name: 'contract.pdf', uri: 'file://contract.pdf'};
        mockPickedFiles = [lowerCaseContract];
        fireEvent.press(screen.getByText('Choose files'));

        // Then it is added, since only forms whose saved files come back under the server's name compare normalized names
        expect(onUpload).toHaveBeenCalledWith([lowerCaseContract]);
    });

    it('leaves out a file whose server name matches an uploaded one when normalized names are compared', () => {
        // Given a saved file, which the server names in lowercase with its spaces replaced
        const onUpload = jest.fn();
        renderUploadFile({uploadedFiles: [{name: 'loan_agreement.pdf', uri: 'kyc/1/loan_agreement.pdf'}], onUpload, shouldCompareNormalizedFileNames: true});

        // When the user picks the same file again under its original name
        mockPickedFiles = [{name: 'Loan Agreement.pdf', uri: 'file://Loan Agreement.pdf'}];
        fireEvent.press(screen.getByText('Choose files'));

        // Then nothing is added, since the server would store it under the name already there
        expect(onUpload).toHaveBeenCalledWith([]);
    });
});
