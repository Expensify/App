const getHistoryParamParse = (historyParamName: string) => ({
    [historyParamName]: (value: string) => value === 'true',
});

export default getHistoryParamParse;
