import isAllowedPDFLink from '@components/PDFView/isAllowedPDFLink';

import prefixes from '@libs/Navigation/linkingConfig/prefixes';

describe('isAllowedPDFLink', () => {
    it.each([
        'new-expensify://transition',
        'new-expensify://transition?email=stranger@example.com',
        'new-expensify://transition?email=victim@example.com',
        'new-expensify://settings/security/closeAccount',
        'NEW-EXPENSIFY://transition',
        'app://-/transition',
        'expensify://transition',
        // eslint-disable-next-line no-script-url -- Verify that untrusted script annotations are rejected.
        'javascript:alert(1)',
        'file:///receipt.pdf',
        'data:text/html,test',
        'mailto:security@example.com',
        'tel:+15555555555',
    ])('blocks non-web annotation URL %s', (url) => {
        // Given a PDF annotation that could launch an app or execute an action
        // When its URL is checked
        const result = isAllowedPDFLink(url);

        // Then it is not forwarded to the operating system
        expect(result).toBe(false);
    });

    it.each(prefixes.filter((prefix) => prefix.startsWith('https://')))('blocks app links on %s', (prefix) => {
        // Given a PDF annotation targeting an app host instead of its custom scheme
        const url = new URL('/transition?email=stranger@example.com', prefix).toString();

        // When its URL is checked
        const result = isAllowedPDFLink(url);

        // Then the HTTPS equivalent cannot bypass the annotation filter
        expect(result).toBe(false);
    });

    it.each([
        'https://NEW.EXPENSIFY.COM/transition',
        'HTTPS://NEW.EXPENSIFY.COM/transition',
        'https://%6eew.expensify.com/transition',
        'https://new.expensify.com:443/transition',
        'https://new.expensify.com./transition',
        'https://example.com@new.expensify.com/transition',
        'http://new.expensify.com/transition',
        'https://dev.new.expensify.com:8082/transition',
        'https://new.expensify.com/settings/about',
    ])('blocks app-host variant %s', (url) => {
        // Given an annotation that disguises or changes an app URL
        // When its URL is checked
        const result = isAllowedPDFLink(url);

        // Then host normalization and protocol changes do not bypass the filter
        expect(result).toBe(false);
    });

    it.each(['', 'not a URL', '/transition', '//new.expensify.com/transition', 'https://'])('blocks malformed or relative annotation URL %s', (url) => {
        // Given an annotation without a valid absolute URL
        // When its URL is checked
        const result = isAllowedPDFLink(url);

        // Then parsing fails closed
        expect(result).toBe(false);
    });

    it.each([
        'https://example.com/receipt',
        'HTTPS://EXAMPLE.COM/receipt',
        'http://example.com/receipt',
        'https://help.expensify.com/articles/receipt',
        'https://travel.expensify.com/trips/123',
        'https://example.com/?url=new-expensify%3A%2F%2Ftransition',
        'https://new.expensify.com.example.com/receipt',
    ])('allows external web URL %s', (url) => {
        // Given a legitimate web link in a PDF annotation
        // When its URL is checked
        const result = isAllowedPDFLink(url);

        // Then ordinary external links remain usable
        expect(result).toBe(true);
    });
});
