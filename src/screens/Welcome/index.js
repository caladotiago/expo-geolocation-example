import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Alert, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';

const Welcome = () => {
    const [displayCurrentAddress, setDisplayCurrentAddress] = useState(
        'Wait, we are fetching your location...'
    );
    
    useEffect(() => {
        checkIfLocationEnabled();
    }, []);

    const checkIfLocationEnabled = async () => {
        const enabled = await Location.hasServicesEnabledAsync();
        if (!enabled) {
            Alert.alert(
                'Location Service not enabled',
                'Please enable your location services to continue',
                [{ text: 'OK' }],
                { cancelable: false }
            );
        }
    };
    const getCurrentLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission not granted',
                'Allow the app to use location service.',
                [{ text: 'OK' }],
                { cancelable: false }
            );
        }

        try {
            const time = Date.now();

            let location;
            let locationSuccess = false;
            while (!locationSuccess) {
                try {
                    location = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.High,
                    });
                    locationSuccess = true;
                } catch (err) {
                    // Bug: https://github.com/expo/expo/issues/9377
                    console.log('Location failed - Retrying...');
                }
            }

            const { coords, mocked } = location;

            console.log('ellapsed time:', Date.now() - time);
            console.log('coordinates:', JSON.stringify(coords, null, 2));
            console.log('is mocking:', mocked);

            if (coords) {
                const { latitude, longitude } = coords;

                const response = await Location.reverseGeocodeAsync({
                    latitude,
                    longitude,
                });

                const [address] = response;

                if (address) {
                    const formattedAddress = `${address.street} number ${
                        address.name
                    }, ${address.district}, ${
                        address.city || address.subregion
                    }, ${address.region}`;

                    setDisplayCurrentAddress(formattedAddress);
                }
            }
        } catch (err) {
            console.log(err);
        }
    };
    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                <TouchableOpacity onPress={getCurrentLocation}>
                    <Text style={styles.title}>What's my address?</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.text}>{displayCurrentAddress}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#070707',
        alignItems: 'center',
        paddingTop: 130,
    },
    contentContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    image: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FD0139',
    },
    text: {
        fontSize: 20,
        fontWeight: '400',
        color: '#fff',
    },
});

export default Welcome;