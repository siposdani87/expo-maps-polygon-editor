import React from 'react';
import { Polygon } from 'react-native-maps';
export const Polygons = (props) => {
    return (<>
            {props.polygons.map((polygon, index) => (<Polygon {...polygon} onPress={props.onPolygonClick(index, polygon)} tappable={true}/>))}
        </>);
};
//# sourceMappingURL=Polygons.js.map