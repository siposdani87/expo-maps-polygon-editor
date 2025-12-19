import React, {
    forwardRef,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import ReactDOM from 'react-dom';
import { MapContext, LatLng } from './MapView';

export interface MarkerDragEvent {
    nativeEvent: {
        coordinate: LatLng;
    };
}

export interface MarkerDragStartEndEvent {
    nativeEvent: {
        coordinate: LatLng;
    };
}

export interface MarkerPressEvent {
    nativeEvent: {
        coordinate: LatLng;
        id: string;
    };
}

interface MarkerProps {
    coordinate: LatLng;
    identifier?: string;
    anchor?: { x: number; y: number };
    draggable?: boolean;
    onDragStart?: (event: MarkerDragStartEndEvent) => void;
    onDrag?: (event: MarkerDragEvent) => void;
    onDragEnd?: (event: MarkerDragStartEndEvent) => void;
    onPress?: (event: MarkerPressEvent) => void;
    tracksViewChanges?: boolean;
    children?: React.ReactNode;
}

export const Marker = forwardRef((props: MarkerProps, _ref) => {
    const { map } = useContext(MapContext);
    const markerRef = useRef<any>(null);
    const overlayRef = useRef<any>(null);
    const isDraggingRef = useRef<boolean>(false);
    const [markerElement, setMarkerElement] = useState<HTMLDivElement | null>(
        null,
    );

    // Store callbacks in refs so they're always up to date
    const onDragStartRef = useRef(props.onDragStart);
    const onDragRef = useRef(props.onDrag);
    const onDragEndRef = useRef(props.onDragEnd);
    const onPressRef = useRef(props.onPress);

    // Update refs when props change
    useEffect(() => {
        onDragStartRef.current = props.onDragStart;
        onDragRef.current = props.onDrag;
        onDragEndRef.current = props.onDragEnd;
        onPressRef.current = props.onPress;
    }, [props.onDragStart, props.onDrag, props.onDragEnd, props.onPress]);

    // Create marker when map is available
    useEffect(() => {
        if (!map) {
            return;
        }

        // If marker has children, use a custom overlay instead of standard marker
        if (props.children) {
            const div = document.createElement('div');
            div.style.position = 'absolute';
            div.style.cursor = props.draggable ? 'move' : 'pointer';
            // Apply transform to center the marker based on anchor
            const anchor = props.anchor || { x: 0.5, y: 0.5 };
            div.style.transform = `translate(-${anchor.x * 100}%, -${anchor.y * 100}%)`;
            setMarkerElement(div);

            class CustomMarker extends window.google.maps.OverlayView {
                private position: any;
                private div: HTMLDivElement;
                private mouseMoveListener: any = null;
                private mouseUpListener: any = null;
                private clickListener: any = null;
                private mouseDownListener: any = null;
                private isCurrentlyDragging: boolean = false;

                constructor(position: any, divElement: HTMLDivElement) {
                    super();
                    this.position = position;
                    this.div = divElement;
                }

                onAdd() {
                    const panes = this.getPanes();
                    panes?.overlayMouseTarget.appendChild(this.div);

                    // Add drag support
                    if (props.draggable) {
                        this.div.style.cursor = 'move';
                        let isDragging = false;
                        let dragStartX = 0;
                        let dragStartY = 0;
                        let hasDragged = false;

                        this.mouseDownListener = (e: MouseEvent) => {
                            isDragging = true;
                            this.isCurrentlyDragging = true;
                            isDraggingRef.current = true;
                            hasDragged = false;
                            dragStartX = e.clientX;
                            dragStartY = e.clientY;
                            e.stopPropagation();
                            e.preventDefault();
                            if (onDragStartRef.current) {
                                onDragStartRef.current({
                                    nativeEvent: {
                                        coordinate: {
                                            latitude: this.position.lat(),
                                            longitude: this.position.lng(),
                                        },
                                    },
                                });
                            }
                        };
                        this.div.addEventListener(
                            'mousedown',
                            this.mouseDownListener,
                        );

                        this.mouseMoveListener = (e: MouseEvent) => {
                            if (!isDragging || !map) {
                                return;
                            }

                            // Only check threshold if we haven't started dragging yet
                            if (!hasDragged) {
                                const dx = Math.abs(e.clientX - dragStartX);
                                const dy = Math.abs(e.clientY - dragStartY);
                                if (dx < 3 && dy < 3) {
                                    // Not enough movement yet, skip
                                    return;
                                }
                                // Movement threshold passed, now we're dragging
                                hasDragged = true;
                            }

                            e.preventDefault();
                            e.stopPropagation();

                            const projection = this.getProjection();
                            if (!projection) {
                                return;
                            }

                            // Get the map container's bounding rect
                            const mapDiv = map.getDiv();
                            const bounds = mapDiv.getBoundingClientRect();

                            // Convert client coordinates to container pixel coordinates
                            const containerX = e.clientX - bounds.left;
                            const containerY = e.clientY - bounds.top;
                            const point = new window.google.maps.Point(
                                containerX,
                                containerY,
                            );

                            const latLng =
                                projection.fromContainerPixelToLatLng(point);
                            if (latLng) {
                                this.position = latLng;
                                this.draw();
                                if (onDragRef.current) {
                                    onDragRef.current({
                                        nativeEvent: {
                                            coordinate: {
                                                latitude: latLng.lat(),
                                                longitude: latLng.lng(),
                                            },
                                        },
                                    });
                                }
                            }
                        };
                        document.addEventListener(
                            'mousemove',
                            this.mouseMoveListener,
                        );

                        this.mouseUpListener = (_e: MouseEvent) => {
                            if (isDragging) {
                                if (hasDragged && onDragEndRef.current) {
                                    // User dragged the marker
                                    onDragEndRef.current({
                                        nativeEvent: {
                                            coordinate: {
                                                latitude: this.position.lat(),
                                                longitude: this.position.lng(),
                                            },
                                        },
                                    });
                                } else if (!hasDragged && onPressRef.current) {
                                    // User clicked without dragging
                                    const syntheticEvent = {
                                        stopPropagation: () => {},
                                        nativeEvent: {
                                            coordinate: props.coordinate,
                                            id: props.identifier || '',
                                        },
                                    };
                                    onPressRef.current(syntheticEvent as any);
                                }
                            }
                            isDragging = false;
                            this.isCurrentlyDragging = false;
                            isDraggingRef.current = false;
                            hasDragged = false;
                        };
                        document.addEventListener(
                            'mouseup',
                            this.mouseUpListener,
                        );
                    } else {
                        // Add click listener for non-draggable markers
                        this.clickListener = (e: MouseEvent) => {
                            e.stopPropagation();
                            const syntheticEvent = {
                                stopPropagation: () => {},
                                nativeEvent: {
                                    coordinate: props.coordinate,
                                    id: props.identifier || '',
                                },
                            };
                            onPressRef.current?.(syntheticEvent as any);
                        };
                        this.div.addEventListener('click', this.clickListener);
                    }
                }

                draw() {
                    const projection = this.getProjection();
                    if (!projection) {
                        return;
                    }

                    const point = projection.fromLatLngToDivPixel(
                        this.position,
                    );
                    if (point) {
                        this.div.style.left = point.x + 'px';
                        this.div.style.top = point.y + 'px';
                    }
                }

                onRemove() {
                    // Clean up event listeners
                    if (this.clickListener) {
                        this.div.removeEventListener(
                            'click',
                            this.clickListener,
                        );
                    }
                    if (this.mouseDownListener) {
                        this.div.removeEventListener(
                            'mousedown',
                            this.mouseDownListener,
                        );
                    }
                    if (this.mouseMoveListener) {
                        document.removeEventListener(
                            'mousemove',
                            this.mouseMoveListener,
                        );
                    }
                    if (this.mouseUpListener) {
                        document.removeEventListener(
                            'mouseup',
                            this.mouseUpListener,
                        );
                    }

                    if (this.div.parentNode) {
                        this.div.parentNode.removeChild(this.div);
                    }
                }

                updatePosition(newPosition: any) {
                    // Don't update position if this marker is currently being dragged
                    if (this.isCurrentlyDragging) {
                        return;
                    }
                    this.position = newPosition;
                    this.draw();
                }
            }

            const overlay = new CustomMarker(
                new window.google.maps.LatLng(
                    props.coordinate.latitude,
                    props.coordinate.longitude,
                ),
                div,
            );
            overlay.setMap(map);
            overlayRef.current = overlay as any;

            return () => {
                overlay.setMap(null);
                overlayRef.current = null;
                setMarkerElement(null);
            };
        } else {
            // Use standard Google Maps marker for markers without children
            const marker = new window.google.maps.Marker({
                position: {
                    lat: props.coordinate.latitude,
                    lng: props.coordinate.longitude,
                },
                map: map,
                draggable: props.draggable,
            });

            // Add event listeners
            if (props.onPress) {
                marker.addListener('click', (e: any) => {
                    const syntheticEvent = {
                        stopPropagation: () => {
                            if (e.stop) {
                                e.stop();
                            }
                        },
                        nativeEvent: {
                            coordinate: props.coordinate,
                            id: props.identifier || '',
                        },
                    };
                    props.onPress?.(syntheticEvent as any);
                });
            }

            if (props.draggable) {
                marker.addListener('dragstart', () => {
                    const pos = marker.getPosition();
                    if (pos) {
                        props.onDragStart?.({
                            nativeEvent: {
                                coordinate: {
                                    latitude: pos.lat(),
                                    longitude: pos.lng(),
                                },
                            },
                        });
                    }
                });

                marker.addListener('drag', () => {
                    const pos = marker.getPosition();
                    if (pos) {
                        props.onDrag?.({
                            nativeEvent: {
                                coordinate: {
                                    latitude: pos.lat(),
                                    longitude: pos.lng(),
                                },
                            },
                        });
                    }
                });

                marker.addListener('dragend', () => {
                    const pos = marker.getPosition();
                    if (pos) {
                        props.onDragEnd?.({
                            nativeEvent: {
                                coordinate: {
                                    latitude: pos.lat(),
                                    longitude: pos.lng(),
                                },
                            },
                        });
                    }
                });
            }

            markerRef.current = marker;

            return () => {
                marker.setMap(null);
                markerRef.current = null;
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map]); // Don't include props.children - we don't want to recreate on every render

    // Update marker position when props change (but not during dragging)
    useEffect(() => {
        // Don't update position from props while user is dragging
        if (isDraggingRef.current) {
            return;
        }

        if (overlayRef.current) {
            const overlay = overlayRef.current as any;
            if (overlay.updatePosition) {
                overlay.updatePosition(
                    new window.google.maps.LatLng(
                        props.coordinate.latitude,
                        props.coordinate.longitude,
                    ),
                );
            }
        } else if (markerRef.current) {
            markerRef.current.setPosition({
                lat: props.coordinate.latitude,
                lng: props.coordinate.longitude,
            });
            markerRef.current.setDraggable(props.draggable || false);
        }
    }, [props.coordinate, props.draggable]);

    // Render children into the marker element
    if (markerElement && props.children) {
        return ReactDOM.createPortal(props.children, markerElement);
    }

    return null;
});
