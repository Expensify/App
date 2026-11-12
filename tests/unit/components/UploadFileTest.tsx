import {render, screen} from '@testing-library/react-native';

import UploadFile from '@components/UploadFile';

import type {FileObject} from '@src/types/utils/Attachment';

import React from 'react';

jest.mock('@components/AttachmentPicker', () => ({
    __esModule: true,
    default: ({children}: {children: (props: {openPicker: () => void}) => React.ReactNode}) => children({openPicker: () => {}}),
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
});
