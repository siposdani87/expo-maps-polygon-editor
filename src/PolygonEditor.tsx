import React, { forwardRef, Fragment, useEffect, useImperativeHandle, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LatLng, MapEvent, Marker, Polygon } from 'react-native-maps';
import { debounce, getMidpointFromCoordinates, isPointInPolygon, MapPolygonExtendedProps, PolygonEditorRef } from './utils';

function PolygonEditor(props: { polygons: MapPolygonExtendedProps[], newPolygon?: MapPolygonExtendedProps, onPolygonChange?: (_i: number|null, _p: MapPolygonExtendedProps|null) => void, onPolygonCreate?: (_p: MapPolygonExtendedProps) => void, onPolygonRemove?: (_i: number|null) => void, onPolygonSelect?: (_i: number, _p: MapPolygonExtendedProps) => void, onPolygonUnselect?: (_i: number|null, _p: MapPolygonExtendedProps) => void, disabled?: boolean }, ref: any) {
    const [polygons, setPolygons] = useState<MapPolygonExtendedProps[]>(props.polygons);

    const [selectedKey, setSelectedKey] = useState<number|null>(null);
    const [selectedPolygon, setSelectedPolygon] = useState<MapPolygonExtendedProps|null>(null);
    const [selectedPolyline, setSelectedPolyline] = useState<MapPolygonExtendedProps|null>(null);

    const [selectedMarkerIndex, setSelectedMarkerIndex] = useState<number|null>(null);

    const [allowCreation, setAllowCreation] = useState<boolean>(false);
    const [newPolygon, setNewPolygon] = useState<MapPolygonExtendedProps|null>(null);

    const [disabled, setDisabled] = useState<boolean|undefined>(props.disabled ?? false);

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
        setSelectedMarkerIndex(null);
    }

    function selectPolygonByKey(key: any): void {
        if (selectedKey !== key) {
            setSelectedKey(key);
        }
    }

    function selectPolygonByIndex(index: number): void {
        const key = getKeyByIndex(index);
        if (selectedKey !== key) {
            setSelectedKey(key);
        }
    }

    function setCoordinate(coordinate: LatLng): void {
        if (!disabled) {
            if (isPointInPolygon(coordinate, getSelectedPolygonCoordinates())) {
                // console.log('isPointInPolygon');
            } else if (selectedPolygon) {
                if (selectedMarkerIndex === null) {
                    addCoordinateToSelectedPolygon(coordinate);
                } else {
                    unselectPolygon();
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
        } as MapPolygonExtendedProps;
    }

    function unselectPolygon() {
        if (selectedKey && selectedPolygon) {
            const index = getIndexByKey(selectedKey);
            props.onPolygonUnselect?.(index, selectedPolygon);
        }
    }

    function getIndexByKey(key: any): number|null {
        const position = polygons.findIndex((polygon: MapPolygonExtendedProps) => polygon.key === key);
        return position === -1 ? null : position;
    }

    function getPolygonByKey(key: any): MapPolygonExtendedProps {
        const index = getIndexByKey(key);
        return polygons[index ?? -1] || null;
    }

    function getKeyByIndex(index: number): any {
        const polygon = polygons[index];
        return polygon?.key || null;
    }

    function addCoordinateToPolygon(polygon: MapPolygonExtendedProps|null, coordinate: LatLng, coordIndex?: number): MapPolygonExtendedProps {
        const i = coordIndex ?? polygon?.coordinates.length ?? -1;
        const coordinates = [...polygon?.coordinates ?? []];
        coordinates.splice(i, 0, coordinate);
        return { ...polygon, coordinates } as MapPolygonExtendedProps;
    }

    function addCoordinateToSelectedPolygon(coordinate: LatLng, coordIndex?: number): void {
        const changedPolygon = addCoordinateToPolygon(selectedPolygon, coordinate, coordIndex);
        setSelectedPolygon(changedPolygon);
        setSelectedPolyline(changedPolygon);
        const index = getIndexByKey(changedPolygon.key);
        props.onPolygonChange?.(index, changedPolygon);
    }

    function addCoordinateToSelectedPolyline(coordinate: LatLng, coordIndex?: number): void {
        const changedPolygon = addCoordinateToPolygon(selectedPolygon, coordinate, coordIndex);
        setSelectedPolyline(changedPolygon);
    }

    function removeCoordinateFromSelectedPolygon(coordIndex: number): void {
        const index = getIndexByKey(selectedPolygon?.key);
        const coordinates = [...selectedPolygon?.coordinates ?? []];
        coordinates.splice(coordIndex, 1);
        setSelectedMarkerIndex(null);
        if (coordinates.length < 3) {
            setSelectedKey(null);
            setSelectedPolyline(null);
            props.onPolygonRemove?.(index);
        } else {
            const changedPolygon = { ...selectedPolygon, coordinates } as MapPolygonExtendedProps;
            setSelectedPolygon(changedPolygon);
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
                setSelectedMarkerIndex(null);
            }
        };
    }

    function changeSelectedPolylineCoordinate(coordIndex: number, coordinate: LatLng) {
        const coordinatesClone = [...selectedPolyline?.coordinates ?? []];
        coordinatesClone[coordIndex] = coordinate;
        const changedPolygon = { ...selectedPolyline, coordinates: coordinatesClone } as MapPolygonExtendedProps;
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
            if (selectedMarkerIndex === coordIndex) {
                removeCoordinateFromSelectedPolygon(coordIndex);
            } else {
                setSelectedMarkerIndex(coordIndex);
            }
        };
    }

    function isSelectedMarker(coordIndex: number): boolean {
        return selectedMarkerIndex === coordIndex;
    }

    function getMarkerSize(coordIndex: number): number {
        return isSelectedMarker(coordIndex) ? 15 : 8;
    }

    function renderCircleRemove(): JSX.Element {
        return (
                <View style={styles.removeMarkerContainer}>
                    <Text style={styles.removeMarkerText}>x</Text>
                </View>
        );
    }

    function renderCircle(coordIndex: number): JSX.Element {
        return (
            <View style={[styles.circleMarker, { borderColor: selectedPolygon?.strokeColor, padding: getMarkerSize(coordIndex) }]}></View>
        );
    }

    function getSelectedPolygonMiddleCoordinates(): LatLng[] {
        const coordinates = selectedPolygon?.coordinates ?? [];
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
                {selectedPolygon.coordinates.map((coordinate: any, coordIndex: number) => (
                    <Marker key={coordIndex} identifier={coordIndex.toString()} coordinate={coordinate} anchor={{ x: .5, y: .5 }} draggable={!isSelectedMarker(coordIndex)} onDragStart={onMarkerDragStart(coordIndex)} onDrag={onMarkerDrag(coordIndex)} onDragEnd={onMarkerDragEnd(coordIndex)} onPress={onMarkerPress(coordIndex)} tracksViewChanges={true} >
                        {isSelectedMarker(coordIndex) && (
                            renderCircleRemove()
                        )}
                        {!isSelectedMarker(coordIndex) && (
                            renderCircle(coordIndex)
                        )}
                    </Marker>
                ))}
            </Fragment>
        );
    }

    function renderPolygons(): JSX.Element {
        return (
            <Fragment>
                {polygons.map((polygonProps: any, index: number) => (
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
