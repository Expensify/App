import React, {useId, useLayoutEffect, useRef} from 'react';
import type {ReactNode} from 'react';
import type {View} from 'react-native';
import FocusableMenuItem from '@components/FocusableMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import {useContentActions, useContentState} from './ContentContext';
import {useSubContext} from './SubContext';

type SubContentProps = {
    children: ReactNode;
    backButtonText?: string;
};

function BackButton({backButtonText, parentSubId}: {backButtonText?: string; parentSubId: string | null}): React.ReactElement {
    const id = useId();
    const ref = useRef<View>(null);
    const {
        state: {focusedId},
    } = useContentState('PopoverMenu.SubContent.BackButton');
    const {exitSub, registerItem, unregisterItem, setFocusedId} = useContentActions('PopoverMenu.SubContent.BackButton');
    const icons = useMemoizedLazyExpensifyIcons(['BackArrow']);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    const hasLabel = !!backButtonText;
    const labelText = backButtonText ?? translate('common.goBack');

    const handleActivateRef = useRef(() => exitSub(parentSubId));
    useLayoutEffect(() => {
        handleActivateRef.current = () => exitSub(parentSubId);
    });

    useLayoutEffect(() => {
        registerItem(id, {
            ref,
            isDisabled: false,
            onActivate: () => handleActivateRef.current(),
        });
        return () => unregisterItem(id);
    }, [id, registerItem, unregisterItem]);

    return (
        <FocusableMenuItem
            ref={ref}
            icon={icons.BackArrow}
            iconFill={(isHovered) => (isHovered ? theme.iconHovered : theme.icon)}
            style={hasLabel ? styles.pv0 : undefined}
            additionalIconStyles={[{width: variables.iconSizeNormal, height: variables.iconSizeNormal}, styles.opacitySemiTransparent, styles.mr1]}
            iconStyles={[{width: variables.iconSizeNormal, height: variables.iconSizeNormal}]}
            wrapperStyle={[styles.ph5, styles.pv3]}
            innerContainerStyle={styles.alignItemsCenter}
            title={labelText}
            accessibilityLabel={`${translate('common.goBack')}, ${labelText}`}
            titleStyle={hasLabel ? styles.createMenuHeaderText : undefined}
            shouldShowBasicTitle={hasLabel}
            shouldCheckActionAllowedOnPress={false}
            onPress={() => exitSub(parentSubId)}
            onFocus={() => setFocusedId(id)}
            focused={focusedId === id}
        />
    );
}

function SubContent({children, backButtonText}: SubContentProps): React.ReactElement {
    const {
        state: {currentSubId},
    } = useContentState('PopoverMenu.SubContent');
    const {subId, parentSubId} = useSubContext('PopoverMenu.SubContent');

    // Children always mount so nested `<Sub>` survives navigation. Items gate themselves via `useIsAtActiveLevel`; only the back button is gated here.
    const isActiveLevel = currentSubId === subId;

    return (
        <>
            {isActiveLevel && (
                <BackButton
                    backButtonText={backButtonText}
                    parentSubId={parentSubId}
                />
            )}
            {children}
        </>
    );
}

SubContent.displayName = 'PopoverMenu.SubContent';

export default SubContent;
export type {SubContentProps};
