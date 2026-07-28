/** This direct import is required, because this function was added by a patch,
 *  and its typings are not supported by default */
import {useTabAnimation} from '@react-navigation/material-top-tabs/src/utils/useTabAnimation';

declare module '@react-navigation/material-top-tabs' {
    // eslint-disable-next-line import/prefer-default-export
    export {useTabAnimation};
}
