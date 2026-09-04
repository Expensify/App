import {render} from '@testing-library/react-native';

import Button from '@components/ButtonComposed';
import type {ScrollViewProps} from '@components/ScrollView';
import TextLink from '@components/TextLink';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';

import CertiniaPrerequisitesStep from '@pages/workspace/accounting/certinia/prerequisites/CertiniaPrerequisitesStep';

import CONST from '@src/CONST';

import React from 'react';

import createMock from '../../../../../utils/createMock';
import {translateLocal} from '../../../../../utils/TestHelper';

jest.mock('@components/ButtonComposed', () => ({
    __esModule: true,
    default: Object.assign(
        jest.fn(() => null),
        {KeyboardShortcut: jest.fn(() => null), Text: jest.fn(() => null)},
    ),
}));
jest.mock('@components/FixedFooter', () => jest.fn((props: React.PropsWithChildren) => props.children));
jest.mock('@components/ScrollView', () => jest.fn((props: ScrollViewProps) => props.children));
jest.mock('@components/TextLink', () => jest.fn(() => null));
jest.mock('@expensify/react-native-hybrid-app', () => ({__esModule: true, default: {isHybridApp: jest.fn(() => false)}}));
jest.mock('@hooks/useLocalize', () => jest.fn());
jest.mock('@hooks/useNetwork', () => jest.fn());
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => ({})));
const mockLocalize = createMock<ReturnType<typeof useLocalize>>({translate: translateLocal});
const [mockTranslate, mockOnNext, mockOnConnect] = [jest.spyOn(mockLocalize, 'translate'), jest.fn(), jest.fn()];
const baseProps = {isEditing: false, onNext: mockOnNext, onMove: jest.fn(), onConnect: mockOnConnect, isSandbox: true};
function renderStep(currentPageName?: string) {
    render(React.createElement(CertiniaPrerequisitesStep, {...baseProps, currentPageName}));
    const buttonProps = jest.mocked(Button).mock.calls.at(-1)?.[0];
    if (!buttonProps) {
        throw new Error('Expected the rendered prerequisite action');
    }
    return buttonProps;
}
jest.mocked(useLocalize).mockReturnValue(mockLocalize);
jest.mocked(useNetwork).mockReturnValue({isOffline: false});
beforeEach(() => jest.clearAllMocks());
it.each([undefined, 'foreign', CONST.CERTINIA_PREREQUISITES.PAGE_NAME.INSTALL_BUNDLE])('uses the intentional complete install-bundle fallback for %s', (pageName) => {
    const button = renderStep(pageName);
    expect(mockTranslate).toHaveBeenCalledWith('workspace.certinia.prerequisites.installBundle');
    expect(mockTranslate).toHaveBeenCalledWith('workspace.certinia.prerequisites.installBundleDescription');
    expect(mockTranslate).toHaveBeenCalledWith('workspace.certinia.prerequisites.installBundleConfirm');
    expect(mockTranslate).toHaveBeenCalledWith('workspace.certinia.prerequisites.installBundlePSALink', {version: CONST.CERTINIA_PSA_BUNDLE_VERSION});
    expect(mockTranslate).toHaveBeenCalledWith('workspace.certinia.prerequisites.installBundleFFALink', {version: CONST.CERTINIA_FFA_BUNDLE_VERSION});
    expect(jest.mocked(TextLink).mock.calls.map(([props]) => props.href)).toEqual([CONST.CERTINIA_PSA_BUNDLE_INSTALL_URL.SANDBOX, CONST.CERTINIA_FFA_BUNDLE_INSTALL_URL.SANDBOX]);
    expect(button.onPress).toBe(mockOnNext);
});
it('preserves setup-contact and OAuth content, actions, and offline state', () => {
    const setupButton = renderStep(CONST.CERTINIA_PREREQUISITES.PAGE_NAME.SETUP_CONTACTS);
    expect(mockTranslate).toHaveBeenCalledWith('workspace.certinia.prerequisites.setupContacts');
    expect(mockTranslate).toHaveBeenCalledWith('workspace.certinia.prerequisites.setupContactsBullet1');
    expect(mockTranslate).toHaveBeenCalledWith('workspace.certinia.prerequisites.setupContactsBullet2');
    expect(mockTranslate).toHaveBeenCalledWith('workspace.certinia.prerequisites.setupContactsBullet3');
    expect(mockTranslate).toHaveBeenCalledWith('workspace.certinia.prerequisites.setupContactsConfirm');
    expect(setupButton.onPress).toBe(mockOnNext);
    jest.mocked(useNetwork).mockReturnValue({isOffline: true});
    const oauthButton = renderStep(CONST.CERTINIA_PREREQUISITES.PAGE_NAME.OAUTH);
    expect(mockTranslate).toHaveBeenCalledWith('workspace.certinia.prerequisites.oauthDescription');
    expect(mockTranslate).toHaveBeenCalledWith('workspace.certinia.prerequisites.connectButton');
    expect([oauthButton.onPress, oauthButton.isDisabled]).toEqual([mockOnConnect, true]);
});
