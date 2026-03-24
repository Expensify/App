import {fireEvent, render, screen} from '@testing-library/react-native';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import DistanceRateListItem from '@components/SelectionList/ListItem/DistanceRateListItem';
import getOSAndName from '@libs/actions/Device/getDeviceInfo/getOSAndName';
import {isMobileIOS} from '@libs/Browser';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';

jest.mock('@components/OnyxListItemProvider', () => {
    function MockOnyxListItemProvider({children}: {children: ReactNode}) {
        return children;
    }

    MockOnyxListItemProvider.displayName = 'OnyxListItemProvider';
    return MockOnyxListItemProvider;
});

jest.mock('@libs/Browser', () => {
    const actualBrowser: Record<string, unknown> = jest.requireActual('@libs/Browser');
    return {
        ...actualBrowser,
        isMobileIOS: jest.fn(),
    };
});

jest.mock('@libs/getPlatform', () => jest.fn());

jest.mock('@libs/actions/Device/getDeviceInfo/getOSAndName', () => jest.fn());

jest.mock('@hooks/useAnimatedHighlightStyle', () => jest.fn(() => undefined));

const mockIsMobileIOS = isMobileIOS as jest.MockedFunction<typeof isMobileIOS>;
const mockGetPlatform = getPlatform as jest.MockedFunction<typeof getPlatform>;
const mockGetOSAndName = getOSAndName as jest.MockedFunction<typeof getOSAndName>;
const defaultDeviceInfo = {
    os: CONST.OS.WINDOWS,
    osVersion: '',
    deviceName: '',
    deviceVersion: '',
    appVersion: '',
    timestamp: '',
};

function renderDistanceRateListItem({canSelectMultiple}: {canSelectMultiple?: boolean} = {}) {
    const onSelectRow = jest.fn();
    const onFocus = jest.fn();

    render(
        <OnyxListItemProvider>
            <DistanceRateListItem
                item={{
                    keyForList: 'rate-1',
                    value: 'rate-1',
                    text: 'Default Rate',
                    alternateText: '$0.67 / mile',
                    accessibilityLabel: 'Default Rate, $0.67 / mile',
                    rightElement: <View testID="switch-element" />,
                }}
                onSelectRow={onSelectRow}
                onDismissError={jest.fn()}
                showTooltip={false}
                isFocused={false}
                keyForList="rate-1"
                onFocus={onFocus}
                canSelectMultiple={canSelectMultiple}
            />
        </OnyxListItemProvider>,
    );

    return {onSelectRow, onFocus};
}

describe('DistanceRateListItem', () => {
    beforeEach(() => {
        mockGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
        mockIsMobileIOS.mockReturnValue(false);
        mockGetOSAndName.mockReturnValue(defaultDeviceInfo);
    });

    it('uses the normal row path outside iOS and hides inner text from the accessibility tree when the row label is explicit', () => {
        renderDistanceRateListItem();

        const row = screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}rate-1`);

        expect(row).toHaveProp('accessibilityLabel', 'Default Rate, $0.67 / mile');
        expect(screen.queryByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}rate-1-summary`)).toBeNull();
        expect(screen.getByTestId('switch-element')).toBeTruthy();
        expect(screen.UNSAFE_getAllByType(View).some((node) => node.props['aria-hidden'] === true)).toBe(true);
    });

    it('creates a separate iOS native summary stop with option semantics and forwards focus', () => {
        mockGetPlatform.mockReturnValue(CONST.PLATFORM.IOS);

        const {onFocus, onSelectRow} = renderDistanceRateListItem();

        const row = screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}rate-1`);
        const summary = screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}rate-1-summary`);

        expect(row).toHaveProp('accessible', false);
        expect(summary).toHaveProp('role', CONST.ROLE.OPTION);
        expect(summary).toHaveProp('accessibilityLabel', 'Default Rate, $0.67 / mile');

        fireEvent(summary, 'focus', {nativeEvent: {}});
        fireEvent.press(summary);

        expect(onFocus).toHaveBeenCalledTimes(1);
        expect(onSelectRow).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('switch-element')).toBeTruthy();
    });

    it('uses button semantics for the iOS web summary stop in multi-select mode', () => {
        mockIsMobileIOS.mockReturnValue(true);

        renderDistanceRateListItem({canSelectMultiple: true});

        const summary = screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}rate-1-summary`);

        expect(summary).toHaveProp('role', CONST.ROLE.BUTTON);
    });

    it('creates a separate summary stop on macOS web', () => {
        mockGetOSAndName.mockReturnValue({...defaultDeviceInfo, os: CONST.OS.MAC_OS});

        const {onFocus, onSelectRow} = renderDistanceRateListItem();

        const row = screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}rate-1`);
        const summary = screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}rate-1-summary`);

        expect(row).toHaveProp('accessible', false);
        expect(summary).toHaveProp('role', CONST.ROLE.OPTION);

        fireEvent(summary, 'focus', {nativeEvent: {}});
        fireEvent.press(summary);

        expect(onFocus).toHaveBeenCalledTimes(1);
        expect(onSelectRow).toHaveBeenCalledTimes(1);
    });
});
