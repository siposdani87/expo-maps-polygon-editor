import React from 'react';
import { Polygon } from 'react-native-maps';
export const Polyline = (props) => {
    if (props.polygon === null) {
        return null;
    }
    const { key, ...polygonProps } = props.polygon;
    return <Polygon key={key} {...polygonProps} fillColor="transparent"/>;
};
//# sourceMappingURL=Polyline.js.map