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
    const [isAttachmentHidden, setIsAttachmentHidden] = useState({});

    useEffect(() => {
        // We only want to store the attachment visibility for the current report.
        // If the current report ID changes, clear the state.
        setIsAttachmentHidden({});
    }, [currentReportID]);

    const contextValue = useMemo(
        () => ({
            isAttachmentHidden,
            updateIsAttachmentHidden: (reportActionID, value) => {
                // To prevent unnecessary re-render, skip updating the state if the value is the same
                if (Boolean(isAttachmentHidden[reportActionID]) === value) {
                    return;
                }
                setIsAttachmentHidden((state) => ({...state, [reportActionID]: value}));
            },
        }),
        [isAttachmentHidden],
    );

    return <ReportAttachmentsContext.Provider value={contextValue}>{props.children}</ReportAttachmentsContext.Provider>;
}

ReportAttachmentsProvider.propTypes = propTypes;
ReportAttachmentsProvider.displayName = 'ReportAttachmentsProvider';

export default ReportAttachmentsContext;
export {ReportAttachmentsProvider};
