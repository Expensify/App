import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import Icon from '../../components/Icon';
import Header from '../../components/Header';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import * as Expensicons from '../../components/Icon/Expensicons';
import Tooltip from '../../components/Tooltip';
import Navigation from '../../libs/Navigation/Navigation';

const propTypes = {
    /** Title of the header */
    title: PropTypes.string.isRequired,

    /** Should we show the back button? */
    shouldShowBackButton: PropTypes.bool,

    /** Callback to fire on back button press */
    onBackButtonPress: PropTypes.func,

    ...withLocalizePropTypes,
};

const defaultProps = {
    shouldShowBackButton: true,
    onBackButtonPress: () => Navigation.goBack(),
};

const ModalHeader = (props) => (
    <View style={[styles.headerBar, props.shouldShowBackButton && styles.pl2]}>
        <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.flexGrow1, styles.justifyContentBetween, styles.overflowHidden]}>
            {props.shouldShowBackButton && (
                <Tooltip text={props.translate('common.back')}>
                    <TouchableOpacity
                        onPress={props.onBackButtonPress}
                        style={[styles.touchableButtonImage]}
                    >
                        <Icon src={Expensicons.BackArrow} />
                    </TouchableOpacity>
                </Tooltip>
            )}
            <Header title={props.title} />
            <View style={[styles.reportOptions, styles.flexRow, styles.pr5]}>
                <Tooltip text={props.translate('common.close')}>
                    <TouchableOpacity
                        onPress={() => Navigation.dismissModal()}
                        style={[styles.touchableButtonImage]}
                        accessibilityRole="button"
                        accessibilityLabel={props.translate('common.close')}
                    >
                        <Icon src={Expensicons.Close} />
                    </TouchableOpacity>
                </Tooltip>
            </View>
        </View>
    </View>
);

ModalHeader.displayName = 'ModalHeader';
ModalHeader.propTypes = propTypes;
ModalHeader.defaultProps = defaultProps;
export default withLocalize(ModalHeader);
