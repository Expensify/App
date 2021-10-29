import React from 'react';
import {View, Text} from 'react-native';
import _ from 'underscore';
import HeaderWithCloseButton from './HeaderWithCloseButton';
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
        }, shortcutModifiers, false, 'openShortcutDialog');
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

    renderRow(shortcut) {
        return (
            <View style={[styles.flex1, styles.alignSelfStretch, styles.flexRow, {borderColor: 'grey', borderWidth: 1}]} key={shortcut.key}>
                <View style={[styles.flex1, styles.p2, {width: '30%', backgroundColor: '#efefef'}]}>
                    <Text>{shortcut.key}</Text>
                </View>
                <View style={[styles.flex1, styles.p2, styles.alignSelfStretch]}>
                    <Text>{this.props.translate(`keyboardShortCutModal.shortcuts.${shortcut.descriptionKey}`)}</Text>
                </View>
            </View>
        );
    }


    render() {
        const viewStyles = this.props.isSmallScreenWidth
            ? [styles.imageModalImageCenterContainer]
            : [styles.imageModalImageCenterContainer, {width: 650}];
        const shortcutMap = KeyboardShortcut.getKeyboardShortcutMap();

        const shortcuts = [];
        _.each(shortcutMap, (descriptionKey, key) => {
            shortcuts.push({key, descriptionKey});
        });

        return (
            <Modal isVisible={this.state.isOpen} type={CONST.MODAL.MODAL_TYPE.CENTERED} onClose={() => this.toggleKeyboardShortcutModal(false)}>
                <View style={viewStyles}>
                    <HeaderWithCloseButton title={this.props.translate('keyboardShortCutModal.title')} onCloseButtonPress={() => this.toggleKeyboardShortcutModal(false)} />
                    <Text>{this.props.translate('keyboardShortCutModal.subtitle')}</Text>

                    <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter, {
                        width: '100%', borderColor: 'grey', borderRadius: 8, borderWidth: 1,
                    }]}
                    >
                        {shortcuts.map(shortcut => (this.renderRow(shortcut)))}
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
