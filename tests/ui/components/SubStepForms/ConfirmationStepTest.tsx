import {render, screen} from '@testing-library/react-native';

import ConfirmationStep from '@components/SubStepForms/ConfirmationStep';

import React from 'react';

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
    id: string;
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

describe('ConfirmationStep — caller-provided id contract', () => {
    it('keys each row by its explicit `id` — an edited title does not shift the focus-return identifier', () => {
        const before: SummaryItem[] = [
            {id: 'legal-name', description: 'Legal name', title: 'John Doe', shouldShowRightIcon: true, onPress: () => {}},
            {id: 'date-of-birth', description: 'Date of birth', title: '1990-01-01', shouldShowRightIcon: true, onPress: () => {}},
        ];
        renderStep(before);
        expect(screen.getByTestId('legal-name')).toBeOnTheScreen();

        screen.unmount();
        const after: SummaryItem[] = [
            {id: 'legal-name', description: 'Legal name', title: 'Jane Smith', shouldShowRightIcon: true, onPress: () => {}},
            {id: 'date-of-birth', description: 'Date of birth', title: '1990-01-01', shouldShowRightIcon: true, onPress: () => {}},
        ];
        renderStep(after);
        expect(screen.getByTestId('legal-name')).toBeOnTheScreen();
        expect(screen.getByTestId('legal-name-title').props.children).toBe('Jane Smith');
    });

    it('honors an explicit `testID` over the id', () => {
        renderStep([{id: 'legal-name', description: 'Legal name', title: 'John', shouldShowRightIcon: true, onPress: () => {}, testID: 'explicit-test-id'}]);
        expect(screen.getByTestId('explicit-test-id')).toBeOnTheScreen();
    });

    it('removing an earlier conditional row does NOT shift the surviving rows key/testID — a semantic id survives the shift where description+index would not', () => {
        const withOptional: SummaryItem[] = [
            {id: 'copy-of-id', description: 'ID document', title: 'passport.pdf', shouldShowRightIcon: true, onPress: () => {}},
            {id: 'address-proof', description: 'Address proof', title: 'utility.pdf', shouldShowRightIcon: true, onPress: () => {}},
        ];
        renderStep(withOptional);
        expect(screen.getByTestId('address-proof')).toBeOnTheScreen();

        screen.unmount();
        const withoutOptional: SummaryItem[] = [{id: 'address-proof', description: 'Address proof', title: 'utility.pdf', shouldShowRightIcon: true, onPress: () => {}}];
        renderStep(withoutOptional);
        expect(screen.getByTestId('address-proof')).toBeOnTheScreen();
    });
});
