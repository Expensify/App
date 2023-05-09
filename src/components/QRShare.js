import React from 'react';
import PropTypes from 'prop-types';
import QRCodeLibrary from 'react-native-qrcode-svg';
import {Dimensions, View} from 'react-native';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import defaultTheme from '../styles/themes/default';
import styles from '../styles/styles';
import Text from './Text';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import compose from '../libs/compose';
import variables from '../styles/variables';

const propTypes = {
    type: PropTypes.string.isRequired,
    value: PropTypes.oneOfType(PropTypes.string, PropTypes.number).isRequired,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    logo: PropTypes.func,
    download: PropTypes.func,

    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    subtitle: undefined,
    logo: undefined,
    download: undefined,
};

class QRShare extends React.Component {
    constructor(props) {
        super(props);

        this.size = (this.props.isSmallScreenWidth ? variables.sideBarWidth : Dimensions.get('window').width) - 100;

        this.url = this.props.type === 'profile' ? `https://new.expensify.com/details?login=${this.props.value}` : `https://new.expensify.com/r/${this.props.value}`;
    }

    render() {
        return (
            <View style={styles.shareCodeContainer}>
                <Text family="EXP_NEUE_BOLD" fontSize={30} style={{marginBottom: 20}} color={defaultTheme.borderFocus}>Expensify</Text>

                <QRCodeLibrary
                    value={this.url}
                    logo={this.props.logo}
                    getRef={c => (this.svg = c)}
                    logoBackgroundColor="transparent"
                    logoSize={this.size * 0.3}
                    logoBorderRadius={this.size}
                    logoMargin={200}
                    size={this.size}
                    backgroundColor={defaultTheme.highlightBG}
                    color={defaultTheme.text}
                />

                <Text family="EXP_NEW_KANSAS_MEDIUM" fontSize={25} style={{marginTop: 20}}>{this.props.title}</Text>

                {this.props.subtitle && (
                <Text family="EXP_NEUE_BOLD" fontSize={15} style={{marginBottom: 20}}>{this.props.subtitle}</Text>
                )}
            </View>
        );
    }
}
QRShare.propTypes = propTypes;
QRShare.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withWindowDimensions,
)(React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <QRShare {...props} forwardedRef={ref} />
)));
