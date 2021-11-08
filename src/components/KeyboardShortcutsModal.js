import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import HeaderWithCloseButton from './HeaderWithCloseButton';
import Text from './Text';
import Modal from './Modal';
import CONST from '../CONST';
import styles from '../styles/styles';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import compose from '../libs/compose';
import KeyboardShortcut from '../libs/KeyboardShortcut';
import getOperatingSystem from '../libs/getOperatingSystem';

const propTypes = {
    /** prop to fetch screen width */
    ...windowDimensionsPropTypes,

    /** props to fetch translation functions */
    ...withLocalizePropTypes,
};

class KeyboardShortcutsModal extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            isOpen: false,
        };
    }

    componentDidMount() {
        let shortcutModifiers = ['control'];
        if (getOperatingSystem() === CONST.OS.MAC_OS) {
            shortcutModifiers = ['meta'];
        }
        this.unsubscribeShortCutModal = KeyboardShortcut.subscribe('?', () => {
            this.toggleKeyboardShortcutModal(true);
        }, 'openShortcutDialog', shortcutModifiers, true);
    }

    componentWillUnmount() {
        if (this.unsubscribeShortCutModal) {
            this.unsubscribeShortCutModal();
        }
    }

    /**
     * Set flag for model visibility
     * @param {Boolean} flag
     */
    toggleKeyboardShortcutModal(flag) {
        this.setState({isOpen: flag});
    }

    renderRow(shortcut, isFirstRow) {
        return (
            <View
                style={[
                    styles.keyboardShortcutTableRow,
                    styles.flex1,
                    isFirstRow && styles.keyboardShortcutTableFirstRow,
                ]}
                key={shortcut.key}
            >
                <View style={[styles.dFlex, styles.p2, styles.keyboardShortcutTablePrefix]}>
                    <Text>{shortcut.key}</Text>
                </View>
                <View style={[styles.flex1, styles.p2, styles.alignSelfStretch]}>
                    <Text>{this.props.translate(`keyboardShortCutModal.shortcuts.${shortcut.descriptionKey}`)}</Text>
                </View>
            </View>
        );
    }

    render() {
        const shortcuts = KeyboardShortcut.getKeyboardShortcutMap();
        return (
            <Modal
                isVisible={this.state.isOpen}
                type={CONST.MODAL.MODAL_TYPE.CENTERED}
                containerStyle={styles.keyboardShortcutModalContainer}
                onClose={() => this.toggleKeyboardShortcutModal(false)}
            >
                <HeaderWithCloseButton title={this.props.translate('keyboardShortCutModal.title')} onCloseButtonPress={() => this.toggleKeyboardShortcutModal(false)} />
                <View style={[styles.p5, styles.pt0]}>
                    <Text style={styles.mb5}>{this.props.translate('keyboardShortCutModal.subtitle')}</Text>
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

export default compose(
    withWindowDimensions,
    withLocalize,
)(KeyboardShortcutsModal);
