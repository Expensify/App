import 'core-js/features/array/at';
import React, {Component} from 'react';
import {PDFPreviewer} from 'react-fast-pdf';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import withLocalize from '@components/withLocalize';
import withThemeStyles from '@components/withThemeStyles';
import withWindowDimensions from '@components/withWindowDimensions';
import compose from '@libs/compose';
import variables from '@styles/variables';
import * as CanvasSize from '@userActions/CanvasSize';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import PDFPasswordForm from './PDFPasswordForm';
import * as pdfViewPropTypes from './pdfViewPropTypes';

class PDFView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isKeyboardOpen: false,
        };
        this.toggleKeyboardOnSmallScreens = this.toggleKeyboardOnSmallScreens.bind(this);
        this.retrieveCanvasLimits();
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(this.state, nextState) || !_.isEqual(this.props, nextProps);
    }

    componentDidUpdate(prevProps) {
        // Use window height changes to toggle the keyboard. To maintain keyboard state
        // on all platforms we also use focus/blur events. So we need to make sure here
        // that we avoid redundant keyboard toggling.
        // Minus 100px is needed to make sure that when the internet connection is
        // disabled in android chrome and a small 'No internet connection' text box appears,
        // we do not take it as a sign to open the keyboard
        if (!this.state.isKeyboardOpen && this.props.windowHeight < prevProps.windowHeight - 100) {
            this.toggleKeyboardOnSmallScreens(true);
        } else if (this.state.isKeyboardOpen && this.props.windowHeight > prevProps.windowHeight) {
            this.toggleKeyboardOnSmallScreens(false);
        }
    }

    /**
     * On small screens notify parent that the keyboard has opened or closed.
     *
     * @param {Boolean} isKeyboardOpen True if keyboard is open
     */
    toggleKeyboardOnSmallScreens(isKeyboardOpen) {
        if (!this.props.isSmallScreenWidth) {
            return;
        }
        this.setState({isKeyboardOpen});
        this.props.onToggleKeyboard(isKeyboardOpen);
    }

    /**
     * Verify that the canvas limits have been calculated already, if not calculate them and put them in Onyx
     */
    retrieveCanvasLimits() {
        if (!this.props.maxCanvasArea) {
            CanvasSize.retrieveMaxCanvasArea();
        }

        if (!this.props.maxCanvasHeight) {
            CanvasSize.retrieveMaxCanvasHeight();
        }

        if (!this.props.maxCanvasWidth) {
            CanvasSize.retrieveMaxCanvasWidth();
        }
    }

    renderPDFView() {
        const styles = this.props.themeStyles;
        const outerContainerStyle = [styles.w100, styles.h100, styles.justifyContentCenter, styles.alignItemsCenter];

        return (
            <View
                style={outerContainerStyle}
                tabIndex={0}
            >
                <PDFPreviewer
                    contentContainerStyle={this.props.style}
                    file={this.props.sourceURL}
                    pageMaxWidth={variables.pdfPageMaxWidth}
                    isSmallScreen={this.props.isSmallScreenWidth}
                    maxCanvasWidth={this.props.maxCanvasWidth}
                    maxCanvasHeight={this.props.maxCanvasHeight}
                    maxCanvasArea={this.props.maxCanvasArea}
                    LoadingComponent={<FullScreenLoadingIndicator />}
                    ErrorComponent={<Text style={this.props.errorLabelStyles}>{this.props.translate('attachmentView.failedToLoadPDF')}</Text>}
                    renderPasswordForm={({isPasswordInvalid, onSubmit, onPasswordChange}) => (
                        <PDFPasswordForm
                            isFocused={this.props.isFocused}
                            isPasswordInvalid={isPasswordInvalid}
                            onSubmit={onSubmit}
                            onPasswordUpdated={onPasswordChange}
                            onPasswordFieldFocused={this.toggleKeyboardOnSmallScreens}
                        />
                    )}
                />
            </View>
        );
    }

    render() {
        const styles = this.props.themeStyles;
        return this.props.onPress ? (
            <PressableWithoutFeedback
                onPress={this.props.onPress}
                style={[styles.flex1, styles.flexRow, styles.alignSelfStretch]}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
                accessibilityLabel={this.props.fileName || this.props.translate('attachmentView.unknownFilename')}
            >
                {this.renderPDFView()}
            </PressableWithoutFeedback>
        ) : (
            this.renderPDFView()
        );
    }
}

PDFView.propTypes = pdfViewPropTypes.propTypes;
PDFView.defaultProps = pdfViewPropTypes.defaultProps;

export default compose(
    withLocalize,
    withWindowDimensions,
    withThemeStyles,
    withOnyx({
        maxCanvasArea: {
            key: ONYXKEYS.MAX_CANVAS_AREA,
        },
        maxCanvasHeight: {
            key: ONYXKEYS.MAX_CANVAS_HEIGHT,
        },
        maxCanvasWidth: {
            key: ONYXKEYS.MAX_CANVAS_WIDTH,
        },
    }),
)(PDFView);
