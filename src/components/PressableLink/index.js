import React from 'react';
import _ from 'underscore';
import {Link} from '../../libs/Router';

/**
 * On web, no changes to Link are required to make links pressable
 * @param props
 * @returns {JSX.Element}
 */
// eslint-disable-next-line react/jsx-props-no-spreading
const PressableLink = props => (<Link {..._.omit(props, ['underlayColor'])} />);

PressableLink.displayName = 'PressableLink';

export default PressableLink;
