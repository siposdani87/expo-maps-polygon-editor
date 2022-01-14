import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState, } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Marker, Polygon } from 'react-native-maps';
import { useNewPolygon } from './useNewPolygon';
import { usePolygonFinder } from './usePolygonFinder';
import { debounce, getMiddleCoordinates, isPointInPolygon } from './utils';
function PolygonEditor(props, ref) {
    const [polygons, setPolygons] = useState(props.polygons);
    const [selectedKey, setSelectedKey] = useState(null);
    const [selectedPolygon, setSelectedPolygon] = useState(null);
    const [selectedPolyline, setSelectedPolyline] = useState(null);
    const [selectedMarkerIndex, setSelectedMarkerIndex] = useState(null);
    const [disabled, setDisabled] = useState(props.disabled ?? false);
    const [getKeyByIndex, getIndexByKey, getPolygonByKey] = usePolygonFinder(polygons);
    const [startNewPolygon, resetNewPolygon, buildNewPolygon] = useNewPolygon(props.newPolygon, (polygon) => {
        setSelectedKey(polygon.key);
        props.onPolygonCreate?.(polygon);
    });
    const init = () => {
        return {
            setCoordinate,
            startPolygon,
            resetAll,
            selectPolygonByKey,
            selectPolygonByIndex,
        };
    };
    const resetSelection = useCallback(() => {
        setSelectedKey(null);
        setSelectedPolyline(null);
        setSelectedMarkerIndex(null);
    }, []);
    const startPolygon = useCallback(() => {
        resetSelection();
        startNewPolygon();
    }, [startNewPolygon, resetSelection]);
    const resetAll = useCallback(() => {
        resetNewPolygon();
        resetSelection();
    }, [resetNewPolygon, resetSelection]);
    const selectPolygonByKey = (key) => {
        if (selectedKey !== key) {
            setSelectedKey(key);
        }
    };
    const selectPolygonByIndex = (index) => {
        const key = getKeyByIndex(index);
        if (selectedKey !== key) {
            setSelectedKey(key);
        }
    };
    const setCoordinate = (coordinate) => {
        if (disabled) {
            return;
        }
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
        else {
            buildNewPolygon(coordinate);
        }
    };
    const unselectPolygon = () => {
        if (selectedKey && selectedPolygon) {
            const index = getIndexByKey(selectedKey);
            if (index != null) {
                props.onPolygonUnselect?.(index, selectedPolygon);
            }
        }
    };
    const addCoordinateToPolygon = (polygon, coordinate, coordIndex) => {
        const i = coordIndex ?? polygon.coordinates.length ?? -1;
        const coordinates = [...polygon.coordinates];
        coordinates.splice(i, 0, coordinate);
        return { ...polygon, coordinates };
    };
    const addCoordinateToSelectedPolygon = (coordinate, coordIndex) => {
        if (!selectedPolygon) {
            return;
        }
        const changedPolygon = addCoordinateToPolygon(selectedPolygon, coordinate, coordIndex);
        setSelectedPolygon(changedPolygon);
        setSelectedPolyline(changedPolygon);
        const index = getIndexByKey(changedPolygon.key);
        if (index != null) {
            props.onPolygonChange?.(index, changedPolygon);
        }
    };
    const addCoordinateToSelectedPolyline = (coordinate, coordIndex) => {
        if (!selectedPolygon) {
            return;
        }
        const changedPolygon = addCoordinateToPolygon(selectedPolygon, coordinate, coordIndex);
        setSelectedPolyline(changedPolygon);
    };
    const removeCoordinateFromSelectedPolygon = (coordIndex) => {
        if (!selectedPolygon) {
            return;
        }
        const index = getIndexByKey(selectedPolygon.key);
        const coordinates = [...selectedPolygon.coordinates];
        coordinates.splice(coordIndex, 1);
        setSelectedMarkerIndex(null);
        if (coordinates.length < 3) {
            setSelectedKey(null);
            setSelectedPolyline(null);
            if (index != null) {
                props.onPolygonRemove?.(index);
            }
        }
        else if (selectedPolygon) {
            const changedPolygon = {
                ...selectedPolygon,
                coordinates,
            };
            setSelectedPolygon(changedPolygon);
            setSelectedPolyline(changedPolygon);
            if (index != null) {
                props.onPolygonChange?.(index, changedPolygon);
            }
        }
    };
    const getSelectedPolygonCoordinates = () => {
        return selectedPolygon?.coordinates ?? [];
    };
    const onPolygonClick = (index, polygon) => {
        return (e) => {
            e.stopPropagation();
            if (disabled) {
                return;
            }
            if (selectedKey === polygon.key) {
                setSelectedKey(null);
                props.onPolygonSelect?.(index, polygon);
            }
            else {
                setSelectedKey(polygon.key);
            }
            setSelectedMarkerIndex(null);
        };
    };
    const changeSelectedPolylineCoordinate = (coordIndex, coordinate) => {
        if (!selectedPolyline) {
            return;
        }
        const coordinatesClone = [...selectedPolyline.coordinates];
        coordinatesClone[coordIndex] = coordinate;
        const changedPolygon = {
            ...selectedPolyline,
            coordinates: coordinatesClone,
        };
        setSelectedPolyline(changedPolygon);
    };
    const synchronizePolylineToPolygon = () => {
        if (!selectedPolyline) {
            return;
        }
        setSelectedPolygon(selectedPolyline);
        setSelectedPolyline(null);
        const index = getIndexByKey(selectedPolyline.key);
        if (index != null) {
            props.onPolygonChange?.(index, selectedPolyline);
        }
    };
    const onSubMarkerDragStart = (coordIndex) => {
        return ({ nativeEvent: { coordinate } }) => {
            addCoordinateToSelectedPolyline(coordinate, coordIndex);
        };
    };
    const onMarkerDragStart = (_coordIndex) => {
        return (_e) => {
            setSelectedPolyline(selectedPolygon);
        };
    };
    const onMarkerDrag = (coordIndex) => {
        return ({ nativeEvent: { coordinate } }) => {
            debounce(() => {
                changeSelectedPolylineCoordinate(coordIndex, coordinate);
            }, 25);
        };
    };
    const onMarkerDragEnd = (_coordIndex) => {
        return (_e) => {
            debounce(() => {
                synchronizePolylineToPolygon();
            }, 25);
        };
    };
    const onMarkerPress = (coordIndex) => {
        return (e) => {
            e.stopPropagation();
            if (selectedMarkerIndex === coordIndex) {
                removeCoordinateFromSelectedPolygon(coordIndex);
            }
            else {
                setSelectedMarkerIndex(coordIndex);
            }
        };
    };
    const isSelectedMarker = (coordIndex) => {
        return selectedMarkerIndex === coordIndex;
    };
    const getMarkerSize = (coordIndex) => {
        return isSelectedMarker(coordIndex) ? 15 : 8;
    };
    const renderCircleRemove = () => {
        return (<View style={styles.removeMarkerContainer}>
                <Text style={styles.removeMarkerText}>x</Text>
            </View>);
    };
    const renderCircle = (coordIndex) => {
        return (<View style={[
                styles.circleMarker,
                {
                    borderColor: selectedPolygon?.strokeColor,
                    padding: getMarkerSize(coordIndex),
                },
            ]}/>);
    };
    const renderSubCircleMarkers = () => {
        if (selectedPolygon === null || disabled) {
            return;
        }
        const coordinates = getSelectedPolygonCoordinates();
        const middleCoordinates = getMiddleCoordinates(coordinates);
        return (<>
                {middleCoordinates.map((coordinate, coordIndex) => (<Marker key={coordIndex} identifier={coordIndex.toString()} coordinate={coordinate} anchor={{ x: 0.5, y: 0.5 }} draggable={true} onDragStart={onSubMarkerDragStart(coordIndex)} onDrag={onMarkerDrag(coordIndex)} onDragEnd={onMarkerDragEnd(coordIndex)} tracksViewChanges={true}>
                        <View style={[
                    styles.subCircleMarker,
                    {
                        borderColor: selectedPolygon.strokeColor,
                        padding: getMarkerSize(Infinity),
                    },
                ]}/>
                    </Marker>))}
            </>);
    };
    const renderCircleMarkers = () => {
        if (selectedPolygon === null || disabled) {
            return;
        }
        return (<>
                {selectedPolygon.coordinates.map((coordinate, coordIndex) => (<Marker key={coordIndex} identifier={coordIndex.toString()} coordinate={coordinate} anchor={{ x: 0.5, y: 0.5 }} draggable={!isSelectedMarker(coordIndex)} onDragStart={onMarkerDragStart(coordIndex)} onDrag={onMarkerDrag(coordIndex)} onDragEnd={onMarkerDragEnd(coordIndex)} onPress={onMarkerPress(coordIndex)} tracksViewChanges={true}>
                            {isSelectedMarker(coordIndex) &&
                    renderCircleRemove()}
                            {!isSelectedMarker(coordIndex) &&
                    renderCircle(coordIndex)}
                        </Marker>))}
            </>);
    };
    const renderPolygons = () => {
        return (<>
                {polygons.map((polygon, index) => (<Polygon {...polygon} onPress={onPolygonClick(index, polygon)} tappable={true}/>))}
            </>);
    };
    const renderPolyline = () => {
        if (selectedPolyline === null) {
            return;
        }
        return <Polygon {...selectedPolyline} fillColor="transparent"/>;
    };
    useImperativeHandle(ref, init);
    useEffect(() => {
        setPolygons(props.polygons);
    }, [props.polygons]);
    useEffect(() => {
        setDisabled(props.disabled ?? false);
        if (props.disabled) {
            resetAll();
        }
    }, [props.disabled, resetAll]);
    useEffect(() => {
        const polygon = selectedKey != null ? getPolygonByKey(selectedKey) : null;
        if (selectedPolygon?.key !== polygon?.key) {
            setSelectedPolygon(polygon);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getPolygonByKey, polygons, selectedKey]);
    useEffect(() => {
        const key = selectedPolygon?.key ?? null;
        if (selectedKey !== key) {
            setSelectedKey(key);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPolygon]);
    return (<>
            {renderPolygons()}
            {renderPolyline()}
            {renderSubCircleMarkers()}
            {renderCircleMarkers()}
        </>);
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