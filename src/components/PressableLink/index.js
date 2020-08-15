import React from 'react';
import {Link} from '../../lib/Router';

/**
 * On web, no changes to Link are required to make links pressable
 * @param props
 * @returns {JSX.Element}
 */
// eslint-disable-next-line react/jsx-props-no-spreading
const PressableLink = props => (<Link {...props} />);

PressableLink.displayName = 'PressableLink';

export default PressableLink;
