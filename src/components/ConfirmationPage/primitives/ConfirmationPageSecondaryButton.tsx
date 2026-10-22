import type {ConfirmationPageButtonProps} from './ConfirmationPageButtonBase';

import ConfirmationPageButtonBase from './ConfirmationPageButtonBase';

function ConfirmationPageSecondaryButton(props: ConfirmationPageButtonProps) {
    return (
        <ConfirmationPageButtonBase
            testID="confirmation-secondary-button"
            {...props}
        />
    );
}

export default ConfirmationPageSecondaryButton;
