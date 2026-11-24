import {render} from '@testing-library/react-native';

import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';

import {connectToOdoo} from '@libs/actions/connections/Odoo';
import Navigation from '@libs/Navigation/Navigation';

import OdooSetupPage from '@pages/workspace/accounting/odoo/OdooSetupPage';

import type ONYXKEYS from '@src/ONYXKEYS';
import type {OdooCredentialsForm} from '@src/types/form/OdooCredentialsForm';
import type {Policy} from '@src/types/onyx';

import React from 'react';

type OdooFormValues = FormOnyxValues<typeof ONYXKEYS.FORMS.ODOO_CREDENTIALS_FORM>;

type CapturedFormProps = {
    validate: (values: OdooFormValues) => FormInputErrors<typeof ONYXKEYS.FORMS.ODOO_CREDENTIALS_FORM>;
    onSubmit: (values: OdooFormValues) => void;
};

const POLICY_ID = '123';

// Capture the layout and form props so the tests can check the page's own logic without rendering the full form
const mockLayoutProps: {current: {shouldBeBlocked?: boolean} | undefined} = {current: undefined};
const mockFormProps: {current: CapturedFormProps | undefined} = {current: undefined};

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useAutoFocusInput', () => () => ({inputCallbackRef: jest.fn()}));
// The policy and form state the page reads, passed through the page's selector like useOnyx does
let mockPolicy: Partial<Policy> | undefined;
let mockForm: Partial<OdooCredentialsForm> | undefined;
jest.mock('@hooks/useOnyx', () => (key: string, options?: {selector?: (value: unknown) => unknown}) => {
    const value: unknown = key === 'odooCredentialsForm' ? mockForm : mockPolicy;
    return [options?.selector ? options.selector(value) : value];
});
jest.mock('@libs/actions/connections/Odoo', () => ({connectToOdoo: jest.fn(), resetOdooCredentialsForm: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({dismissModal: jest.fn()}));
jest.mock('@components/ConnectionLayout', () => ({children, shouldBeBlocked}: {children: React.ReactNode; shouldBeBlocked?: boolean}) => {
    mockLayoutProps.current = {shouldBeBlocked};
    return children;
});
jest.mock('@components/Form/FormProvider', () => ({children, validate, onSubmit}: CapturedFormProps & {children: React.ReactNode}) => {
    mockFormProps.current = {validate, onSubmit};
    return children;
});
jest.mock('@components/Form/InputWrapper', () => () => null);
jest.mock('@components/RenderHTML', () => () => null);

function renderPage() {
    return (
        // @ts-expect-error - the page only reads the route, so the navigation prop is left out
        <OdooSetupPage route={{key: 'test-route', name: 'Policy_Accounting_Odoo_Setup', params: {policyID: POLICY_ID}}} />
    );
}

function renderOdooSetupPage(policy?: Partial<Policy>) {
    mockPolicy = policy;
    mockForm = undefined;
    return render(renderPage());
}

describe('OdooSetupPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockLayoutProps.current = undefined;
        mockFormProps.current = undefined;
    });

    it('requires both the Odoo URL and the API key', () => {
        // Given the setup page for a workspace that isn't connected yet
        renderOdooSetupPage();

        // When the admin confirms with an empty URL and a key that's only spaces
        const errors = mockFormProps.current?.validate({odooURL: '', apiKey: '   '});

        // Then both fields show the required-field error, since an API key alone can't reach an Odoo database
        expect(errors).toEqual({odooURL: 'common.error.fieldRequired', apiKey: 'common.error.fieldRequired'});
    });

    it.each(['acme.odoo.com', 'my odoo', 'http://acme.odoo.com', 'https://odoo.acme.com', 'https://acme.odoo.com/odoo'])('rejects %s as the Odoo URL before submitting', (odooURL) => {
        // Given the setup page for a workspace that isn't connected yet
        renderOdooSetupPage();

        // When the admin confirms a URL that isn't an Odoo Online database address
        const errors = mockFormProps.current?.validate({odooURL, apiKey: 'api-key-1'});

        // Then the URL shows the Odoo URL error, since only https://<name>.odoo.com databases are supported
        expect(errors).toEqual({odooURL: 'workspace.odoo.invalidURL'});
    });

    it.each([' https://acme.odoo.com ', 'https://my-company.odoo.com/', 'HTTPS://ACME.ODOO.COM'])('accepts %s as the Odoo URL', (odooURL) => {
        // Given the setup page for a workspace that isn't connected yet
        renderOdooSetupPage();

        // When the admin confirms an Odoo Online URL, pasted with spaces, a trailing slash or in capitals
        const errors = mockFormProps.current?.validate({odooURL, apiKey: 'api-key-1'});

        // Then there is no error, so the form can submit
        expect(errors).toEqual({});
    });

    it('connects with the trimmed URL and API key and keeps the page open until the server accepts them', () => {
        // Given the setup page for a workspace that isn't connected yet
        renderOdooSetupPage();

        // When the admin confirms values pasted with surrounding spaces
        mockFormProps.current?.onSubmit({odooURL: ' https://acme.odoo.com ', apiKey: ' api-key-1 '});

        // Then the workspace connects with the clean values, and the page stays open so a rejected URL can show its error here
        expect(connectToOdoo).toHaveBeenCalledWith(POLICY_ID, 'https://acme.odoo.com', 'api-key-1');
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
    });

    it('closes the setup page once the server accepts the connection', () => {
        // Given the setup page waiting on the connect request
        const {rerender} = renderOdooSetupPage();

        // When the server accepts the URL and key
        mockForm = {hasConnectionSucceeded: true};
        rerender(renderPage());

        // Then the page closes so the Accounting page can show the sync
        expect(Navigation.dismissModal).toHaveBeenCalledTimes(1);
    });

    it('blocks the page for a working connection but allows reconnecting after an authentication error', () => {
        // Given a workspace with a working Odoo connection
        const {rerender} = renderOdooSetupPage({connections: {odoo: {config: {url: 'https://acme.odoo.com', subsidiaryID: '1', isConfigured: true}}}});

        // Then the setup page is blocked, so an admin can't replace a working connection from here
        expect(mockLayoutProps.current?.shouldBeBlocked).toBe(true);

        // When the stored key stops working
        mockPolicy = {
            connections: {
                odoo: {config: {url: 'https://acme.odoo.com', subsidiaryID: '1', isConfigured: true}, lastSync: {isSuccessful: false, isAuthenticationError: true, source: 'AUTOSYNC'}},
            },
        };
        rerender(renderPage());

        // Then Reconnect can open the page again to enter a new key
        expect(mockLayoutProps.current?.shouldBeBlocked).toBe(false);
    });
});
