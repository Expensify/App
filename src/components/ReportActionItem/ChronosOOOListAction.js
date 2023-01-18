import React from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import Text from '../Text';
import styles from '../../styles/styles';
import reportActionPropTypes from '../../pages/home/report/reportActionPropTypes';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';

const propTypes = {
    /** All the data of the action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    ...withLocalizePropTypes,
};

const ChronosOOOListAction = (props) => {
    console.log('!!!', props);

    return (
        <Text style={[styles.pv3, styles.ph5, styles.textAlignCenter, styles.textLabelSupporting]}>
            <Text style={[styles.textLabelSupporting, styles.textStrong, styles.textAlignCenter]}>
                hi
            </Text>
            yo
        </Text>
    );
};

ChronosOOOListAction.propTypes = propTypes;
ChronosOOOListAction.displayName = 'ChronosOOOListAction';

export default withLocalize(ChronosOOOListAction);
