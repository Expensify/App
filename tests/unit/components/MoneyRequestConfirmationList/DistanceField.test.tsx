import {render, screen} from '@testing-library/react-native';

import DistanceField from '@components/MoneyRequestConfirmationList/sections/DistanceField';

import DistanceRequestUtils from '@libs/DistanceRequestUtils';

import CONST from '@src/CONST';

import React from 'react';

jest.mock('@components/MenuItemWithTopDescription', () => {
    const {Text} = jest.requireActual<Record<'Text', React.ComponentType<{children?: React.ReactNode}>>>('react-native');
    return ({title}: {title: string}) => <Text>{title}</Text>;
});

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key.replace('common.', '')}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));

const defaultProps = {
    hasRoute: true,
    unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
    isManualDistanceRequest: false,
    isOdometerDistanceRequest: false,
    isGPSDistanceRequest: false,
    isReadOnly: false,
    didConfirm: false,
    transactionID: 'transactionID',
    action: CONST.IOU.ACTION.CREATE,
    iouType: CONST.IOU.TYPE.SUBMIT,
    reportID: 'reportID',
    reportActionID: undefined,
};

describe('DistanceField', () => {
    it.each([
        [1, '1.00 mile'],
        [100, '100.00 miles'],
    ])('displays the long-form distance unit for %s miles', (distanceInMiles, expected) => {
        render(
            <DistanceField
                {...defaultProps}
                distance={DistanceRequestUtils.convertToDistanceInMeters(distanceInMiles, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES)}
            />,
        );

        expect(screen.getByText(expected)).toBeOnTheScreen();
    });
});
