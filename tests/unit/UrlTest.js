const Url = require('../../src/libs/Url');

describe('Url', () => {
    describe('getPathFromURL()', () => {
        it('It should work correctly', () => {
            expect(Url.getPathFromURL('http://www.foo.com')).toEqual('');
            expect(Url.getPathFromURL('http://foo.com/blah_blah')).toEqual('blah_blah');
            expect(Url.getPathFromURL('http://foo.com/blah_blah_(wikipedia)')).toEqual('blah_blah_(wikipedia)');
            expect(Url.getPathFromURL('http://www.example.com/wpstyle/?p=364')).toEqual('wpstyle/?p=364');
            expect(Url.getPathFromURL('https://www.example.com/foo/?bar=baz&inga=42&quux')).toEqual('foo/?bar=baz&inga=42&quux');
            expect(Url.getPathFromURL('http://foo.com/(something)?after=parens')).toEqual('(something)?after=parens');
            expect(Url.getPathFromURL('http://code.google.com/events/#&product=browser')).toEqual('events/#&product=browser');
            expect(Url.getPathFromURL('http://foo.bar/?q=Test%20URL-encoded%20stuff')).toEqual('?q=Test%20URL-encoded%20stuff');
            expect(Url.getPathFromURL('http://www.test.com/path?param=123#123')).toEqual('path?param=123#123');
            expect(Url.getPathFromURL('http://1337.net')).toEqual('');
            expect(Url.getPathFromURL('http://a.b-c.de/')).toEqual('');
            expect(Url.getPathFromURL('https://sd1.sd2.docs.google.com/')).toEqual('');
            expect(Url.getPathFromURL('https://expensify.cash/#/r/1234')).toEqual('#/r/1234');
            expect(Url.getPathFromURL('https://github.com/Expensify/ReactNativeChat/pull/6.45')).toEqual('Expensify/ReactNativeChat/pull/6.45');
            expect(Url.getPathFromURL('https://github.com/Expensify/Expensify/issues/143,231')).toEqual('Expensify/Expensify/issues/143,231');
            expect(Url.getPathFromURL('testRareTLDs.beer')).toEqual('');
            expect(Url.getPathFromURL('test@expensify.com')).toEqual('');
            expect(Url.getPathFromURL('test.completelyFakeTLD')).toEqual('');
            expect(
                Url.getPathFromURL(
                    // eslint-disable-next-line max-len
                    'https://www.expensify.com/_devportal/tools/logSearch/#query=request_id:(%22Ufjjim%22)+AND+timestamp:[2021-01-08T03:48:10.389Z+TO+2021-01-08T05:48:10.389Z]&index=logs_expensify-008878)',
                ),
            ).toEqual('_devportal/tools/logSearch/#query=request_id:(%22Ufjjim%22)+AND+timestamp:[2021-01-08T03:48:10.389Z+TO+2021-01-08T05:48:10.389Z]&index=logs_expensify-008878)');
            expect(Url.getPathFromURL('http://necolas.github.io/react-native-web/docs/?path=/docs/components-pressable--disabled ')).toEqual(
                'react-native-web/docs/?path=/docs/components-pressable--disabled',
            );
            expect(Url.getPathFromURL('https://github.com/Expensify/Expensify.cash/issues/123#:~:text=Please%20work/Expensify.cash ')).toEqual(
                'Expensify/Expensify.cash/issues/123#:~:text=Please%20work/Expensify.cash',
            );
            expect(Url.getPathFromURL('mm..food ')).toEqual('');
            expect(Url.getPathFromURL('https://upwork.com/jobs/~016781e062ce860b84 ')).toEqual('jobs/~016781e062ce860b84');
            expect(
                Url.getPathFromURL(
                    // eslint-disable-next-line max-len
                    "https://bastion1.sjc/logs/app/kibana#/discover?_g=()&_a=(columns:!(_source),index:'2125cbe0-28a9-11e9-a79c-3de0157ed580',interval:auto,query:(language:lucene,query:''),sort:!(timestamp,desc))",
                ),
            ).toEqual(
                "logs/app/kibana#/discover?_g=()&_a=(columns:!(_source),index:'2125cbe0-28a9-11e9-a79c-3de0157ed580',interval:auto,query:(language:lucene,query:''),sort:!(timestamp,desc))",
            );
            expect(
                Url.getPathFromURL("https://google.com/maps/place/The+Flying'+Saucer/@42.4043314,-86.2742418,15z/data=!4m5!3m4!1s0x0:0xe28f6108670216bc!8m2!3d42.4043316!4d-86.2742121"),
            ).toEqual("maps/place/The+Flying'+Saucer/@42.4043314,-86.2742418,15z/data=!4m5!3m4!1s0x0:0xe28f6108670216bc!8m2!3d42.4043316!4d-86.2742121");
            expect(
                Url.getPathFromURL(
                    // eslint-disable-next-line max-len
                    'https://google.com/maps/place/%E9%9D%92%E5%B3%B6%E9%80%A3%E7%B5%A1%E8%88%B9%E4%B9%97%E5%A0%B4/@33.7363156,132.4877213,17.78z/data=!4m5!3m4!1s0x3545615c8c65bf7f:0xb89272c1a705a33f!8m2!3d33.7366776!4d132.4878843 ',
                ),
            ).toEqual(
                'maps/place/%E9%9D%92%E5%B3%B6%E9%80%A3%E7%B5%A1%E8%88%B9%E4%B9%97%E5%A0%B4/@33.7363156,132.4877213,17.78z/data=!4m5!3m4!1s0x3545615c8c65bf7f:0xb89272c1a705a33f!8m2!3d33.7366776!4d132.4878843',
            );
            expect(
                Url.getPathFromURL(
                    // eslint-disable-next-line max-len
                    'https://www.google.com/maps/place/Taj+Mahal+@is~"Awesome"/@27.1751496,78.0399535,17z/data=!4m12!1m6!3m5!1s0x39747121d702ff6d:0xdd2ae4803f767dde!2sTaj+Mahal!8m2!3d27.1751448!4d78.0421422!3m4!1s0x39747121d702ff6d:0xdd2ae4803f767dde!8m2!3d27.1751448!4d78.0421422',
                ),
            ).toEqual(
                'maps/place/Taj+Mahal+@is~%22Awesome%22/@27.1751496,78.0399535,17z/data=!4m12!1m6!3m5!1s0x39747121d702ff6d:0xdd2ae4803f767dde!2sTaj+Mahal!8m2!3d27.1751448!4d78.0421422!3m4!1s0x39747121d702ff6d:0xdd2ae4803f767dde!8m2!3d27.1751448!4d78.0421422',
            );
            expect(
                Url.getPathFromURL(
                    'https://new.expensify.com/r/443044983936732/attachment?source=https://www.expensify.com/chat-attachments/3915228701265930556/w_a758d3c8444a64f98d37205b17141388064d458e.jpg',
                ),
            ).toEqual('r/443044983936732/attachment?source=https://www.expensify.com/chat-attachments/3915228701265930556/w_a758d3c8444a64f98d37205b17141388064d458e.jpg');
        });
    });
    describe('hasSameExpensifyOrigin()', () => {
        describe('happy path', () => {
            it('It should work correctly', () => {
                expect(Url.hasSameExpensifyOrigin('https://new.expensify.com/inbox/124', 'https://new.expensify.com/inbox/123')).toBe(true);
            });
            it('It should work correctly with www in both urls', () => {
                expect(Url.hasSameExpensifyOrigin('https://www.new.expensify.com/inbox/124', 'https://www.new.expensify.com/action/123')).toBe(true);
            });
            it('It should work correctly with www in one of two urls', () => {
                expect(Url.hasSameExpensifyOrigin('https://new.expensify.com/action/1234', 'https://www.new.expensify.com/action/123')).toBe(true);
            });
            it('It should work correctly with old dot', () => {
                expect(Url.hasSameExpensifyOrigin('https://expensify.com/action/123', 'https://www.expensify.com/action/123')).toBe(true);
            });
            it('It should work correctly with local urls', () => {
                expect(Url.hasSameExpensifyOrigin('https://www.expensify.com.dev/inbox/123', 'https://expensify.com.dev/inbox/123')).toBe(true);
            });
        });
        describe('failure path', () => {
            it('It should work correctly with two origin urls', () => {
                expect(Url.hasSameExpensifyOrigin('https://new.expensify.com/inbox/124', 'https://expensify.com/inbox/123')).toBe(false);
            });
            it('It should work correctly with www', () => {
                expect(Url.hasSameExpensifyOrigin('https://www.expensify.com/inbox/124', 'https://www.new.expensify.com/action/123')).toBe(false);
            });
            it('It should work correctly with  www', () => {
                expect(Url.hasSameExpensifyOrigin('https://expensify.com/action/1234', 'https://www.new.expensify.com/action/123')).toBe(false);
            });
        });
    });
});
