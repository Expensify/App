// This is a no-op component for desktop and web,
// because sharing to the app is only supported on mobile
import ShareType from './ShareType';
import sharedItemPropTypes from './PropTypes';

export {
    sharedItemPropTypes,
};

export default {
    register: () => {},
    deregister: () => {},
    TYPE: ShareType,
};
