import {fireEvent, render, screen} from '@testing-library/react-native';

import ConfirmationStep from '@components/SubStepForms/ConfirmationStep';

import type useOnyx from '@hooks/useOnyx';

import Confirmation from '@pages/ReimbursementAccount/NonUSD/BankInfo/subSteps/Confirmation';

import CONST from '@src/CONST';
import type * as OnyxKeys from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {ReimbursementAccountForm} from '@src/types/form/ReimbursementAccountForm';
import type {CorpayFields, ReimbursementAccount} from '@src/types/onyx';

import type {ComponentProps} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {Pressable as NativePressable} from 'react-native/Libraries/Components/Pressable/Pressable';
import type {View as NativeView} from 'react-native/Libraries/Components/View/View';

import React from 'react';

import createMock from '../utils/createMock';

let mockSaved: OnyxEntry<ReimbursementAccount>;
let mockDraft: OnyxEntry<ReimbursementAccountForm>;

jest.mock('@hooks/useOnyx', () => {
    const {default: ONYXKEYS} = jest.requireActual<typeof OnyxKeys>('@src/ONYXKEYS');
    return (key: Parameters<typeof useOnyx>[0]) => [key === ONYXKEYS.REIMBURSEMENT_ACCOUNT ? mockSaved : mockDraft];
});
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useThemeStyles', () => () => ({flexGrow1: {flexGrow: 1}}));
jest.mock('@components/ActivityIndicator', () => {
    const {View} = jest.requireActual<{View: typeof NativeView}>('react-native');
    return {__esModule: true, default: () => <View testID="metadata-loading" />};
});
jest.mock('@components/SubStepForms/ConfirmationStep', () => {
    const {Pressable, View} = jest.requireActual<{Pressable: typeof NativePressable; View: typeof NativeView}>('react-native');
    return {
        __esModule: true,
        default: jest.fn(({summaryItems = [], onNext}: ComponentProps<typeof ConfirmationStep>) => (
            <View testID="confirmation">
                {summaryItems.map((item) => (
                    <Pressable
                        key={item.id}
                        testID={item.id}
                        accessibilityRole="button"
                        onPress={item.onPress}
                    />
                ))}
                <Pressable
                    testID="next"
                    accessibilityRole="button"
                    onPress={() => onNext()}
                />
            </View>
        )),
    };
});

const keys = INPUT_IDS.ADDITIONAL_DATA;
const fields = createMock<CorpayFields>({
    formFields: [
        {id: keys.ROUTING_CODE, label: 'Routing'},
        {id: keys.CORPAY.SWIFT_BIC_CODE, label: 'SWIFT'},
        {id: keys.ACCOUNT_HOLDER_NAME, label: 'Holder'},
        {id: keys.ACCOUNT_HOLDER_ADDRESS_1, label: 'Street'},
        {id: keys.ACCOUNT_HOLDER_CITY, label: 'City'},
        {id: keys.ACCOUNT_HOLDER_REGION, label: 'Region'},
        {id: keys.ACCOUNT_HOLDER_POSTAL, label: 'Postal'},
        {id: keys.CORPAY.ACCOUNT_HOLDER_COUNTRY, label: 'Country'},
        {id: keys.CORPAY.BANK_NAME, label: 'Bank'},
    ],
});

