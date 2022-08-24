import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {View} from 'react-native';
import styles from '../styles/styles';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import colors from '../styles/colors';
import RenderHTML from './RenderHTML';
import Text from './Text';
import TextLink from './TextLink';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import {withNetwork} from './OnyxProvider';

const propTypes = {
    /** Whether message is in html format */
    isMessageHtml: PropTypes.bool,

    /** Error message to display above button */
    message: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    isMessageHtml: false,
    message: '',
};

const FormAlertError = props => (
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
                        onPress={props.onFixTheErrorsPressed}
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
);

FormAlertError.propTypes = propTypes;
FormAlertError.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withNetwork(),
)(FormAlertError);
