import React from 'react';
import PropTypes from 'prop-types';
import { withOnyx } from 'react-native-onyx';
import withLocalize, { withLocalizePropTypes } from './withLocalize';
import ONYXKEYS from '../ONYXKEYS';
import FullScreenLoadingIndicator from './FullscreenLoadingIndicator';

const propTypes = {
    /** Child elements */
    children: PropTypes.node.isRequired,

    isLoading: PropTypes.bool.isRequired,

    error: PropTypes.string,

    /** Props to fetch translation features */
    ...withLocalizePropTypes,
};

const FullPageOfflineView = (props) => {
    if (props.isLoading) { 
        return <FullScreenLoadingIndicator/>;
    }

    return props.children;
};

FullPageOfflineView.propTypes = propTypes;

export default compose(
    withLocalize,
    withOnyx({
        isShortcutsModalOpen: {key: ONYXKEYS.IS_SHORTCUTS_MODAL_OPEN},
    }),
)(FullPageOfflineView);
