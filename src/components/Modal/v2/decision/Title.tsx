import React from 'react';
import type {ReactNode} from 'react';
import DialogTitle from '@components/Modal/v2/compound/DialogTitle';

type TitleProps = {
    children: ReactNode;
};

function Title({children}: TitleProps) {
    return <DialogTitle variant="decision">{children}</DialogTitle>;
}

export default Title;
export type {TitleProps};
