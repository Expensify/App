import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';

import type {ComponentProps} from 'react';

import React from 'react';

type TextFieldProps = ComponentProps<typeof MenuItemWithTopDescription> & Pick<OfflineWithFeedbackProps, 'pendingAction'>;

function TextField({pendingAction, ...props}: TextFieldProps) {
    return (
        <OfflineWithFeedback pendingAction={pendingAction}>
            <MenuItemWithTopDescription {...props} />
        </OfflineWithFeedback>
    );
}

export default TextField;
