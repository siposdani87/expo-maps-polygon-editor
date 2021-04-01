import React, { forwardRef, Fragment, useImperativeHandle, useState } from 'react';
import { Callout, LatLng, MapEvent, MapPolygonProps, Marker, Polygon } from 'react-native-maps';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { debounce, getMidpointFromCoordinates, isPointInPolygon } from './utils';

export type PolygonEditorRef = {
    setCoordinate: (coordinate: LatLng) => void,
    startPolygon: () => void,
    closePolygon: () => void,
    resetSelection: () => void,
};

export type MapPolygonExtendedProps = MapPolygonProps & {};

function PolygonEditor(props: { newPolygon?: MapPolygonExtendedProps, polygons: MapPolygonExtendedProps[], onPolygonChange: (_i: number, _p: MapPolygonExtendedProps) => void, onPolygonCreate: (_p: MapPolygonExtendedProps) => void, onPolygonRemove: (_i: number) => void }, ref) {
    const [selectedPolygon, setSelectedPolygon] = useState<MapPolygonExtendedProps>(null);
    const [selectedIndex, setSelectedIndex] = useState<number>(null);
    const [selectedPolyline, setSelectedPolyline] = useState<MapPolygonExtendedProps>(null);
    const [allowCreation, setAllowCreation] = useState<boolean>(false);
    const [markerIndex, setMarkerIndex] = useState<number>(null);
    const [newPolygon, setNewPolygon] = useState<MapPolygonExtendedProps>(null);

    useImperativeHandle(ref, init);

    function init(): PolygonEditorRef {
        return {
            setCoordinate,
            startPolygon,
            closePolygon,
            resetSelection,
        };
    }

    function startPolygon(): void {
        resetSelection();
        setNewPolygon(null);
        setAllowCreation(true);
    }

    function closePolygon(): void {
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
        setSelectedPolyline(changedPolygon);
    }

    function synchronizePolylineToPolygon() {
        setSelectedPolygon(selectedPolyline);
        props.onPolygonChange(selectedIndex, selectedPolyline);
        setSelectedPolyline(null);
    }

    function onMarkerDragStart(_index: number) {
        return (_e: MapEvent) => {
            setSelectedPolyline(selectedPolygon);
        };
    }

    function onMarkerDrag(index: number) {
        return ({ nativeEvent: { coordinate } }: MapEvent) => {
            debounce(() => {
                changeSelectedPolygonCoordinate(index, coordinate);
            }, 25);
        };
    }

    function onMarkerDragEnd(_index: number) {
        return (_e: MapEvent) => {
            synchronizePolylineToPolygon();
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
            console.log('onMarkerDelete');
            removeCoordinateFromSelectedPolygon(index);
        };
    }

    function isSelectedMarker(index: number): boolean {
        return markerIndex === index;
    }

    function getMarkerSize(index: number): number {
        return isSelectedMarker(index) ? 15 : 8;
    }

    function renderCircleRemove(index: number): any {

        return (
            <View style={{ backgroundColor: 'blue' }}>

            </View>
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
                    <Marker key={index} identifier={index.toString()} coordinate={coordinate} anchor={{ x: .5, y: .5 }} draggable={true} onDragStart={onSubMarkerDragStart(index)} onDrag={onMarkerDrag(index)} onDragEnd={onMarkerDragEnd(index)} tracksViewChanges={true} >
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
                    <Marker key={index} identifier={index.toString()} coordinate={coordinate} anchor={{ x: .5, y: .5 }} draggable={!isSelectedMarker(index)} onDragStart={onMarkerDragStart(index)} onDrag={onMarkerDrag(index)} onDragEnd={onMarkerDragEnd(index)} onPress={onMarkerPress(index)} tracksViewChanges={true} >
                        <View style={[styles.circleMarker, { borderColor: selectedPolygon.strokeColor, padding: getMarkerSize(index) }]}></View>
                        <Callout tooltip={true}>
                            <View>
                                {isSelectedMarker(index) && (
                                    <Pressable onPress={onMarkerDelete(index)}>
                                        <View style={styles.removeMarkerContainer}>
                                            <Text style={styles.removeMarkerText}>x</Text>
                                        </View>
                                    </Pressable>
                                )}
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </Fragment>
        );
    }

    function renderPolygons(): JSX.Element {
        return (
            <Fragment>
                {props.polygons.map((polygonProps, index) => (
                    <Polygon key={index} {...polygonProps} onPress={clickOnPolygon(index, polygonProps)} tappable={true} />
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
        width: 25,
        height: 25,
        backgroundColor: '#f00',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 40,
        marginTop: 0,
    },
    removeMarkerText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default forwardRef(PolygonEditor);
