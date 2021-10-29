import React from 'react';
import PropTypes from 'prop-types';
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

const propTypes = {

    /** Flag to visibility of shortcuts modal */
    isOpen: PropTypes.bool.isRequired,

    /** function to send the updated visibility flag to parent */
    toggleKeyboardShortcutModal: PropTypes.func.isRequired,

    /** prop to fetch screen width */
    ...windowDimensionsPropTypes,

    /** props to fetch translation functions */
    ...withLocalizePropTypes,

};

const KeyboardShortcutsModal = ({
    isOpen, toggleKeyboardShortcutModal, isSmallScreenWidth, translate,
}) => {
    const viewStyles = isSmallScreenWidth
        ? [styles.imageModalImageCenterContainer]
        : [styles.imageModalImageCenterContainer, {width: 650}];
    const shortcutMap = KeyboardShortcut.getKeyboardShortcutMap();

    const shortcuts = [];
    _.each(shortcutMap, (descriptionKey, key) => {
        shortcuts.push({key, descriptionKey});
    });


    const renderRow = shortcut => (
        <View style={[styles.flex1, styles.alignSelfStretch, styles.flexRow, {borderColor: 'grey', borderWidth: 1}]} key={shortcut.key}>
            <View style={[styles.flex1, styles.p2, {width: '30%', backgroundColor: '#efefef'}]}>
                <Text>{shortcut.key}</Text>
            </View>
            <View style={[styles.flex1, styles.p2, styles.alignSelfStretch]}>
                <Text>{translate(`keyboardShortCutModal.shortcuts.${shortcut.descriptionKey}`)}</Text>
            </View>
        </View>
    );


    return (
        <Modal isVisible={isOpen} modalType={CONST.MODAL.MODAL_TYPE.CENTERED} onClose={() => toggleKeyboardShortcutModal(false)}>
            <View style={viewStyles}>
                <HeaderWithCloseButton title="Keyboard Shortcuts" onCloseButtonPress={() => toggleKeyboardShortcutModal(false)} />
                <Text>Sub title</Text>

                <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter, {
                    width: '100%', borderColor: 'grey', borderRadius: 8, borderWidth: 1,
                }]}
                >
                    {shortcuts.map(shortcut => (renderRow(shortcut)))}
                </View>

            </View>
        </Modal>
    );
};

KeyboardShortcutsModal.propTypes = propTypes;

export default compose(
    withWindowDimensions,
    withLocalize,
)(KeyboardShortcutsModal);
