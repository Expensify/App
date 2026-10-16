import {render, screen} from '@testing-library/react-native';

import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import DistanceField from '@components/MoneyRequestConfirmationList/sections/DistanceField';

import DistanceRequestUtils from '@libs/DistanceRequestUtils';

import CONST from '@src/CONST';

import React from 'react';

jest.mock('@components/MenuItemWithTopDescription', () => {
    const {Text} = jest.requireActual<Record<'Text', React.ComponentType<{children?: React.ReactNode}>>>('react-native');
    return ({title, hintText}: {title: string; hintText?: string}) => (
        <>
            <Text>{title}</Text>
            {hintText ? <Text>{hintText}</Text> : null}
        </>
    );
});

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key.replace('common.', '')}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));

const defaultProps = {
    hasRoute: true,
    unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
};

const renderDistanceField = (props: React.ComponentProps<typeof DistanceField>) =>
    render(
        <ConfirmationFieldsProvider
            transactionID="transactionID"
            reportID="reportID"
            action={CONST.IOU.ACTION.CREATE}
            iouType={CONST.IOU.TYPE.SUBMIT}
        >
            <DistanceField {...props} />
        </ConfirmationFieldsProvider>,
    );

describe('DistanceField', () => {
    it.each([
        [1, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, '1.00 mile'],
        [100, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, '100.00 miles'],
        [1, CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS, '1.00 kilometer'],
        [100, CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS, '100.00 kilometers'],
    ])('displays the long-form distance unit for %s %s', (distance, unit, expected) => {
        renderDistanceField({...defaultProps, distance: DistanceRequestUtils.convertToDistanceInMeters(distance, unit), unit});

        expect(screen.getByText(expected)).toBeOnTheScreen();
    });

    it('displays the commuter exclusion hint', () => {
        renderDistanceField({
            ...defaultProps,
            distance: DistanceRequestUtils.convertToDistanceInMeters(3, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES),
            customUnit: {
                quantity: 4,
                distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                commuterExclusion: 1,
                reimbursableDistance: 3,
            },
        });

        expect(screen.getByText('distance.commuterExclusion.removedCommuterDistance.mi')).toBeOnTheScreen();
    });
});
