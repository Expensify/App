// This is a no-op component for desktop and web,
// because sharing to the app is only supported on mobile
import ShareType from './ShareType';

export default {
    register: () => {},
    deregister: () => {},
    TYPE: ShareType,
};
