// eslint-disable-next-line no-restricted-imports
import React, {createContext, useMemo} from 'react';
import useOnyx from '@hooks/useOnyx';
import ExpensiMark from '@libs/Parser';
import ONYXKEYS from '@src/ONYXKEYS';

type Extras = {
    reportIDToName?: Record<string, string>;
    accountIDToName?: Record<string, string>;
    cacheVideoAttributes?: (vidSource: string, attrs: string) => void;
    videoAttributeCache?: Record<string, string>;
};
type ParserContextProps = {
    htmlToMarkdown: (htmlString: string, extras?: Extras) => string;
    htmlToText: (htmlString: string, extras?: Extras) => string;
};
type ParserContextProviderProps = {children: React.ReactNode};
const ParserContext = createContext<ParserContextProps>({
    htmlToMarkdown: () => '',
    htmlToText: () => '',
});

function ParserContextProvider({children}: ParserContextProviderProps) {
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [personalDetailsList] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);

    const reportIDToNameMap = useMemo(() => {
        const map: Record<string, string> = {};
        Object.values(reports ?? {}).forEach((report) => {
            if (!report) {
                return;
            }
            map[report.reportID] = report.reportName ?? report.reportID;
        });
        return map;
    }, [reports]);

    const accountIDToNameMap = useMemo(() => {
        const map: Record<string, string> = {};
        Object.values(personalDetailsList ?? {}).forEach((personalDetails) => {
            if (!personalDetails) {
                return;
            }
            map[personalDetails.accountID] = personalDetails.login ?? personalDetails.displayName ?? '';
        });
        return map;
    }, [personalDetailsList]);

    const Parser = React.useMemo<ParserContextProps>(() => {
        const parser = ExpensiMark as unknown as Record<string, unknown>;

        return {
            ...parser,
            htmlToMarkdown: (htmlString: string, extras?: Extras) =>
                (parser.htmlToMarkdown as (htmlString: string, extras?: Extras) => string)(htmlString, {
                    reportIDToName: extras?.reportIDToName ?? reportIDToNameMap,
                    accountIDToName: extras?.accountIDToName ?? accountIDToNameMap,
                    cacheVideoAttributes: extras?.cacheVideoAttributes,
                }),
            htmlToText: (htmlString: string, extras?: Extras) =>
                (parser.htmlToText as (htmlString: string, extras?: Extras) => string)(htmlString, {
                    reportIDToName: extras?.reportIDToName ?? reportIDToNameMap,
                    accountIDToName: extras?.accountIDToName ?? accountIDToNameMap,
                    cacheVideoAttributes: extras?.cacheVideoAttributes,
                }),
        };
    }, [reportIDToNameMap, accountIDToNameMap]);

    const contextValue = useMemo<ParserContextProps>(() => Parser, [Parser]);

    return <ParserContext.Provider value={contextValue}>{children}</ParserContext.Provider>;
}

ParserContextProvider.displayName = 'ParserContextProvider';

export {ParserContext, ParserContextProvider};
