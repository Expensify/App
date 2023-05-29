import React, {useEffect, useState} from 'react';
import {ActivityIndicator} from 'react-native';
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
    // const [isLoading, setIsLoading] = useState(true);

    // useEffect(() => {
    //     // TODO: Maybe need to find a better way to do this
    //     // SignInPage is too heavy when opening the modal, which makes it
    //     // stutter when opening on iOS. Opening the modal with a quick loading
    //     // indicator makes it better.
    //     setTimeout(() => {
    //         setIsLoading(false);
    //     }, 1000);
    // }, []);

    return (
        <Modal
            isVisible={props.isSignInModalOpen}
            onClose={SignInModalActions.hideSignInModal}
            type={CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE}
            useNativeDriver
            hideModalContentWhileAnimating
        >
            <HeaderWithCloseButton onCloseButtonPress={SignInModalActions.hideSignInModal} />
            {/* {isLoading ? <ActivityIndicator /> : <SignInPage />} */}
            <SignInPage />
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
