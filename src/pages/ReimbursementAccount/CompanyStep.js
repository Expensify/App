import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import withLocalize from '@components/withLocalize';
import compose from '@libs/compose';
import ONYXKEYS from '@src/ONYXKEYS';
import BusinessInfo from './BusinessInfo/BusinessInfo';

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
