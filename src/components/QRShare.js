import React from 'react';
import PropTypes from 'prop-types';
import QRCodeLibrary from 'react-native-qrcode-svg';
import {Dimensions, View} from 'react-native';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import defaultTheme from '../styles/themes/default';
import styles from '../styles/styles';
import Text from './Text';

const propTypes = {
    type: PropTypes.string,
    value: PropTypes.oneOfType(PropTypes.string, PropTypes.number),
    logo: PropTypes.func,
    download: PropTypes.func,

    ...withLocalizePropTypes,
};

const defaultProps = {
    type: undefined,
    value: undefined,
    logo: undefined,
    download: undefined,
};

class QRShare extends React.Component {
    constructor(props) {
        super(props);

        this.url = this.props.type === 'profile' ? `https://new.expensify.com/details?login=${this.props.value}` : `https://new.expensify.com/r/${this.props.value}`;

        this.base64Logo = this.props.logo;
    }

    render() {
        const screenWidth = Dimensions.get('window').width;

        return (
            <View style={styles.shareCodeContainer}>
                <Text family="EXP_NEUE_BOLD" fontSize={30} style={{marginBottom: 20}} color={defaultTheme.borderFocus}>Expensify</Text>

                <QRCodeLibrary
                    value={this.url}
                    logo={this.base64Logo}
                    getRef={c => (this.svg = c)}
                    logoBackgroundColor="transparent"
                    logoSize={screenWidth * 0.2}
                    logoBorderRadius={screenWidth}
                    logoMargin={200}
                    size={screenWidth - 100}
                    backgroundColor={defaultTheme.highlightBG}
                    color={defaultTheme.text}
                />

                <Text family="EXP_NEW_KANSAS_MEDIUM" fontSize={25} style={{marginTop: 20}}>Shawn Borton</Text>

                <Text family="EXP_NEUE_BOLD" fontSize={15} style={{marginBottom: 20}}>shawn@expensify.com</Text>
            </View>
        );
    }
}
QRShare.propTypes = propTypes;
QRShare.defaultProps = defaultProps;

export default withLocalize(React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <QRShare {...props} forwardedRef={ref} />
)));
