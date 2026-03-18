import {createContext} from 'react';

type MentionReportContextProps = {
    currentReportID: string | undefined;
    exactlyMatch?: boolean;
    policyID?: string;
};

const MentionReportContext = createContext<MentionReportContextProps>({
    currentReportID: undefined,
});

export default MentionReportContext;
