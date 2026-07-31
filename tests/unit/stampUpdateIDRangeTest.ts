import stampUpdateIDRange from '@libs/telemetry/stampUpdateIDRange';

import CONST from '@src/CONST';

const setAttributes = jest.fn();
const span = {setAttributes};

const requestWith = (fields: Record<string, string>) => {
    const body = new FormData();
    for (const [key, value] of Object.entries(fields)) {
        body.append(key, value);
    }
    return {input: ['https://www.expensify.com/api/GetMissingOnyxMessages', {method: 'post', body}], startTimestamp: 0};
};

describe('stampUpdateIDRange', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('stamps the range of a GetMissingOnyxMessages request as numbers', () => {
        stampUpdateIDRange(span, requestWith({updateIDFrom: '100', updateIDTo: '200'}));

        expect(setAttributes).toHaveBeenCalledWith({
            [CONST.TELEMETRY.ATTRIBUTE_UPDATE_ID_FROM]: 100,
            [CONST.TELEMETRY.ATTRIBUTE_UPDATE_ID_TO]: 200,
        });
    });

    it('stamps only the start of an incremental ReconnectApp request, which has no end', () => {
        stampUpdateIDRange(span, requestWith({updateIDFrom: '100', policyIDList: ''}));

        expect(setAttributes).toHaveBeenCalledWith({
            [CONST.TELEMETRY.ATTRIBUTE_UPDATE_ID_FROM]: 100,
            [CONST.TELEMETRY.ATTRIBUTE_UPDATE_ID_TO]: undefined,
        });
    });

    it('leaves requests without an update-ID range alone', () => {
        stampUpdateIDRange(span, requestWith({reportID: '1234'}));
        stampUpdateIDRange(span, {input: ['https://www.expensify.com/api/OpenApp', {method: 'post'}], startTimestamp: 0});
        stampUpdateIDRange(span, {input: [], startTimestamp: 0});

        expect(setAttributes).not.toHaveBeenCalled();
    });
});
