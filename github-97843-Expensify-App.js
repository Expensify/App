// src/pages/AccountPage.js
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import * as Report from '@libs/ReportUtils';
import * as User from '@libs/UserUtils';
import withLocalize, { withLocalizePropTypes } from '@components/withLocalize';
import compose from '@libs/compose';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import FullScreenLoadingIndicator from '@components/FullScreenLoadingIndicator';
import CONST from '@src/CONST';

const AccountPage = (props) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initializeAccountPage = async () => {
            try {
                // Ensure user data is loaded
                if (!props.session || !props.session.accountID) {
                    throw new Error('User not authenticated');
                }
                
                // Fetch any additional account-specific data if needed
                // This ensures we have all required data before rendering
                
                setIsLoaded(true);
            } catch (err) {
                setError(err.message);
                setIsLoaded(true);
            }
        };

        initializeAccountPage();
    }, [props.session, props.translate]);

    // Show loading indicator while initializing
    if (!isLoaded) {
        return <FullScreenLoadingIndicator />;
    }

    // Show error state if something went wrong
    if (error) {
        return (
            <View style={styles.container}>
                <HeaderWithBackButton title={props.translate('common.account')} />
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    // Render the actual account content
    return (
        <View style={styles.container}>
            <HeaderWithBackButton title={props.translate('common.account')} />
            <View style={styles.content}>
                <Text style={styles.title}>{props.translate('accountPage.account')}</Text>
                <Text style={styles.subtitle}>{props.translate('accountPage.accountSubtitle')}</Text>
                {/* Add actual account content here */}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        padding: 20,
    },
});

AccountPage.propTypes = {
    ...withLocalizePropTypes,
    session: React.PropTypes.shape({
        accountID: React.PropTypes.number,
    }),
    translate: React.PropTypes.func,
};

function mapStateToProps(state) {
    return {
        session: state.session,
    };
}

export default compose(
    withLocalize,
    connect(mapStateToProps),
)(AccountPage);