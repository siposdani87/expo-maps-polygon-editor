import React, { forwardRef, Fragment, useImperativeHandle, useState } from 'react';
import { LatLng, MapEvent, MapPolygonProps, Marker, Polygon } from 'react-native-maps';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { debounce, getMidpointFromCoordinates, isPointInPolygon } from './utils';

export type PolygonEditorRef = {
    setCoordinate: (coordinate: LatLng) => void,
    startPolygon: () => void,
    closePolygon: () => void,
};

export type MapPolygonExtendedProps = MapPolygonProps & {};

function PolygonEditor(props: { newPolygon?: MapPolygonExtendedProps, polygons: MapPolygonExtendedProps[], onPolygonChange: (_i: number, _p: MapPolygonExtendedProps) => void, onPolygonCreate: (_p: MapPolygonExtendedProps) => void, onPolygonRemove: (_i: number) => void }, ref) {
    const [selectedPolygon, setSelectedPolygon] = useState<MapPolygonExtendedProps>(null);
    const [selectedIndex, setSelectedIndex] = useState<number>(null);
    const [allowCreation, setAllowCreation] = useState<boolean>(false);
    const [markerIndex, setMarkerIndex] = useState<number>(null);
    const [newPolygon, setNewPolygon] = useState<MapPolygonExtendedProps>(null);

    useImperativeHandle(ref, init);

    function init(): PolygonEditorRef {
        return {
            setCoordinate,
            startPolygon,
            closePolygon,
        };
    }

    function startPolygon(): void {
        resetSelection();
        setAllowCreation(true);
    }

    function closePolygon(): void {
        setAllowCreation(false);
        resetSelection();
    }

    function resetSelection(): void {
        setNewPolygon(null);
        setSelectedPolygon(null);
        setSelectedIndex(null);
        setMarkerIndex(null);
    }

    function setCoordinate(coordinate: LatLng): void {
        console.log('setCoordinate', coordinate);
        if (isPointInPolygon(coordinate, getSelectedPolygonCoordinates())) {
            console.log('isPointInPolygon');
        } else if (selectedPolygon) {
            if (markerIndex === null) {
                console.log('addCoordinateToSelectedPolygon');
                // setMarkerIndex(selectedPolygon.coordinates.length);
                addCoordinateToSelectedPolygon(coordinate);
            } else {
                resetSelection();
            }
        } else if (allowCreation) {
            console.log('buildNewPolygon');
            buildNewPolygon(coordinate);
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
            props.onPolygonCreate(changedPolygon);
        }
    }

    function getNewPolygon(): MapPolygonExtendedProps {
        return {
            ...props.newPolygon,
            coordinates: [],
        };
    }

    function addCoordinateToSelectedPolygon(coordinate: LatLng, index?: number): void {
        if (!selectedPolygon) {
            return;
        }
        const i = index ?? selectedPolygon.coordinates.length;
        const coordinates = [...selectedPolygon.coordinates];
        coordinates.splice(i, 0, coordinate);
        const changedPolygon = { ...selectedPolygon, coordinates };
        setSelectedPolygon(changedPolygon);
        props.onPolygonChange(selectedIndex, changedPolygon);
    }

    function removeCoordinateFromSelectedPolygon(index: number): void {
        if (!selectedPolygon) {
            return;
        }
        const coordinates = [...selectedPolygon.coordinates];
        coordinates.splice(index, 1);
        if (coordinates.length < 3) {
            setSelectedIndex(null);
            setSelectedPolygon(null);
            props.onPolygonRemove(selectedIndex);
        } else {
            const changedPolygon = { ...selectedPolygon, coordinates };
            setSelectedPolygon(changedPolygon);
            props.onPolygonChange(selectedIndex, changedPolygon);
        }
    }

    function getSelectedPolygonCoordinates(): LatLng[] {
        return selectedPolygon?.coordinates || [];
    }

    function clickOnPolygon(index: number, polygonProps: MapPolygonExtendedProps) {
        return (e: MapEvent) => {
            e.stopPropagation();
            if (selectedIndex === index) {
                setSelectedIndex(null);
                setSelectedPolygon(null);
            } else {
                setSelectedIndex(index);
                setSelectedPolygon(polygonProps);
            }
            setMarkerIndex(null);
        };
    }

    function changeSelectedPolygonCoordinate(index: number, coordinate: LatLng) {
        const coordinatesClone = [...selectedPolygon.coordinates];
        coordinatesClone[index] = coordinate;
        const changedPolygon = { ...selectedPolygon, coordinates: coordinatesClone };
        setSelectedPolygon(changedPolygon);
        props.onPolygonChange(selectedIndex, changedPolygon);
    }

    function onMarkerDragStart(index: number) {
        return ({ nativeEvent: { coordinate } }: MapEvent) => {
            changeSelectedPolygonCoordinate(index, coordinate);
        };
    }

    function onMarkerDrag(index: number) {
        return ({ nativeEvent: { coordinate } }: MapEvent) => {
            debounce(() => {
                changeSelectedPolygonCoordinate(index, coordinate);
            }, 50);
        };
    }

    function onMarkerDragEnd(index: number) {
        return ({ nativeEvent: { coordinate } }: MapEvent) => {
            changeSelectedPolygonCoordinate(index, coordinate);
        };
    }

    function onMarkerPress(index: number) {
        return (e: MapEvent) => {
            e.stopPropagation();
            if (markerIndex === index) {
                setMarkerIndex(null);
            } else {
                setMarkerIndex(index);
            }
        };
    }

    function onMarkerDelete(index: number) {
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
        if (!isSelectedMarker(index)) {
            return;
        }
        return (
            <Pressable style={{ marginLeft: 15 }} onPress={onMarkerDelete(index)}>
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

    function onSubMarkerDragStart(index: number) {
        return ({ nativeEvent: { coordinate } }: MapEvent) => {
            addCoordinateToSelectedPolygon(coordinate, index);
        };
    }

    function renderSubCircleMarkers(): JSX.Element | void {
        if (selectedPolygon === null) {
            return;
        }
        const coordinates = getSelectedPolygonMiddleCoordinates();
        return (
            <Fragment>
                {coordinates.map((coordinate, index) => (
                    <Marker key={index} identifier={index.toString()} coordinate={coordinate} anchor={{ x: -getMarkerSize(Infinity), y: -getMarkerSize(Infinity) }} draggable={true} onDragStart={onSubMarkerDragStart(index)} onDrag={onMarkerDrag(index)} onDragEnd={onMarkerDragEnd(index)} tracksViewChanges={false} >
                        <View style={[styles.subCircleMarker, { borderColor: selectedPolygon.strokeColor, padding: getMarkerSize(Infinity) }]}></View>
                    </Marker>
                ))}
            </Fragment>
        );
    }

    function renderCircleMarkers(): JSX.Element | void {
        if (selectedPolygon === null) {
            return;
        }

        return (
            <Fragment>
                {selectedPolygon.coordinates.map((coordinate, index) => (
                    <Marker key={index} identifier={index.toString()} coordinate={coordinate} anchor={{ x: -getMarkerSize(index), y: -getMarkerSize(index) }} draggable={!isSelectedMarker(index)} onDragStart={onMarkerDragStart(index)} onDrag={onMarkerDrag(index)} onDragEnd={onMarkerDragEnd(index)} onPress={onMarkerPress(index)} tracksViewChanges={false} >
                        {renderCircleRemove(index)}
                        <View style={[styles.circleMarker, { borderColor: selectedPolygon.strokeColor, padding: getMarkerSize(index) }]}></View>
                    </Marker>
                ))}
            </Fragment>
        );
    }

    return (
        <Fragment>
            {props.polygons.map((polygonProps, index) => (
                <Polygon key={index} {...polygonProps} onPress={clickOnPolygon(index, polygonProps)} tappable={true} />
            ))}
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
    },
    removeMarkerContainer: {
        paddingBottom: 1,
        paddingHorizontal: 5,
        backgroundColor: '#f00',
        borderRadius: 20,
    },
    removeMarkerText: {
        color: '#fff',
        fontSize: 14,
    },
});

export default forwardRef(PolygonEditor);
