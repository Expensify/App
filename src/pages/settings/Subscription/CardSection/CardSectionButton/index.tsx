import React from 'react';
import type {ButtonProps} from '@components/Button';
import Button from '@components/Button';

function CardSectionButton(props: ButtonProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Button {...props} />;
}

export default CardSectionButton;
