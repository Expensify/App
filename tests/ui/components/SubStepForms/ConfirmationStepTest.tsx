import {render, screen} from '@testing-library/react-native';
import React from 'react';
import ConfirmationStep from '@components/SubStepForms/ConfirmationStep';

type RNComponent = React.ComponentType<{testID?: string; children?: React.ReactNode}>;
type ReactNative = {Pressable: RNComponent; View: RNComponent; Text: RNComponent};

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key, formatPhoneNumber: (phone: string) => phone, preferredLocale: 'en'}));
jest.mock('@hooks/useThemeStyles', () => () => new Proxy({}, {get: () => ({})}));
jest.mock('@hooks/useNetwork', () => () => ({isOffline: false}));
jest.mock('@hooks/useSafeAreaPaddings', () => () => ({paddingTop: 0, paddingBottom: 0, insets: undefined, safeAreaPaddingBottomStyle: {}}));

jest.mock('@components/MenuItemWithTopDescription', () => {
    const reactNative = jest.requireActual<ReactNative>('react-native');
    const RNPressable = reactNative.Pressable;
    const RNView = reactNative.View;
    function MockMenuItem({pressableTestID, title, description}: {pressableTestID?: string; title: string; description: string}) {
        return (
            <RNPressable testID={pressableTestID}>
                <RNView testID={`${pressableTestID}-title`}>{title}</RNView>
                <RNView testID={`${pressableTestID}-description`}>{description}</RNView>
            </RNPressable>
        );
    }
    return {__esModule: true, default: MockMenuItem};
});

jest.mock('@components/RenderHTML', () => ({__esModule: true, default: () => null}));
jest.mock('@components/DotIndicatorMessage', () => ({__esModule: true, default: () => null}));
jest.mock('@components/Button', () => ({__esModule: true, default: () => null}));
jest.mock('@components/Text', () => {
    const reactNative = jest.requireActual<ReactNative>('react-native');
    return {__esModule: true, default: reactNative.Text};
});
jest.mock('@components/ScrollView', () => {
    const reactNative = jest.requireActual<ReactNative>('react-native');
    return {__esModule: true, default: reactNative.View};
});

type SummaryItem = {
    id?: string;
    description: string;
    title: string;
    shouldShowRightIcon: boolean;
    onPress: () => void;
    testID?: string;
};

function renderStep(items: SummaryItem[]) {
    return render(
        <ConfirmationStep
            isEditing={false}
            onNext={() => {}}
            onMove={() => {}}
            pageTitle="title"
            summaryItems={items}
            showOnfidoLinks={false}
        />,
    );
}

describe('ConfirmationStep — stableId fallback', () => {
    it('derives the row id from `description` + index (not `title`), so an edited title does not shift the focus-return identifier', () => {
        const before: SummaryItem[] = [
            {description: 'Legal name', title: 'John Doe', shouldShowRightIcon: true, onPress: () => {}},
            {description: 'Date of birth', title: '1990-01-01', shouldShowRightIcon: true, onPress: () => {}},
        ];
        renderStep(before);
        const idBefore = screen.getByTestId('Legal name-0');
        expect(idBefore).toBeOnTheScreen();

        screen.unmount();
        const after: SummaryItem[] = [
            {description: 'Legal name', title: 'Jane Smith', shouldShowRightIcon: true, onPress: () => {}},
            {description: 'Date of birth', title: '1990-01-01', shouldShowRightIcon: true, onPress: () => {}},
        ];
        renderStep(after);
        const idAfter = screen.getByTestId('Legal name-0');
        expect(idAfter).toBeOnTheScreen();
        expect(screen.getByTestId('Legal name-0-title').props.children).toBe('Jane Smith');
    });

    it('honors an explicit `id` over the description+index fallback', () => {
        renderStep([{id: 'firstName', description: 'Legal name', title: 'John', shouldShowRightIcon: true, onPress: () => {}}]);
        expect(screen.getByTestId('firstName')).toBeOnTheScreen();
        expect(screen.queryByTestId('Legal name-0')).toBeNull();
    });

    it('honors an explicit `testID` over the stableId', () => {
        renderStep([{description: 'Legal name', title: 'John', shouldShowRightIcon: true, onPress: () => {}, testID: 'explicit-test-id'}]);
        expect(screen.getByTestId('explicit-test-id')).toBeOnTheScreen();
    });

    it('disambiguates two rows with the same description via the index suffix', () => {
        renderStep([
            {description: 'Address', title: '123 Main St', shouldShowRightIcon: true, onPress: () => {}},
            {description: 'Address', title: '456 Other Ave', shouldShowRightIcon: true, onPress: () => {}},
        ]);
        expect(screen.getByTestId('Address-0')).toBeOnTheScreen();
        expect(screen.getByTestId('Address-1')).toBeOnTheScreen();
    });
});
