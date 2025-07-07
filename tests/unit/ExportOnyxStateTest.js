"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ExportOnyxState = require("@libs/ExportOnyxState/common");
describe('maskOnyxState', function () {
    var mockSession = {
        authToken: 'sensitive-auth-token',
        encryptedAuthToken: 'sensitive-encrypted-token',
        email: 'user@example.com',
        accountID: 12345,
    };
    it('should mask session details by default', function () {
        var input = { session: mockSession };
        var result = ExportOnyxState.maskOnyxState(input);
        expect(result.session.authToken).toBe('***');
        expect(result.session.encryptedAuthToken).toBe('***');
    });
    it('should not mask fragile data when isMaskingFragileDataEnabled is false', function () {
        var input = {
            session: mockSession,
        };
        var result = ExportOnyxState.maskOnyxState(input);
        expect(result.session.authToken).toBe('***');
        expect(result.session.encryptedAuthToken).toBe('***');
        expect(result.session.email).toBe('user@example.com');
    });
    it('should mask fragile data when isMaskingFragileDataEnabled is true', function () {
        var input = {
            session: mockSession,
        };
        var result = ExportOnyxState.maskOnyxState(input, true);
        expect(result.session.authToken).toBe('***');
        expect(result.session.encryptedAuthToken).toBe('***');
    });
    it('should mask emails as a string value in property with a random email', function () {
        var input = {
            session: mockSession,
        };
        var result = ExportOnyxState.maskOnyxState(input);
        expect(result.session.email).toMatch(ExportOnyxState.emailRegex);
    });
    it('should mask array of emails with random emails', function () {
        var input = {
            session: mockSession,
            emails: ['user@example.com', 'user2@example.com'],
        };
        var result = ExportOnyxState.maskOnyxState(input, true);
        expect(result.emails.at(0)).toMatch(ExportOnyxState.emailRegex);
        expect(result.emails.at(1)).toMatch(ExportOnyxState.emailRegex);
    });
    it('should mask emails in keys of objects', function () {
        var input = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'user@example.com': 'value',
            session: mockSession,
        };
        var result = ExportOnyxState.maskOnyxState(input, true);
        expect(Object.keys(result).at(0)).toMatch(ExportOnyxState.emailRegex);
    });
    it('should mask emails that are part of a string', function () {
        var input = {
            session: mockSession,
            emailString: 'user@example.com is a test string',
        };
        var result = ExportOnyxState.maskOnyxState(input, true);
        expect(result.emailString).not.toContain('user@example.com');
    });
    it('should mask keys that are in the fixed list', function () {
        var input = {
            session: mockSession,
            edits: ['hey', 'hi'],
            lastMessageHtml: 'hey',
        };
        var result = ExportOnyxState.maskOnyxState(input, true);
        expect(result.edits).toEqual(['***', '***']);
        expect(result.lastMessageHtml).toEqual('***');
    });
});
