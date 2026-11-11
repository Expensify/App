import {render, screen} from '@testing-library/react-native';

import MockText from '@components/Text';

import UpgradeIntro from '@pages/workspace/upgrade/UpgradeIntro';
import type UpgradeIntroView from '@pages/workspace/upgrade/UpgradeIntroView';

import CONST from '@src/CONST';

import React from 'react';

let mockMissingIcon: string | undefined;
let mockOverlapIcon: string | undefined;
let mockIntroProps: React.ComponentProps<typeof UpgradeIntroView> | undefined;
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: (names: string[]) => Object.fromEntries(names.filter((name) => name !== mockMissingIcon).map((name) => [name, `illustration:${name}`])),
    useMemoizedLazyExpensifyIcons: (names: string[]) =>
        Object.fromEntries([...names, ...(mockOverlapIcon ? [mockOverlapIcon] : [])].filter((name) => name !== mockMissingIcon).map((name) => [name, `icon:${name}`])),
}));
jest.mock('@hooks/useOnyx', () => ({__esModule: true, default: () => [undefined]}));
jest.mock('@hooks/usePreferredCurrency', () => ({__esModule: true, default: () => 'USD'}));
jest.mock('@hooks/useHasTeam2025Pricing', () => ({__esModule: true, default: () => false}));
jest.mock('@hooks/useLocalize', () => ({__esModule: true, default: () => ({translate: (key: string) => key})}));
jest.mock('@hooks/useThemeStyles', () => ({__esModule: true, default: () => ({br0: {borderRadius: 0}})}));
jest.mock('@pages/workspace/upgrade/GenericFeaturesView', () => ({__esModule: true, default: () => <MockText>generic upgrade</MockText>}));
jest.mock('@pages/workspace/upgrade/UpgradeIntroView', () => ({
    __esModule: true,
    default: (props: React.ComponentProps<typeof UpgradeIntroView>) => {
        mockIntroProps = props;
        return <MockText>feature upgrade</MockText>;
    },
}));
beforeEach(() => {
    mockMissingIcon = undefined;
    mockOverlapIcon = undefined;
    mockIntroProps = undefined;
});
describe('UpgradeIntro', () => {
    it('prefers the icon registry when both registries contain a feature name', () => {
        // Given a feature icon name found in both registries, so the lookup order decides which asset is shown
        const feature = CONST.UPGRADE_FEATURE_INTRO_MAPPING.reportFields;
        mockOverlapIcon = feature.icon;
        // When the upgrade intro picks the feature's icon
        render(
            <UpgradeIntro
                feature={feature}
                policyID="policy-1"
                onUpgrade={jest.fn()}
                upgradeSentryLabel={CONST.SENTRY_LABEL.WORKSPACE.UPGRADE.UPGRADE_PLAN.CONTROL}
            />,
        );
        // Then the icon registry wins and the illustration flag stays set, because that flag controls the icon size and styles on the card
        expect(screen.getByText('feature upgrade')).toBeTruthy();
        expect(mockIntroProps?.iconSrc).toBe(`icon:${feature.icon}`);
        expect(mockIntroProps?.isIllustration).toBe(true);
    });
    it('reports a missing registry icon', () => {
        // Given a mapped feature whose icon is in neither registry, as when a feature is added without loading its icon
        mockMissingIcon = CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.icon;
        // When the upgrade intro checks its registries
        // Then it throws and names the icon, so the omission fails loudly instead of rendering a card with no icon
        expect(() =>
            render(
                <UpgradeIntro
                    feature={CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals}
                    policyID="policy-1"
                    onUpgrade={jest.fn()}
                    upgradeSentryLabel={CONST.SENTRY_LABEL.WORKSPACE.UPGRADE.UPGRADE_PLAN.CONTROL}
                />,
            ),
        ).toThrow(`Missing icons: ${mockMissingIcon}`);
    });
    it('shows the generic view without a feature', () => {
        // Given no feature and no workspace, so there is no feature card to show
        // When the upgrade intro decides what to show
        render(
            <UpgradeIntro
                onUpgrade={jest.fn()}
                upgradeSentryLabel={CONST.SENTRY_LABEL.WORKSPACE.UPGRADE.UPGRADE_PLAN.CONTROL}
            />,
        );
        // Then the generic view is shown, so the user still sees the price and can go to a workspace to upgrade
        expect(screen.getByText('generic upgrade')).toBeTruthy();
    });
    it('passes the approvals border style to the feature view', () => {
        // Given the approvals feature on a workspace, the only feature UpgradeIntro gives its own icon style
        // When the upgrade intro builds the feature card
        render(
            <UpgradeIntro
                feature={CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals}
                policyID="policy-1"
                onUpgrade={jest.fn()}
                upgradeSentryLabel={CONST.SENTRY_LABEL.WORKSPACE.UPGRADE.UPGRADE_PLAN.CONTROL}
            />,
        );
        // Then the card receives a zero border radius; only this prop is covered, because UpgradeIntroView ignores the style for a non-illustration icon such as this one
        expect(mockIntroProps?.iconAdditionalStyles).toEqual({borderRadius: 0});
    });
});
