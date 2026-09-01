/**
 * libs/Network runs the main queue bootstrap as a module load side effect: it flushes the persisted request
 * queue and starts the drain interval once the leader tab is elected. Nothing imports libs/Network for that
 * side effect on purpose. It rides along on the `post` import in libs/Reauthentication, which the middleware
 * registry pulls in, so the bootstrap runs before any request can be made.
 *
 * That makes the chain load bearing and invisible. This test fails if a link is ever dropped or made lazy,
 * which would otherwise leave the queue silently never drained, with no other signal.
 *
 * libs/Network is mocked so only the reachability is checked. The real bootstrap never runs here.
 */
let didLoadNetworkModule = false;

jest.mock('@libs/Network', () => {
    didLoadNetworkModule = true;
    return {post: jest.fn(), clearProcessQueueInterval: jest.fn()};
});

describe('main queue bootstrap reachability', () => {
    it('loads libs/Network when libs/API is loaded', () => {
        jest.isolateModules(() => {
            require('@libs/API');
        });

        expect(didLoadNetworkModule).toBe(true);
    });
});
