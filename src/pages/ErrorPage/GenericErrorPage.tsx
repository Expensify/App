import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import ImageSVG from '@components/ImageSVG';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useIsAuthenticated from '@hooks/useIsAuthenticated';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePageRefresh from '@hooks/usePageRefresh';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import {signOutAndRedirectToSignIn} from '@userActions/Session';
import CONST from '@src/CONST';
import ErrorBodyText from './ErrorBodyText';

function GenericErrorPage({error}: {error?: Error}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const isAuthenticated = useIsAuthenticated();
    const {translate} = useLocalize();
    const isChunkLoadError = error?.name === CONST.CHUNK_LOAD_ERROR || /Loading chunk [\d]+ failed/.test(error?.message ?? '');
    const refreshPage = usePageRefresh();
    const icons = useMemoizedLazyExpensifyIcons(['ExpensifyWordmark', 'Bug'] as const);

    return (
        <SafeAreaConsumer>
            {({paddingBottom}) => (
                <View style={[styles.flex1, styles.pt10, styles.ph5, StyleUtils.getErrorPageContainerStyle(Number(paddingBottom))]}>
                    <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                        <View>
                            <View style={styles.mb5}>
                                <Icon
                                    src={icons.Bug}
                                    height={variables.componentSizeNormal}
                                    width={variables.componentSizeNormal}
                                    fill={theme.iconSuccessFill}
                                />
                            </View>
                            <View style={styles.mb5}>
                                <Text style={[styles.textHeadline]}>{translate('genericErrorPage.title')}</Text>
                            </View>
                            <View style={styles.mb5}>
                                <ErrorBodyText />
                                <Text>
                                    {`${translate('genericErrorPage.body.helpTextConcierge')} `}
                                    <TextLink
                                        href={`mailto:${CONST.EMAIL.CONCIERGE}`}
                                        style={[styles.link]}
                                    >
                                        {CONST.EMAIL.CONCIERGE}
                                    </TextLink>
                                </Text>
                            </View>
                            <View style={[styles.flexRow]}>
                                <View style={[styles.flex1, styles.flexRow]}>
                                    <Button
                                        success
                                        text={translate('genericErrorPage.refresh')}
                                        style={styles.mr3}
                                        onPress={() => refreshPage(isChunkLoadError)}
                                    />
                                    {isAuthenticated && (
                                        <Button
                                            text={translate('initialSettingsPage.signOut')}
                                            onPress={() => {
                                                signOutAndRedirectToSignIn();
                                                refreshPage();
                                            }}
                                        />
                                    )}
                                </View>
                            </View>
                        </View>
                    </View>
                    <View>
                        <View style={[styles.flex1, styles.flexRow, styles.justifyContentCenter]}>
                            <ImageSVG
                                contentFit="contain"
                                src={icons.ExpensifyWordmark}
                                height={30}
                                width={80}
                                fill={theme.text}
                            />
                        </View>
                    </View>
                </View>
            )}
        </SafeAreaConsumer>
    );
}

GenericErrorPage.displayName = 'ErrorPage';

export default GenericErrorPage;
