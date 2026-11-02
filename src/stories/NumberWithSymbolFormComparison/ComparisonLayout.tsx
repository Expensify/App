import Button from '@components/Button';
import type {NumberWithSymbolFormRef} from '@components/NumberWithSymbolForm';
import Text from '@components/Text';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {DeviceMode} from '@src/stories/mocks/deviceMode';
import {getDeviceMode, isTouchDeviceMode, setDeviceMode, subscribeToDeviceMode} from '@src/stories/mocks/deviceMode';

import type {ReactNode, Ref, RefObject} from 'react';

import React, {createContext, useContext, useEffect, useImperativeHandle, useRef, useState, useSyncExternalStore} from 'react';
import {View} from 'react-native';

// Touch support of the loaded modules. In Storybook it comes from the stored device mode (src/stories/mocks/canUseTouchScreen.ts).
const canUseTouchScreen = canUseTouchScreenUtil();

/** Value every column receives from the "updateNumber" toolbar action */
const SAMPLE_NUMBER = '1234.56';

/** Viewport the full-screen archetypes are rendered in for each device mode: the desktop RHP, or a phone screen */
const FULL_SCREEN_FRAME_SIZES: Record<DeviceMode, {width: number; height: number}> = {
    web: {width: variables.sideBarWidth, height: 720},
    mobilePortrait: {width: 390, height: 844},
    mobileLandscape: {width: 844, height: 390},
};

/** Width of the table cell frame, which does not depend on the device */
const CELL_FRAME_WIDTH = 200;

const DEVICE_MODE_OPTIONS: Array<{mode: DeviceMode; label: string}> = [
    {mode: 'web', label: 'Web (desktop)'},
    {mode: 'mobilePortrait', label: 'Mobile portrait'},
    {mode: 'mobileLandscape', label: 'Mobile landscape'},
];

/** Implementation rendered by a column */
type ComparisonImplementation = 'legacy' | 'adapter' | 'composition';

/** Implementation of the `NumberWithSymbolForm` props interface */
type FormImplementation = Exclude<ComparisonImplementation, 'composition'>;

/**
 * Where the archetype lives in the app, which decides the size of its frame.
 * `fullScreen` gets the whole viewport of the device mode, the others a viewport-wide (or cell-wide) strip with automatic height.
 */
type ComparisonFrame = 'fullScreen' | 'inline' | 'row' | 'cell';

/** State and callbacks a column owns and hands to the rendered implementation, the same way a caller would */
type ComparisonCell = {
    /** Current value, or `undefined` for archetypes whose callers never pass `value` */
    value: string | undefined;

    /** Stores the value reported by the implementation */
    onInputChange: (value: string) => void;

    /** Parent-owned sign, for the archetypes whose callers keep the sign outside of the value */
    isNegative: boolean;

    /** Flips the parent-owned sign */
    toggleNegative: () => void;

    /** Clears the parent-owned sign */
    clearNegative: () => void;
};

/**
 * Imperative API of the form rendered by the current column, used by the toolbar actions. It is handed down through a
 * context instead of `ComparisonCell`, so the render callbacks never receive a ref.
 */
const ComparisonNumberFormRefContext = createContext<RefObject<NumberWithSymbolFormRef | null>>({current: null});

/** Returns the ref the rendered implementation passes as `numberFormRef` (or `ref` for the KeypadAmountEditor and AmountFormField roots) */
function useComparisonNumberFormRef() {
    return useContext(ComparisonNumberFormRefContext);
}

type ComparisonLayoutProps = {
    /** Archetype name */
    title: string;

    /** Call sites whose props the archetype reproduces */
    source: string;

    /** Anything a reviewer should know before comparing the columns, like an intentional difference */
    note?: string;

    /** Frame the columns render in */
    frame: ComparisonFrame;

    /** Whether the callers pass `value`. When false, the value is only set through `numberFormRef`. */
    isControlled?: boolean;

    /** Value each column starts with */
    initialValue?: string;

    /** Whether the parent-owned sign starts negative. The composition column starts with the signed value instead. */
    initialIsNegative?: boolean;

    /** Whether the callers keep the sign outside of the value (`isNegative`/`toggleNegative`) */
    usesParentOwnedSign?: boolean;

    /** Renders the legacy form or the adapter with the archetype's props */
    renderForm: (implementation: FormImplementation, cell: ComparisonCell) => ReactNode;

    /** Renders the target composition. Omitted when the archetype has no direct composition yet. */
    renderComposition?: (cell: ComparisonCell) => ReactNode;
};

type ComparisonColumnHandle = {
    updateNumber: (newNumber: string) => void;
    readNumber: () => void;
    reset: () => void;
};

type ComparisonColumnProps = Pick<ComparisonLayoutProps, 'frame' | 'isControlled' | 'initialValue' | 'initialIsNegative' | 'usesParentOwnedSign'> & {
    /** Column heading */
    label: string;

    /** Renders the column's implementation */
    render: (cell: ComparisonCell) => ReactNode;

    /** Whether the column renders the target composition, which owns a signed value instead of a parent-owned sign */
    isComposition: boolean;

    /** Device mode the frame is sized for */
    deviceMode: DeviceMode;

    /** Handle the layout toolbar drives every column with */
    ref: Ref<ComparisonColumnHandle>;
};

