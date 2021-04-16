import React, { forwardRef, Fragment, useEffect, useImperativeHandle, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LatLng, MapEvent, MapPolygonProps, Marker, Polygon } from 'react-native-maps';
import { debounce, getMidpointFromCoordinates, isPointInPolygon } from './utils';

export type PolygonEditorRef = {
    setCoordinate: (_coordinate: LatLng) => void,
    startPolygon: () => void,
    selectPolygonByKey: (key: any) => void,
    selectPolygonByIndex: (index: number) => void,
    resetAll: () => void,
};

export type MapPolygonExtendedProps = MapPolygonProps & { key: any };

function getRandomNumber(min: number, max: number): number {
    return (Math.random() * max) + min;
}

export function getRandomColors(): string[] {
    const red = Math.floor(getRandomNumber(0, 255));
    const green = Math.floor(getRandomNumber(0, 255));
    const blue = Math.floor(getRandomNumber(0, 255));
    return [`rgb(${red}, ${green}, ${blue})`, `rgba(${red}, ${green}, ${blue}, 0.2)`];
}

function PolygonEditor(props: { polygons: MapPolygonExtendedProps[], newPolygon?: MapPolygonExtendedProps, onPolygonChange?: (_i: number, _p: MapPolygonExtendedProps) => void, onPolygonCreate?: (_p: MapPolygonExtendedProps) => void, onPolygonRemove?: (_i: number) => void, onPolygonSelect?: (_i: number, _p: MapPolygonExtendedProps) => void, disabled?: boolean }, ref) {
    const [polygons, setPolygons] = useState<MapPolygonExtendedProps[]>(props.polygons);

    const [selectedKey, setSelectedKey] = useState<number>(null);
    const [selectedPolygon, setSelectedPolygon] = useState<MapPolygonExtendedProps>(null);
    const [selectedPolyline, setSelectedPolyline] = useState<MapPolygonExtendedProps>(null);

    const [markerIndex, setMarkerIndex] = useState<number>(null);

    const [allowCreation, setAllowCreation] = useState<boolean>(false);
    const [newPolygon, setNewPolygon] = useState<MapPolygonExtendedProps>(null);

    const [disabled, setDisabled] = useState<boolean>(props.disabled ?? false);

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

    function init(): PolygonEditorRef {
        return {
            setCoordinate,
            startPolygon,
            resetAll,
            selectPolygonByKey,
            selectPolygonByIndex,
        };
    }

    function startPolygon(): void {
        resetSelection();
        setNewPolygon(null);
        setAllowCreation(true);
    }

    function resetAll(): void {
        setAllowCreation(false);
        setNewPolygon(null);
        resetSelection();
    }

    function resetSelection(): void {
        setSelectedKey(null);
        setSelectedPolyline(null);
        setMarkerIndex(null);
    }

    function selectPolygonByKey(key: any): void {
        setSelectedKey(key);
    }

    function selectPolygonByIndex(index: number): void {
        const key = getKeyByIndex(index)
        if (selectedKey !== key) {
            setSelectedKey(key);
        }
    }

    function setCoordinate(coordinate: LatLng): void {
        if (!disabled) {
            if (isPointInPolygon(coordinate, getSelectedPolygonCoordinates())) {
                console.log('isPointInPolygon');
            } else if (selectedPolygon) {
                if (markerIndex === null) {
                    addCoordinateToSelectedPolygon(coordinate);
                } else {
                    resetSelection();
                }
            } else if (allowCreation) {
                buildNewPolygon(coordinate);
            }
        }
    }

    function buildNewPolygon(coordinate: LatLng): void {
        const polygon = newPolygon || getNewPolygon();
        const changedPolygon = { ...polygon, coordinates: [...polygon.coordinates, coordinate] };
        setNewPolygon(changedPolygon);
        if (changedPolygon.coordinates.length === 3) {
            setAllowCreation(false);
            setSelectedKey(changedPolygon.key);
            props.onPolygonCreate?.(changedPolygon);
        }
    }

    function getNewPolygon(): MapPolygonExtendedProps {
        return {
            ...props.newPolygon,
            coordinates: [],
        };
    }

    function getIndexByKey(key: any): number {
        const position = polygons.findIndex((polygon) => polygon.key === key);
        return position === -1 ? null : position;
    }

    function getPolygonByKey(key: any): MapPolygonExtendedProps {
        const index = getIndexByKey(key);
        return polygons[index] || null;
    }

    function getKeyByIndex(index: number): any {
        const polygon = polygons[index];
        return polygon?.key || null;
    }

    function addCoordinateToPolygon(polygon: MapPolygonExtendedProps, coordinate: LatLng, coordIndex?: number): MapPolygonExtendedProps {
        const i = coordIndex ?? polygon.coordinates.length;
        const coordinates = [...polygon.coordinates];
        coordinates.splice(i, 0, coordinate);
        return { ...polygon, coordinates };
    }

    function addCoordinateToSelectedPolygon(coordinate: LatLng, coordIndex?: number): void {
        const changedPolygon = addCoordinateToPolygon(selectedPolygon, coordinate, coordIndex);
        setSelectedPolygon(changedPolygon);
        const index = getIndexByKey(changedPolygon.key);
        props.onPolygonChange?.(index, changedPolygon);
    }

    function addCoordinateToSelectedPolyline(coordinate: LatLng, coordIndex?: number): void {
        const changedPolygon = addCoordinateToPolygon(selectedPolygon, coordinate, coordIndex);
        setSelectedPolyline(changedPolygon);
    }

    function removeCoordinateFromSelectedPolygon(coordIndex: number): void {
        const coordinates = [...selectedPolygon.coordinates];
        coordinates.splice(coordIndex, 1);
        const index = getIndexByKey(selectedPolygon.key);
        if (coordinates.length < 3) {
            setSelectedKey(null);
            setSelectedPolyline(null);
            props.onPolygonRemove?.(index);
        } else {
            const changedPolygon = { ...selectedPolygon, coordinates };
            setSelectedPolyline(changedPolygon);
            props.onPolygonChange?.(index, changedPolygon);
        }
    }

    function getSelectedPolygonCoordinates(): LatLng[] {
        return selectedPolygon?.coordinates || [];
    }

    function onPolygonClick(index: number, polygon: MapPolygonExtendedProps) {
        return (e: MapEvent) => {
            e.stopPropagation();
            if (!disabled) {
                if (selectedKey === polygon.key) {
                    setSelectedKey(null);
                    props.onPolygonSelect?.(index, polygon);
                } else {
                    setSelectedKey(polygon.key);
                }
                setMarkerIndex(null);
            }
        };
    }

    function changeSelectedPolylineCoordinate(coordIndex: number, coordinate: LatLng) {
        const coordinatesClone = [...selectedPolyline.coordinates];
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

    function onSubMarkerDragStart(coordIndex: number) {
        return ({ nativeEvent: { coordinate } }: MapEvent) => {
            addCoordinateToSelectedPolyline(coordinate, coordIndex);
        };
    }

    function onMarkerDragStart(_coordIndex: number) {
        return (_e: MapEvent) => {
            setSelectedPolyline(selectedPolygon);
        };
    }

    function onMarkerDrag(coordIndex: number) {
        return ({ nativeEvent: { coordinate } }: MapEvent) => {
            debounce(() => {
                changeSelectedPolylineCoordinate(coordIndex, coordinate);
            }, 25);
        };
    }

    function onMarkerDragEnd(_coordIndex: number) {
        return (_e: MapEvent) => {
            debounce(() => {
                synchronizePolylineToPolygon();
            }, 25);
        };
    }

    function onMarkerPress(coordIndex: number) {
        return (e: MapEvent) => {
            e.stopPropagation();
            if (markerIndex === coordIndex) {
                onMarkerRemove(coordIndex);
            } else {
                setMarkerIndex(coordIndex);
            }
        };
    }

    function onMarkerRemove(coordIndex: number) {
        return (e) => {
            e.stopPropagation();
            removeCoordinateFromSelectedPolygon(coordIndex);
        };
    }

    function isSelectedMarker(coordIndex: number): boolean {
        return markerIndex === coordIndex;
    }

    function getMarkerSize(coordIndex: number): number {
        return isSelectedMarker(coordIndex) ? 15 : 8;
    }

    function renderCircleRemove(coordIndex: number): JSX.Element | void {
        return (
            <Pressable onPress={onMarkerRemove(coordIndex)}>
                <View style={styles.removeMarkerContainer}>
                    <Text style={styles.removeMarkerText}>x</Text>
                </View>
            </Pressable>
        );
    }

    function getSelectedPolygonMiddleCoordinates(): LatLng[] {
        const { coordinates } = selectedPolygon;
        const middleCoordinates = [getMidpointFromCoordinates(coordinates[0], coordinates[coordinates.length - 1])];
        for (let i = 1; i < coordinates.length; i++) {
            const coordinate = getMidpointFromCoordinates(coordinates[i - 1], coordinates[i]);
            middleCoordinates.push(coordinate);
        }
        return middleCoordinates;
    }

    function renderSubCircleMarkers(): JSX.Element | void {
        if (selectedPolygon === null || disabled) {
            return;
        }
        const coordinates = getSelectedPolygonMiddleCoordinates();
        return (
            <Fragment>
                {coordinates.map((coordinate, coordIndex) => (
                    <Marker key={coordIndex} identifier={coordIndex.toString()} coordinate={coordinate} anchor={{ x: .5, y: .5 }} draggable={true} onDragStart={onSubMarkerDragStart(coordIndex)} onDrag={onMarkerDrag(coordIndex)} onDragEnd={onMarkerDragEnd(coordIndex)} tracksViewChanges={true} >
                        <View style={[styles.subCircleMarker, { borderColor: selectedPolygon.strokeColor, padding: getMarkerSize(Infinity) }]}></View>
                    </Marker>
                ))}
            </Fragment>
        );
    }

    function renderCircleMarkers(): JSX.Element | void {
        if (selectedPolygon === null || disabled) {
            return;
        }
        return (
            <Fragment>
                {selectedPolygon.coordinates.map((coordinate, coordIndex) => (
                    <Marker key={coordIndex} identifier={coordIndex.toString()} coordinate={coordinate} anchor={{ x: .5, y: .5 }} draggable={!isSelectedMarker(coordIndex)} onDragStart={onMarkerDragStart(coordIndex)} onDrag={onMarkerDrag(coordIndex)} onDragEnd={onMarkerDragEnd(coordIndex)} onPress={onMarkerPress(coordIndex)} tracksViewChanges={true} >
                        {isSelectedMarker(coordIndex) && (
                            renderCircleRemove(coordIndex)
                        )}
                        {!isSelectedMarker(coordIndex) && (
                            <View style={[styles.circleMarker, { borderColor: selectedPolygon.strokeColor, padding: getMarkerSize(coordIndex) }]}></View>
                        )}
                    </Marker>
                ))}
            </Fragment>
        );
    }

    function renderPolygons(): JSX.Element {
        return (
            <Fragment>
                {polygons.map((polygonProps, index) => (
                    <Polygon key={index} {...polygonProps} onPress={onPolygonClick(index, polygonProps)} tappable={true} />
                ))}
            </Fragment>
        );
    }

    function renderPolyline(): JSX.Element | void {
        if (selectedPolyline === null) {
            return;
        }
        return (
            <Polygon {...selectedPolyline} fillColor='transparent' />
        );
    }

    return (
        <Fragment>
            {renderPolygons()}
            {renderPolyline()}
            {renderSubCircleMarkers()}
            {renderCircleMarkers()}
        </Fragment>
    );
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
