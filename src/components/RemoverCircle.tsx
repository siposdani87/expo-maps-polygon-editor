import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export const RemoverCircle = () => {
    return (
        <View style={styles.removeMarkerContainer}>
            <Text style={styles.removeMarkerText}>x</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    removeMarkerContainer: {
        width: 30,
        height: 30,
        backgroundColor: '#f00',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeMarkerText: {
        color: '#fff',
        fontSize: 18,
    },
});
