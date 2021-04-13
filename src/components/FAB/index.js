import React from 'react';

import FAB from './FAB';
import fabPropTypes from './fabPropTypes';

function Fab({onPress, isActive}) {
    return <FAB onPress={onPress} isActive={isActive} />;
}

Fab.propTypes = fabPropTypes;
export default Fab;
