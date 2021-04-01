import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Button, StyleSheet, View } from 'react-native';
import MapView, { MapEvent } from 'react-native-maps';
import { area1, area2 } from './area';
import PolygonEditor, { MapPolygonExtendedProps, PolygonEditorRef } from './src/PolygonEditor';

function getRandomNumber(min: number, max: number): number {
  return (Math.random() * max) + min;
}

function getRandomColors(): string[] {
  const red = Math.floor(getRandomNumber(0, 255));
  const green = Math.floor(getRandomNumber(0, 255));
  const blue = Math.floor(getRandomNumber(0, 255));
  return [`rgb(${red}, ${green}, ${blue})`, `rgba(${red}, ${green}, ${blue}, 0.2)`];
}

const [strokeColor1, fillColor1] = getRandomColors();
const polygon1 = {
  coordinates: area1,
  strokeWidth: 2,
  strokeColor: strokeColor1,
  fillColor: fillColor1,
};

const [strokeColor2, fillColor2] = getRandomColors();
const polygon2 = {
  coordinates: area2,
  strokeWidth: 2,
  strokeColor: strokeColor2,
  fillColor: fillColor2,
};

const [strokeColor3, fillColor3] = getRandomColors();
const newPolygon = {
  coordinates: [],
  strokeWidth: 2,
  strokeColor: strokeColor3,
  fillColor: fillColor3,
};

export default function App() {
  const [polygons, setPolygons] = useState([]);
  const mapRef = useRef(null);
  const polygonEditorRef = useRef<PolygonEditorRef>(null);

  useEffect(() => {
    setPolygons([polygon1, polygon2]);
  }, []);

  function onLayoutReady() {
    mapRef.current?.fitToCoordinates(polygons[0]?.coordinates, {
      edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
      animated: true,
    });
  }

  function clickOnMap({ nativeEvent: { coordinate } }: MapEvent) {
    polygonEditorRef.current?.setCoordinate(coordinate);
  }

  function createNewPolygon() {
    polygonEditorRef.current?.startPolygon();
  }

  function onPolygonChange(index: number, polygon: MapPolygonExtendedProps) {
    console.log('onPolygonChange');
    const polygonsClone = [...polygons];
    polygonsClone[index] = polygon;
    setPolygons(polygonsClone);
  }

  function onPolygonCreate(polygon: MapPolygonExtendedProps) {
    console.log('onPolygonCreate');
    const polygonsClone = [...polygons, polygon];
    setPolygons(polygonsClone);
  }

  function onPolygonRemove(index: number) {
    console.log('onPolygonRemove');
    const polygonsClone = [...polygons];
    polygonsClone.splice(index, 1);
    setPolygons(polygonsClone);
  }

  return (
    <View style={styles.container}>
      <StatusBar style='auto' />
      <MapView ref={mapRef} onPress={clickOnMap} style={styles.mapContainer} onLayout={onLayoutReady}>
        <PolygonEditor ref={polygonEditorRef} newPolygon={newPolygon} polygons={polygons} onPolygonChange={onPolygonChange} onPolygonCreate={onPolygonCreate} onPolygonRemove={onPolygonRemove} />
      </MapView>
      <View style={styles.actionsContaiener}>
        <Button onPress={createNewPolygon} title='New polygon' />
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
  },
});
