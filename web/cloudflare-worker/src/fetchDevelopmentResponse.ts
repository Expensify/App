/** Forward live requests without relying on Wrangler's implicit upstream host/port handling. */
function getDevelopmentUpstream(env: DevelopmentEnv): URL {
    const upstream = new URL(env.DEV_UPSTREAM);
    if (
        upstream.protocol !== 'http:' ||
        upstream.hostname !== '127.0.0.1' ||
        !upstream.port ||
        upstream.pathname !== '/' ||
        upstream.search ||
        upstream.hash ||
        upstream.username ||
        upstream.password
    ) {
        throw new Error('DEV_UPSTREAM must be an HTTP loopback origin with an explicit port');
    }
    return upstream;
}

/** API and attachment responses must never enter the SPA fallback or HTML nonce/cache pipeline. */
function isAPIRequest(pathname: string): boolean {
    return /^\/(?:api|staging|staging-secure|chat-attachments|receipts)(?:\/|$)/.test(pathname);
}

async function fetchDevelopmentResponse(request: Request, env: DevelopmentEnv): Promise<Response> {
    const upstream = getDevelopmentUpstream(env);
    const publicURL = new URL(request.url);
    const url = new URL(request.url);
    url.protocol = upstream.protocol;
    url.host = upstream.host;
    if (url.pathname === '/apple-app-site-association') {
        url.pathname = '/.well-known/apple-app-site-association';
    }
    const forwarded = new Request(url, request);
    if (!isAPIRequest(url.pathname)) {
        // Never let an upstream 304 pair a previously cached HTML body with a fresh CSP nonce.
        forwarded.headers.delete('If-None-Match');
        forwarded.headers.delete('If-Modified-Since');
    }
    let response: Response;
    try {
        response = await fetch(forwarded, {redirect: 'manual'});
    } catch {
        return new Response('The local Rsbuild server is unavailable. Check its output in npm run web.', {status: 503});
    }
    if (response.status === 101) {
        return response;
    }
    const location = response.headers.get('Location');
    if (location && new URL(location, url).origin === upstream.origin) {
        const redirect = new URL(location, url);
        redirect.protocol = publicURL.protocol;
        redirect.host = publicURL.host;
        response = new Response(response.body, response);
        response.headers.set('Location', redirect.href);
    }
    return response;
}

export {fetchDevelopmentResponse, getDevelopmentUpstream, isAPIRequest};
