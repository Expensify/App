import React from 'react';
import PropTypes from 'prop-types';
import {View, ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import HeaderWithCloseButton from './HeaderWithCloseButton';
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

class KeyboardShortcutsModal extends React.Component {
    componentDidMount() {
        this.subscribedOpenModalShortcuts = [];

        const openShortcutModalConfig = CONST.KEYBOARD_SHORTCUTS.SHORTCUT_MODAL;
        this.unsubscribeShortcutModal = KeyboardShortcut.subscribe(
            openShortcutModalConfig.shortcutKey,
            () => {
                if (this.props.isShortcutsModalOpen) {
                    return;
                }

                ModalActions.close();
                KeyboardShortcutsActions.showKeyboardShortcutModal();
            },
            openShortcutModalConfig.descriptionKey,
            openShortcutModalConfig.modifiers,
            true,
        );

        if (this.props.isShortcutsModalOpen) {
            // The modal started open, which can happen if you reload the page when the modal is open.
            this.subscribeOpenModalShortcuts();
        }
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.isShortcutsModalOpen && this.props.isShortcutsModalOpen) {
            this.subscribeOpenModalShortcuts();
        } else if (prevProps.isShortcutsModalOpen && !this.props.isShortcutsModalOpen) {
            // Modal is closing, remove keyboard shortcuts
            this.unsubscribeOpenModalShortcuts();
        }
    }

    componentWillUnmount() {
        if (this.unsubscribeShortcutModal) {
            this.unsubscribeShortcutModal();
        }
        this.unsubscribeOpenModalShortcuts();
    }

    /*
     * Subscribe shortcuts that only are used when the modal is open
     */
    subscribeOpenModalShortcuts() {
        // Allow closing the modal with the both Enter and Escape keys
        // Both callbacks have the lowest priority (0) to ensure that they are called before any other callbacks
        // and configured so that event propagation is stopped after the callback is called (only when the modal is open)
        const closeShortcutEscapeModalConfig = CONST.KEYBOARD_SHORTCUTS.ESCAPE;
        this.subscribedOpenModalShortcuts.push(
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
        );

        const closeShortcutEnterModalConfig = CONST.KEYBOARD_SHORTCUTS.ENTER;
        this.subscribedOpenModalShortcuts.push(
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
        );

        // Intercept arrow up and down keys to prevent scrolling ArrowKeyFocusManager while this modal is open
        const arrowUpConfig = CONST.KEYBOARD_SHORTCUTS.ARROW_UP;
        this.subscribedOpenModalShortcuts.push(KeyboardShortcut.subscribe(arrowUpConfig.shortcutKey, () => {}, arrowUpConfig.descriptionKey, arrowUpConfig.modifiers, true));

        const arrowDownConfig = CONST.KEYBOARD_SHORTCUTS.ARROW_DOWN;
        this.subscribedOpenModalShortcuts.push(KeyboardShortcut.subscribe(arrowDownConfig.shortcutKey, () => {}, arrowDownConfig.descriptionKey, arrowDownConfig.modifiers, true));
    }

    /*
     * Unsubscribe all shortcuts that were subscribed when the modal opened
     */
    unsubscribeOpenModalShortcuts() {
        _.each(this.subscribedOpenModalShortcuts, (unsubscribe) => unsubscribe());
        this.subscribedOpenModalShortcuts = [];
    }

    /**
     * Render single row for the Keyboard shortcuts with description
     * @param {Object} shortcut
     * @param {Boolean} isFirstRow
     * @returns {*}
     */
    renderRow(shortcut, isFirstRow) {
        return (
            <View
                style={[styles.keyboardShortcutTableRow, isFirstRow && styles.keyboardShortcutTableFirstRow]}
                key={shortcut.displayName}
            >
                <View style={[styles.dFlex, styles.p2, styles.keyboardShortcutTablePrefix]}>
                    <Text>{shortcut.displayName}</Text>
                </View>
                <View style={[styles.flex1, styles.p2, styles.alignSelfStretch]}>
                    <Text>{this.props.translate(`keyboardShortcutModal.shortcuts.${shortcut.descriptionKey}`)}</Text>
                </View>
            </View>
        );
    }

    render() {
        const shortcuts = KeyboardShortcut.getDocumentedShortcuts();
        const modalType = this.props.isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE;

        return (
            <Modal
                isVisible={this.props.isShortcutsModalOpen}
                type={modalType}
                innerContainerStyle={{...styles.keyboardShortcutModalContainer, ...StyleUtils.getKeyboardShortcutsModalWidth(this.props.isSmallScreenWidth)}}
                onClose={KeyboardShortcutsActions.hideKeyboardShortcutModal}
            >
                <HeaderWithCloseButton
                    title={this.props.translate('keyboardShortcutModal.title')}
                    onCloseButtonPress={KeyboardShortcutsActions.hideKeyboardShortcutModal}
                />
                <ScrollView style={[styles.p5, styles.pt0]}>
                    <Text style={styles.mb5}>{this.props.translate('keyboardShortcutModal.subtitle')}</Text>
                    <View style={[styles.keyboardShortcutTableWrapper]}>
                        <View style={[styles.alignItemsCenter, styles.keyboardShortcutTableContainer]}>
                            {_.map(shortcuts, (shortcut, index) => {
                                const isFirstRow = index === 0;
                                return this.renderRow(shortcut, isFirstRow);
                            })}
                        </View>
                    </View>
                </ScrollView>
            </Modal>
        );
    }
}

KeyboardShortcutsModal.propTypes = propTypes;
KeyboardShortcutsModal.defaultProps = defaultProps;

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
