import React, { forwardRef, Fragment, useEffect, useImperativeHandle, useState } from 'react';
import { LatLng, MapEvent, MapPolygonProps, Marker, Polygon } from 'react-native-maps';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { debounce, getMidpointFromCoordinates, isPointInPolygon } from './utils';

export type PolygonEditorRef = {
    setCoordinate: (_coordinate: LatLng) => void,
    startPolygon: () => void,
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

function PolygonEditor(props: { polygons: MapPolygonExtendedProps[], newPolygon?: MapPolygonExtendedProps, onPolygonChange?: (_i: number, _p: MapPolygonExtendedProps) => void, onPolygonCreate?: (_p: MapPolygonExtendedProps) => void, onPolygonRemove?: (_i: number) => void, onPolygonSelect?: (_i: number) => void, disabled?: boolean }, ref) {
    const [selectedPolygon, setSelectedPolygon] = useState<MapPolygonExtendedProps>(null);
    const [selectedIndex, setSelectedIndex] = useState<number>(null);
    const [selectedPolyline, setSelectedPolyline] = useState<MapPolygonExtendedProps>(null);
    const [allowCreation, setAllowCreation] = useState<boolean>(false);
    const [markerIndex, setMarkerIndex] = useState<number>(null);
    const [newPolygon, setNewPolygon] = useState<MapPolygonExtendedProps>(null);
    const [disabled, setDisabled] = useState<boolean>(props.disabled ?? false);

    useImperativeHandle(ref, init);

    useEffect(() => {
        setDisabled(props.disabled);
        if (props.disabled) {
            resetAll();
        }
    }, [props.disabled]);

    function init(): PolygonEditorRef {
        return {
            setCoordinate,
            startPolygon,
            resetAll,
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
        setSelectedPolygon(null);
        setSelectedIndex(null);
        setSelectedPolyline(null);
        setMarkerIndex(null);
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
        const polygon = newPolygon === null ? getNewPolygon() : newPolygon;
        const changedPolygon = { ...polygon, coordinates: [...polygon.coordinates, coordinate] };
        setNewPolygon(changedPolygon);
        if (changedPolygon.coordinates.length === 3) {
            setAllowCreation(false);
            setSelectedIndex(props.polygons.length);
            setSelectedPolygon(changedPolygon);
            props.onPolygonCreate?.(changedPolygon);
        }
    }

    function getNewPolygon(): MapPolygonExtendedProps {
        return {
            ...props.newPolygon,
            coordinates: [],
        };
    }

    function addCoordinateToPolygon(polygon: MapPolygonExtendedProps, coordinate: LatLng, index?: number): MapPolygonExtendedProps {
        const i = index ?? polygon.coordinates.length;
        const coordinates = [...polygon.coordinates];
        coordinates.splice(i, 0, coordinate);
        return { ...polygon, coordinates };
    }

    function addCoordinateToSelectedPolygon(coordinate: LatLng, index?: number): void {
        const changedPolygon = addCoordinateToPolygon(selectedPolygon, coordinate, index);
        setSelectedPolygon(changedPolygon);
        props.onPolygonChange?.(selectedIndex, changedPolygon);
    }

    function addCoordinateToSelectedPolyline(coordinate: LatLng, index?: number): void {
        const changedPolygon = addCoordinateToPolygon(selectedPolygon, coordinate, index);
        setSelectedPolyline(changedPolygon);
    }

    function removeCoordinateFromSelectedPolygon(index: number): void {
        const coordinates = [...selectedPolygon.coordinates];
        coordinates.splice(index, 1);
        if (coordinates.length < 3) {
            setSelectedIndex(null);
            setSelectedPolygon(null);
            setSelectedPolyline(null);
            props.onPolygonRemove?.(selectedIndex);
        } else {
            const changedPolygon = { ...selectedPolygon, coordinates };
            setSelectedPolygon(changedPolygon);
            setSelectedPolyline(changedPolygon);
            props.onPolygonChange?.(selectedIndex, changedPolygon);
        }
    }

    function getSelectedPolygonCoordinates(): LatLng[] {
        return selectedPolygon?.coordinates || [];
    }

    function onPolygonClick(index: number, polygonProps: MapPolygonExtendedProps) {
        return (e: MapEvent) => {
            e.stopPropagation();
            if (!disabled) {
                if (selectedIndex === index) {
                    setSelectedIndex(null);
                    setSelectedPolygon(null);
                    props.onPolygonSelect?.(index);
                } else {
                    setSelectedIndex(index);
                    setSelectedPolygon(polygonProps);
                }
                setMarkerIndex(null);
            }
        };
    }

    function changeSelectedPolylineCoordinate(index: number, coordinate: LatLng) {
        const coordinatesClone = [...selectedPolyline.coordinates];
        coordinatesClone[index] = coordinate;
        const changedPolygon = { ...selectedPolyline, coordinates: coordinatesClone };
        setSelectedPolyline(changedPolygon);
    }

    function synchronizePolylineToPolygon() {
        setSelectedPolygon(selectedPolyline);
        setSelectedPolyline(null);
        props.onPolygonChange?.(selectedIndex, selectedPolyline);
    }

    function onSubMarkerDragStart(index: number) {
        return ({ nativeEvent: { coordinate } }: MapEvent) => {
            addCoordinateToSelectedPolyline(coordinate, index);
        };
    }

    function onMarkerDragStart(_index: number) {
        return (_e: MapEvent) => {
            setSelectedPolyline(selectedPolygon);
        };
    }

    function onMarkerDrag(index: number) {
        return ({ nativeEvent: { coordinate } }: MapEvent) => {
            debounce(() => {
                changeSelectedPolylineCoordinate(index, coordinate);
            }, 25);
        };
    }

    function onMarkerDragEnd(_index: number) {
        return (_e: MapEvent) => {
            debounce(() => {
                synchronizePolylineToPolygon();
            }, 25);
        };
    }

    function onMarkerPress(index: number) {
        return (e: MapEvent) => {
            e.stopPropagation();
            if (markerIndex === index) {
                onMarkerRemove(index);
                // setMarkerIndex(null);
            } else {
                setMarkerIndex(index);
            }
        };
    }

    function onMarkerRemove(index: number) {
        return (e) => {
            e.stopPropagation();
            removeCoordinateFromSelectedPolygon(index);
        };
    }

    function isSelectedMarker(index: number): boolean {
        return markerIndex === index;
    }

    function getMarkerSize(index: number): number {
        return isSelectedMarker(index) ? 15 : 8;
    }

    function renderCircleRemove(index: number): JSX.Element | void {
        return (
            <Pressable onPress={onMarkerRemove(index)}>
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
                {coordinates.map((coordinate, index) => (
                    <Marker key={index} identifier={index.toString()} coordinate={coordinate} anchor={{ x: .5, y: .5 }} draggable={true} onDragStart={onSubMarkerDragStart(index)} onDrag={onMarkerDrag(index)} onDragEnd={onMarkerDragEnd(index)} tracksViewChanges={true} >
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
                {selectedPolygon.coordinates.map((coordinate, index) => (
                    <Marker key={index} identifier={index.toString()} coordinate={coordinate} anchor={{ x: .5, y: .5 }} draggable={!isSelectedMarker(index)} onDragStart={onMarkerDragStart(index)} onDrag={onMarkerDrag(index)} onDragEnd={onMarkerDragEnd(index)} onPress={onMarkerPress(index)} tracksViewChanges={true} >
                        {isSelectedMarker(index) && (
                            renderCircleRemove(index)
                        )}
                        {!isSelectedMarker(index) && (
                            <View style={[styles.circleMarker, { borderColor: selectedPolygon.strokeColor, padding: getMarkerSize(index) }]}></View>
                        )}
                    </Marker>
                ))}
            </Fragment>
        );
    }

    function renderPolygons(): JSX.Element {
        return (
            <Fragment>
                {props.polygons.map((polygonProps, index) => (
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
