import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import HeaderWithCloseButton from './HeaderWithCloseButton';
import ExpensifyText from './ExpensifyText';
import Modal from './Modal';
import CONST from '../CONST';
import styles from '../styles/styles';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import compose from '../libs/compose';
import KeyboardShortcut from '../libs/KeyboardShortcut';
import * as KeyboardShortcutsActions from '../libs/actions/KeyboardShortcuts';
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
        const shortcutConfig = CONST.KEYBOARD_SHORTCUTS.SHORTCUT_MODAL;
        const shortcutModifiers = KeyboardShortcut.getShortcutModifiers(shortcutConfig.modifiers);
        this.unsubscribeShortcutModal = KeyboardShortcut.subscribe(shortcutConfig.shortcutKey, () => {
            KeyboardShortcutsActions.showKeyboardShortcutModal();
        }, shortcutConfig.descriptionKey, shortcutModifiers, true);
    }

    componentWillUnmount() {
        if (!this.unsubscribeShortcutModal) {
            return;
        }
        this.unsubscribeShortcutModal();
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
                style={[
                    styles.keyboardShortcutTableRow,
                    styles.flex1,
                    isFirstRow && styles.keyboardShortcutTableFirstRow,
                ]}
                key={shortcut.displayName}
            >
                <View style={[styles.dFlex, styles.p2, styles.keyboardShortcutTablePrefix]}>
                    <ExpensifyText>{shortcut.displayName}</ExpensifyText>
                </View>
                <View style={[styles.flex1, styles.p2, styles.alignSelfStretch]}>
                    <ExpensifyText>{this.props.translate(`keyboardShortcutModal.shortcuts.${shortcut.descriptionKey}`)}</ExpensifyText>
                </View>
            </View>
        );
    }

    render() {
        const shortcuts = KeyboardShortcut.getKeyboardShortcuts();
        const modalType = this.props.isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE;

        return (
            <Modal
                isVisible={this.props.isShortcutsModalOpen}
                type={modalType}
                containerStyle={styles.keyboardShortcutModalContainer}
                onClose={KeyboardShortcutsActions.hideKeyboardShortcutModal}
            >
                <HeaderWithCloseButton title={this.props.translate('keyboardShortcutModal.title')} onCloseButtonPress={KeyboardShortcutsActions.hideKeyboardShortcutModal} />
                <View style={[styles.p5, styles.pt0]}>
                    <ExpensifyText style={styles.mb5}>{this.props.translate('keyboardShortcutModal.subtitle')}</ExpensifyText>
                    <View style={[styles.keyboardShortcutTableWrapper]}>
                        <View style={[styles.alignItemsCenter, styles.keyboardShortcutTableContainer]}>
                            {_.map(shortcuts, (shortcut, index) => {
                                const isFirstRow = index === 0;
                                return this.renderRow(shortcut, isFirstRow);
                            })}
                        </View>
                    </View>
                </View>
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
        isShortcutsModalOpen: {key: ONYXKEYS.IS_SHORTCUTS_MODAL_OPEN},
    }),
)(KeyboardShortcutsModal);
