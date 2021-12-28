# @siposdani87/expo-maps-polygon-editor

[![Version](https://img.shields.io/npm/v/@siposdani87/expo-maps-polygon-editor.svg?style=square)](https://www.npmjs.com/package/@siposdani87/expo-maps-polygon-editor)
[![Download](https://img.shields.io/npm/dt/@siposdani87/expo-maps-polygon-editor.svg?style=square)](https://www.npmjs.com/package/@siposdani87/expo-maps-polygon-editor)
[![License](https://img.shields.io/npm/l/@siposdani87/expo-maps-polygon-editor.svg?style=square)](./LICENSE)

<a href="https://www.buymeacoffee.com/siposdani87" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-blue.png" alt="Buy Me A Coffee" style="width: 150px !important;"></a>

This multi polygon editor written in TypeScript for the React Native Maps component. This component allows you to select, create, or modify areas on Apple Maps and Google Maps. You can edit multiple polygons at the same time.

## Getting Started

### Installing

```
npm install @siposdani87/expo-maps-polygon-editor

# Expo
expo install @siposdani87/expo-maps-polygon-editor
```

### Basic Usage

Check example directory for more samples and options.

```js
import { PolygonEditor, getRandomPolygonColors, PolygonEditorRef, MapPolygonExtendedProps } from '@siposdani87/expo-maps-polygon-editor';

const [strokeColor, fillColor] = getRandomPolygonColors();
const polygons: MapPolygonExtendedProps[] = [{
    key: 'key_0',
    coordinates: [
        {
            latitude: 47.64623435880296,
            longitude: 17.488861083984375,
        },
        {
            latitude: 47.69155620579073,
            longitude: 17.514411988020868,
        },
        {
            latitude: 47.65998584885824,
            longitude: 17.54299213146342,
        },
    ],
    strokeWidth: 2,
    strokeColor,
    fillColor,
}];

export const PolygonEditorComponents = () => {
    const polygonEditorRef = useRef<PolygonEditorRef>(null);

    return (
        <MapView
            style={styles.mapContainer}
        >
            <PolygonEditor
                ref={polygonEditorRef}
                polygons={polygons}
            />
        </MapView>
    );
};

const styles = StyleSheet.create({
    mapContainer: {
        ...StyleSheet.absoluteFillObject,
    },
});

```

## Props

### PolygonEditor

| Prop              | Type                                                      | Description |
| ----------------- | --------------------------------------------------------- | ----------- |
| polygons *        | MapPolygonExtendedProps[]                                 | |
| onPolygonChange   | (index: number, polygon: MapPolygonExtendedProps) => void | |
| onPolygonCreate   | (polygon: MapPolygonExtendedProps) => void                | |
| onPolygonRemove   | (index: number) => void                                   | |
| onPolygonSelect   | (index: number, polygon: MapPolygonExtendedProps) => void | |
| onPolygonUnselect | (index: number, polygon: MapPolygonExtendedProps) => void | |
| disabled          | boolean                                                   | Disable editing on component |

## Preview
![Overview](https://raw.githubusercontent.com/siposdani87/expo-maps-polygon-editor/master/images/expo-maps-polygon-editor.png)

## Bugs or Requests

If you encounter any problems feel free to open an [issue](https://github.com/siposdani87/expo-maps-polygon-editor/issues/new?template=bug_report.md). If you feel the library is missing a feature, please raise a [ticket](https://github.com/siposdani87/expo-maps-polygon-editor/issues/new?template=feature_request.md). Pull request are also welcome.
