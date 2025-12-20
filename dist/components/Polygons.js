import React from 'react';
import { Polygon } from 'react-native-maps';
export const Polygons = (props) => {
    return (<>
            {props.polygons.map((polygon, index) => {
            const { key, ...polygonProps } = polygon;
            return (<Polygon key={key} {...polygonProps} onPress={props.onPolygonClick(index, polygon)} tappable={true}/>);
        })}
        </>);
};
//# sourceMappingURL=Polygons.js.map