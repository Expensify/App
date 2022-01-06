import React, {createContext} from 'react';
import PropTypes from 'prop-types';

const reportActionsNeedingRerender = new Set();

const ReportActionsRenderContext = createContext(reportActionsNeedingRerender);

const propTypes = {
    children: PropTypes.node.isRequired,
};

const ReportActionsRenderContextProvider = props => (
    <ReportActionsRenderContext.Provider value={reportActionsNeedingRerender}>
        {props.children}
    </ReportActionsRenderContext.Provider>
);

ReportActionsRenderContextProvider.propTypes = propTypes;
ReportActionsRenderContextProvider.displayName = 'ReportActionsRenderContextProvider';

export {
    ReportActionsRenderContext as context,
    ReportActionsRenderContextProvider as Provider,
};
