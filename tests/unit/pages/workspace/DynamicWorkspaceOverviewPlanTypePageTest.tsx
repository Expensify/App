/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return -- Jest factory mocks use CommonJS require() which returns untyped modules; typing each mock precisely is not practical here */
import {render} from '@testing-library/react-native';
import React from 'react';
import DynamicWorkspaceOverviewPlanTypePage from '@pages/workspace/DynamicWorkspaceOverviewPlanTypePage';
import CONST from '@src/CONST';

type SelectionListMockProps = {
    alternateNumberOfSupportedLines?: number;
    data?: Array<{value: string}>;
};

let mockSelectionListProps: SelectionListMockProps | undefined;

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);

jest.mock('@hooks/useTheme', () => jest.fn(() => ({success: 'green'})));

jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(
        () =>
            new Proxy(
                {},
                {
                    get: () => ({}),
                },
            ),
    ),
);

jest.mock('@hooks/usePrivateSubscription', () => jest.fn(() => undefined));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({Lock: 1})),
}));

jest.mock('@libs/actions/Policy/Plan', () => jest.fn());

jest.mock('@libs/PolicyUtils', () => ({
    isSubmitPolicy: (policy?: {type?: string}) => policy?.type === 'submit2026',
}));

jest.mock('@libs/SubscriptionUtils', () => ({
    isSubscriptionTypeOfInvoicing: jest.fn(() => false),
}));

jest.mock('@navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
}));

jest.mock('@pages/settings/Subscription/CardSection/utils', () => ({
    getNextBillingDate: jest.fn(() => 'May 17, 2026'),
}));

jest.mock('@pages/workspace/withPolicy', () => (Component: unknown) => Component);

jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => {
    function MockAccessOrNotFoundWrapper({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockAccessOrNotFoundWrapper;
});

jest.mock('@components/ActivityIndicator', () => {
    function MockActivityIndicator() {
        return null;
    }
    return MockActivityIndicator;
});

jest.mock('@components/Button', () => {
    const ReactModule = require('react');
    const {Text: RNText} = require('react-native');

    function MockButton({text}: {text: string}) {
        return ReactModule.createElement(RNText, null, text);
    }
    return MockButton;
});

jest.mock('@components/HeaderWithBackButton', () => {
    const ReactModule = require('react');
    const {Text: RNText} = require('react-native');

    function MockHeaderWithBackButton({title}: {title: string}) {
        return ReactModule.createElement(RNText, null, title);
    }
    return MockHeaderWithBackButton;
});

jest.mock('@components/Icon', () => {
    const ReactModule = require('react');
    const {View: RNView} = require('react-native');

    function MockIcon() {
        return ReactModule.createElement(RNView);
    }
    return MockIcon;
});

jest.mock('@components/ScreenWrapper', () => {
    const ReactModule = require('react');
    const {View: RNView} = require('react-native');

    function MockScreenWrapper({children, testID}: {children: React.ReactNode; testID: string}) {
        return ReactModule.createElement(RNView, {testID}, children);
    }
    return MockScreenWrapper;
});

jest.mock('@components/SelectionList', () => {
    const ReactModule = require('react');
    const {View: RNView} = require('react-native');

    function MockSelectionList(props: SelectionListMockProps) {
        mockSelectionListProps = props;
        return ReactModule.createElement(RNView, {testID: 'selection-list'});
    }
    return MockSelectionList;
});

jest.mock('@components/SelectionList/ListItem/SingleSelectListItem', () => 'SingleSelectListItem');

jest.mock('@components/Text', () => {
    const ReactModule = require('react');
    const {Text: RNText} = require('react-native');

    function MockText({children}: {children: React.ReactNode}) {
        return ReactModule.createElement(RNText, null, children);
    }
    return MockText;
});

jest.mock('@components/TextLink', () => {
    const ReactModule = require('react');
    const {Text: RNText} = require('react-native');

    function MockTextLink({children}: {children: React.ReactNode}) {
        return ReactModule.createElement(RNText, null, children);
    }
    return MockTextLink;
});

describe('DynamicWorkspaceOverviewPlanTypePage', () => {
    beforeEach(() => {
        mockSelectionListProps = undefined;
    });

    it('allows Submit plan descriptions to wrap to two lines', () => {
        render(
            <DynamicWorkspaceOverviewPlanTypePage
                policy={
                    {
                        id: 'policy-1',
                        type: CONST.POLICY.TYPE.SUBMIT,
                        isLoading: false,
                        canDowngrade: true,
                    } as never
                }
            />,
        );

        expect(mockSelectionListProps?.data).toEqual(expect.arrayContaining([expect.objectContaining({value: CONST.POLICY.TYPE.SUBMIT})]));
        expect(mockSelectionListProps?.alternateNumberOfSupportedLines).toBe(2);
    });
});
