import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import useCurrentReportID from '../../../hooks/useCurrentReportID';

const ReportAttachmentsContext = React.createContext();

const propTypes = {
    /** Rendered child component */
    children: PropTypes.node.isRequired,
};

function ReportAttachmentsProvider(props) {
    const currentReportID = useCurrentReportID();
    const [isAttachmentHidden, setIsAttachmentHidden] = useState({});

    useEffect(() => {
        // We only want to store the attachment visibility for the current report.
        // If the current report ID changes, clear the state.
        setIsAttachmentHidden({});
    }, [currentReportID]);

    return (
        <ReportAttachmentsContext.Provider
            value={{
                isAttachmentHidden,
                updateIsAttachmentHidden: (reportActionID, value) => setIsAttachmentHidden({...isAttachmentHidden, [reportActionID]: value}),
            }}
        >
            {props.children}
        </ReportAttachmentsContext.Provider>
    );
}

ReportAttachmentsProvider.propTypes = propTypes;
ReportAttachmentsProvider.displayName = 'ReportAttachmentsProvider';

export default ReportAttachmentsContext;
export {ReportAttachmentsProvider};
