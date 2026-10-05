import Button from '@components/Button';

import CONST from '@src/CONST';

import type {ConfirmationPageButtonProps} from './ConfirmationPageButtonBase';

import ConfirmationPageButton from './ConfirmationPageButtonBase';

function ConfirmationPagePrimaryButton(props: ConfirmationPageButtonProps) {
    return (
        <ConfirmationPageButton
            variant={CONST.BUTTON_VARIANT.SUCCESS}
            testID="confirmation-primary-button"
            {...props}
        >
            <Button.KeyboardShortcut />
        </ConfirmationPageButton>
    );
}

export default ConfirmationPagePrimaryButton;
