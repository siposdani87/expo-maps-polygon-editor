import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState, } from 'react';
import { useNewPolygon, usePolygonFinder, useSelectedKey, useDisabled, usePolygons, useSelectedMarker, } from './hooks';
import { isPointInPolygon } from './lib/geospatials';
import { addCoordinateToPolygon, debounce } from './lib/helpers';
import { CircleMarkers, SubCircleMarkers, Polyline, Polygons, } from './components';
export const PolygonEditor = forwardRef((props, ref) => {
    const [selectedPolygon, setSelectedPolygon] = useState(null);
    const [selectedPolyline, setSelectedPolyline] = useState(null);
    const { selectedMarkerIndex, setSelectedMarkerIndex, isSelectedMarker, } = useSelectedMarker();
    const polygons = usePolygons(props.polygons);
    const disabled = useDisabled(() => {
        resetAll();
    }, props.disabled);
    const { getIndexByKey, getPolygonByKey } = usePolygonFinder(polygons);
    const [selectedKey, setSelectedKey, selectPolygonByKey, selectPolygonByIndex,] = useSelectedKey(polygons);
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
    }, [setSelectedKey, setSelectedMarkerIndex]);
    const startPolygon = useCallback(() => {
        resetSelection();
        startNewPolygon();
    }, [startNewPolygon, resetSelection]);
    const resetAll = useCallback(() => {
        resetNewPolygon();
        resetSelection();
    }, [resetNewPolygon, resetSelection]);
    const unselectPolygon = () => {
        if (selectedKey && selectedPolygon) {
            const index = getIndexByKey(selectedKey);
            if (index != null) {
                props.onPolygonUnselect?.(index, selectedPolygon);
            }
        }
    };
    const setCoordinate = (coordinate) => {
        if (disabled) {
            return;
        }
        const coordinates = selectedPolygon?.coordinates ?? [];
        if (isPointInPolygon(coordinate, coordinates)) {
            // console.log('isPointInPolygon');
        }
        else if (selectedPolygon) {
            // Don't add coordinate, just unselect the polygon
            // This prevents adding points when clicking another polygon
            unselectPolygon();
            resetSelection();
        }
        else {
            buildNewPolygon(coordinate);
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
        return ({ nativeEvent: { coordinate }, }) => {
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
            if (isSelectedMarker(coordIndex)) {
                removeCoordinateFromSelectedPolygon(coordIndex);
            }
            else {
                setSelectedMarkerIndex(coordIndex);
            }
        };
    };
    useImperativeHandle(ref, init);
    useEffect(() => {
        const polygon = selectedKey != null ? getPolygonByKey(selectedKey) : null;
        setSelectedPolygon(polygon);
    }, [polygons, selectedKey, getPolygonByKey]);
    return (<>
                <Polygons polygons={polygons} onPolygonClick={onPolygonClick}/>
                <Polyline polygon={selectedPolyline}/>
                {selectedPolygon !== null && !disabled && (<>
                        <SubCircleMarkers polygon={selectedPolygon} onDragStart={onSubMarkerDragStart} onDrag={onMarkerDrag} onDragEnd={onMarkerDragEnd}/>
                        <CircleMarkers selectedMarkerIndex={selectedMarkerIndex} polygon={selectedPolygon} onDragStart={onMarkerDragStart} onDrag={onMarkerDrag} onDragEnd={onMarkerDragEnd} onPress={onMarkerPress}/>
                    </>)}
            </>);
});
//# sourceMappingURL=PolygonEditor.js.map