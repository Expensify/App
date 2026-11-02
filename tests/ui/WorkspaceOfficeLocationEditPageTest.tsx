import {render} from '@testing-library/react-native';

import Header from '@components/Header';

import usePolicy from '@hooks/usePolicy';

import WorkspaceOfficeLocationEditPage from '@pages/workspace/WorkspaceOfficeLocationEditPage';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import type {CompanyAddress, OfficeLocation} from '@src/types/onyx/Policy';

import type React from 'react';
import type {PropsWithChildren} from 'react';

import createMock from '../utils/createMock';

jest.mock('@components/Header', () => ({__esModule: true, default: {IconButton: jest.fn(() => null)}}));
jest.mock('@components/Header/composed/HeaderWithBackButtonAndTitle', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@hooks/useConfirmModal', () => jest.fn(() => ({showConfirmModal: jest.fn()})));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: jest.fn(() => ({Trashcan: 'Trashcan'}))}));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/usePermissions', () => jest.fn(() => ({isBetaEnabled: () => true})));
jest.mock('@hooks/usePolicy', () => jest.fn());
jest.mock('@libs/Navigation/Navigation', () => ({goBack: jest.fn()}));
jest.mock('@userActions/Policy/DistanceRate', () => ({deleteOfficeLocation: jest.fn(), updateOfficeLocation: jest.fn()}));
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => ({__esModule: true, default: ({children}: PropsWithChildren) => children}));
jest.mock('@pages/workspace/WorkspaceOfficeLocationForm', () => jest.fn(() => null));

const companyAddress: CompanyAddress = {addressStreet: '1 Market St', city: 'San Francisco', state: 'CA', zipCode: '94105', country: 'US'};
const headquarters: OfficeLocation = {name: 'Headquarters', address: {addressStreet: '88 Kearny St', city: 'San Francisco', state: 'CA', zipCode: '94108', country: 'US'}, isDefault: true};
const newJerseyOffice: OfficeLocation = {name: 'New Jersey Office', address: {addressStreet: '900 Asbury Ave', city: 'Ocean City', state: 'NJ', zipCode: '08226', country: 'US'}};
const homeAndOfficeCommuterExclusions = {method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE};

describe('WorkspaceOfficeLocationEditPage', () => {
    const policyID = 'policy123';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderPage = (policy: Partial<Policy>) => {
        jest.mocked(usePolicy).mockReturnValue(createMock<Policy>({id: policyID, ...policy}));
        const props = createMock<React.ComponentProps<typeof WorkspaceOfficeLocationEditPage>>({route: {params: {policyID, officeID: 'OFFICE1'}}});
        render(<WorkspaceOfficeLocationEditPage {...props} />);
    };
    const isDeleteShown = () => jest.mocked(Header.IconButton).mock.calls.length > 0;

    it('lets the last office be deleted while the workspace does not exclude commutes by home and office', () => {
        // Given a workspace without a company address whose only office is the one being edited
        renderPage({officeLocations: {OFFICE1: headquarters}});

        // When the office is shown for editing
        // Then it can be deleted, since nothing needs an office
        expect(isDeleteShown()).toBe(true);
    });

    it('keeps the last office while the workspace excludes commutes by home and office', () => {
        // Given a workspace without a company address that excludes commutes by home and office with its only office
        renderPage({officeLocations: {OFFICE1: headquarters}, commuterExclusions: homeAndOfficeCommuterExclusions});

        // When the office is shown for editing
        // Then it can't be deleted, since excluding commutes by home and office needs an office
        expect(isDeleteShown()).toBe(false);
    });

    it.each([
        ['another office', {officeLocations: {OFFICE1: headquarters, OFFICE2: newJerseyOffice}}],
        ['the company address', {officeLocations: {OFFICE1: headquarters}, address: companyAddress}],
    ])('lets an office be deleted while the workspace excludes commutes by home and office when %s remains', (_description, policy) => {
        // Given a workspace that excludes commutes by home and office with another office left after the deletion
        renderPage({...policy, commuterExclusions: homeAndOfficeCommuterExclusions});

        // When the office is shown for editing
        // Then it can be deleted, since the workspace keeps an office
        expect(isDeleteShown()).toBe(true);
    });
});
