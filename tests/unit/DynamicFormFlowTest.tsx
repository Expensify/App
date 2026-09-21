import {act, fireEvent, render, screen} from '@testing-library/react-native';

import DynamicFormFlow from '@components/DynamicForm/DynamicFormFlow';
import type {DynamicFormValues} from '@components/DynamicForm/types';

import Navigation from '@libs/Navigation/Navigation';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {DynamicFormField} from '@src/types/onyx';

import type ReactNative from 'react-native';

import React from 'react';
import Onyx from 'react-native-onyx';

import allFieldTypes from '../fixtures/dynamicForm/allFieldTypes';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockRouteParams: {subPage?: string; action?: 'edit'} = {};
const mockSetParams = jest.fn();

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setParams: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));

jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@react-navigation/native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        useIsFocused: () => true,
        useRoute: jest.fn(() => ({name: '', key: '', params: mockRouteParams})),
        useNavigation: jest.fn(() => ({addListener: jest.fn(() => jest.fn()), getState: jest.fn(() => ({routes: []})), isFocused: () => true, setParams: mockSetParams})),
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        preferredLocale: 'en',
    })),
);

jest.mock('@components/UploadFile', () => {
    function MockUploadFile() {
        return null;
    }
    return {__esModule: true, default: MockUploadFile};
});

