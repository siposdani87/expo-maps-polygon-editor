import React from 'react';
import { StyleSheet, View } from 'react-native';

export const Circle = (props: { size: number; color?: string }) => {
    const diameter = props.size * 2;
    return (
        <View
            style={[
                styles.circleMarker,
                {
                    borderColor: props.color,
                    width: diameter,
                    height: diameter,
                },
            ]}
        />
    );
};

const styles = StyleSheet.create({
    circleMarker: {
        backgroundColor: '#fff',
        borderRadius: 100,
        borderWidth: 1,
    },
});
