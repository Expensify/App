import React, {useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import {View, ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import HeaderWithBackButton from './HeaderWithBackButton';
import Text from './Text';
import Modal from './Modal';
import CONST from '../CONST';
import styles from '../styles/styles';
import * as StyleUtils from '../styles/StyleUtils';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import compose from '../libs/compose';
import KeyboardShortcut from '../libs/KeyboardShortcut';
import * as KeyboardShortcutsActions from '../libs/actions/KeyboardShortcuts';
import * as ModalActions from '../libs/actions/Modal';
import ONYXKEYS from '../ONYXKEYS';

const propTypes = {
    /** prop to set shortcuts modal visibility */
    isShortcutsModalOpen: PropTypes.bool,

    /** prop to fetch screen width */
    ...windowDimensionsPropTypes,

    /** props to fetch translation functions */
    ...withLocalizePropTypes,
};

const defaultProps = {
    isShortcutsModalOpen: false,
};

const closeShortcutEscapeModalConfig = CONST.KEYBOARD_SHORTCUTS.ESCAPE;
const closeShortcutEnterModalConfig = CONST.KEYBOARD_SHORTCUTS.ENTER;
const arrowUpConfig = CONST.KEYBOARD_SHORTCUTS.ARROW_UP;
const arrowDownConfig = CONST.KEYBOARD_SHORTCUTS.ARROW_DOWN;
const openShortcutModalConfig = CONST.KEYBOARD_SHORTCUTS.SHORTCUT_MODAL;

function KeyboardShortcutsModal({isShortcutsModalOpen = false, isSmallScreenWidth, translate}) {
    const subscribedOpenModalShortcuts = useRef([]);
    const modalType = isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE;
    const shortcuts = KeyboardShortcut.getDocumentedShortcuts();

    /*
     * Subscribe shortcuts that only are used when the modal is open
     */
    const subscribeOpenModalShortcuts = () => {
        // Allow closing the modal with the both Enter and Escape keys
        // Both callbacks have the lowest priority (0) to ensure that they are called before any other callbacks
        // and configured so that event propagation is stopped after the callback is called (only when the modal is open)

        subscribedOpenModalShortcuts.current = [
            KeyboardShortcut.subscribe(
                closeShortcutEscapeModalConfig.shortcutKey,
                () => {
                    ModalActions.close();
                    KeyboardShortcutsActions.hideKeyboardShortcutModal();
                },
                closeShortcutEscapeModalConfig.descriptionKey,
                closeShortcutEscapeModalConfig.modifiers,
                true,
                true,
            ),

            KeyboardShortcut.subscribe(
                closeShortcutEnterModalConfig.shortcutKey,
                () => {
                    ModalActions.close();
                    KeyboardShortcutsActions.hideKeyboardShortcutModal();
                },
                closeShortcutEnterModalConfig.descriptionKey,
                closeShortcutEnterModalConfig.modifiers,
                true,
            ),

            // Intercept arrow up and down keys to prevent scrolling ArrowKeyFocusManager while this modal is open
            KeyboardShortcut.subscribe(arrowUpConfig.shortcutKey, () => {}, arrowUpConfig.descriptionKey, arrowUpConfig.modifiers, true),
            KeyboardShortcut.subscribe(arrowDownConfig.shortcutKey, () => {}, arrowDownConfig.descriptionKey, arrowDownConfig.modifiers, true),
        ];
    };

    /*
     * Unsubscribe all shortcuts that were subscribed when the modal opened
     */
    const unsubscribeOpenModalShortcuts = () => {
        _.each(subscribedOpenModalShortcuts.current, (unsubscribe) => unsubscribe());
        subscribedOpenModalShortcuts.current = [];
    };

    /**
     * Render single row for the Keyboard shortcuts with description
     * @param {Object} shortcut
     * @param {Boolean} isFirstRow
     * @returns {*}
     */
    const renderRow = (shortcut, isFirstRow) => (
        <View
            style={[styles.keyboardShortcutTableRow, isFirstRow && styles.keyboardShortcutTableFirstRow]}
            key={shortcut.displayName}
        >
            <View style={[styles.dFlex, styles.p2, styles.keyboardShortcutTablePrefix]}>
                <Text>{shortcut.displayName}</Text>
            </View>
            <View style={[styles.flex1, styles.p2, styles.alignSelfStretch]}>
                <Text>{translate(`keyboardShortcutModal.shortcuts.${shortcut.descriptionKey}`)}</Text>
            </View>
        </View>
    );

    useEffect(() => {
        const unsubscribeShortcutModal = KeyboardShortcut.subscribe(
            openShortcutModalConfig.shortcutKey,
            () => {
                if (isShortcutsModalOpen) {
                    return;
                }

                ModalActions.close();
                KeyboardShortcutsActions.showKeyboardShortcutModal();
            },
            openShortcutModalConfig.descriptionKey,
            openShortcutModalConfig.modifiers,
            true,
        );

        if (isShortcutsModalOpen) {
            // The modal started open, which can happen if you reload the page when the modal is open.
            subscribeOpenModalShortcuts();
        }

        return () => {
            if (unsubscribeShortcutModal) {
                unsubscribeShortcutModal();
            }
            unsubscribeOpenModalShortcuts();
        };
        // We only want this to run on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (isShortcutsModalOpen) {
            subscribeOpenModalShortcuts();
        } else {
            // Modal is closing, remove keyboard shortcuts
            unsubscribeOpenModalShortcuts();
        }
        // subscribeOpenModalShortcuts and unsubscribeOpenModalShortcuts functions are not added as dependencies since they don't change between renders
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isShortcutsModalOpen]);

    return (
        <Modal
            isVisible={isShortcutsModalOpen}
            type={modalType}
            innerContainerStyle={{...styles.keyboardShortcutModalContainer, ...StyleUtils.getKeyboardShortcutsModalWidth(isSmallScreenWidth)}}
            onClose={KeyboardShortcutsActions.hideKeyboardShortcutModal}
        >
            <HeaderWithBackButton
                title={translate('keyboardShortcutModal.title')}
                shouldShowCloseButton
                shouldShowBackButton={false}
                onCloseButtonPress={KeyboardShortcutsActions.hideKeyboardShortcutModal}
            />
            <ScrollView style={[styles.p5, styles.pt0]}>
                <Text style={styles.mb5}>{translate('keyboardShortcutModal.subtitle')}</Text>
                <View style={[styles.keyboardShortcutTableWrapper]}>
                    <View style={[styles.alignItemsCenter, styles.keyboardShortcutTableContainer]}>
                        {_.map(shortcuts, (shortcut, index) => {
                            const isFirstRow = index === 0;
                            return renderRow(shortcut, isFirstRow);
                        })}
                    </View>
                </View>
            </ScrollView>
        </Modal>
    );
}

KeyboardShortcutsModal.propTypes = propTypes;
KeyboardShortcutsModal.defaultProps = defaultProps;
KeyboardShortcutsModal.displayName = 'KeyboardShortcutsModal';

export default compose(
    withWindowDimensions,
    withLocalize,
    withOnyx({
        isShortcutsModalOpen: {
            key: ONYXKEYS.IS_SHORTCUTS_MODAL_OPEN,
            initWithStoredValues: false,
        },
    }),
)(KeyboardShortcutsModal);
