import React from 'react';
import { Marker } from 'react-native-maps';
import Circle from './Circle';
import RemoverCircle from './RemoverCircle';
export default function CircleMarkers(props) {
    const isSelectedMarker = (coordIndex) => {
        return props.selectedMarkerIndex === coordIndex;
    };
    return (<>
            {props.polygon.coordinates.map((coordinate, coordIndex) => (<Marker key={coordIndex} identifier={coordIndex.toString()} coordinate={coordinate} anchor={{ x: 0.5, y: 0.5 }} draggable={!isSelectedMarker(coordIndex)} onDragStart={props.onMarkerDragStart(coordIndex)} onDrag={props.onMarkerDrag(coordIndex)} onDragEnd={props.onMarkerDragEnd(coordIndex)} onPress={props.onMarkerPress(coordIndex)} tracksViewChanges={true}>
                        {isSelectedMarker(coordIndex) && <RemoverCircle />}
                        {!isSelectedMarker(coordIndex) && (<Circle size={isSelectedMarker(coordIndex) ? 15 : 8} color={props.polygon.strokeColor}/>)}
                    </Marker>))}
        </>);
}
//# sourceMappingURL=CircleMarkers.js.map