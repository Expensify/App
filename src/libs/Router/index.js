/**
 * On web we use react-router-dom to route pages and components due to incompatibility with the native version.
 * @see: https://reactrouter.com/web
 */
import {
    HashRouter as Router,
    Route,
    Redirect,
    Switch,
    withRouter,
} from 'react-router-dom';

export {
    Route,
    Redirect,
    Router,
    Switch,
    withRouter
};
