import _ from 'underscore';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import deeplinkRoutes from './deeplinkRoutes';
import FullScreenLoadingIndicator from '../FullscreenLoadingIndicator';
import TextLink from '../TextLink';
import * as Illustrations from '../Icon/Illustrations';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import Text from '../Text';
import styles from '../../styles/styles';
import CONST from '../../CONST';
import CONFIG from '../../CONFIG';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import colors from '../../styles/colors';
import * as Browser from '../../libs/Browser';

const propTypes = {
    /** Children to render. */
    children: PropTypes.node.isRequired,

    ...withLocalizePropTypes,
};

const desktopAppState = {
    checking: 'checking',
    installed: 'installed',
    notInstalled: 'not-installed',
};

class DeeplinkWrapper extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            appInstallationCheckStatus: this.isMacOSWeb() ? desktopAppState.checking : desktopAppState.notInstalled,
        };
    }

    componentDidMount() {
        if (!this.isMacOSWeb()) {
            return;
        }

        let focused = true;

        window.addEventListener('blur', () => {
            focused = false;
        });

        setTimeout(() => {
            if (!focused) {
                this.setState({appInstallationCheckStatus: desktopAppState.installed});
            } else {
                this.setState({appInstallationCheckStatus: desktopAppState.notInstalled});
            }
        }, 500);

        // check if pathname matches with deeplink routes
        const matchedRoute = _.find(deeplinkRoutes, (route) => {
            const routeRegex = new RegExp(route.pattern);
            return routeRegex.test(window.location.pathname);
        });

        if (matchedRoute) {
            this.setState({deeplinkMatch: true});
            this.openRouteInDesktopApp();
        } else {
            this.setState({deeplinkMatch: false});
        }
    }

    openRouteInDesktopApp() {
        const expensifyUrl = new URL(CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL);
        const expensifyDeeplinkUrl = `${CONST.DEEPLINK_BASE_URL}${expensifyUrl.host}${window.location.pathname}`;

        // This check is necessary for Safari, otherwise, if the user
        // does NOT have the Expensify desktop app installed, it's gonna
        // show an error in the page saying that the address is invalid
        if (CONST.BROWSER.SAFARI === Browser.getBrowser()) {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            iframe.contentWindow.location.href = expensifyDeeplinkUrl;

            // Since we're creating an iframe for Safari to handle
            // deeplink we need to give this iframe some time for
            // it to do what it needs to do. After that we can just
            // remove the iframe.
            setTimeout(() => {
                if (!iframe.parentNode) {
                    return;
                }

                iframe.parentNode.removeChild(iframe);
            }, 100);
        } else {
            window.location.href = expensifyDeeplinkUrl;
        }
    }

    isMacOSWeb() {
        return !Browser.isMobile() && (
            typeof navigator === 'object'
            && typeof navigator.userAgent === 'string'
            && /Mac/i.test(navigator.userAgent)
            && !/Electron/i.test(navigator.userAgent)
        );
    }

    render() {
        if (this.state.appInstallationCheckStatus === desktopAppState.checking) {
            return <FullScreenLoadingIndicator style={styles.flex1} />;
        }

        if (
            this.state.deeplinkMatch
            && this.state.appInstallationCheckStatus === desktopAppState.installed
        ) {
            return (
                <View style={styles.deeplinkWrapperContainer}>
                    <View style={styles.deeplinkWrapperMessage}>
                        <View style={styles.mb2}>
                            <Icon
                                width={200}
                                height={164}
                                src={Illustrations.RocketBlue}
                            />
                        </View>
                        <Text style={[styles.textHeadline, styles.textXXLarge]}>
                            {this.props.translate('deeplinkWrapper.launching')}
                        </Text>
                        <View style={styles.mt2}>
                            <Text style={[styles.fontSizeNormal, styles.textAlignCenter]}>
                                {this.props.translate('deeplinkWrapper.redirectedToDesktopApp')}
                                {'\n'}
                                {this.props.translate('deeplinkWrapper.youCanAlso')}
                                {' '}
                                <TextLink onPress={() => this.setState({deeplinkMatch: false})}>
                                    {this.props.translate('deeplinkWrapper.openLinkInBrowser')}
                                </TextLink>
                                .
                            </Text>
                        </View>
                    </View>
                    <View style={styles.deeplinkWrapperFooter}>
                        <Icon
                            width={154}
                            height={34}
                            fill={colors.green}
                            src={Expensicons.ExpensifyWordmark}
                        />
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
}

DeeplinkWrapper.propTypes = propTypes;
export default withLocalize(DeeplinkWrapper);
