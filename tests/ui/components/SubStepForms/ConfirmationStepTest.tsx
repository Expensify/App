import {fireEvent, render, screen} from '@testing-library/react-native';

import type {MenuItemProps} from '@components/MenuItem';
import ConfirmationStep from '@components/SubStepForms/ConfirmationStep';

import useAccessibilityAnnouncement from '@hooks/useAccessibilityAnnouncement';

import type {Pressable as NativePressable} from 'react-native/Libraries/Components/Pressable/Pressable';
import type {View as NativeView} from 'react-native/Libraries/Components/View/View';
import type {Text as NativeText} from 'react-native/Libraries/Text/Text';

import React from 'react';

jest.mock('@hooks/useAccessibilityAnnouncement', () => jest.fn());
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key, formatPhoneNumber: (phone: string) => phone, preferredLocale: 'en'}));
jest.mock('@hooks/useThemeStyles', () => () => new Proxy({}, {get: () => ({})}));
jest.mock('@hooks/useNetwork', () => () => ({isOffline: false}));
jest.mock('@hooks/useSafeAreaPaddings', () => () => ({paddingTop: 0, paddingBottom: 0, insets: undefined, safeAreaPaddingBottomStyle: {}}));

jest.mock('@components/MenuItemWithTopDescription', () => {
    const reactNative = jest.requireActual<{Pressable: typeof NativePressable; View: typeof NativeView}>('react-native');
    const RNPressable = reactNative.Pressable;
    const RNView = reactNative.View;
    return {
        __esModule: true,
        default: ({pressableTestID, title, description, onPress}: MenuItemProps) => (
            <RNPressable
                testID={pressableTestID}
                onPress={(event) => {
                    onPress?.(event);
                }}
            >
                <RNView testID={`${pressableTestID}-title`}>{title}</RNView>
                <RNView testID={`${pressableTestID}-description`}>{description}</RNView>
            </RNPressable>
        ),
    };
});

jest.mock('@components/RenderHTML', () => ({__esModule: true, default: () => null}));
jest.mock('@components/DotIndicatorMessage', () => ({__esModule: true, default: () => null}));
jest.mock('@components/Text', () => {
    const reactNative = jest.requireActual<{Text: typeof NativeText}>('react-native');
    return {__esModule: true, default: reactNative.Text};
});
jest.mock('@components/ScrollView', () => {
    const reactNative = jest.requireActual<{View: typeof NativeView}>('react-native');
    return {__esModule: true, default: reactNative.View};
});

type SummaryItem = NonNullable<React.ComponentProps<typeof ConfirmationStep>['summaryItems']>[number];

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

describe('ConfirmationStep — subtitle and resubmission', () => {
    it('renders the page subtitle when one is provided', () => {
        render(
            <ConfirmationStep
                isEditing={false}
                onNext={() => {}}
                onMove={() => {}}
                pageTitle="title"
                pageSubtitle="subtitle"
                summaryItems={[]}
                showOnfidoLinks={false}
            />,
        );
        expect(screen.getByText('subtitle')).toBeOnTheScreen();
    });

    it('calls onNext when Confirm is pressed while an error is shown, so the same details can be resubmitted', () => {
        const onNext = jest.fn();
        render(
            <ConfirmationStep
                isEditing={false}
                onNext={onNext}
                onMove={() => {}}
                pageTitle="title"
                summaryItems={[]}
                showOnfidoLinks={false}
                error="Bank account details could not be verified"
            />,
        );
        fireEvent.press(screen.getByText('common.confirm'));
        expect(onNext).toHaveBeenCalledTimes(1);
    });

    it('announces the error once a submission finishes, not when Confirm is pressed', () => {
        // Given a confirmation page still showing the error of an earlier submission
        const error = 'Bank account details could not be verified';
        const props = {isEditing: false, onNext: () => {}, onMove: () => {}, pageTitle: 'title', summaryItems: [], showOnfidoLinks: false, error, shouldAnnounceSubmitState: true};
        const getAnnouncementKey = () => jest.mocked(useAccessibilityAnnouncement).mock.lastCall?.[2]?.announcementKey;
        const {rerender} = render(<ConfirmationStep {...props} />);
        const keyBeforeSubmit = getAnnouncementKey();

        // When the user resubmits and the request is still running
        fireEvent.press(screen.getByText('common.confirm'));
        rerender(
            <ConfirmationStep
                {...props}
                isLoading
            />,
        );

        // Then the old error is not announced again yet
        expect(getAnnouncementKey()).toBe(keyBeforeSubmit);

        // When the request finishes with the error
        rerender(
            <ConfirmationStep
                {...props}
                isLoading={false}
            />,
        );

        // Then the error is announced for this submission
        expect(getAnnouncementKey()).not.toBe(keyBeforeSubmit);
    });
});

describe('ConfirmationStep missing plain title', () => {
    it('retains required rows and edit actions when a title is undefined', () => {
        // Given a missing country label must keep its row identity and edit action
        const editCountry = jest.fn();
        const editName = jest.fn();
        const items: SummaryItem[] = [
            {id: 'country', description: 'Country', title: undefined, shouldShowRightIcon: true, onPress: editCountry},
            {id: 'name', description: 'Name', title: 'Example', shouldShowRightIcon: true, onPress: editName},
        ];

        // When the real shared component forwards both rows to presentation
        renderStep(items);
        const country = screen.getByTestId('country');
        const name = screen.getByTestId('name');

        // Then missing title content does not remove the row or disconnect its action
        expect(country).toBeOnTheScreen();
        expect(name).toBeOnTheScreen();
        expect(screen.getByTestId('country-title').props.children).toBeUndefined();
        expect(screen.getByTestId('name-title').props.children).toBe('Example');
        fireEvent.press(country);
        fireEvent.press(name);
        expect(editCountry).toHaveBeenCalledTimes(1);
        expect(editName).toHaveBeenCalledTimes(1);
    });
});
