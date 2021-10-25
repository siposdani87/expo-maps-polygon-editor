import { getRandomPolygonColors, MapPolygonExtendedProps, PolygonEditor, PolygonEditorRef } from '@siposdani87/expo-maps-polygon-editor/src';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Button, StyleSheet, View } from 'react-native';
import MapView, { MapEvent } from 'react-native-maps';
import { area0, area1 } from './areas';

const [strokeColor0, fillColor0] = getRandomPolygonColors();
const polygon0 = {
  key: 'key_0',
  coordinates: area0,
  strokeWidth: 2,
  strokeColor: strokeColor0,
  fillColor: fillColor0,
};

const [strokeColor1, fillColor1] = getRandomPolygonColors();
const polygon1 = {
  key: 'key_1',
  coordinates: area1,
  strokeWidth: 2,
  strokeColor: strokeColor1,
  fillColor: fillColor1,
};

const [strokeColor, fillColor] = getRandomPolygonColors();
const newPolygon = {
  key: 'NEW',
  coordinates: [],
  strokeWidth: 2,
  strokeColor,
  fillColor,
};

export default function App() {
  const [polygons, setPolygons] = useState([]);
  const mapRef = useRef(null);
  const polygonEditorRef = useRef<PolygonEditorRef>(null);

  useEffect(() => {
    selectPolygonByKey('key_1');
  }, []);

  useEffect(() => {
    fitToCoordinates();
  }, [polygons]);

  useEffect(() => {
    setTimeout(() => {
      loadPolygons();
    }, 1000);
  }, []);

  function onLayoutReady() {
    fitToCoordinates();
  }

  function fitToCoordinates() {
    const coordinates = polygons.map((p) => p.coordinates).flat();
    mapRef.current?.fitToCoordinates(coordinates, {
      edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
      animated: true,
    });
  }

  function clickOnMap({ nativeEvent: { coordinate } }: MapEvent) {
    polygonEditorRef.current?.setCoordinate(coordinate);
  }

  function createNewPolygon() {
    const [strokeColor, fillColor] = getRandomPolygonColors();
    newPolygon.strokeColor = strokeColor;
    newPolygon.fillColor = fillColor;
    polygonEditorRef.current?.startPolygon();
  }

  function selectPolygonByIndex(index: number) {
    polygonEditorRef.current?.selectPolygonByIndex(index);
  }

  function selectPolygonByKey(key: any) {
    polygonEditorRef.current?.selectPolygonByKey(key);
  }

  function resetAll() {
    polygonEditorRef.current?.resetAll();
  }

  function loadPolygons() {
    setPolygons([polygon0, polygon1]);
  }

  function onPolygonChange(index: number, polygon: MapPolygonExtendedProps) {
    console.log('onPolygonChange', index);
    const polygonsClone = [...polygons];
    polygonsClone[index] = polygon;
    setPolygons(polygonsClone);
  }

  function onPolygonCreate(polygon: MapPolygonExtendedProps) {
    console.log('onPolygonCreate');
    const newKey = `key_${polygons.length + 1}`;
    const polygonClone = { ...polygon, key: newKey };
    const polygonsClone = [...polygons, polygonClone];
    setPolygons(polygonsClone);
    polygonEditorRef.current?.selectPolygonByKey(newKey);
  }

  function onPolygonRemove(index: number) {
    console.log('onPolygonRemove', index);
    const polygonsClone = [...polygons];
    polygonsClone.splice(index, 1);
    setPolygons(polygonsClone);
  }

  function onPolygonSelect(index: number, polygon: MapPolygonExtendedProps) {
    console.log('onPolygonSelect', index, polygon.key);
  }

  function onPolygonUnselect(index: number, polygon: MapPolygonExtendedProps) {
    console.log('onPolygonUnselect', index, polygon.key);
  }

  return (
    <View style={styles.container}>
      <StatusBar style='auto' />
      <MapView ref={mapRef} onPress={clickOnMap} style={styles.mapContainer} onLayout={onLayoutReady}>
       <PolygonEditor ref={polygonEditorRef} newPolygon={newPolygon} polygons={polygons} onPolygonChange={onPolygonChange} onPolygonCreate={onPolygonCreate} onPolygonRemove={onPolygonRemove} onPolygonSelect={onPolygonSelect} onPolygonUnselect={onPolygonUnselect} />
      </MapView>
      <View style={styles.actionsContaiener}>
        <Button onPress={createNewPolygon} title='New polygon' />
        <Button onPress={() => selectPolygonByKey('key_0')} title='Select key_0' />
        <Button onPress={() => selectPolygonByIndex(1)} title='Select 2nd' />
        <Button onPress={resetAll} title='Reset' />
        <Button onPress={loadPolygons} title='Reload polygons' />
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
