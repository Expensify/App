import _ from 'underscore';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import deeplinkRoutes from './deeplinkRoutes';
import FullScreenLoadingIndicator from '../FullscreenLoadingIndicator';
import TextLink from '../TextLink';
import * as Illustrations from '../Icon/Illustrations';
import LogoWordmark from '../../../assets/images/expensify-wordmark.svg';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import Text from '../Text';
import styles from '../../styles/styles';
import CONST from '../../CONST';
import CONFIG from '../../CONFIG';
import * as FontFamily from '../../styles/fontFamily';
import Icon from '../Icon';
import colors from '../../styles/colors';

const propTypes = {
    /** Children to render. */
    children: PropTypes.node.isRequired,

    ...withLocalizePropTypes,
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

    isiOSWeb() {
        return [
            'iPad Simulator',
            'iPhone Simulator',
            'iPod Simulator',
            'iPad',
            'iPhone',
            'iPod',
        ].includes(navigator.platform)
        || (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
    }

    isMacOSWeb() {
        if (
            !this.isiOSWeb()
            && typeof navigator === 'object'
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
                <View style={styles.deeplinkWrapperContainer}>
                    <View style={styles.deeplinkWrapperInfoSection}>
                        <View style={styles.mb2}>
                            <Icon
                                width={200}
                                height={164}
                                src={Illustrations.RocketBlue}
                            />
                        </View>
                        <Text style={[styles.textXXLarge, {fontFamily: FontFamily.newKansas.NEW_KANSAS_MEDIUM}]}>
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
                            </Text>
                        </View>
                    </View>
                    <View style={styles.deeplinkWrapperFooter}>
                        <LogoWordmark
                            width={154}
                            height={34}
                            fill={colors.green}
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
