import React, { forwardRef, Fragment, useEffect, useImperativeHandle, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Marker, Polygon } from 'react-native-maps';
import { debounce, getMidpointFromCoordinates, isPointInPolygon } from './utils';
function PolygonEditor(props, ref) {
    const [polygons, setPolygons] = useState(props.polygons);
    const [selectedKey, setSelectedKey] = useState(null);
    const [selectedPolygon, setSelectedPolygon] = useState(null);
    const [selectedPolyline, setSelectedPolyline] = useState(null);
    const [selectedMarkerIndex, setSelectedMarkerIndex] = useState(null);
    const [allowCreation, setAllowCreation] = useState(false);
    const [newPolygon, setNewPolygon] = useState(null);
    const [disabled, setDisabled] = useState(props.disabled ?? false);
    useImperativeHandle(ref, init);
    useEffect(() => {
        setPolygons(props.polygons);
    }, [props.polygons]);
    useEffect(() => {
        setDisabled(props.disabled);
        if (props.disabled) {
            resetAll();
        }
    }, [props.disabled]);
    useEffect(() => {
        const polygon = getPolygonByKey(selectedKey);
        if (selectedPolygon?.key !== polygon?.key) {
            setSelectedPolygon(polygon);
        }
    }, [polygons, selectedKey]);
    useEffect(() => {
        const key = selectedPolygon?.key || null;
        if (selectedKey !== key) {
            setSelectedKey(key);
        }
    }, [selectedPolygon]);
    function init() {
        return {
            setCoordinate,
            startPolygon,
            resetAll,
            selectPolygonByKey,
            selectPolygonByIndex,
        };
    }
    function startPolygon() {
        resetSelection();
        setNewPolygon(null);
        setAllowCreation(true);
    }
    function resetAll() {
        setAllowCreation(false);
        setNewPolygon(null);
        resetSelection();
    }
    function resetSelection() {
        setSelectedKey(null);
        setSelectedPolyline(null);
        setSelectedMarkerIndex(null);
    }
    function selectPolygonByKey(key) {
        if (selectedKey !== key) {
            setSelectedKey(key);
        }
    }
    function selectPolygonByIndex(index) {
        const key = getKeyByIndex(index);
        if (selectedKey !== key) {
            setSelectedKey(key);
        }
    }
    function setCoordinate(coordinate) {
        if (!disabled) {
            if (isPointInPolygon(coordinate, getSelectedPolygonCoordinates())) {
                // console.log('isPointInPolygon');
            }
            else if (selectedPolygon) {
                if (selectedMarkerIndex === null) {
                    addCoordinateToSelectedPolygon(coordinate);
                }
                else {
                    unselectPolygon();
                    resetSelection();
                }
            }
            else if (allowCreation) {
                buildNewPolygon(coordinate);
            }
        }
    }
    function buildNewPolygon(coordinate) {
        const polygon = newPolygon || getNewPolygon();
        const changedPolygon = { ...polygon, coordinates: [...polygon.coordinates, coordinate] };
        setNewPolygon(changedPolygon);
        if (changedPolygon.coordinates.length === 3) {
            setAllowCreation(false);
            setSelectedKey(changedPolygon.key);
            props.onPolygonCreate?.(changedPolygon);
        }
    }
    function getNewPolygon() {
        return {
            ...props.newPolygon,
            coordinates: [],
        };
    }
    function unselectPolygon() {
        if (selectedKey && selectedPolygon) {
            const index = getIndexByKey(selectedKey);
            props.onPolygonUnselect?.(index, selectedPolygon);
        }
    }
    function getIndexByKey(key) {
        const position = polygons.findIndex((polygon) => polygon.key === key);
        return position === -1 ? null : position;
    }
    function getPolygonByKey(key) {
        const index = getIndexByKey(key);
        return polygons[index ?? -1] || null;
    }
    function getKeyByIndex(index) {
        const polygon = polygons[index];
        return polygon?.key || null;
    }
    function addCoordinateToPolygon(polygon, coordinate, coordIndex) {
        const i = coordIndex ?? polygon?.coordinates.length ?? -1;
        const coordinates = [...polygon?.coordinates ?? []];
        coordinates.splice(i, 0, coordinate);
        return { ...polygon, coordinates };
    }
    function addCoordinateToSelectedPolygon(coordinate, coordIndex) {
        const changedPolygon = addCoordinateToPolygon(selectedPolygon, coordinate, coordIndex);
        setSelectedPolygon(changedPolygon);
        setSelectedPolyline(changedPolygon);
        const index = getIndexByKey(changedPolygon.key);
        props.onPolygonChange?.(index, changedPolygon);
    }
    function addCoordinateToSelectedPolyline(coordinate, coordIndex) {
        const changedPolygon = addCoordinateToPolygon(selectedPolygon, coordinate, coordIndex);
        setSelectedPolyline(changedPolygon);
    }
    function removeCoordinateFromSelectedPolygon(coordIndex) {
        const index = getIndexByKey(selectedPolygon?.key);
        const coordinates = [...selectedPolygon?.coordinates ?? []];
        coordinates.splice(coordIndex, 1);
        setSelectedMarkerIndex(null);
        if (coordinates.length < 3) {
            setSelectedKey(null);
            setSelectedPolyline(null);
            props.onPolygonRemove?.(index);
        }
        else {
            const changedPolygon = { ...selectedPolygon, coordinates };
            setSelectedPolygon(changedPolygon);
            setSelectedPolyline(changedPolygon);
            props.onPolygonChange?.(index, changedPolygon);
        }
    }
    function getSelectedPolygonCoordinates() {
        return selectedPolygon?.coordinates || [];
    }
    function onPolygonClick(index, polygon) {
        return (e) => {
            e.stopPropagation();
            if (!disabled) {
                if (selectedKey === polygon.key) {
                    setSelectedKey(null);
                    props.onPolygonSelect?.(index, polygon);
                }
                else {
                    setSelectedKey(polygon.key);
                }
                setSelectedMarkerIndex(null);
            }
        };
    }
    function changeSelectedPolylineCoordinate(coordIndex, coordinate) {
        const coordinatesClone = [...selectedPolyline?.coordinates ?? []];
        coordinatesClone[coordIndex] = coordinate;
        const changedPolygon = { ...selectedPolyline, coordinates: coordinatesClone };
        setSelectedPolyline(changedPolygon);
    }
    function synchronizePolylineToPolygon() {
        setSelectedPolygon(selectedPolyline);
        setSelectedPolyline(null);
        const index = getIndexByKey(selectedPolyline?.key);
        props.onPolygonChange?.(index, selectedPolyline);
    }
    function onSubMarkerDragStart(coordIndex) {
        return ({ nativeEvent: { coordinate } }) => {
            addCoordinateToSelectedPolyline(coordinate, coordIndex);
        };
    }
    function onMarkerDragStart(_coordIndex) {
        return (_e) => {
            setSelectedPolyline(selectedPolygon);
        };
    }
    function onMarkerDrag(coordIndex) {
        return ({ nativeEvent: { coordinate } }) => {
            debounce(() => {
                changeSelectedPolylineCoordinate(coordIndex, coordinate);
            }, 25);
        };
    }
    function onMarkerDragEnd(_coordIndex) {
        return (_e) => {
            debounce(() => {
                synchronizePolylineToPolygon();
            }, 25);
        };
    }
    function onMarkerPress(coordIndex) {
        return (e) => {
            e.stopPropagation();
            if (selectedMarkerIndex === coordIndex) {
                removeCoordinateFromSelectedPolygon(coordIndex);
            }
            else {
                setSelectedMarkerIndex(coordIndex);
            }
        };
    }
    function isSelectedMarker(coordIndex) {
        return selectedMarkerIndex === coordIndex;
    }
    function getMarkerSize(coordIndex) {
        return isSelectedMarker(coordIndex) ? 15 : 8;
    }
    function renderCircleRemove() {
        return (<View style={styles.removeMarkerContainer}>
                    <Text style={styles.removeMarkerText}>x</Text>
                </View>);
    }
    function renderCircle(coordIndex) {
        return (<View style={[styles.circleMarker, { borderColor: selectedPolygon?.strokeColor, padding: getMarkerSize(coordIndex) }]}></View>);
    }
    function getSelectedPolygonMiddleCoordinates() {
        const coordinates = selectedPolygon?.coordinates ?? [];
        const middleCoordinates = [getMidpointFromCoordinates(coordinates[0], coordinates[coordinates.length - 1])];
        for (let i = 1; i < coordinates.length; i++) {
            const coordinate = getMidpointFromCoordinates(coordinates[i - 1], coordinates[i]);
            middleCoordinates.push(coordinate);
        }
        return middleCoordinates;
    }
    function renderSubCircleMarkers() {
        if (selectedPolygon === null || disabled) {
            return;
        }
        const coordinates = getSelectedPolygonMiddleCoordinates();
        return (<Fragment>
                {coordinates.map((coordinate, coordIndex) => (<Marker key={coordIndex} identifier={coordIndex.toString()} coordinate={coordinate} anchor={{ x: .5, y: .5 }} draggable={true} onDragStart={onSubMarkerDragStart(coordIndex)} onDrag={onMarkerDrag(coordIndex)} onDragEnd={onMarkerDragEnd(coordIndex)} tracksViewChanges={true}>
                        <View style={[styles.subCircleMarker, { borderColor: selectedPolygon.strokeColor, padding: getMarkerSize(Infinity) }]}></View>
                    </Marker>))}
            </Fragment>);
    }
    function renderCircleMarkers() {
        if (selectedPolygon === null || disabled) {
            return;
        }
        return (<Fragment>
                {selectedPolygon.coordinates.map((coordinate, coordIndex) => (<Marker key={coordIndex} identifier={coordIndex.toString()} coordinate={coordinate} anchor={{ x: .5, y: .5 }} draggable={!isSelectedMarker(coordIndex)} onDragStart={onMarkerDragStart(coordIndex)} onDrag={onMarkerDrag(coordIndex)} onDragEnd={onMarkerDragEnd(coordIndex)} onPress={onMarkerPress(coordIndex)} tracksViewChanges={true}>
                        {isSelectedMarker(coordIndex) && (renderCircleRemove())}
                        {!isSelectedMarker(coordIndex) && (renderCircle(coordIndex))}
                    </Marker>))}
            </Fragment>);
    }
    function renderPolygons() {
        return (<Fragment>
                {polygons.map((polygonProps, index) => (<Polygon key={index} {...polygonProps} onPress={onPolygonClick(index, polygonProps)} tappable={true}/>))}
            </Fragment>);
    }
    function renderPolyline() {
        if (selectedPolyline === null) {
            return;
        }
        return (<Polygon {...selectedPolyline} fillColor='transparent'/>);
    }
    return (<Fragment>
            {renderPolygons()}
            {renderPolyline()}
            {renderSubCircleMarkers()}
            {renderCircleMarkers()}
        </Fragment>);
}
const styles = StyleSheet.create({
    circleMarker: {
        backgroundColor: '#fff',
        borderRadius: 100,
        borderWidth: 1,
    },
    subCircleMarker: {
        backgroundColor: 'rgba(255, 255, 255, .3)',
        borderRadius: 100,
        borderWidth: 1,
        borderStyle: 'dotted',
    },
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
export default forwardRef(PolygonEditor);
//# sourceMappingURL=PolygonEditor.js.map