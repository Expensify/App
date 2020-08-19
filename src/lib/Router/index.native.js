/**
 * On native we use react-router-native to route pages and components due to incompatibility with the web version.
 * @see: https://reactrouter.com/native
 */
import {
    NativeRouter as Router,
    Link,
    Route,
    Redirect,
    Switch,
    withRouter,
} from 'react-router-native';

export {
    Link,
    Route,
    Redirect,
    Router,
    Switch,
    withRouter,
};
