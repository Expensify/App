import Button from '@components/Button';

import CONST from '@src/CONST';

import type {ConfirmationPageButtonProps} from './ConfirmationPageButtonBase';

import ConfirmationPageButtonBase from './ConfirmationPageButtonBase';

function ConfirmationPagePrimaryButton(props: ConfirmationPageButtonProps) {
    return (
        <ConfirmationPageButtonBase
            variant={CONST.BUTTON_VARIANT.SUCCESS}
            testID="confirmation-primary-button"
            {...props}
        >
            <Button.KeyboardShortcut />
        </ConfirmationPageButtonBase>
    );
}

export default ConfirmationPagePrimaryButton;
