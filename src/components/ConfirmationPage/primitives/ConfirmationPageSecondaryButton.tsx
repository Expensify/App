import type {ConfirmationPageButtonProps} from './ConfirmationPageButtonBase';

import ConfirmationPageButton from './ConfirmationPageButtonBase';

function ConfirmationPageButtonSecondary(props: ConfirmationPageButtonProps) {
    return (
        <ConfirmationPageButton
            testID="confirmation-secondary-button"
            {...props}
        />
    );
}

export default ConfirmationPageButtonSecondary;
