import _ from 'underscore';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import React from 'react';
import {withNetwork} from './OnyxProvider';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import RenderHTML from './RenderHTML';
import TextLink from './TextLink';
import Text from './Text';
import colors from '../styles/colors';
import compose from '../libs/compose';
import networkPropTypes from './networkPropTypes';
import styles from '../styles/styles';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {
    /** Wrapped child components */
    children: PropTypes.func.isRequired,

    /** Styles for container element */
    // eslint-disable-next-line react/forbid-prop-types
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Whether to show the alert text */
    isAlertVisible: PropTypes.bool,

    /** Whether message is in html format */
    isMessageHtml: PropTypes.bool,

    /** Error message to display above button */
    message: PropTypes.string,

    /** Props to detect online status */
    network: networkPropTypes.isRequired,

    /** Callback fired when the "fix the errors" link is pressed */
    onFixTheErrorsLinkPressed: PropTypes.func,

    ...withLocalizePropTypes,
};

const defaultProps = {
    containerStyles: [],
    isAlertVisible: false,
    isMessageHtml: false,
    message: '',
    onFixTheErrorsLinkPressed: () => {},
};

// The FormAlertWrapper offers a standardized way of showing error messages and offline functionality.
//
// This component takes other components as a child prop. It will then render any wrapped components as a function using "render props",
// and passes it a (bool) isOffline parameter. Child components can then use the isOffline variable to determine offline behavior.
const FormAlertWrapper = props => (
    <View style={props.containerStyles}>
        {props.isAlertVisible && (
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb3]}>
                <Icon src={Expensicons.Exclamation} fill={colors.red} />
                <View style={[styles.flexRow, styles.ml2, styles.flexWrap, styles.flex1]}>
                    {!_.isEmpty(props.message) && props.isMessageHtml && <RenderHTML html={`<muted-text>${props.message}</muted-text>`} />}

                    {!_.isEmpty(props.message) && !props.isMessageHtml && <Text style={styles.mutedTextLabel}>{props.message}</Text>}

                    {_.isEmpty(props.message) && (
                        <>
                            <Text style={styles.mutedTextLabel}>
                                {`${props.translate('common.please')} `}
                            </Text>
                            <TextLink
                                style={styles.label}
                                onPress={props.onFixTheErrorsLinkPressed}
                            >
                                {props.translate('common.fixTheErrors')}
                            </TextLink>
                            <Text style={styles.mutedTextLabel}>
                                {` ${props.translate('common.inTheFormBeforeContinuing')}.`}
                            </Text>
                        </>
                    )}
                </View>
            </View>
        )}
        {props.children(props.network.isOffline)}
    </View>
);

FormAlertWrapper.propTypes = propTypes;
FormAlertWrapper.defaultProps = defaultProps;
FormAlertWrapper.displayName = 'FormAlertWrapper';

export default compose(
    withLocalize,
    withNetwork(),
)(FormAlertWrapper);
