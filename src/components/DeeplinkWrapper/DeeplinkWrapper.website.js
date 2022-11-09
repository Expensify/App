import _ from 'underscore';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import deeplinkRoutes from './deeplinkRoutes';
import FullScreenLoadingIndicator from '../FullscreenLoadingIndicator';
import Button from '../Button';
import Text from '../Text';
import styles from '../../styles/styles';
import CONST from '../../CONST';
import CONFIG from '../../CONFIG';

const propTypes = {
    /** Children to render. */
    children: PropTypes.node.isRequired,
};

class DeeplinkWrapper extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            appInstallationCheckStatus: this.isMacOSWeb() ? 'checking' : 'not-installed',
        };
    }

    componentDidMount() {
        if (this.isMacOSWeb()) {
            let focused = true;

            window.addEventListener('blur', () => {
                focused = false;
            });

            setTimeout(() => {
                if (!focused) {
                    this.setState({appInstallationCheckStatus: 'installed'});
                } else {
                    this.setState({appInstallationCheckStatus: 'not-installed'});
                }
            }, 500);

            // check if pathname matches with deeplink routes
            const pathname = window.location.pathname;
            const matchedRoute = _.find(deeplinkRoutes, (route) => {
                const routeRegex = new RegExp(route.pattern);
                return routeRegex.test(pathname);
            });

            if (matchedRoute) {
                this.setState({deeplinkMatch: true});

                this.openRouteInDesktopApp();
            } else {
                this.setState({deeplinkMatch: false});
            }
        }

        return undefined;
    }

    openRouteInDesktopApp() {
        const pathname = window.location.pathname;
        const expensifyUrl = new URL(CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL);
        window.location = `${CONST.DEEPLINK_BASE_URL}${expensifyUrl.host}${pathname}`;
    }

    isMacOSWeb() {
        if (
            typeof navigator === 'object'
            && typeof navigator.userAgent === 'string'
            && /Mac/i.test(navigator.userAgent)
            && !/Electron/i.test(navigator.userAgent)
        ) {
            return true;
        }

        return false;
    }

    render() {
        if (this.state.appInstallationCheckStatus === 'checking') {
            return <FullScreenLoadingIndicator style={styles.flex1} />;
        }

        if (
            this.state.deeplinkMatch
            && this.state.appInstallationCheckStatus === 'installed'
        ) {
            return (
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <Text>It looks like you have the desktop app installed. How do you wish to proceed?</Text>

                    <Button
                        text="Open in App"
                        style={{marginTop: 20}}
                        onPress={this.openRouteInDesktopApp}
                    />
                    <Button
                        style={{marginTop: 20}}
                        text="Continue in Browser"
                        onPress={() => this.setState({deeplinkMatch: false})}
                    />
                </View>
            );
        }

        return this.props.children;
    }
}

DeeplinkWrapper.propTypes = propTypes;
export default DeeplinkWrapper;
