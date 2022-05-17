import React, {useRef} from 'react';
import {withNavigation} from '@react-navigation/compat';
import {withOnyx} from 'react-native-onyx';
import compose from '../../../../libs/compose';
import withWindowDimensions from '../../../../components/withWindowDimensions';
import withLocalize from '../../../../components/withLocalize';
import ONYXKEYS from '../../../../ONYXKEYS';
import propTypes from './sidebarPropTypes';
import BaseSidebarScreen from './BaseSidebarScreen';

const SidebarScreen = (props) => {
    const BaseSidebarScreenRef = useRef(null);

    /**
     * Method create event listener
     */
    const createDragoverListener = () => {
        document.addEventListener('dragover', BaseSidebarScreenRef.current.hideCreateMenu);
    };

    /**
     * Method remove event listener.
     */
    const removeDragoverListener = () => {
        document.removeEventListener('dragover', BaseSidebarScreenRef.current.hideCreateMenu);
    };
    return (
        <BaseSidebarScreen
            innerRef={BaseSidebarScreenRef}
            onShowCreateMenu={createDragoverListener}
            onHideCreateMenu={removeDragoverListener}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
};

SidebarScreen.propTypes = propTypes;
SidebarScreen.displayName = 'SidebarScreen';

export default compose(
    withNavigation,
    withLocalize,
    withWindowDimensions,
    withOnyx({
        allPolicies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
        isCreatingWorkspace: {
            key: ONYXKEYS.IS_CREATING_WORKSPACE,
        },
    }),
)(SidebarScreen);