jest.mock('@components/ScreenWrapper', () => {
    function MockScreenWrapper({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockScreenWrapper;
});

jest.mock('@components/HeaderWithBackButton', () => {
    const RN = jest.requireActual<typeof ReactNative>('react-native');
    function MockHeader({title, onBackButtonPress}: {title: string; onBackButtonPress: () => void}) {
        return (
            <RN.Pressable
                accessibilityLabel="common.back"
                onPress={onBackButtonPress}
            >
                <RN.Text>{title}</RN.Text>
            </RN.Pressable>
        );
    }
    return MockHeader;
});

jest.mock('@src/utils/keyboard', () => ({
    dismiss: jest.fn(() => Promise.resolve()),
    dismissKeyboardAndExecute: jest.fn((callback: () => void) => callback()),
}));

const FORM_ID = ONYXKEYS.FORMS.DYNAMIC_FORM_LIST_ITEM_FORM;
const buildRoute = (pageName: string, action?: 'edit') => ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute(undefined, pageName, action);

const completeDraft = {
    accountNumber: '12345678',
    numberOfEmployees: '25',
    settlementCurrency: 'USD',
    operatingCountries: ['GB'],
    legalType: 'PRIVATE',
    accountType: 'CHECKING',
    annualVolume: '1000',
    annualVolumeCurrency: 'USD',
    dateOfBirth: '1990-01-31',
    country: 'GB',
    address: '1 High Street',
    useCases: ['PAYING_SUPPLIERS_CONTRACTORS_EMPLOYEES'],
    isSourceOfFund: false,
    legalEntityShareholders: [],
    ownershipPercentage: '40',
};

async function renderFlow(onSubmit: (values: DynamicFormValues) => void = jest.fn(), onBack: () => void = jest.fn()) {
    render(
        <DynamicFormFlow
            fields={allFieldTypes}
            formID={FORM_ID}
            headerTitle="Add bank account"
            testID="DynamicFormFlowTest"
            buildRoute={buildRoute}
            onSubmit={onSubmit}
            onBack={onBack}
            confirmationTitle="Confirm your details"
        />,
    );
    await waitForBatchedUpdatesWithAct();
}

describe('DynamicFormFlow', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        delete mockRouteParams.subPage;
        delete mockRouteParams.action;
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.FORMS.DYNAMIC_FORM_LIST_ITEM_FORM_DRAFT, completeDraft);
        });
    });

    it('renders the first group as a page with a step indicator for three groups', async () => {
        mockRouteParams.subPage = 'account-details';
        await renderFlow();

        expect(screen.getByText('Account details')).toBeOnTheScreen();
        expect(screen.getByText('common.next')).toBeOnTheScreen();
        expect(screen.getByLabelText(/^stepCounter, Add bank account$/)).toBeOnTheScreen();
        expect(screen.getAllByLabelText(/stepCounter/)).toHaveLength(3);
    });

    it('moves to the next page route when the page validates', async () => {
        mockRouteParams.subPage = 'account-details';
        await renderFlow();

        fireEvent.press(screen.getByText('common.next'));
        await waitForBatchedUpdatesWithAct();

        expect(Navigation.navigate).toHaveBeenCalledWith(buildRoute('account-holder-details'));
    });

    it('blocks Next while a required answer is missing', async () => {
        await act(async () => {
            await Onyx.merge(ONYXKEYS.FORMS.DYNAMIC_FORM_LIST_ITEM_FORM_DRAFT, {accountNumber: ''});
        });
        mockRouteParams.subPage = 'account-details';
        await renderFlow();

        fireEvent.press(screen.getByText('common.next'));
        await waitForBatchedUpdatesWithAct();

        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(screen.getAllByText('common.error.fieldRequired').length).toBeGreaterThan(0);
    });

    it('summarizes every visible answer on the confirmation page and submits the draft', async () => {
        const onSubmit = jest.fn();
        mockRouteParams.subPage = 'confirm';
        await renderFlow(onSubmit);

        expect(screen.getByText('Confirm your details')).toBeOnTheScreen();
        expect(screen.getByText('12345678')).toBeOnTheScreen();
        expect(screen.getByText('Person')).toBeOnTheScreen();
        expect(screen.getAllByText('allCountries.GB')).toHaveLength(2);

        fireEvent.press(screen.getByText('common.confirm'));
        await waitForBatchedUpdatesWithAct();

        expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({accountNumber: '12345678', country: 'GB'}));
    });

    it('carries a sensitive answer from its page to the submission without writing it to the draft', async () => {
        const fields: DynamicFormField[] = [
            {key: 'ssn', label: 'SSN', group: 'Identity', type: 'text', required: true, sensitive: true, refreshOnChange: false},
            {key: 'nickname', label: 'Nickname', group: 'Profile', type: 'text', required: false, refreshOnChange: false},
        ];
        const onSubmit = jest.fn();
        mockRouteParams.subPage = 'identity';
        render(
            <DynamicFormFlow
                fields={fields}
                formID={FORM_ID}
                headerTitle="Identity"
                testID="DynamicFormFlowSensitive"
                buildRoute={buildRoute}
                onSubmit={onSubmit}
                onBack={jest.fn()}
                confirmationTitle="Confirm"
            />,
        );
        await waitForBatchedUpdatesWithAct();

        fireEvent.changeText(screen.getByLabelText('SSN'), '123456789');
        fireEvent.press(screen.getByText('common.next'));
        await waitForBatchedUpdatesWithAct();

        const draft = await new Promise<Record<string, unknown> | undefined>((resolve) => {
            Onyx.connect({key: ONYXKEYS.FORMS.DYNAMIC_FORM_LIST_ITEM_FORM_DRAFT, callback: (value) => resolve(value ?? undefined)});
        });
        expect(draft?.ssn).toBeUndefined();
        expect(Navigation.navigate).toHaveBeenCalledWith(buildRoute('profile'));

        const renderPage = async (subPage: string) => {
            screen.unmount();
            mockRouteParams.subPage = subPage;
            render(
                <DynamicFormFlow
                    fields={fields}
                    formID={FORM_ID}
                    headerTitle="Identity"
                    testID="DynamicFormFlowSensitive"
                    buildRoute={buildRoute}
                    onSubmit={onSubmit}
                    onBack={jest.fn()}
                    confirmationTitle="Confirm"
                />,
            );
            await waitForBatchedUpdatesWithAct();
        };

        await renderPage('profile');
        fireEvent.press(screen.getByText('common.next'));
        await waitForBatchedUpdatesWithAct();

        await renderPage('confirm');
        fireEvent.press(screen.getByText('common.confirm'));
        await waitForBatchedUpdatesWithAct();

        expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ssn: '123456789'}));
    });

    it('skips a group whose fields are all hidden', async () => {
        mockRouteParams.subPage = 'account-details';
        await act(async () => {
            await Onyx.merge(ONYXKEYS.FORMS.DYNAMIC_FORM_LIST_ITEM_FORM_DRAFT, {legalType: 'PRIVATE'});
        });
        const hiddenOwnership = allFieldTypes.map((field) => (field.group === 'Ownership' ? {...field, showWhen: {key: 'legalType', equals: ['BUSINESS']}} : field));
        render(
            <DynamicFormFlow
                fields={hiddenOwnership}
                formID={FORM_ID}
                headerTitle="Add bank account"
                testID="DynamicFormFlowSkip"
                buildRoute={buildRoute}
                onSubmit={jest.fn()}
                onBack={jest.fn()}
                confirmationTitle="Confirm"
            />,
        );
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryAllByLabelText(/stepCounter/)).toHaveLength(0);
        mockRouteParams.subPage = 'account-holder-details';
        screen.unmount();
        render(
            <DynamicFormFlow
                fields={hiddenOwnership}
                formID={FORM_ID}
                headerTitle="Add bank account"
                testID="DynamicFormFlowSkip"
                buildRoute={buildRoute}
                onSubmit={jest.fn()}
                onBack={jest.fn()}
                confirmationTitle="Confirm"
            />,
        );
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText('common.next'));
        await waitForBatchedUpdatesWithAct();

        expect(Navigation.navigate).toHaveBeenCalledWith(buildRoute('confirm'));
    });

    it('hands each page and its answers to onPageSubmit before moving on', async () => {
        mockRouteParams.subPage = 'account-details';
        const onPageSubmit = jest.fn();
        render(
            <DynamicFormFlow
                fields={allFieldTypes}
                formID={FORM_ID}
                headerTitle="Add bank account"
                testID="DynamicFormFlowPageSubmit"
                buildRoute={buildRoute}
                onSubmit={jest.fn()}
                onBack={jest.fn()}
                onPageSubmit={onPageSubmit}
                confirmationTitle="Confirm"
            />,
        );
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText('common.next'));
        await waitForBatchedUpdatesWithAct();

        expect(onPageSubmit).toHaveBeenCalledTimes(1);
        expect(onPageSubmit).toHaveBeenCalledWith(expect.objectContaining({slug: 'account-details', name: 'Account details'}), expect.objectContaining({accountNumber: '12345678'}));
        expect(Navigation.navigate).toHaveBeenCalledWith(buildRoute('account-holder-details'));
    });

    it('starts a fresh form on its first page and resumes a started one at its first incomplete page', async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.FORMS.DYNAMIC_FORM_LIST_ITEM_FORM_DRAFT, {});
        });
        await renderFlow();
        expect(mockSetParams).toHaveBeenLastCalledWith({subPage: 'account-details'});

        screen.unmount();
        mockSetParams.mockClear();
        await act(async () => {
            await Onyx.set(ONYXKEYS.FORMS.DYNAMIC_FORM_LIST_ITEM_FORM_DRAFT, {...completeDraft, dateOfBirth: '', country: ''});
        });
        await renderFlow();
        expect(mockSetParams).toHaveBeenLastCalledWith({subPage: 'account-holder-details'});

        screen.unmount();
        mockSetParams.mockClear();
        await act(async () => {
            await Onyx.set(ONYXKEYS.FORMS.DYNAMIC_FORM_LIST_ITEM_FORM_DRAFT, completeDraft);
        });
        await renderFlow();
        expect(mockSetParams).toHaveBeenLastCalledWith({subPage: 'confirm'});
    });

    it('redirects away from a page whose fields are all hidden when it is opened directly', async () => {
        mockRouteParams.subPage = 'ownership';
        await act(async () => {
            await Onyx.merge(ONYXKEYS.FORMS.DYNAMIC_FORM_LIST_ITEM_FORM_DRAFT, {legalType: 'PRIVATE'});
        });
        const hiddenOwnership = allFieldTypes.map((field) => (field.group === 'Ownership' ? {...field, showWhen: {key: 'legalType', equals: ['BUSINESS']}} : field));
        render(
            <DynamicFormFlow
                fields={hiddenOwnership}
                formID={FORM_ID}
                headerTitle="Add bank account"
                testID="DynamicFormFlowRedirect"
                buildRoute={buildRoute}
                onSubmit={jest.fn()}
                onBack={jest.fn()}
                confirmationTitle="Confirm"
            />,
        );
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByText('Ownership')).not.toBeOnTheScreen();
        expect(Navigation.navigate).toHaveBeenCalledWith(buildRoute('confirm'), {forceReplace: true});
    });

    it('leaves the flow from Back on the first shown page when the first group is hidden', async () => {
        mockRouteParams.subPage = 'account-holder-details';
        const hiddenFirstGroup = allFieldTypes.map((field) => (field.group === 'Account details' ? {...field, showWhen: {key: 'legalType', equals: ['NEVER']}} : field));
        const onBack = jest.fn();
        render(
            <DynamicFormFlow
                fields={hiddenFirstGroup}
                formID={FORM_ID}
                headerTitle="Add bank account"
                testID="DynamicFormFlowHiddenFirst"
                buildRoute={buildRoute}
                onSubmit={jest.fn()}
                onBack={onBack}
                confirmationTitle="Confirm"
            />,
        );
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByLabelText('common.back'));

        expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('sends the user to the first incomplete page instead of submitting when a required answer is missing', async () => {
        mockRouteParams.subPage = 'confirm';
        await act(async () => {
            await Onyx.merge(ONYXKEYS.FORMS.DYNAMIC_FORM_LIST_ITEM_FORM_DRAFT, {country: ''});
        });
        const onSubmit = jest.fn();
        await renderFlow(onSubmit);
        fireEvent.press(screen.getByText('common.confirm'));
        await waitForBatchedUpdatesWithAct();

        expect(onSubmit).not.toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenCalledWith(buildRoute('account-holder-details'));
    });

    it('lets a flow force the step indicator on or off regardless of page count', async () => {
        const twoGroups = allFieldTypes.filter((field) => field.group !== 'Ownership');
        mockRouteParams.subPage = 'account-details';
        render(
            <DynamicFormFlow
                fields={twoGroups}
                formID={FORM_ID}
                headerTitle="Add bank account"
                testID="DynamicFormFlowForced"
                buildRoute={buildRoute}
                onSubmit={jest.fn()}
                onBack={jest.fn()}
                confirmationTitle="Confirm"
                shouldShowStepIndicator
            />,
        );
        await waitForBatchedUpdatesWithAct();
        expect(screen.getAllByLabelText(/stepCounter/)).toHaveLength(2);

        screen.unmount();
        render(
            <DynamicFormFlow
                fields={allFieldTypes}
                formID={FORM_ID}
                headerTitle="Add bank account"
                testID="DynamicFormFlowHidden"
                buildRoute={buildRoute}
                onSubmit={jest.fn()}
                onBack={jest.fn()}
                confirmationTitle="Confirm"
                shouldShowStepIndicator={false}
            />,
        );
        await waitForBatchedUpdatesWithAct();
        expect(screen.queryAllByLabelText(/stepCounter/)).toHaveLength(0);
    });

    it('calls onBack from the first page and goes to the previous page otherwise', async () => {
        const onBack = jest.fn();
        mockRouteParams.subPage = 'account-holder-details';
        await renderFlow(jest.fn(), onBack);

        fireEvent.press(screen.getByLabelText('common.back'));
        expect(Navigation.goBack).toHaveBeenCalledWith(buildRoute('account-details'));
        expect(onBack).not.toHaveBeenCalled();
    });
});
