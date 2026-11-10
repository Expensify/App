/** Guards revealed card values and their copy targets when composing Wallet detail rows. */
import {render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MenuItem from '@components/MenuItem';

import {getFormattedAddress} from '@libs/PersonalDetailsUtils';

import CardDetails from '@pages/settings/Wallet/WalletPage/CardDetails';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PrivatePersonalDetails} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('Wallet card details composition', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('keeps every revealed value masked and copies the displayed value', async () => {
        // Given synthetic card details and a billing address.
        const privateDetails: PrivatePersonalDetails = {addresses: [{street: '123 Test St', city: 'Test City', state: 'CA', zip: '12345', country: 'US'}]};
        await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, privateDetails);
        await waitForBatchedUpdates();
        const values = ['4111 1111 1111 1111', '12/30', '123', getFormattedAddress(privateDetails)];

        // When the revealed card details are rendered using the real field preset.
        render(
            <LocaleContextProvider>
                <CardDetails pan={values[0]} expiration={values[1]} cvv={values[2]} />
            </LocaleContextProvider>,
        );

        // Then masking remains on all value leaves, and each copy target matches its displayed value.
        const valueLeaves = screen.UNSAFE_getAllByType(MenuItem.FieldValue);
        expect(valueLeaves).toHaveLength(values.length);
        for (const [index, leaf] of valueLeaves.entries()) {
            expect(leaf.props.forwardedFSClass).toBe(CONST.FULLSTORY.CLASS.MASK);
            expect(leaf.props.children).toBe(values[index]);
        }
        const copyLeaves = screen.UNSAFE_getAllByType(MenuItem.Copy);
        expect(copyLeaves).toHaveLength(values.length);
        for (const [index, copy] of copyLeaves.entries()) {
            expect(copy.props.value).toBe(values[index]);
        }
        expect(screen.UNSAFE_getAllByType(MenuItem.Root).every((root) => !root.props.onPress)).toBe(true);
    });

    it('only renders the CVV when a travel card reveals no PAN or expiration', () => {
        // Given a travel card with only a revealed CVV.
        const cvv = '456';

        // When the details component is rendered.
        render(
            <LocaleContextProvider>
                <CardDetails cvv={cvv} />
            </LocaleContextProvider>,
        );

        // Then no number, expiration, or address row is introduced by the migration.
        expect(screen.UNSAFE_getAllByType(MenuItem.FieldValue)).toHaveLength(1);
        expect(screen.UNSAFE_getByType(MenuItem.FieldValue).props.forwardedFSClass).toBe(CONST.FULLSTORY.CLASS.MASK);
        expect(screen.UNSAFE_getByType(MenuItem.Copy).props.value).toBe(cvv);
    });
});
