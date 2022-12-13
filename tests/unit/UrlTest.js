const Url = require('../../src/libs/Url');

describe('Url', () => {
    describe('getURLObject()', () => {
        it('It should work correctly', () => {
            expect(Url.getURLObject('foo.com')).toEqual({
                href: 'foo.com',
                protocol: undefined,
                hostname: 'foo.com',
                path: '',
            });
            expect(Url.getURLObject('www.foo.com')).toEqual({
                href: 'www.foo.com',
                protocol: undefined,
                hostname: 'www.foo.com',
                path: '',
            });
            expect(Url.getURLObject('http://www.foo.com')).toEqual({
                href: 'http://www.foo.com',
                protocol: 'http://',
                hostname: 'www.foo.com',
                path: '',
            });
            expect(Url.getURLObject('http://foo.com/blah_blah')).toEqual({
                href: 'http://foo.com/blah_blah',
                protocol: 'http://',
                hostname: 'foo.com',
                path: '/blah_blah',
            });
            expect(Url.getURLObject('http://foo.com/blah_blah_(wikipedia)')).toEqual({
                href: 'http://foo.com/blah_blah_(wikipedia)',
                protocol: 'http://',
                hostname: 'foo.com',
                path: '/blah_blah_(wikipedia)',
            });
            expect(Url.getURLObject('http://www.example.com/wpstyle/?p=364')).toEqual({
                href: 'http://www.example.com/wpstyle/?p=364',
                protocol: 'http://',
                hostname: 'www.example.com',
                path: '/wpstyle/?p=364',
            });
            expect(Url.getURLObject('https://www.example.com/foo/?bar=baz&inga=42&quux')).toEqual({
                href: 'https://www.example.com/foo/?bar=baz&inga=42&quux',
                protocol: 'https://',
                hostname: 'www.example.com',
                path: '/foo/?bar=baz&inga=42&quux',
            });
            expect(Url.getURLObject('http://foo.com/(something)?after=parens')).toEqual({
                href: 'http://foo.com/(something)?after=parens',
                protocol: 'http://',
                hostname: 'foo.com',
                path: '/(something)?after=parens',
            });
            expect(Url.getURLObject('http://code.google.com/events/#&product=browser')).toEqual({
                href: 'http://code.google.com/events/#&product=browser',
                protocol: 'http://',
                hostname: 'code.google.com',
                path: '/events/#&product=browser',
            });
            expect(Url.getURLObject('http://foo.bar/?q=Test%20URL-encoded%20stuff')).toEqual({
                href: 'http://foo.bar/?q=Test%20URL-encoded%20stuff',
                protocol: 'http://',
                hostname: 'foo.bar',
                path: '/?q=Test%20URL-encoded%20stuff',
            });
            expect(Url.getURLObject('http://www.test.com/path?param=123#123')).toEqual({
                href: 'http://www.test.com/path?param=123#123',
                protocol: 'http://',

                hostname: 'www.test.com',
                path: '/path?param=123#123',
            });
            expect(Url.getURLObject('http://1337.net')).toEqual({
                href: 'http://1337.net',
                protocol: 'http://',

                hostname: '1337.net',
                path: '',
            });
            expect(Url.getURLObject('http://a.b-c.de/')).toEqual({
                href: 'http://a.b-c.de/',
                protocol: 'http://',

                hostname: 'a.b-c.de',
                path: '/',
            });
            expect(Url.getURLObject('https://sd1.sd2.docs.google.com/')).toEqual({
                href: 'https://sd1.sd2.docs.google.com/',
                protocol: 'https://',
                hostname: 'sd1.sd2.docs.google.com',
                path: '/',
            });
            expect(Url.getURLObject('https://expensify.cash/#/r/1234')).toEqual({
                href: 'https://expensify.cash/#/r/1234',
                protocol: 'https://',
                hostname: 'expensify.cash',
                path: '/#/r/1234',
            });
            expect(Url.getURLObject('https://github.com/Expensify/ReactNativeChat/pull/6.45')).toEqual({
                href: 'https://github.com/Expensify/ReactNativeChat/pull/6.45',
                protocol: 'https://',
                hostname: 'github.com',
                path: '/Expensify/ReactNativeChat/pull/6.45',
            });
            expect(Url.getURLObject('https://github.com/Expensify/Expensify/issues/143,231')).toEqual({
                href: 'https://github.com/Expensify/Expensify/issues/143,231',
                protocol: 'https://',
                hostname: 'github.com',
                path: '/Expensify/Expensify/issues/143,231',
            });
            expect(Url.getURLObject('testRareTLDs.beer')).toEqual({
                href: 'testRareTLDs.beer',
                protocol: undefined,
                hostname: 'testRareTLDs.beer',
                path: '',
            });
            expect(Url.getURLObject('test@expensify.com')).toEqual({
                href: 'test@expensify.com',
                protocol: undefined,
                hostname: 'expensify.com',
                path: '',
            });
            expect(Url.getURLObject('test.completelyFakeTLD')).toEqual({
                href: undefined,
                protocol: undefined,
                hostname: undefined,
                path: undefined,
            });
            expect(Url.getURLObject(
                // eslint-disable-next-line max-len
                'https://www.expensify.com/_devportal/tools/logSearch/#query=request_id:(%22Ufjjim%22)+AND+timestamp:[2021-01-08T03:48:10.389Z+TO+2021-01-08T05:48:10.389Z]&index=logs_expensify-008878)',
            ))
                .toEqual({
                    // eslint-disable-next-line max-len
                    href: 'https://www.expensify.com/_devportal/tools/logSearch/#query=request_id:(%22Ufjjim%22)+AND+timestamp:[2021-01-08T03:48:10.389Z+TO+2021-01-08T05:48:10.389Z]&index=logs_expensify-008878)',
                    protocol: 'https://',
                    hostname: 'www.expensify.com',
                    path: '/_devportal/tools/logSearch/#query=request_id:(%22Ufjjim%22)+AND+timestamp:[2021-01-08T03:48:10.389Z+TO+2021-01-08T05:48:10.389Z]&index=logs_expensify-008878)',
                });
            expect(Url.getURLObject('http://necolas.github.io/react-native-web/docs/?path=/docs/components-pressable--disabled ')).toEqual({
                href: 'http://necolas.github.io/react-native-web/docs/?path=/docs/components-pressable--disabled ',
                protocol: 'http://',
                hostname: 'necolas.github.io',
                path: '/react-native-web/docs/?path=/docs/components-pressable--disabled ',
            });
            expect(Url.getURLObject('https://github.com/Expensify/Expensify.cash/issues/123#:~:text=Please%20work/Expensify.cash ')).toEqual({
                href: 'https://github.com/Expensify/Expensify.cash/issues/123#:~:text=Please%20work/Expensify.cash ',
                protocol: 'https://',
                hostname: 'github.com',
                path: '/Expensify/Expensify.cash/issues/123#:~:text=Please%20work/Expensify.cash ',
            });
            expect(Url.getURLObject('https://github.com/Expensify/Expensify.cash/issues/123#:~:text=Please%20work/Expensify.cash ')).toEqual({
                href: 'https://github.com/Expensify/Expensify.cash/issues/123#:~:text=Please%20work/Expensify.cash ',
                protocol: 'https://',
                hostname: 'github.com',
                path: '/Expensify/Expensify.cash/issues/123#:~:text=Please%20work/Expensify.cash ',
            });
            expect(Url.getURLObject('mm..food ')).toEqual({
                href: undefined,
                protocol: undefined,
                hostname: undefined,
                path: undefined,
            });
            expect(Url.getURLObject('upwork.com/jobs/~016781e062ce860b84 ')).toEqual({
                href: 'upwork.com/jobs/~016781e062ce860b84 ',
                protocol: undefined,
                hostname: 'upwork.com',
                path: '/jobs/~016781e062ce860b84 ',
            });
            expect(Url.getURLObject(
                // eslint-disable-next-line max-len
                'https://bastion1.sjc/logs/app/kibana#/discover?_g=()&_a=(columns:!(_source),index:\'2125cbe0-28a9-11e9-a79c-3de0157ed580\',interval:auto,query:(language:lucene,query:\'\'),sort:!(timestamp,desc))',
            )).toEqual({
                // eslint-disable-next-line max-len
                href: 'https://bastion1.sjc/logs/app/kibana#/discover?_g=()&_a=(columns:!(_source),index:\'2125cbe0-28a9-11e9-a79c-3de0157ed580\',interval:auto,query:(language:lucene,query:\'\'),sort:!(timestamp,desc))',
                protocol: 'https://',

                hostname: 'bastion1.sjc',
                // eslint-disable-next-line max-len
                path: '/logs/app/kibana#/discover?_g=()&_a=(columns:!(_source),index:\'2125cbe0-28a9-11e9-a79c-3de0157ed580\',interval:auto,query:(language:lucene,query:\'\'),sort:!(timestamp,desc))',
            });
            expect(Url.getURLObject('google.com/maps/place/The+Flying\'+Saucer/@42.4043314,-86.2742418,15z/data=!4m5!3m4!1s0x0:0xe28f6108670216bc!8m2!3d42.4043316!4d-86.2742121')).toEqual({
                href: 'google.com/maps/place/The+Flying\'+Saucer/@42.4043314,-86.2742418,15z/data=!4m5!3m4!1s0x0:0xe28f6108670216bc!8m2!3d42.4043316!4d-86.2742121',
                protocol: undefined,
                hostname: 'google.com',
                path: '/maps/place/The+Flying\'+Saucer/@42.4043314,-86.2742418,15z/data=!4m5!3m4!1s0x0:0xe28f6108670216bc!8m2!3d42.4043316!4d-86.2742121',
            });
            expect(Url.getURLObject(
                // eslint-disable-next-line max-len
                'google.com/maps/place/%E9%9D%92%E5%B3%B6%E9%80%A3%E7%B5%A1%E8%88%B9%E4%B9%97%E5%A0%B4/@33.7363156,132.4877213,17.78z/data=!4m5!3m4!1s0x3545615c8c65bf7f:0xb89272c1a705a33f!8m2!3d33.7366776!4d132.4878843 ',
            ))
                .toEqual({
                    // eslint-disable-next-line max-len
                    href: 'google.com/maps/place/%E9%9D%92%E5%B3%B6%E9%80%A3%E7%B5%A1%E8%88%B9%E4%B9%97%E5%A0%B4/@33.7363156,132.4877213,17.78z/data=!4m5!3m4!1s0x3545615c8c65bf7f:0xb89272c1a705a33f!8m2!3d33.7366776!4d132.4878843 ',
                    protocol: undefined,
                    hostname: 'google.com',
                    // eslint-disable-next-line max-len
                    path: '/maps/place/%E9%9D%92%E5%B3%B6%E9%80%A3%E7%B5%A1%E8%88%B9%E4%B9%97%E5%A0%B4/@33.7363156,132.4877213,17.78z/data=!4m5!3m4!1s0x3545615c8c65bf7f:0xb89272c1a705a33f!8m2!3d33.7366776!4d132.4878843 ',
                });
            expect(Url.getURLObject(
                // eslint-disable-next-line max-len
                'https://www.google.com/maps/place/Taj+Mahal+@is~"Awesome"/@27.1751496,78.0399535,17z/data=!4m12!1m6!3m5!1s0x39747121d702ff6d:0xdd2ae4803f767dde!2sTaj+Mahal!8m2!3d27.1751448!4d78.0421422!3m4!1s0x39747121d702ff6d:0xdd2ae4803f767dde!8m2!3d27.1751448!4d78.0421422',
            ))
                .toEqual({
                    // eslint-disable-next-line max-len
                    href: 'https://www.google.com/maps/place/Taj+Mahal+@is~"Awesome"/@27.1751496,78.0399535,17z/data=!4m12!1m6!3m5!1s0x39747121d702ff6d:0xdd2ae4803f767dde!2sTaj+Mahal!8m2!3d27.1751448!4d78.0421422!3m4!1s0x39747121d702ff6d:0xdd2ae4803f767dde!8m2!3d27.1751448!4d78.0421422',
                    protocol: 'https://',
                    hostname: 'www.google.com',
                    // eslint-disable-next-line max-len
                    path: '/maps/place/Taj+Mahal+@is~"Awesome"/@27.1751496,78.0399535,17z/data=!4m12!1m6!3m5!1s0x39747121d702ff6d:0xdd2ae4803f767dde!2sTaj+Mahal!8m2!3d27.1751448!4d78.0421422!3m4!1s0x39747121d702ff6d:0xdd2ae4803f767dde!8m2!3d27.1751448!4d78.0421422',
                });
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
            it('It should work correctly without https://', () => {
                expect(Url.hasSameExpensifyOrigin('new.expensify.com/action/1234', 'new.expensify.com/action/123')).toBe(true);
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
            it('It should work correctly with www in one of two urls', () => {
                expect(Url.hasSameExpensifyOrigin('https://new.expensify.com/action/1234', 'https://www.new.expensify.com/action/123')).toBe(false);
            });
        });
    });
});
