import {createContext} from 'react';

type MentionReportContextProps = {
    currentReportID: string;
};

const MentionReportContext = createContext<MentionReportContextProps>({
    currentReportID: '',
});

export default MentionReportContext;
