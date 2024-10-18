import React, {useState} from 'react';
import {Button, Platform, SafeAreaView, ScrollView, Text} from 'react-native';
import PushProvisioning from 'react-native-wallet';

type FetchDataHandler = (methodName: string, method: () => Promise<any>) => void;

const AppleMethods: React.FC<{handleFetchData: FetchDataHandler}> = ({handleFetchData}) => (
    <>
        <Button
            title="Can Add Payment Pass (Apple)"
            onPress={() => handleFetchData('canAddPaymentPass', PushProvisioning.Apple.canAddPaymentPass)}
        />
        <Button
            title="Start Add Payment Pass (Apple)"
            onPress={() =>
                handleFetchData('startAddPaymentPass', () =>
                    PushProvisioning.Apple.startAddPaymentPass({
                        last4: '1234',
                        cardHolderName: 'John Doe',
                    }),
                )
            }
        />
        <Button
            title="Complete Add Payment Pass (Apple)"
            onPress={() =>
                handleFetchData('completeAddPaymentPass', () =>
                    PushProvisioning.Apple.completeAddPaymentPass({
                        activation: 'activationData',
                        encryptedData: 'encryptedPassData',
                        ephemeralKey: 'ephemeralPublicKey',
                    }),
                )
            }
        />
    </>
);

const GoogleMethods: React.FC<{handleFetchData: FetchDataHandler}> = ({handleFetchData}) => (
    <>
        <Button
            title="Get Active Wallet ID (Google)"
            onPress={() => handleFetchData('getActiveWalletID', PushProvisioning.Google.getActiveWalletID)}
        />
        <Button
            title="Get Stable Hardware ID (Google)"
            onPress={() => handleFetchData('getStableHardwareId', PushProvisioning.Google.getStableHardwareId)}
        />
        <Button
            title="Push Provision (Google)"
            onPress={() =>
                handleFetchData('pushProvision', () =>
                    PushProvisioning.Google.pushProvision({
                        opc: 'someOpc',
                        tsp: 'VISA',
                        clientName: 'Expensify',
                        lastDigits: '1234',
                        address: {
                            name: 'John Doe',
                            addressOne: '123 Main St',
                            addressTwo: '',
                            locality: 'Somewhere',
                            administrativeArea: 'CA',
                            countryCode: 'US',
                            postalCode: '90210',
                            phoneNumber: '555-555-5555',
                        },
                    }),
                )
            }
        />
    </>
);

const App: React.FC = () => {
    const [log, setLog] = useState<string>('');

    const handleFetchData = async (methodName: string, method: () => Promise<any>) => {
        try {
            const result = await method();
            setLog((prevLog) => `${prevLog}\n${methodName}: ${JSON.stringify(result)}`);
        } catch (error: any) {
            setLog((prevLog) => `${prevLog}\n${methodName} Error: ${error.message}`);
        }
    };

    return (
        <SafeAreaView>
            <ScrollView>
                <Text>Test React Native Wallet</Text>

                {Platform.OS === 'ios' && <AppleMethods handleFetchData={handleFetchData} />}
                {Platform.OS === 'android' && <GoogleMethods handleFetchData={handleFetchData} />}

                <Text>Logs:</Text>
                <Text>{log}</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

export default App;
