import React from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import withLocalize from '../../components/withLocalize';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import BusinessInfo from './BusinessInfo/BusinessInfo';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import withLocalize from '@components/withLocalize';
import compose from '@libs/compose';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /* The workspace policyID */
    policyID: PropTypes.string,
};

const defaultProps = {
    policyID: '',
};

function CompanyStep({policyID}) {
    return <BusinessInfo policyID={policyID} />;
}

CompanyStep.propTypes = propTypes;
CompanyStep.defaultProps = defaultProps;
CompanyStep.displayName = 'CompanyStep';

export default compose(
    withLocalize,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
        user: {
            key: ONYXKEYS.USER,
        },
    }),
)(CompanyStep);
