import {
    getRandomPolygonColors,
    MapPolygonExtendedProps,
    PolygonEditor,
    PolygonEditorRef,
} from '@siposdani87/expo-maps-polygon-editor';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, StyleSheet, View } from 'react-native';
import MapView, { MapPressEvent } from 'react-native-maps';
import { area0, area1 } from './areas';

const [strokeColor0, fillColor0] = getRandomPolygonColors();
const polygon0: MapPolygonExtendedProps = {
    key: 'key_0',
    coordinates: area0,
    strokeWidth: 2,
    strokeColor: strokeColor0,
    fillColor: fillColor0,
};

const [strokeColor1, fillColor1] = getRandomPolygonColors();
const polygon1: MapPolygonExtendedProps = {
    key: 'key_1',
    coordinates: area1,
    strokeWidth: 2,
    strokeColor: strokeColor1,
    fillColor: fillColor1,
};

const [strokeColor, fillColor] = getRandomPolygonColors();
const newPolygon: MapPolygonExtendedProps = {
    key: 'NEW',
    coordinates: [],
    strokeWidth: 2,
    strokeColor,
    fillColor,
};

export default function App() {
    const [polygons, setPolygons] = useState<MapPolygonExtendedProps[]>([]);
    const mapRef = useRef<MapView>(null);
    const polygonEditorRef = useRef<PolygonEditorRef>(null);

    const onMapReady = (): void => {
        fitToCoordinates();
    };

    const fitToCoordinates = (): void => {
        const coordinates = polygons
            .map((polygon) => polygon.coordinates)
            .flat();
        mapRef.current?.fitToCoordinates(coordinates, {
            edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
            animated: true,
        });
    };

    const clickOnMap = ({ nativeEvent: { coordinate } }: MapPressEvent): void => {
        polygonEditorRef.current?.setCoordinate(coordinate);
    };

    const showNewPolygonInfo = (): void => {
        Alert.alert(
            'New polygon',
            'Click on the map 3 times to create starter polygon!',
            [
                {
                    text: 'Cancel',
                    onPress: () => {},
                    style: 'cancel',
                },
                { text: 'OK', onPress: createNewPolygon },
            ],
        );
    };

    const createNewPolygon = (): void => {
        const [strokeColor, fillColor] = getRandomPolygonColors();
        newPolygon.strokeColor = strokeColor;
        newPolygon.fillColor = fillColor;
        polygonEditorRef.current?.startPolygon();
    };

    const selectPolygonByIndex = (index: number): void => {
        polygonEditorRef.current?.selectPolygonByIndex(index);
    };

    const selectPolygonByKey = (key: string): void => {
        polygonEditorRef.current?.selectPolygonByKey(key);
    };

    const resetAll = (): void => {
        polygonEditorRef.current?.resetAll();
    };

    const loadPolygons = (): void => {
        setPolygons([polygon0, polygon1]);
    };

    const reloadPolygons = (): void => {
        resetAll();
        loadPolygons();
    };

    const onPolygonChange = (
        index: number,
        polygon: MapPolygonExtendedProps,
    ): void => {
        console.log('onPolygonChange', index);
        const polygonsClone = [...polygons];
        polygonsClone[index] = polygon;
        setPolygons(polygonsClone);
    };

    const onPolygonCreate = (polygon: MapPolygonExtendedProps): void => {
        console.log('onPolygonCreate', newPolygon.key);
        const newKey = `key_${polygons.length + 1}`;
        const polygonClone = { ...polygon, key: newKey };
        const polygonsClone = [...polygons, polygonClone];
        setPolygons(polygonsClone);
        polygonEditorRef.current?.selectPolygonByKey(newKey);
    };

    const onPolygonRemove = (index: number): void => {
        console.log('onPolygonRemove', index);
        const polygonsClone = [...polygons];
        polygonsClone.splice(index, 1);
        setPolygons(polygonsClone);
    };

    const onPolygonSelect = (
        index: number,
        polygon: MapPolygonExtendedProps,
    ): void => {
        console.log('onPolygonSelect', index, polygon.key);
    };

    const onPolygonUnselect = (
        index: number,
        polygon: MapPolygonExtendedProps,
    ): void => {
        console.log('onPolygonUnselect', index, polygon.key);
    };

    useEffect(() => {
        selectPolygonByIndex(0);

        setTimeout(() => {
            selectPolygonByKey('key_1');
        }, 500);
    }, []);

    useEffect(() => {
        fitToCoordinates();
    }, [polygons]);

    useEffect(() => {
        setTimeout(() => {
            loadPolygons();
        }, 1000);
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
            <MapView
                ref={mapRef}
                onPress={clickOnMap}
                style={styles.mapContainer}
                onMapReady={onMapReady}
            >
                <PolygonEditor
                    ref={polygonEditorRef}
                    newPolygon={newPolygon}
                    polygons={polygons}
                    onPolygonChange={onPolygonChange}
                    onPolygonCreate={onPolygonCreate}
                    onPolygonRemove={onPolygonRemove}
                    onPolygonSelect={onPolygonSelect}
                    onPolygonUnselect={onPolygonUnselect}
                />
            </MapView>
            <View style={styles.actionsContaiener}>
                <Button onPress={showNewPolygonInfo} title="New polygon" />
                <Button
                    onPress={() => selectPolygonByKey('key_0')}
                    title="Select key_0"
                />
                <Button
                    onPress={() => selectPolygonByIndex(1)}
                    title="Select 2nd"
                />
                <Button onPress={resetAll} title="Reset" />
                <Button onPress={reloadPolygons} title="Reload polygons" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mapContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    actionsContaiener: {
        position: 'absolute',
        bottom: 50,
        left: 10,
        backgroundColor: '#fff',
        padding: 5,
        borderRadius: 5,
    },
});
