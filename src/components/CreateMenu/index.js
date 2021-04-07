import React from 'react';
import BaseCreateMenu from './BaseCreateMenu';

/**
 * The web implementation of the menu needs to trigger actions before the popup closes
 * When the modal is closed it's elements are destroyed
 * Some browser will ignore interactions on elements that were removed or if the
 * the action is not triggered immediately after a click
 * This is a precaution against malicious scripts
 *
 * @param {Object} props
 * @returns {React.ReactElement}
 */
function CreateMenu(props) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <BaseCreateMenu {...props} executeActionMode="ON_PRESS" />;
}

export default CreateMenu;
