import {act, render, screen} from '@testing-library/react-native';

import FormContext from '@components/Form/FormContext';
import FormProvider from '@components/Form/FormProvider';
import type {FormInputErrors, FormOnyxValues, InputComponentBaseProps} from '@components/Form/types';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import Text from '@components/Text';

import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

import type * as ReactNavigationNative from '@react-navigation/native';

import React, {useContext, useEffect} from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useResponsiveLayout', () =>
    jest.fn(() => ({
        shouldUseNarrowLayout: false,
        isInNarrowPaneModal: false,
    })),
);

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: () => true,
        useNavigation: () => ({navigate: jest.fn(), addListener: jest.fn(), goBack: jest.fn(), isFocused: () => true}),
        useFocusEffect: jest.fn(),
        usePreventRemove: jest.fn(),
    };
});

const FORM_ID = ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM;
const STREET = INPUT_IDS.PERSONAL_INFO_STEP.STREET;
const PO_BOX_ERROR = 'A physical address is required. PO boxes and mail drops are not accepted.';
const PO_BOX_VALUE = 'po box 123';
const VALID_STREET = '123 Main St';

type CapturedHandlers = Pick<InputComponentBaseProps, 'onInputChange' | 'onTouched'>;

/**
 * A tiny consumer that registers a single input with the surrounding FormProvider and hands the
 * `onInputChange`/`onTouched` callbacks it receives back to the test (and renders the resolved
 * `errorText`). Exposing them lets the test drive validation directly and — crucially — hold onto a
 * *stale* `onInputChange` reference captured before an error was committed, mirroring the async
 * address-selection flow.
 */
function CaptureInput({onCapture}: {onCapture: (handlers: CapturedHandlers) => void}) {
    const {registerInput} = useContext(FormContext);
    const registeredProps = registerInput(STREET, false, {});
    const errorText = registeredProps.errorText ?? '';
    const {onInputChange, onTouched} = registeredProps;
    useEffect(() => {
        onCapture({onInputChange, onTouched});
    }, [onCapture, onInputChange, onTouched]);
    return <Text testID="street-error">{errorText}</Text>;
}

function renderForm(handlers: {current: CapturedHandlers | undefined}) {
    return render(
        <OnyxListItemProvider>
            <LocaleContextProvider>
                <FormProvider
                    formID={FORM_ID}
                    submitButtonText="Save"
                    onSubmit={jest.fn()}
                    validate={(values: FormOnyxValues<typeof FORM_ID>) => {
                        const errors: FormInputErrors<typeof FORM_ID> = {};
                        const street = values[STREET];
                        if (typeof street === 'string' && street.toLowerCase().includes('po box')) {
                            errors[STREET] = PO_BOX_ERROR;
                        }
                        return errors;
                    }}
                >
                    <View>
                        <CaptureInput
                            onCapture={(captured) => {
                                // eslint-disable-next-line no-param-reassign
                                handlers.current = captured;
                            }}
                        />
                    </View>
                </FormProvider>
            </LocaleContextProvider>
        </OnyxListItemProvider>,
    );
}

describe('FormProvider validation', () => {
    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('clears a touched error when a valid value is committed via a handler captured before the error was set', async () => {
        const handlers: {current: CapturedHandlers | undefined} = {current: undefined};
        renderForm(handlers);
        await waitForBatchedUpdatesWithAct();

        // 1. User types a PO box value. The field is not touched yet, so no error is displayed, but this
        //    render's `onInputChange` closes over the pre-error (empty) `errors` snapshot.
        await act(async () => {
            handlers.current?.onInputChange?.(PO_BOX_VALUE, STREET);
        });
        expect(screen.getByTestId('street-error')).toHaveTextContent('');

        // Snapshot the stale handler — this is the reference the async address selection would still hold.
        const staleOnInputChange = handlers.current?.onInputChange;

        // 2. The field is marked touched and re-validated against the PO box value, so the error appears.
        await act(async () => {
            // The FormProvider `onTouched` handler only flags the field as touched and never reads the event.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            handlers.current?.onTouched?.({} as Parameters<NonNullable<CapturedHandlers['onTouched']>>[0]);
        });
        await act(async () => {
            handlers.current?.onInputChange?.(PO_BOX_VALUE, STREET);
        });
        expect(screen.getByTestId('street-error')).toHaveTextContent(PO_BOX_ERROR);

        // 3. The async suggestion selection commits a valid street using the STALE handler captured in step 1.
        //    The error must clear even though that handler closed over the old (empty) `errors` snapshot.
        await act(async () => {
            staleOnInputChange?.(VALID_STREET, STREET);
        });
        expect(screen.getByTestId('street-error')).toHaveTextContent('');
    });
});
