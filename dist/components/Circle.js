import React from 'react';
import { StyleSheet, View } from 'react-native';
export default function Circle(props) {
    return (<View style={[
            styles.circleMarker,
            {
                borderColor: props.color,
                padding: props.size,
            },
        ]}/>);
}
const styles = StyleSheet.create({
    circleMarker: {
        backgroundColor: '#fff',
        borderRadius: 100,
        borderWidth: 1,
    },
});
//# sourceMappingURL=Circle.js.map