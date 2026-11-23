/** The list of a form's dropdown row on a page of its own */
import CONST from '@src/CONST';

import type {ReactNode} from 'react';

import React from 'react';

import Header from './Header';
import Modal from './Modal';
import ScreenWrapper from './ScreenWrapper';

type FormDropdownFullPageListProps = {
    isVisible: boolean;

    /** Heading of the page, the field's question */
    title: string;

    /** Closes the page without a pick */
    onClose: () => void;

    /** The field's list, the same one its dropdown shows */
    children: ReactNode;
};

/**
 * A choice field's list on a page of its own. A dropdown row opens it only when neither side of the row has room for
 * one option, where the expense form would navigate to the field's page. A form field has no page to go to, so its
 * list opens here instead.
 */
function FormDropdownFullPageList({isVisible, title, onClose, children}: FormDropdownFullPageListProps) {
    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isVisible}
            onClose={onClose}
            onBackdropPress={onClose}
            shouldHandleNavigationBack
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <ScreenWrapper
                includePaddingTop={false}
                enableEdgeToEdgeBottomSafeAreaPadding
                testID="FormDropdownFullPageList"
            >
                <Header>
                    <Header.BackButton onPress={onClose} />
                    <Header.Title title={title} />
                </Header>
                {children}
            </ScreenWrapper>
        </Modal>
    );
}

export default FormDropdownFullPageList;
