import React, {useEffect, useMemo, useRef} from 'react';
import PropTypes from 'prop-types';
import useCurrentReportID from '../../../hooks/useCurrentReportID';

const ReportAttachmentsContext = React.createContext();

const propTypes = {
    /** Rendered child component */
    children: PropTypes.node.isRequired,
};

function ReportAttachmentsProvider(props) {
    const currentReportID = useCurrentReportID();
    const hiddenAttachments = useRef({});

    useEffect(() => {
        // We only want to store the attachment visibility for the current report.
        // If the current report ID changes, clear the ref.
        hiddenAttachments.current = {};
    }, [currentReportID]);

    const contextValue = useMemo(
        () => ({
            isAttachmentHidden: (reportActionID) => hiddenAttachments.current[reportActionID],
            updateHiddenAttachments: (reportActionID, value) => {
                hiddenAttachments.current = {
                    ...hiddenAttachments.current,
                    [reportActionID]: value,
                };
            },
        }),
        [],
    );

    return <ReportAttachmentsContext.Provider value={contextValue}>{props.children}</ReportAttachmentsContext.Provider>;
}

ReportAttachmentsProvider.propTypes = propTypes;
ReportAttachmentsProvider.displayName = 'ReportAttachmentsProvider';

export default ReportAttachmentsContext;
export {ReportAttachmentsProvider};
