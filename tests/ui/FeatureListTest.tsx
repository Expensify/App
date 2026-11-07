import {act, fireEvent, render, screen, within} from '@testing-library/react-native';

import CreditCardsNew from '@assets/images/simple-illustrations/simple-illustration__credit-cards.svg';
import HandCard from '@assets/images/simple-illustrations/simple-illustration__handcard.svg';
import MagnifyingGlassMoney from '@assets/images/simple-illustrations/simple-illustration__magnifyingglass-money.svg';
import MoneyReceipts from '@assets/images/simple-illustrations/simple-illustration__money-receipts.svg';
import MoneyWings from '@assets/images/simple-illustrations/simple-illustration__moneywings.svg';

import FeatureList from '@components/FeatureList';
import type {FeatureListProps} from '@components/FeatureList';
import Icon from '@components/Icon';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MenuItem from '@components/MenuItem';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';
import Text from '@components/Text';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesContextProvider';

import {fontFamilyScale} from '@styles/typography';
import variables from '@styles/variables';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type IconAsset from '@src/types/utils/IconAsset';

import React from 'react';
import {StyleSheet} from 'react-native';
import Onyx from 'react-native-onyx';

import {translateLocal} from '../utils/TestHelper';

const TITLE = 'Card benefits';
const SUBTITLE = 'Features available to this workspace';
const FOOTER = 'Card terms remain below the benefits';
const CTA_TEXT = 'Set up cards';
const CTA_LABEL = 'Open card setup';
const PRESS_EVENT = {nativeEvent: {}};

function renderFeatureList(props: Partial<FeatureListProps> = {}) {
    return render(
        <ThemeProvider theme={CONST.THEME.LIGHT}>
            <ThemeStylesProvider>
                <LocaleContextProvider>
                    <FeatureList
                        title={TITLE}
                        subtitle={SUBTITLE}
                        illustration={undefined}
                        {...props}
                    />
                </LocaleContextProvider>
            </ThemeStylesProvider>
        </ThemeProvider>,
    );
}

async function expectInformationalBenefit(label: string, illustration: IconAsset) {
    const row = await screen.findByLabelText(label);
    const icon = within(row).UNSAFE_getByType(Icon);
    const iconCellStyle: unknown = StyleSheet.flatten(icon.parent?.props.style);
    const title = within(row).getByText(label);

    expect(icon.props).toMatchObject({src: illustration, width: variables.menuIconSize, height: variables.menuIconSize});
    expect(icon.props.fill).toBeUndefined();
    expect(iconCellStyle).toMatchObject({width: variables.avatarSizeMedium, alignItems: 'center', justifyContent: 'center'});
    expect(title).toHaveStyle(fontFamilyScale.strong);
    expect(title.props.numberOfLines ?? 0).toBe(0);
    expect(row).toHaveProp('accessible', true);
    expect(row).toHaveProp('tabIndex', -1);
    expect(row).toHaveStyle({padding: 0});
    expect(within(row).queryAllByRole(CONST.ROLE.BUTTON)).toHaveLength(0);
    expect(within(row).queryAllByRole('image')).toHaveLength(0);
}

