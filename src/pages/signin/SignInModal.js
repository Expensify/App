import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import SignInPage from './SignInPage';
import Modal from '../../components/Modal';
import CONST from '../../CONST';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import ONYXKEYS from '../../ONYXKEYS';
import * as SignInModalActions from '../../libs/actions/SignInModalActions';

const propTypes = {
    /** Modal visibility */
    isSignInModalOpen: PropTypes.bool,
};

const defaultProps = {
    isSignInModalOpen: false,
};

function SignInModal(props) {
    return (
        <Modal
            isVisible={props.isSignInModalOpen}
            onClose={SignInModalActions.hideSignInModal}
            type={CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE}
            hideModalContentWhileAnimating
            useNativeDriver
        >
            <HeaderWithCloseButton onCloseButtonPress={SignInModalActions.hideSignInModal} />
            <SignInPage isAnonymous />
        </Modal>
    );
}

SignInModal.propTypes = propTypes;
SignInModal.defaultProps = defaultProps;
SignInModal.displayName = 'SignInModal';

export default withOnyx({
    isSignInModalOpen: {
        key: ONYXKEYS.IS_SIGN_IN_MODAL_OPEN,
    },
})(SignInModal);
