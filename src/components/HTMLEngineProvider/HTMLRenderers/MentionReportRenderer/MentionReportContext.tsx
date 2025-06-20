import {createContext} from 'react';

type MentionReportContextProps = {
    currentReportID: string | undefined;
    exactlyMatch?: boolean;
};

const MentionReportContext = createContext<MentionReportContextProps>({
    currentReportID: undefined,
});

export default MentionReportContext;