describe('FeatureList', () => {
    beforeEach(async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
            await IntlStore.load(CONST.LOCALES.EN);
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('renders explicitly composed benefits in order without row actions', async () => {
        // Given translated children whose illustrations must not acquire menu icon tinting
        const support = translateLocal('workspace.moreFeatures.companyCards.feed.features.support');
        const assignCards = translateLocal('workspace.moreFeatures.companyCards.feed.features.assignCards');
        const automaticImport = translateLocal('workspace.moreFeatures.companyCards.feed.features.automaticImport');

        // When a caller composes the informational items directly
        renderFeatureList({
            children: (
                <>
                    <FeatureList.Item icon={CreditCardsNew}>{support}</FeatureList.Item>
                    <FeatureList.Item icon={HandCard}>{assignCards}</FeatureList.Item>
                    <FeatureList.Item icon={MagnifyingGlassMoney}>{automaticImport}</FeatureList.Item>
                </>
            ),
        });

        // Then labels, full-color art and the centered 40px cells remain paired in the supplied order
        expect(screen.UNSAFE_getAllByType(Icon).map((icon): unknown => icon.props.src)).toEqual([CreditCardsNew, HandCard, MagnifyingGlassMoney]);
        await expectInformationalBenefit(support, CreditCardsNew);
        await expectInformationalBenefit(assignCards, HandCard);
        await expectInformationalBenefit(automaticImport, MagnifyingGlassMoney);
        expect(screen.UNSAFE_getAllByType(MenuItem.Root).map((row): unknown => row.props.onPress)).toEqual([undefined, undefined, undefined]);
        expect(screen.queryAllByRole(CONST.ROLE.BUTTON)).toHaveLength(0);
    });

    it.each([undefined, ''])('keeps the section and footer when benefits are empty and CTA text is %p', (ctaText) => {
        // Given an empty benefit list and no CTA copy, which must not create an empty button
        // When the section still supplies its introductory text and terms
        renderFeatureList({ctaText, footer: <Text>{FOOTER}</Text>});

        // Then the surrounding content remains readable without benefit icons or an unintended action
        expect(screen.getByText(TITLE)).toBeOnTheScreen();
        expect(screen.getByText(SUBTITLE)).toBeOnTheScreen();
        expect(screen.getByText(FOOTER)).toBeOnTheScreen();
        expect(screen.UNSAFE_queryAllByType(Icon)).toHaveLength(0);
        expect(screen.queryAllByRole(CONST.ROLE.BUTTON)).toHaveLength(0);
        const benefitsContainer = screen.UNSAFE_root.find((node) => {
            const style: unknown = StyleSheet.flatten(node.props.style);
            return typeof node.type === 'string' && !!style && typeof style === 'object' && 'rowGap' in style && style.rowGap === 16;
        });
        expect(benefitsContainer).toHaveStyle({flex: 1, flexDirection: 'row', flexWrap: 'wrap', rowGap: 16, paddingVertical: 16, paddingLeft: 4});
        expect(benefitsContainer.children).toHaveLength(0);
    });

    it('renders a caller-provided subtitle instead of the plain subtitle', () => {
        // Given a caller that needs richer introductory content without changing the section shell
        const customSubtitle = 'Introduction with caller-provided content';

        // When it supplies the existing subtitle render contract
        renderFeatureList({renderSubtitle: () => <Text>{customSubtitle}</Text>, footer: <Text>{FOOTER}</Text>});

        // Then the custom introduction replaces, rather than duplicates, the default subtitle
        expect(screen.getByRole(CONST.ROLE.HEADER, {name: TITLE})).toBeOnTheScreen();
        expect(screen.getByText(customSubtitle)).toBeOnTheScreen();
        expect(screen.queryByText(SUBTITLE)).not.toBeOnTheScreen();
        expect(screen.getByText(FOOTER)).toBeOnTheScreen();
    });

    it('keeps every benefit and unlimited bold titles for a longer translated list', async () => {
        // Given more benefits than either card screen and a locale that needs additional wrapping
        const longBenefitKey = 'workspace.moreFeatures.expensifyCard.feed.features.spend';
        const englishBenefit = translateLocal(longBenefitKey);
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DE);
            await IntlStore.load(CONST.LOCALES.DE);
        });

        // When the real component renders all supplied benefits in that locale
        renderFeatureList({
            children: (
                <>
                    <FeatureList.Item icon={CreditCardsNew}>{translateLocal('workspace.moreFeatures.companyCards.feed.features.support')}</FeatureList.Item>
                    <FeatureList.Item icon={HandCard}>{translateLocal('workspace.moreFeatures.companyCards.feed.features.assignCards')}</FeatureList.Item>
                    <FeatureList.Item icon={MagnifyingGlassMoney}>{translateLocal('workspace.moreFeatures.companyCards.feed.features.automaticImport')}</FeatureList.Item>
                    <FeatureList.Item icon={MoneyReceipts}>{translateLocal('workspace.moreFeatures.expensifyCard.feed.features.cashBack')}</FeatureList.Item>
                    <FeatureList.Item icon={CreditCardsNew}>{translateLocal('workspace.moreFeatures.expensifyCard.feed.features.unlimited')}</FeatureList.Item>
                    <FeatureList.Item icon={MoneyWings}>{translateLocal(longBenefitKey)}</FeatureList.Item>
                </>
            ),
        });

        // Then neither the number of benefits nor their translated length imposes a line limit
        expect(translateLocal(longBenefitKey)).not.toBe(englishBenefit);
        expect(screen.UNSAFE_getAllByType(Icon)).toHaveLength(6);
        await expectInformationalBenefit(translateLocal('workspace.moreFeatures.companyCards.feed.features.support'), CreditCardsNew);
        await expectInformationalBenefit(translateLocal('workspace.moreFeatures.companyCards.feed.features.assignCards'), HandCard);
        await expectInformationalBenefit(translateLocal('workspace.moreFeatures.companyCards.feed.features.automaticImport'), MagnifyingGlassMoney);
        await expectInformationalBenefit(translateLocal('workspace.moreFeatures.expensifyCard.feed.features.cashBack'), MoneyReceipts);
        await expectInformationalBenefit(translateLocal('workspace.moreFeatures.expensifyCard.feed.features.unlimited'), CreditCardsNew);
        await expectInformationalBenefit(translateLocal(longBenefitKey), MoneyWings);
        expect(screen.queryAllByRole(CONST.ROLE.BUTTON)).toHaveLength(0);
    });

    it('invokes the CTA callback only from the separately labelled button', async () => {
        // Given a setup action that belongs to the CTA rather than the explanatory benefits
        const openCardSetup = jest.fn();
        const benefit = translateLocal('workspace.moreFeatures.companyCards.feed.features.support');
        renderFeatureList({
            ctaText: CTA_TEXT,
            ctaAccessibilityLabel: CTA_LABEL,
            onCtaPress: openCardSetup,
            children: <FeatureList.Item icon={CreditCardsNew}>{benefit}</FeatureList.Item>,
        });
        const benefitPressable = screen.UNSAFE_getByType(PressableWithSecondaryInteraction);
        expect(benefitPressable.props.onPress).toEqual(expect.any(Function));
        expect(benefitPressable.props.onSecondaryInteraction).toBeUndefined();
        expect(benefitPressable.props.activeOpacity).toBe(1);

        // When a reader presses the real row, its read-only handler must not activate setup
        fireEvent.press(await screen.findByLabelText(benefit), PRESS_EVENT);

        // Then reading the benefits cannot trigger setup
        expect(openCardSetup).not.toHaveBeenCalled();
        const cta = screen.getByRole(CONST.ROLE.BUTTON, {name: CTA_LABEL});
        expect(cta).toBeEnabled();
        expect(screen.getByText(CTA_TEXT)).toBeOnTheScreen();
        expect(screen.getAllByRole(CONST.ROLE.BUTTON)).toHaveLength(1);

        // When the reader deliberately activates the CTA
        fireEvent.press(cta, PRESS_EVENT);

        // Then the existing callback runs once without making any benefit actionable
        expect(openCardSetup).toHaveBeenCalledTimes(1);
    });

    it('keeps a disabled CTA inactive without hiding its benefits or footer', async () => {
        // Given a caller that cannot start setup yet but still needs to explain its card benefits
        const openCardSetup = jest.fn();
        const benefit = translateLocal('workspace.moreFeatures.companyCards.feed.features.support');
        renderFeatureList({
            ctaText: CTA_TEXT,
            ctaAccessibilityLabel: CTA_LABEL,
            onCtaPress: openCardSetup,
            isButtonDisabled: true,
            footer: <Text>{FOOTER}</Text>,
            children: <FeatureList.Item icon={CreditCardsNew}>{benefit}</FeatureList.Item>,
        });
        const cta = screen.getByRole(CONST.ROLE.BUTTON, {name: CTA_LABEL});

        // When activation is attempted while the caller has disabled setup
        fireEvent.press(cta, PRESS_EVENT);

        // Then the button keeps its disabled semantics and the explanatory content remains available
        expect(cta).toBeDisabled();
        expect(openCardSetup).not.toHaveBeenCalled();
        expect(screen.getByText(FOOTER)).toBeOnTheScreen();
        expect(await screen.findByLabelText(benefit)).toBeOnTheScreen();

        // When the same action becomes available, an enabled render proves the callback is connected
        screen.unmount();
        renderFeatureList({ctaText: CTA_TEXT, ctaAccessibilityLabel: CTA_LABEL, onCtaPress: openCardSetup});
        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: CTA_LABEL}), PRESS_EVENT);

        // Then the enabled CTA, unlike the disabled one, invokes setup
        expect(openCardSetup).toHaveBeenCalledTimes(1);
    });
});
