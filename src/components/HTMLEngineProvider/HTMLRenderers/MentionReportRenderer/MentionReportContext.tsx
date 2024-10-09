import {createContext} from 'react';

type MentionReportContextProps = {
    currentReportID: string;
    exactlyMatch: boolean;
};

const MentionReportContext = createContext<MentionReportContextProps>({
    currentReportID: '',
    exactlyMatch: false,
});

export default MentionReportContext;
