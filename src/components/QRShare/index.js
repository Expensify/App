import React, {Component} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import defaultTheme from '../../styles/themes/default';
import styles from '../../styles/styles';
import Text from '../Text';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import compose from '../../libs/compose';
import variables from '../../styles/variables';
import ExpensifyWordmark from '../../../assets/images/expensify-wordmark.svg';
import {qrSharePropTypes, qrShareDefaultProps} from './propTypes';
import QRCode from '../QRCode';

const propTypes = {
    ...qrSharePropTypes,
    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

class QRShare extends Component {
    constructor(props) {
        super(props);

        this.state = {
            qrCodeSize: 1,
        };

        this.onLayout = this.onLayout.bind(this);
        this.getSvg = this.getSvg.bind(this);
    }

    onLayout(event) {
        const containerWidth = event.nativeEvent.layout.width - variables.qrShareHorizontalPadding * 2 || 0;

        this.setState({
            qrCodeSize: Math.max(1, containerWidth),
        });
    }

    getSvg() {
        return this.svg;
    }

    render() {
        return (
            <View
                style={styles.shareCodeContainer}
                onLayout={this.onLayout}
            >
                <View style={styles.expensifyQrLogo}>
                    <ExpensifyWordmark
                        fill={defaultTheme.borderFocus}
                        width="100%"
                        height="100%"
                    />
                </View>

                <QRCode
                    getRef={(svg) => (this.svg = svg)}
                    url={this.props.url}
                    logo={this.props.logo}
                    size={this.state.qrCodeSize}
                    logoRatio={this.props.logoRatio}
                    logoMarginRatio={this.props.logoMarginRatio}
                />

                <Text
                    family="EXP_NEW_KANSAS_MEDIUM"
                    fontSize={variables.fontSizeXLarge}
                    numberOfLines={2}
                    style={styles.qrShareTitle}
                >
                    {this.props.title}
                </Text>

                {!_.isEmpty(this.props.subtitle) && (
                    <Text
                        family="EXP_NEUE_BOLD"
                        fontSize={variables.fontSizeLabel}
                        numberOfLines={2}
                        style={[styles.mt1, styles.textAlignCenter]}
                        color={defaultTheme.textSupporting}
                    >
                        {this.props.subtitle}
                    </Text>
                )}
            </View>
        );
    }
}
QRShare.propTypes = propTypes;
QRShare.defaultProps = qrShareDefaultProps;

export default compose(withLocalize, withWindowDimensions)(QRShare);
