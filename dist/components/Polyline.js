import React from 'react';
import { Polygon } from 'react-native-maps';
export const Polyline = (props) => {
    if (props.polygon === null) {
        return null;
    }
    return <Polygon {...props.polygon} fillColor="transparent"/>;
};
//# sourceMappingURL=Polyline.js.map