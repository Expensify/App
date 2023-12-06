import React, {Component} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import ExpensifyWordmark from '@assets/images/expensify-wordmark.svg';
import QRCode from '@components/QRCode';
import Text from '@components/Text';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import withTheme, {withThemePropTypes} from '@components/withTheme';
import withThemeStyles, {withThemeStylesPropTypes} from '@components/withThemeStyles';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import compose from '@libs/compose';
import variables from '@styles/variables';
import {qrShareDefaultProps, qrSharePropTypes} from './propTypes';

const propTypes = {
    ...qrSharePropTypes,
    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
    ...withThemeStylesPropTypes,
    ...withThemePropTypes,
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
                style={this.props.themeStyles.shareCodeContainer}
                onLayout={this.onLayout}
            >
                <View style={this.props.themeStyles.expensifyQrLogo}>
                    <ExpensifyWordmark
                        fill={this.props.theme.QRLogo}
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
                    style={this.props.themeStyles.qrShareTitle}
                >
                    {this.props.title}
                </Text>

                {!_.isEmpty(this.props.subtitle) && (
                    <Text
                        fontSize={variables.fontSizeLabel}
                        numberOfLines={2}
                        style={[this.props.themeStyles.mt1, this.props.themeStyles.textAlignCenter]}
                        color={this.props.theme.textSupporting}
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

export default compose(withLocalize, withWindowDimensions, withThemeStyles, withTheme)(QRShare);
