import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import {
    LatLng,
    MarkerDragEvent,
    MarkerDragStartEndEvent,
    MarkerPressEvent,
} from 'react-native-maps';
import {
    useNewPolygon,
    usePolygonFinder,
    useSelectedKey,
    useDisabled,
    useSelectedMarker,
} from './hooks';
import { isPointInPolygon } from './lib/geospatials';
import { MapPolygonExtendedProps, PolygonEditorRef } from './lib/types';
import { addCoordinateToPolygon } from './lib/helpers';
import {
    CircleMarkers,
    SubCircleMarkers,
    Polyline,
    Polygons,
} from './components';
import { PolygonPressEvent } from './components/Polygons';

export const PolygonEditor = forwardRef(
    (
        props: {
            polygons: MapPolygonExtendedProps[];
            newPolygon?: MapPolygonExtendedProps;
            onPolygonCreate?: (polygon: MapPolygonExtendedProps) => void;
            onPolygonChange?: (
                index: number,
                polygon: MapPolygonExtendedProps,
            ) => void;
            onPolygonRemove?: (index: number) => void;
            onPolygonSelect?: (
                index: number,
                polygon: MapPolygonExtendedProps,
            ) => void;
            onPolygonUnselect?: (
                index: number,
                polygon: MapPolygonExtendedProps,
            ) => void;
            disabled?: boolean;
        },
        ref: React.Ref<PolygonEditorRef>,
    ) => {
        const {
            polygons,
            newPolygon,
            onPolygonCreate,
            onPolygonChange,
            onPolygonRemove,
            onPolygonSelect,
            onPolygonUnselect,
            disabled: disabledProp,
        } = props;

        const [selectedPolygon, setSelectedPolygon] =
            useState<MapPolygonExtendedProps | null>(null);
        const [selectedPolyline, setSelectedPolyline] =
            useState<MapPolygonExtendedProps | null>(null);
        const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
            null,
        );
        const selectedPolygonRef = useRef<MapPolygonExtendedProps | null>(null);
        const selectedPolylineRef = useRef<MapPolygonExtendedProps | null>(
            null,
        );
        selectedPolygonRef.current = selectedPolygon;
        selectedPolylineRef.current = selectedPolyline;

        const {
            selectedMarkerIndex,
            setSelectedMarkerIndex,
            isSelectedMarker,
        } = useSelectedMarker();

        const disabled = useDisabled(() => {
            resetAll();
        }, disabledProp);

        const { getIndexByKey, getPolygonByKey } = usePolygonFinder(polygons);

        const [
            selectedKey,
            setSelectedKey,
            selectPolygonByKey,
            selectPolygonByIndex,
        ] = useSelectedKey(polygons);

        const [startNewPolygon, resetNewPolygon, buildNewPolygon] =
            useNewPolygon(newPolygon, (polygon) => {
                setSelectedKey(polygon.key);
                onPolygonCreate?.(polygon);
            });

        const init = (): PolygonEditorRef => {
            return {
                setCoordinate,
                startPolygon,
                resetAll,
                selectPolygonByKey,
                selectPolygonByIndex,
            };
        };

        const resetSelection = useCallback((): void => {
            setSelectedKey(null);
            setSelectedPolyline(null);
            setSelectedMarkerIndex(null);
        }, [setSelectedKey, setSelectedMarkerIndex]);

        const startPolygon = useCallback((): void => {
            resetSelection();
            startNewPolygon();
        }, [startNewPolygon, resetSelection]);

        const resetAll = useCallback((): void => {
            resetNewPolygon();
            resetSelection();
        }, [resetNewPolygon, resetSelection]);

        const unselectPolygon = (): void => {
            if (selectedKey && selectedPolygon) {
                const index = getIndexByKey(selectedKey);
                if (index != null) {
                    onPolygonUnselect?.(index, selectedPolygon);
                }
            }
        };

        const setCoordinate = (coordinate: LatLng): void => {
            if (disabled) {
                return;
            }
            const coordinates = selectedPolygon?.coordinates ?? [];
            if (isPointInPolygon(coordinate, coordinates)) {
                // console.log('isPointInPolygon');
            } else if (selectedPolygon) {
                unselectPolygon();
                resetSelection();
            } else {
                buildNewPolygon(coordinate);
            }
        };

        const addCoordinateToSelectedPolyline = useCallback(
            (coordinate: LatLng, coordIndex?: number): void => {
                const polygon = selectedPolygonRef.current;
                if (!polygon) {
                    return;
                }
                const changedPolygon = addCoordinateToPolygon(
                    polygon,
                    coordinate,
                    coordIndex,
                );
                setSelectedPolyline(changedPolygon);
            },
            [],
        );

        const removeCoordinateFromSelectedPolygon = useCallback(
            (coordIndex: number): void => {
                const polygon = selectedPolygonRef.current;
                if (!polygon) {
                    return;
                }
                const index = getIndexByKey(polygon.key);
                const coordinates = [...polygon.coordinates];
                coordinates.splice(coordIndex, 1);
                setSelectedMarkerIndex(null);
                if (coordinates.length < 3) {
                    setSelectedKey(null);
                    setSelectedPolyline(null);
                    if (index != null) {
                        onPolygonRemove?.(index);
                    }
                } else {
                    const changedPolygon = {
                        ...polygon,
                        coordinates,
                    };
                    setSelectedPolygon(changedPolygon);
                    setSelectedPolyline(changedPolygon);
                    if (index != null) {
                        onPolygonChange?.(index, changedPolygon);
                    }
                }
            },
            [
                getIndexByKey,
                setSelectedMarkerIndex,
                setSelectedKey,
                onPolygonRemove,
                onPolygonChange,
            ],
        );

        const onPolygonClick = (
            index: number,
            polygon: MapPolygonExtendedProps,
        ) => {
            return (e: PolygonPressEvent) => {
                e.stopPropagation();
                if (disabled) {
                    return;
                }
                if (selectedKey === polygon.key) {
                    setSelectedKey(null);
                    onPolygonUnselect?.(index, polygon);
                } else {
                    setSelectedKey(polygon.key);
                    onPolygonSelect?.(index, polygon);
                }
                setSelectedMarkerIndex(null);
            };
        };

        const changeSelectedPolylineCoordinate = useCallback(
            (coordIndex: number, coordinate: LatLng): void => {
                setSelectedPolyline((prev) => {
                    if (!prev) {
                        return prev;
                    }
                    const coordinatesClone = [...prev.coordinates];
                    coordinatesClone[coordIndex] = coordinate;
                    return {
                        ...prev,
                        coordinates: coordinatesClone,
                    };
                });
            },
            [],
        );

        const synchronizePolylineToPolygon = useCallback((): void => {
            const polyline = selectedPolylineRef.current;
            if (!polyline) {
                return;
            }
            setSelectedPolygon(polyline);
            setSelectedPolyline(null);
            const index = getIndexByKey(polyline.key);
            if (index != null) {
                onPolygonChange?.(index, polyline);
            }
        }, [getIndexByKey, onPolygonChange]);

        const onSubMarkerDragStart = useCallback(
            (coordIndex: number) => {
                return ({
                    nativeEvent: { coordinate },
                }: MarkerDragStartEndEvent) => {
                    addCoordinateToSelectedPolyline(coordinate, coordIndex);
                };
            },
            [addCoordinateToSelectedPolyline],
        );

        const onMarkerDragStart = useCallback(() => {
            return (_e: MarkerDragStartEndEvent) => {
                setSelectedPolyline(selectedPolygonRef.current);
            };
        }, []);

        const onMarkerDrag = useCallback(
            (coordIndex: number) => {
                return ({ nativeEvent: { coordinate } }: MarkerDragEvent) => {
                    changeSelectedPolylineCoordinate(coordIndex, coordinate);
                };
            },
            [changeSelectedPolylineCoordinate],
        );

        const onMarkerDragEnd = useCallback(() => {
            return (_e: MarkerDragStartEndEvent) => {
                if (debounceTimeoutRef.current) {
                    clearTimeout(debounceTimeoutRef.current);
                }
                debounceTimeoutRef.current = setTimeout(() => {
                    debounceTimeoutRef.current = null;
                    synchronizePolylineToPolygon();
                }, 25);
            };
        }, [synchronizePolylineToPolygon]);

        const onMarkerPress = useCallback(
            (coordIndex: number) => {
                return (e: MarkerPressEvent) => {
                    e.stopPropagation();
                    if (isSelectedMarker(coordIndex)) {
                        removeCoordinateFromSelectedPolygon(coordIndex);
                    } else {
                        setSelectedMarkerIndex(coordIndex);
                    }
                };
            },
            [
                isSelectedMarker,
                removeCoordinateFromSelectedPolygon,
                setSelectedMarkerIndex,
            ],
        );

        useImperativeHandle(ref, init);

        useEffect(() => {
            const polygon =
                selectedKey != null ? getPolygonByKey(selectedKey) : null;
            setSelectedPolygon(polygon);
        }, [polygons, selectedKey, getPolygonByKey]);

        return (
            <>
                <Polygons polygons={polygons} onPolygonClick={onPolygonClick} />
                <Polyline polygon={selectedPolyline} />
                {selectedPolygon !== null && !disabled && (
                    <>
                        <SubCircleMarkers
                            polygon={selectedPolygon}
                            onDragStart={onSubMarkerDragStart}
                            onDrag={onMarkerDrag}
                            onDragEnd={onMarkerDragEnd}
                        />
                        <CircleMarkers
                            selectedMarkerIndex={selectedMarkerIndex}
                            polygon={selectedPolygon}
                            onDragStart={onMarkerDragStart}
                            onDrag={onMarkerDrag}
                            onDragEnd={onMarkerDragEnd}
                            onPress={onMarkerPress}
                        />
                    </>
                )}
            </>
        );
    },
);

PolygonEditor.displayName = 'PolygonEditor';
