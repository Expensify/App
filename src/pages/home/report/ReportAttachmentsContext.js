import React, {useEffect, useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import useCurrentReportID from '../../../hooks/useCurrentReportID';

const ReportAttachmentsContext = React.createContext();

const propTypes = {
    /** Rendered child component */
    children: PropTypes.node.isRequired,
};

function ReportAttachmentsProvider(props) {
    const currentReportID = useCurrentReportID();
    const [hiddenAttachments, setHiddenAttachments] = useState({});

    useEffect(() => {
        // We only want to store the attachment visibility for the current report.
        // If the current report ID changes, clear the state.
        setHiddenAttachments({});
    }, [currentReportID]);

    const contextValue = useMemo(
        () => ({
            hiddenAttachments,
            updateHiddenAttachments: (reportActionID, value) => {
                // To prevent unnecessary re-render, skip updating the state if the value is the same
                if (Boolean(hiddenAttachments[reportActionID]) === value) {
                    return;
                }
                setHiddenAttachments((state) => ({...state, [reportActionID]: value}));
            },
        }),
        [hiddenAttachments],
    );

    return <ReportAttachmentsContext.Provider value={contextValue}>{props.children}</ReportAttachmentsContext.Provider>;
}

ReportAttachmentsProvider.propTypes = propTypes;
ReportAttachmentsProvider.displayName = 'ReportAttachmentsProvider';

export default ReportAttachmentsContext;
export {ReportAttachmentsProvider};
