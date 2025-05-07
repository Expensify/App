type ImportContactButtonProps = {
    showImportContacts?: boolean;
    inputHelperText?: string;
};

function ImportContactButton({showImportContacts: _showImportContacts, inputHelperText: _inputHelperText}: ImportContactButtonProps) {
    // This is the web version which doesn't render anything
    // The props are destructured to fix lint errors, but not used as this returns null
    return null;
}

ImportContactButton.displayName = 'ImportContactButton';

export default ImportContactButton;
