import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useState,
} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LatLng, MapEvent, Marker, Polygon } from 'react-native-maps';
import {
    debounce,
    getMidpointFromCoordinates,
    isPointInPolygon,
    MapPolygonExtendedProps,
    PolygonEditorRef,
    PolygonKey,
} from './utils';

function PolygonEditor(
    props: {
        polygons: MapPolygonExtendedProps[];
        newPolygon?: MapPolygonExtendedProps;
        onPolygonChange?: (
            _index: number,
            _polygon: MapPolygonExtendedProps,
        ) => void;
        onPolygonCreate?: (_polygon: MapPolygonExtendedProps) => void;
        onPolygonRemove?: (_index: number) => void;
        onPolygonSelect?: (
            _index: number,
            _polygon: MapPolygonExtendedProps,
        ) => void;
        onPolygonUnselect?: (
            _index: number,
            _polygon: MapPolygonExtendedProps,
        ) => void;
        disabled?: boolean;
    },
    ref: any,
) {
    const [polygons, setPolygons] = useState<MapPolygonExtendedProps[]>(
        props.polygons,
    );

    const [selectedKey, setSelectedKey] = useState<PolygonKey>(null);
    const [selectedPolygon, setSelectedPolygon] =
        useState<MapPolygonExtendedProps | null>(null);
    const [selectedPolyline, setSelectedPolyline] =
        useState<MapPolygonExtendedProps | null>(null);
    const [selectedMarkerIndex, setSelectedMarkerIndex] = useState<
        number | null
    >(null);
    const [newPolygon, setNewPolygon] =
        useState<MapPolygonExtendedProps | null>(null);

    const [allowCreation, setAllowCreation] = useState<boolean>(false);
    const [disabled, setDisabled] = useState<boolean>(props.disabled ?? false);

    const init = (): PolygonEditorRef => {
        return {
            setCoordinate,
            startPolygon,
            resetAll,
            selectPolygonByKey,
            selectPolygonByIndex,
        };
    };

    const startPolygon = (): void => {
        resetSelection();
        setNewPolygon(null);
        setAllowCreation(true);
    };

    const resetSelection = useCallback((): void => {
        setSelectedKey(null);
        setSelectedPolyline(null);
        setSelectedMarkerIndex(null);
    }, []);

    const resetAll = useCallback((): void => {
        setAllowCreation(false);
        setNewPolygon(null);
        resetSelection();
    }, [resetSelection]);

    const selectPolygonByKey = (key: PolygonKey): void => {
        if (selectedKey !== key) {
            setSelectedKey(key);
        }
    };

    const selectPolygonByIndex = (index: number): void => {
        const key = getKeyByIndex(index);
        if (selectedKey !== key) {
            setSelectedKey(key);
        }
    };

    const setCoordinate = (coordinate: LatLng): void => {
        if (disabled) {
            return;
        }
        if (isPointInPolygon(coordinate, getSelectedPolygonCoordinates())) {
            // console.log('isPointInPolygon');
        } else if (selectedPolygon) {
            if (selectedMarkerIndex === null) {
                addCoordinateToSelectedPolygon(coordinate);
            } else {
                unselectPolygon();
                resetSelection();
            }
        } else {
            buildNewPolygon(coordinate);
        }
    };

    const buildNewPolygon = (coordinate: LatLng): void => {
        if (!allowCreation || !props.newPolygon) {
            return;
        }
        const polygon = newPolygon ?? {
            ...props.newPolygon,
            coordinates: [],
        };
        const changedPolygon = {
            ...polygon,
            coordinates: [...polygon.coordinates, coordinate],
        };
        setNewPolygon(changedPolygon);
        if (changedPolygon.coordinates.length === 3) {
            setAllowCreation(false);
            setSelectedKey(changedPolygon.key);
            props.onPolygonCreate?.(changedPolygon);
        }
    };

    const unselectPolygon = () => {
        if (selectedKey && selectedPolygon) {
            const index = getIndexByKey(selectedKey);
            if (index != null) {
                props.onPolygonUnselect?.(index, selectedPolygon);
            }
        }
    };

    const getIndexByKey = useCallback(
        (key: PolygonKey): number | null => {
            const index = polygons.findIndex((polygon) => polygon.key === key);
            return index === -1 ? null : index;
        },
        [polygons],
    );

    const getPolygonByKey = useCallback(
        (key: PolygonKey): MapPolygonExtendedProps | null => {
            const index = getIndexByKey(key);
            if (index != null) {
                return polygons[index];
            }
            return null;
        },
        [getIndexByKey, polygons],
    );

    const getKeyByIndex = (index: number): PolygonKey => {
        const polygon = polygons[index];
        return polygon?.key;
    };

    const addCoordinateToPolygon = (
        polygon: MapPolygonExtendedProps,
        coordinate: LatLng,
        coordIndex?: number,
    ): MapPolygonExtendedProps => {
        const i = coordIndex ?? polygon.coordinates.length ?? -1;
        const coordinates = [...polygon.coordinates];
        coordinates.splice(i, 0, coordinate);
        return { ...polygon, coordinates };
    };

    const addCoordinateToSelectedPolygon = (
        coordinate: LatLng,
        coordIndex?: number,
    ): void => {
        if (!selectedPolygon) {
            return;
        }
        const changedPolygon = addCoordinateToPolygon(
            selectedPolygon,
            coordinate,
            coordIndex,
        );
        setSelectedPolygon(changedPolygon);
        setSelectedPolyline(changedPolygon);
        const index = getIndexByKey(changedPolygon.key);
        if (index != null) {
            props.onPolygonChange?.(index, changedPolygon);
        }
    };

    const addCoordinateToSelectedPolyline = (
        coordinate: LatLng,
        coordIndex?: number,
    ): void => {
        if (!selectedPolygon) {
            return;
        }
        const changedPolygon = addCoordinateToPolygon(
            selectedPolygon,
            coordinate,
            coordIndex,
        );
        setSelectedPolyline(changedPolygon);
    };

    const removeCoordinateFromSelectedPolygon = (coordIndex: number): void => {
        if (!selectedPolygon) {
            return;
        }
        const index = getIndexByKey(selectedPolygon.key);
        const coordinates = [...selectedPolygon.coordinates];
        coordinates.splice(coordIndex, 1);
        setSelectedMarkerIndex(null);
        if (coordinates.length < 3) {
            setSelectedKey(null);
            setSelectedPolyline(null);
            if (index != null) {
                props.onPolygonRemove?.(index);
            }
        } else if (selectedPolygon) {
            const changedPolygon = {
                ...selectedPolygon,
                coordinates,
            };
            setSelectedPolygon(changedPolygon);
            setSelectedPolyline(changedPolygon);
            if (index != null) {
                props.onPolygonChange?.(index, changedPolygon);
            }
        }
    };

    const getSelectedPolygonCoordinates = (): LatLng[] => {
        return selectedPolygon?.coordinates ?? [];
    };

    const onPolygonClick = (
        index: number,
        polygon: MapPolygonExtendedProps,
    ) => {
        return (e: MapEvent) => {
            e.stopPropagation();
            if (disabled) {
                return;
            }
            if (selectedKey === polygon.key) {
                setSelectedKey(null);
                props.onPolygonSelect?.(index, polygon);
            } else {
                setSelectedKey(polygon.key);
            }
            setSelectedMarkerIndex(null);
        };
    };

    const changeSelectedPolylineCoordinate = (
        coordIndex: number,
        coordinate: LatLng,
    ): void => {
        if (!selectedPolyline) {
            return;
        }
        const coordinatesClone = [...selectedPolyline.coordinates];
        coordinatesClone[coordIndex] = coordinate;
        const changedPolygon = {
            ...selectedPolyline,
            coordinates: coordinatesClone,
        };
        setSelectedPolyline(changedPolygon);
    };

    const synchronizePolylineToPolygon = (): void => {
        if (!selectedPolyline) {
            return;
        }
        setSelectedPolygon(selectedPolyline);
        setSelectedPolyline(null);
        const index = getIndexByKey(selectedPolyline.key);
        if (index != null) {
            props.onPolygonChange?.(index, selectedPolyline);
        }
    };

    const onSubMarkerDragStart = (coordIndex: number) => {
        return ({ nativeEvent: { coordinate } }: MapEvent) => {
            addCoordinateToSelectedPolyline(coordinate, coordIndex);
        };
    };

    const onMarkerDragStart = (_coordIndex: number) => {
        return (_e: MapEvent) => {
            setSelectedPolyline(selectedPolygon);
        };
    };

    const onMarkerDrag = (coordIndex: number) => {
        return ({ nativeEvent: { coordinate } }: MapEvent) => {
            debounce(() => {
                changeSelectedPolylineCoordinate(coordIndex, coordinate);
            }, 25);
        };
    };

    const onMarkerDragEnd = (_coordIndex: number) => {
        return (_e: MapEvent) => {
            debounce(() => {
                synchronizePolylineToPolygon();
            }, 25);
        };
    };

    const onMarkerPress = (coordIndex: number) => {
        return (e: MapEvent) => {
            e.stopPropagation();
            if (selectedMarkerIndex === coordIndex) {
                removeCoordinateFromSelectedPolygon(coordIndex);
            } else {
                setSelectedMarkerIndex(coordIndex);
            }
        };
    };

    const isSelectedMarker = (coordIndex: number): boolean => {
        return selectedMarkerIndex === coordIndex;
    };

    const getMarkerSize = (coordIndex: number): number => {
        return isSelectedMarker(coordIndex) ? 15 : 8;
    };

    const renderCircleRemove = (): JSX.Element => {
        return (
            <View style={styles.removeMarkerContainer}>
                <Text style={styles.removeMarkerText}>x</Text>
            </View>
        );
    };

    const renderCircle = (coordIndex: number): JSX.Element => {
        return (
            <View
                style={[
                    styles.circleMarker,
                    {
                        borderColor: selectedPolygon?.strokeColor,
                        padding: getMarkerSize(coordIndex),
                    },
                ]}
            />
        );
    };

    const getSelectedPolygonMiddleCoordinates = (): LatLng[] => {
        const coordinates = getSelectedPolygonCoordinates();
        const middleCoordinates = [
            getMidpointFromCoordinates(
                coordinates[0],
                coordinates[coordinates.length - 1],
            ),
        ];
        for (let i = 1; i < coordinates.length; i++) {
            const coordinate = getMidpointFromCoordinates(
                coordinates[i - 1],
                coordinates[i],
            );
            middleCoordinates.push(coordinate);
        }
        return middleCoordinates;
    };

    const renderSubCircleMarkers = (): JSX.Element | void => {
        if (selectedPolygon === null || disabled) {
            return;
        }
        const coordinates = getSelectedPolygonMiddleCoordinates();
        return (
            <>
                {coordinates.map((coordinate, coordIndex) => (
                    <Marker
                        key={coordIndex}
                        identifier={coordIndex.toString()}
                        coordinate={coordinate}
                        anchor={{ x: 0.5, y: 0.5 }}
                        draggable={true}
                        onDragStart={onSubMarkerDragStart(coordIndex)}
                        onDrag={onMarkerDrag(coordIndex)}
                        onDragEnd={onMarkerDragEnd(coordIndex)}
                        tracksViewChanges={true}
                    >
                        <View
                            style={[
                                styles.subCircleMarker,
                                {
                                    borderColor: selectedPolygon.strokeColor,
                                    padding: getMarkerSize(Infinity),
                                },
                            ]}
                        />
                    </Marker>
                ))}
            </>
        );
    };

    const renderCircleMarkers = (): JSX.Element | void => {
        if (selectedPolygon === null || disabled) {
            return;
        }
        return (
            <>
                {selectedPolygon.coordinates.map(
                    (coordinate: LatLng, coordIndex: number) => (
                        <Marker
                            key={coordIndex}
                            identifier={coordIndex.toString()}
                            coordinate={coordinate}
                            anchor={{ x: 0.5, y: 0.5 }}
                            draggable={!isSelectedMarker(coordIndex)}
                            onDragStart={onMarkerDragStart(coordIndex)}
                            onDrag={onMarkerDrag(coordIndex)}
                            onDragEnd={onMarkerDragEnd(coordIndex)}
                            onPress={onMarkerPress(coordIndex)}
                            tracksViewChanges={true}
                        >
                            {isSelectedMarker(coordIndex) &&
                                renderCircleRemove()}
                            {!isSelectedMarker(coordIndex) &&
                                renderCircle(coordIndex)}
                        </Marker>
                    ),
                )}
            </>
        );
    };

    const renderPolygons = (): JSX.Element => {
        return (
            <>
                {polygons.map((polygon, index) => (
                    <Polygon
                        {...polygon}
                        onPress={onPolygonClick(index, polygon)}
                        tappable={true}
                    />
                ))}
            </>
        );
    };

    const renderPolyline = (): JSX.Element | void => {
        if (selectedPolyline === null) {
            return;
        }
        return <Polygon {...selectedPolyline} fillColor="transparent" />;
    };

    useImperativeHandle<any, PolygonEditorRef>(ref, init);

    useEffect(() => {
        setPolygons(props.polygons);
    }, [props.polygons]);

    useEffect(() => {
        setDisabled(props.disabled ?? false);
        if (props.disabled) {
            resetAll();
        }
    }, [props.disabled, resetAll]);

    useEffect(() => {
        const polygon =
            selectedKey != null ? getPolygonByKey(selectedKey) : null;
        if (selectedPolygon?.key !== polygon?.key) {
            setSelectedPolygon(polygon);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getPolygonByKey, polygons, selectedKey]);

    useEffect(() => {
        const key = selectedPolygon?.key ?? null;
        if (selectedKey !== key) {
            setSelectedKey(key);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPolygon]);

    return (
        <>
            {renderPolygons()}
            {renderPolyline()}
            {renderSubCircleMarkers()}
            {renderCircleMarkers()}
        </>
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
