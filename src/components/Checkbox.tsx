import React from 'react';
import CONST from '@src/CONST';
import SelectionButton from './SelectionButton';
import type {SelectionButtonProps} from './SelectionButton';

type CheckboxProps = Omit<SelectionButtonProps, 'role'>;

function Checkbox(props: CheckboxProps) {
    return (
        <SelectionButton
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            role={CONST.ROLE.CHECKBOX}
        />
    );
}

export default Checkbox;
