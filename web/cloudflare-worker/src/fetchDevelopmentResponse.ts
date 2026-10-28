import {isAPIRequest} from './developmentAPIProxy';

/** Forward live requests without relying on Wrangler's implicit upstream host/port handling. */
async function fetchDevelopmentResponse(request: Request, upstream: URL): Promise<Response> {
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
    const redirect = location ? new URL(location, url) : null;
    if (redirect?.origin === upstream.origin) {
        redirect.protocol = publicURL.protocol;
        redirect.host = publicURL.host;
        response = new Response(response.body, response);
        response.headers.set('Location', redirect.href);
    }
    return response;
}

export default fetchDevelopmentResponse;
