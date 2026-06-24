import React from 'react';
import type {ReactNode} from 'react';
import type {ModalKind} from '@components/Overlay/libs/overlayStore';
import Portal from '@components/Overlay/Portal';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {SheetKeyboardBehavior} from './resolveKeyboardBehavior/types';

type SheetProps = {
    kind: ModalKind;
    // eslint-disable-next-line react/no-unused-prop-types -- cross-platform contract; the native variant consumes this.
    onRequestClose?: () => void;
    // eslint-disable-next-line react/no-unused-prop-types -- cross-platform contract; the native variant consumes this.
    keyboardBehavior?: SheetKeyboardBehavior;
    children: ReactNode;
};

function getKindZIndex(kind: ModalKind): number {
    if (kind === CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED) {
        return variables.modalRightDockedZIndex;
    }
    return variables.modalBaseZIndex;
}

function Sheet({kind, children}: SheetProps) {
    return <Portal zIndex={getKindZIndex(kind)}>{children}</Portal>;
}

export default Sheet;