function getFrameStyle(frame: ComparisonFrame, deviceMode: DeviceMode) {
    const fullScreenSize = FULL_SCREEN_FRAME_SIZES[deviceMode];
    switch (frame) {
        case 'fullScreen':
            return fullScreenSize;
        case 'cell':
            return {width: CELL_FRAME_WIDTH};
        default:
            return {width: fullScreenSize.width};
    }
}

function Readout({label, value}: {label: string; value: string}) {
    const styles = useThemeStyles();

    return (
        <Text style={styles.textMicroSupporting}>
            {label}: <Text style={[styles.textMicro, styles.textStrong]}>{value}</Text>
        </Text>
    );
}

/** One implementation with its own state, so a column never reacts to what another column does */
function ComparisonColumn({
    label,
    render,
    frame,
    isControlled = true,
    initialValue = '',
    initialIsNegative = false,
    usesParentOwnedSign = false,
    isComposition,
    deviceMode,
    ref,
}: ComparisonColumnProps) {
    const styles = useThemeStyles();
    const theme = useTheme();

    // The composition owns the sign inside its value, so a negative start is the signed value
    const startValue = isComposition && initialIsNegative && initialValue ? `-${initialValue}` : initialValue;
    const [value, setValue] = useState(startValue);
    const [isNegative, setIsNegative] = useState(!isComposition && initialIsNegative);
    const [lastReportedValue, setLastReportedValue] = useState<string>();
    const [readValue, setReadValue] = useState<string>();
    const numberFormRef = useRef<NumberWithSymbolFormRef | null>(null);

    // Callers that never pass `value` seed the form imperatively once it is mounted, like IOURequestStepHours
    useEffect(() => {
        if (isControlled || !startValue) {
            return;
        }
        numberFormRef.current?.updateNumber(startValue);
        // Seeds only the first mount, the same way the callers do
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useImperativeHandle(ref, () => ({
        updateNumber: (newNumber: string) => numberFormRef.current?.updateNumber(newNumber),
        readNumber: () => setReadValue(numberFormRef.current?.getNumber() ?? ''),
        reset: () => {
            setValue('');
            setIsNegative(false);
            numberFormRef.current?.updateNumber('');
        },
    }));

    const cell: ComparisonCell = {
        value: isControlled ? value : undefined,
        onInputChange: (newValue: string) => {
            setValue(newValue);
            setLastReportedValue(newValue);
        },
        isNegative,
        toggleNegative: () => setIsNegative((previous) => !previous),
        clearNegative: () => setIsNegative(false),
    };

    return (
        <View style={styles.gap2}>
            <Text style={[styles.textLabelSupportingNormal, styles.textStrong]}>{label}</Text>
            <View style={[getFrameStyle(frame, deviceMode), styles.border, styles.br3, styles.overflowHidden, {backgroundColor: theme.appBG}]}>
                <ComparisonNumberFormRefContext.Provider value={numberFormRef}>{render(cell)}</ComparisonNumberFormRefContext.Provider>
            </View>
            <View style={styles.gap1}>
                <Readout
                    label="onInputChange"
                    value={lastReportedValue === undefined ? '-' : `"${lastReportedValue}"`}
                />
                <Readout
                    label="getNumber()"
                    value={readValue === undefined ? '-' : `"${readValue}"`}
                />
                {usesParentOwnedSign && !isComposition && (
                    <Readout
                        label="isNegative"
                        value={String(isNegative)}
                    />
                )}
            </View>
        </View>
    );
}

/** Stand-in for the column of an archetype that has no direct composition yet */
function CompositionPlaceholder({frame, deviceMode}: {frame: ComparisonFrame; deviceMode: DeviceMode}) {
    const styles = useThemeStyles();

    return (
        <View style={styles.gap2}>
            <Text style={[styles.textLabelSupportingNormal, styles.textStrong]}>Target composition</Text>
            <View style={[getFrameStyle(frame, deviceMode), styles.border, styles.br3, styles.p5, styles.alignItemsCenter, styles.justifyContentCenter, styles.gap2]}>
                <View style={[styles.border, styles.br2, styles.ph2, styles.pv1]}>
                    <Text style={[styles.textMicro, styles.textStrong]}>N/A</Text>
                </View>
                <Text style={[styles.textMicroSupporting, styles.textAlignCenter]}>
                    The target composition comes in a later migration step. Until then this archetype only renders through the adapter.
                </Text>
            </View>
        </View>
    );
}

/**
 * Side-by-side comparison of one NumberWithSymbolForm archetype: the legacy form, the adapter with the same props, and the
 * target composition. A shared toolbar switches the device mode (web, mobile portrait, mobile landscape) and drives the
 * imperative API of every column at once.
 */
function ComparisonLayout({title, source, note, frame, isControlled, initialValue, initialIsNegative, usesParentOwnedSign, renderForm, renderComposition}: ComparisonLayoutProps) {
    const styles = useThemeStyles();
    const storedDeviceMode = useSyncExternalStore(subscribeToDeviceMode, getDeviceMode);
    // Without a stored mode the mocks report the real device, so the toolbar shows the mode that matches it
    const deviceMode = storedDeviceMode ?? (canUseTouchScreen ? 'mobilePortrait' : 'web');
    // Only happens when the session storage is unavailable, so the reload could not apply the mode's touch support
    const isTouchOutOfSync = isTouchDeviceMode(deviceMode) !== canUseTouchScreen;
    const [mountKey, setMountKey] = useState(0);
    const legacyColumnRef = useRef<ComparisonColumnHandle>(null);
    const adapterColumnRef = useRef<ComparisonColumnHandle>(null);
    const compositionColumnRef = useRef<ComparisonColumnHandle>(null);
    const columnRefs = [legacyColumnRef, adapterColumnRef, compositionColumnRef];

    const selectDeviceMode = (mode: DeviceMode) => {
        const isPersisted = setDeviceMode(mode);

        // Touch support is read once, when each module loads, so only a reload applies it. The orientation applies live.
        if (isPersisted && isTouchDeviceMode(mode) !== canUseTouchScreen) {
            window.location.reload();
        }
    };

    const forEachColumn = (action: (column: ComparisonColumnHandle) => void) => {
        for (const columnRef of columnRefs) {
            if (columnRef.current) {
                action(columnRef.current);
            }
        }
    };

    const columnProps = {frame, isControlled, initialValue, initialIsNegative, usesParentOwnedSign, deviceMode};

    return (
        <View style={[styles.p4, styles.gap4]}>
            <View style={styles.gap1}>
                <Text style={[styles.textHeadlineH2]}>{title}</Text>
                <Text style={styles.textLabelSupportingNormal}>Source: {source}</Text>
                {!!note && <Text style={styles.textLabelSupportingNormal}>{note}</Text>}
                <Text style={styles.textMicroSupporting}>
                    Touch screen: {String(canUseTouchScreen)}. The mobile modes render the touch number pad and the touch-only buttons, which also work with a mouse. Switching between the
                    web and the mobile modes reloads the preview, and the mode stays for the rest of the browser tab session.
                </Text>
                {isTouchOutOfSync && <Text style={[styles.textMicro, styles.textStrong]}>The session storage is unavailable, so the touch support of this mode could not be applied.</Text>}
            </View>

            <View style={[styles.flexRow, styles.flexWrap, styles.gap2]}>
                {DEVICE_MODE_OPTIONS.map((option) => (
                    <Button
                        key={option.mode}
                        size={CONST.BUTTON_SIZE.SMALL}
                        variant={option.mode === deviceMode ? CONST.BUTTON_VARIANT.SUCCESS : undefined}
                        onPress={() => selectDeviceMode(option.mode)}
                    >
                        <Button.Text>{option.label}</Button.Text>
                    </Button>
                ))}
                <Button
                    size={CONST.BUTTON_SIZE.SMALL}
                    onPress={() => forEachColumn((column) => column.updateNumber(SAMPLE_NUMBER))}
                >
                    <Button.Text>{`updateNumber('${SAMPLE_NUMBER}')`}</Button.Text>
                </Button>
                <Button
                    size={CONST.BUTTON_SIZE.SMALL}
                    onPress={() => forEachColumn((column) => column.readNumber())}
                >
                    <Button.Text>getNumber()</Button.Text>
                </Button>
                <Button
                    size={CONST.BUTTON_SIZE.SMALL}
                    onPress={() => forEachColumn((column) => column.reset())}
                >
                    <Button.Text>Reset to empty</Button.Text>
                </Button>
                <Button
                    size={CONST.BUTTON_SIZE.SMALL}
                    onPress={() => setMountKey((previous) => previous + 1)}
                >
                    <Button.Text>Remount</Button.Text>
                </Button>
            </View>

            <View
                // Components reading the orientation through useResponsiveLayout (e.g. BigNumberPad) only re-render on a window
                // resize, so a live orientation switch remounts the columns to apply it
                key={`${deviceMode}-${mountKey}`}
                style={[styles.flexRow, styles.flexWrap, styles.gap4, styles.alignItemsStart]}
            >
                <ComparisonColumn
                    {...columnProps}
                    ref={legacyColumnRef}
                    label="Legacy (0c5a23e5878)"
                    render={(cell) => renderForm('legacy', cell)}
                    isComposition={false}
                />
                <ComparisonColumn
                    {...columnProps}
                    ref={adapterColumnRef}
                    label="Adapter (current NumberWithSymbolForm)"
                    render={(cell) => renderForm('adapter', cell)}
                    isComposition={false}
                />
                {renderComposition ? (
                    <ComparisonColumn
                        {...columnProps}
                        ref={compositionColumnRef}
                        label="Target composition"
                        render={renderComposition}
                        isComposition
                    />
                ) : (
                    <CompositionPlaceholder
                        frame={frame}
                        deviceMode={deviceMode}
                    />
                )}
            </View>
        </View>
    );
}

export default ComparisonLayout;
export {useComparisonNumberFormRef};
export type {ComparisonCell, FormImplementation};
