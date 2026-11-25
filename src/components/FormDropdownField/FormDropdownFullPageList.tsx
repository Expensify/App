/** The list of a form's dropdown row on a page of its own */
import Header from '@components/Header';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';

import CONST from '@src/CONST';
import type {SentryLabel} from '@src/types/utils/SentryLabel';

import type {ReactNode} from 'react';

import React from 'react';

type FormDropdownFullPageListProps = {
    isVisible: boolean;

    /** Heading of the page, the field's question */
    title: string;

    /** Closes the page without a pick */
    onClose: () => void;

    /** Sentry label for the back button in the page's header, so each form's presses are attributed to it */
    backButtonSentryLabel: SentryLabel;

    /** The field's list, the same one its dropdown shows */
    children: ReactNode;
};

/**
 * A choice field's list on a page of its own. A dropdown row opens it only when neither side of the row has room for
 * one option, where the expense form would navigate to the field's page. A form field has no page to go to, so its
 * list opens here instead.
 */
function FormDropdownFullPageList({isVisible, title, onClose, backButtonSentryLabel, children}: FormDropdownFullPageListProps) {
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
                    <Header.BackButton
                        onPress={onClose}
                        sentryLabel={backButtonSentryLabel}
                    />
                    <Header.Title title={title} />
                </Header>
                {children}
            </ScreenWrapper>
        </Modal>
    );
}

export default FormDropdownFullPageList;
