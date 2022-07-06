
import React from 'react';
import PropTypes from 'prop-types';
import BlockingView from './BlockingView';
import * as Expensicons from '../Icon/Expensicons';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';

const propTypes = {
    /** Props to fetch translation features */
    ...withLocalizePropTypes,

    /** Child elements */
    children: PropTypes.node.isRequired,

    /** If true, child components are replaced with a blocking "not found" view */
    show: PropTypes.bool,
};

const defaultProps = {
    show: false,
};

// eslint-disable-next-line rulesdir/no-negated-variables
const FullPageNotFoundView = (props) => {
    if (props.show) {
        return (
            <BlockingView
                icon={Expensicons.QuestionMark}
                title={props.translate('notFound.notHere')}
                subtitle={props.translate('notFound.pageNotFound')}
            />
        );
    }

    return props.children;
};

FullPageNotFoundView.propTypes = propTypes;
FullPageNotFoundView.defaultProps = defaultProps;
FullPageNotFoundView.displayName = 'FullPageNotFoundView';

export default withLocalize(FullPageNotFoundView);
