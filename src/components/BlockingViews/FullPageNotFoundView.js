
import React from 'react';
import PropTypes from 'prop-types';
import BlockingView from './BlockingView';
import * as Expensicons from '../Icon/Expensicons';
import themeColors from '../../styles/themes/default';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';

const propTypes = {
    /** Props to fetch translation features */
    ...withLocalizePropTypes,

    /** Child elements */
    children: PropTypes.node.isRequired,

    /** If true, child components are replaced with a blocking "not found" view */
    show: PropTypes.bool,
};

// eslint-disable-next-line rulesdir/no-negated-variables
const FullPageNotFoundView = (props) => {
    if (props.show) {
        return (
            <BlockingView
                icon={Expensicons.QuestionMark}
                iconColor={themeColors.offline}
                title={props.translate('common.notFound')}
                subtitle={props.translate('common.cantFindWhatYoureLookingFor')}
            />
        );
    }

    return props.children;
};

FullPageNotFoundView.propTypes = propTypes;
FullPageNotFoundView.displayName = 'FullPageNotFoundView';

export default withLocalize(FullPageNotFoundView);
