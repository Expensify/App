import _ from 'underscore';
import React, {Component} from 'react';
import {View, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import Header from '../../components/Header';
import Navigation from '../../libs/Navigation/Navigation';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import CONST from '../../CONST';
import Modal from '../../components/Modal/index.ios';
import themeColors from '../../styles/themes/default';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';

const propTypes = {
    /** The route object passed to this page from the navigator */
    route: PropTypes.shape({
        /** Each parameter passed via the URL */
        params: PropTypes.shape({
            /** The policyID that is being configured */
            policyID: PropTypes.string.isRequired,
        }).isRequired,
    }).isRequired,

    ...withLocalizePropTypes,
};

const WalletStatementModal = props => (
    <>
        <Modal
        >
            <HeaderWithCloseButton
                title={props.translate('reportActionCompose.sendAttachment')}
            />
        </Modal>
    </>
);

WalletStatementModal.propTypes = propTypes;
WalletStatementModal.displayName = 'WalletStatementModal';
export default withLocalize(WalletStatementModal);