describe('NonUSD bank info Confirmation', () => {
    beforeEach(() => {
        jest.mocked(ConfirmationStep).mockClear();
        mockSaved = createMock<ReimbursementAccount>({
            achData: {
                routingNumber: 'saved-routing',
                addressName: 'Saved Holder',
                addressStreet: '123 Main Street',
                addressCity: 'London',
                addressState: 'London',
                addressZipCode: 'SW1A 1AA',
                corpay: {accountHolderCountry: CONST.COUNTRY.GB, bankName: 'Saved Bank'},
            },
        });
        mockDraft = undefined;
    });

    it('preserves metadata order, backend aliases, labels and edit destinations', () => {
        // Given metadata uses routing and account-holder aliases from the saved account
        const onMove = jest.fn();
        const onNext = jest.fn();

        // When the actual component runs its real key builder and projection
        render(
            <Confirmation
                isEditing
                onMove={onMove}
                onNext={onNext}
                corpayFields={fields}
            />,
        );
        const props = jest.mocked(ConfirmationStep).mock.lastCall?.[0];

        // Then every metadata row survives in order with the original display value
        expect(screen.getByTestId('confirmation')).toBeOnTheScreen();
        expect(props).toBeDefined();
        expect(props?.summaryItems?.map(({id, description, title}) => ({id, description, title}))).toEqual([
            {id: keys.ROUTING_CODE, description: 'Routing', title: 'saved-routing'},
            {id: keys.CORPAY.SWIFT_BIC_CODE, description: 'SWIFT', title: 'saved-routing'},
            {id: keys.ACCOUNT_HOLDER_NAME, description: 'Holder', title: 'Saved Holder'},
            {id: keys.ACCOUNT_HOLDER_ADDRESS_1, description: 'Street', title: '123 Main Street'},
            {id: keys.ACCOUNT_HOLDER_CITY, description: 'City', title: 'London'},
            {id: keys.ACCOUNT_HOLDER_REGION, description: 'Region', title: 'London'},
            {id: keys.ACCOUNT_HOLDER_POSTAL, description: 'Postal', title: 'SW1A 1AA'},
            {id: keys.CORPAY.ACCOUNT_HOLDER_COUNTRY, description: 'Country', title: CONST.ALL_COUNTRIES.GB},
            {id: keys.CORPAY.BANK_NAME, description: 'Bank', title: 'Saved Bank'},
        ]);
        for (const field of fields.formFields) {
            expect(screen.getByTestId(field.id)).toBeOnTheScreen();
            fireEvent.press(screen.getByTestId(field.id));
        }
        expect(onMove.mock.calls).toEqual([[0], [0], [1], [1], [1], [1], [1], [1], [0]]);
        fireEvent.press(screen.getByTestId('next'));
        expect(onNext).toHaveBeenCalledTimes(1);
        expect(props).toMatchObject({
            isEditing: true,
            showOnfidoLinks: false,
            forwardedFSClass: CONST.FULLSTORY.CLASS.MASK,
            pageTitle: 'bankInfoStep.letsDoubleCheck',
            pageSubtitle: 'bankInfoStep.thisBankAccount',
        });
    });

    it('keeps draft empty strings ahead of saved data and preserves an undefined country label', () => {
        // Given empty draft fields intentionally override nonempty saved values
        mockDraft = createMock<ReimbursementAccountForm>({routingCode: '', accountHolderName: '', accountHolderCountry: '', bankName: ''});

        // When the real projection and SafeString display path build the rows
        render(
            <Confirmation
                isEditing={false}
                onMove={jest.fn()}
                onNext={jest.fn()}
                corpayFields={fields}
            />,
        );
        const props = jest.mocked(ConfirmationStep).mock.lastCall?.[0];

        // Then empty input is preserved and the country row exists without a fabricated label
        expect(screen.getByTestId(keys.CORPAY.ACCOUNT_HOLDER_COUNTRY)).toBeOnTheScreen();
        expect(props).toBeDefined();
        expect(props?.summaryItems).toEqual(
            expect.arrayContaining([
                expect.objectContaining({id: keys.ROUTING_CODE, title: ''}),
                expect.objectContaining({id: keys.ACCOUNT_HOLDER_NAME, title: ''}),
                expect.objectContaining({id: keys.CORPAY.BANK_NAME, title: ''}),
                expect.objectContaining({id: keys.CORPAY.ACCOUNT_HOLDER_COUNTRY, title: undefined}),
            ]),
        );
    });

    it('preserves missing labels for an exact malformed country from the provider', () => {
        // Given a malformed provider value outside the typed country domain
        mockDraft = createMock<ReimbursementAccountForm>({
            // @ts-expect-error The provider can contain this exact unknown country at runtime.
            accountHolderCountry: 'ZZ',
        });

        // When the real component resolves the country display text
        render(
            <Confirmation
                isEditing={false}
                onMove={jest.fn()}
                onNext={jest.fn()}
                corpayFields={fields}
            />,
        );
        const props = jest.mocked(ConfirmationStep).mock.lastCall?.[0];

        // Then the country row remains editable without echoing the unknown code
        expect(screen.getByTestId(keys.CORPAY.ACCOUNT_HOLDER_COUNTRY)).toBeOnTheScreen();
        expect(props).toBeDefined();
        expect(props?.summaryItems).toEqual(expect.arrayContaining([expect.objectContaining({id: keys.CORPAY.ACCOUNT_HOLDER_COUNTRY, title: undefined})]));
    });

    it.each([undefined, createMock<CorpayFields>({formFields: []})])('renders confirmation for absent or empty metadata', (corpayFields) => {
        // Given metadata has no rows and is not loading
        // When the real component renders the confirmation boundary
        render(
            <Confirmation
                isEditing={false}
                onMove={jest.fn()}
                onNext={jest.fn()}
                corpayFields={corpayFields}
            />,
        );

        // Then an empty summary remains a usable confirmation
        expect(screen.getByTestId('confirmation')).toBeOnTheScreen();
        expect(jest.mocked(ConfirmationStep).mock.lastCall?.[0].summaryItems).toEqual([]);
    });

    it('shows metadata loading before rendering confirmation', () => {
        // Given metadata is still being fetched
        const loadingFields = {...fields, isLoading: true};

        // When the component has not received its final metadata
        render(
            <Confirmation
                isEditing={false}
                onMove={jest.fn()}
                onNext={jest.fn()}
                corpayFields={loadingFields}
            />,
        );

        // Then only the existing loading branch is displayed
        expect(screen.getByTestId('metadata-loading')).toBeOnTheScreen();
        expect(screen.queryByTestId('confirmation')).toBeNull();
        expect(ConfirmationStep).not.toHaveBeenCalled();
    });

    it('forwards saved loading and the latest error without changing next behavior', () => {
        // Given the saved account is loading and contains more than one submission error
        const oldErrorKey = '1';
        const latestErrorKey = '2';
        mockSaved = createMock<ReimbursementAccount>({isLoading: true, errors: {[oldErrorKey]: 'Old error', [latestErrorKey]: 'Latest error'}});
        const onNext = jest.fn();

        // When the real component renders its shared confirmation
        render(
            <Confirmation
                isEditing={false}
                onMove={jest.fn()}
                onNext={onNext}
                corpayFields={fields}
            />,
        );

        // Then saved request state and the original next callback are forwarded
        expect(screen.getByTestId('confirmation')).toBeOnTheScreen();
        expect(jest.mocked(ConfirmationStep).mock.lastCall?.[0]).toMatchObject({isLoading: true, error: 'Latest error', onNext});
        fireEvent.press(screen.getByTestId('next'));
        expect(onNext).toHaveBeenCalledTimes(1);
    });
});
