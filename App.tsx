import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Button, StyleSheet, View } from 'react-native';
import MapView, { MapEvent } from 'react-native-maps';
import { area1, area2 } from './areas';
import { getRandomColors, MapPolygonExtendedProps, PolygonEditor, PolygonEditorRef } from './src';

const [strokeColor1, fillColor1] = getRandomColors();
const polygon1 = {
  key: 'key_1',
  coordinates: area1,
  strokeWidth: 2,
  strokeColor: strokeColor1,
  fillColor: fillColor1,
};

const [strokeColor2, fillColor2] = getRandomColors();
const polygon2 = {
  key: 'key_2',
  coordinates: area2,
  strokeWidth: 2,
  strokeColor: strokeColor2,
  fillColor: fillColor2,
};

const [strokeColor, fillColor] = getRandomColors();
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
    selectPolygonByKey('key_2');
  }, []);

  useEffect(() => {
    fitToCoordinates();
  }, [polygons]);

  useEffect(() => {
    setTimeout(() => {
      setPolygons([polygon1, polygon2]);
    }, 1000);
  }, []);

  function onLayoutReady() {
    fitToCoordinates();
  }

  function fitToCoordinates() {
    mapRef.current?.fitToCoordinates(polygons[0]?.coordinates, {
      edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
      animated: true,
    });
  }

  function clickOnMap({ nativeEvent: { coordinate } }: MapEvent) {
    polygonEditorRef.current?.setCoordinate(coordinate);
  }

  function createNewPolygon() {
    const [strokeColor, fillColor] = getRandomColors();
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

  function onPolygonChange(index: number, polygon: MapPolygonExtendedProps) {
    console.log('onPolygonChange', index);
    const polygonsClone = [...polygons];
    polygonsClone[index] = polygon;
    setPolygons(polygonsClone);
  }

  function onPolygonCreate(polygon: MapPolygonExtendedProps) {
    console.log('onPolygonCreate');
    const key = `key_${polygons.length + 1}`;
    const polygonClone = { ...polygon, key };
    const polygonsClone = [...polygons, polygonClone];
    setPolygons(polygonsClone);
    polygonEditorRef.current?.selectPolygonByKey(key);
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

  return (
    <View style={styles.container}>
      <StatusBar style='auto' />
      <MapView ref={mapRef} onPress={clickOnMap} style={styles.mapContainer} onLayout={onLayoutReady}>
        <PolygonEditor ref={polygonEditorRef} newPolygon={newPolygon} polygons={polygons} onPolygonChange={onPolygonChange} onPolygonCreate={onPolygonCreate} onPolygonRemove={onPolygonRemove} onPolygonSelect={onPolygonSelect} />
      </MapView>
      <View style={styles.actionsContaiener}>
        <Button onPress={createNewPolygon} title='New polygon' />
        <Button onPress={() => selectPolygonByIndex(1)} title='Select 2nd' />
        <Button onPress={() => selectPolygonByKey('key_1')} title='Select key_1' />
        <Button onPress={resetAll} title='Reset' />
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
