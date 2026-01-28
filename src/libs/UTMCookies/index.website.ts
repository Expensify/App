/**
 * Captures UTM parameters from the URL and stores them in cookies for marketing attribution.
 * These cookies are shared across subdomains and read by the PHP backend during signup.
 * Uses last-touch attribution - overwrites existing values on each visit with UTM params.
 */

const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

/**
 * Get the cookie domain for cross-subdomain sharing.
 * For expensify.com, returns .expensify.com
 * For expensify.com.dev, returns .expensify.com.dev
 */
function getCookieDomain(): string {
    const hostname = window.location.hostname;

    // For localhost, don't set a domain (use default)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return '';
    }

    // Extract the parent domain for cross-subdomain cookies
    // e.g., dev.new.expensify.com -> .expensify.com
    // e.g., new.expensify.com.dev -> .expensify.com.dev
    const parts = hostname.split('.');

    // Handle .dev domains (e.g., expensify.com.dev)
    if (hostname.endsWith('.dev')) {
        // Get last 3 parts: expensify.com.dev
        return `.${parts.slice(-3).join('.')}`;
    }

    // Handle production domains (e.g., expensify.com)
    // Get last 2 parts: expensify.com
    return `.${parts.slice(-2).join('.')}`;
}

/**
 * Set a cookie with the given name and value.
 * Cookie expires in 30 days (standard UTM cookie lifetime).
 */
function setCookie(name: string, value: string): void {
    const domain = getCookieDomain();
    const expires = new Date();
    expires.setTime(expires.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Build cookie string
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    cookieString += `; expires=${expires.toUTCString()}`;
    cookieString += '; path=/';

    if (domain) {
        cookieString += `; domain=${domain}`;
    }

    // Set secure flag for HTTPS
    if (window.location.protocol === 'https:') {
        cookieString += '; secure';
    }

    // SameSite=Lax allows cookies to be sent with top-level navigations
    cookieString += '; SameSite=Lax';

    document.cookie = cookieString;
}

/**
 * Capture UTM parameters from the current URL and store them in cookies.
 * Should be called early in app initialization.
 */
function captureUTMParams(): void {
    try {
        const urlParams = new URLSearchParams(window.location.search);

        UTM_PARAMS.forEach((param) => {
            const value = urlParams.get(param);
            if (value) {
                setCookie(param, value);
            }
        });
    } catch (error) {
        // Silently fail - UTM tracking is not critical
        console.warn('Failed to capture UTM params:', error);
    }
}

export default captureUTMParams;
