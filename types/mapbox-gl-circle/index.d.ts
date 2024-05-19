import mapboxgl = require("mapbox-gl");

type FeatureCollection = unknown;
type Polygon = unknown;
type EventEmitter = unknown;
type Point = unknown;

interface MapboxCircleOptions {
    /**
     * Enable handles for changing center and radius
     * @default false
     */
    editable: boolean;

    /**
     * Minimum radius on user interaction
     * @default 10
     */
    minRadius: number;

    /**
     * Maximum radius on user interaction
     * @default 1100000
     */
    maxRadius: number;

    /**
     * Stroke color
     * @default '#000000'
     */
    strokeColor: string;

    /**
     * Stroke weight
     * @default 0.5
     */
    strokeWeight: number;

    /**
     * Stroke opacity
     * @default 0.75
     */
    strokeOpacity: number;

    /**
     * Fill color
     * @default '#FB6A4A'
     */
    fillColor: string;

    /**
     * Fill opacity
     * @default 0.25
     */
    fillOpacity: number;

    /**
     * Adjust circle polygon precision based on radius and zoom (i.e. prettier circles at the expense of performance)
     * @default false
     */
    refineStroke: boolean;

    /**
     * Property metadata for Mapbox GL JS circle object
     * @default {}
     */
    properties: Record<string, unknown>;
}

/**
 * A `google.maps.Circle` replacement for Mapbox GL JS, rendering a "spherical cap" on top of the world.
 * @example
 * var myCircle = new MapboxCircle({lat: 39.984, lng: -75.343}, 25000, {
 *         editable: true,
 *         minRadius: 1500,
 *         fillColor: '#29AB87'
 *     }).addTo(myMapboxGlMap);
 *
 * myCircle.on('centerchanged', function (circleObj) {
 *         console.log('New center:', circleObj.getCenter());
 *     });
 * myCircle.once('radiuschanged', function (circleObj) {
 *         console.log('New radius (once!):', circleObj.getRadius());
 *     });
 * myCircle.on('click', function (mapMouseEvent) {
 *         console.log('Click:', mapMouseEvent.point);
 *     });
 * myCircle.on('contextmenu', function (mapMouseEvent) {
 *         console.log('Right-click:', mapMouseEvent.lngLat);
 *     });
 */
declare class MapboxCircle {
    private static __MONOSTATE: {
        instanceIdCounter: number;
        activeEditableCircles: MapboxCircle[];
        broadcast: EventEmitter;
    };
    options: MapboxCircleOptions;
    private __safariContextMenuEventHackEnabled: boolean;
    private _eventEmitter: EventEmitter;
    private _lastCenterLngLat: [number, number];
    private _editCenterLngLat: [number, number];
    private _currentCenterLngLat: [number, number];
    private _lastRadius: number;
    private _editRadius: number;
    private _currentRadius: number;
    private _circle: Polygon;
    private _handles: Point[];
    private _centerDragActive: boolean;
    private _radiusDragActive: boolean;
    private _debouncedHandlers: Record<string, unknown>;
    private _updateCount: boolean;

    /**
     * @param {{lat: number, lng: number}|[number,number]} center Circle center as an object or `[lng, lat]` coordinates
     * @param {number} radius Meter radius
     * @param {?Partial<MapboxCircleOptions>} options Meter radius
     */
    constructor(
        center: { lat: number; lng: number } | [number, number],
        radius: number,
        options?: Partial<MapboxCircleOptions>,
    );

    /**
     * @return {string} 'mapbox-gl-circle' library version number.
     */
    static get VERSION(): string;

    private _map: mapboxgl.Map;

    /** @return {mapboxgl.Map} Mapbox map. */
    get map(): mapboxgl.Map;

    /** @param {mapboxgl.Map} map Target map. */
    set map(map: mapboxgl.Map);

    private _zoom: number;

    /** @param {number} newZoom New zoom level. */
    set zoom(newZoom: number);

    /**
     * @return {string} Unique circle source ID.
     */
    get _circleSourceId(): string;

    /** @return {[number,number]} Current center `[lng, lat]` coordinates. */
    get center(): [number, number];

    /** @param {[number,number]} newCenter Center `[lng, lat]` coordinates. */
    set center(newCenter: [number, number]);

    /** @return {number} Current circle radius. */
    get radius(): number;

    /** @param {number} newRadius Meter radius. */
    set radius(newRadius: number);

    /**
     * @return {number} Globally unique instance ID.
     */
    private get _instanceId(): number;

    /**
     * @return {string} Unique circle center handle source ID.
     */
    private get _circleCenterHandleSourceId(): string;

    /**
     * @return {string} Unique radius handles source ID.
     */
    private get _circleRadiusHandlesSourceId(): string;

    /**
     * @return {string} Unique circle line-stroke ID.
     */
    private get _circleStrokeId(): string;

    /**
     * @return {string} Unique circle fill ID.
     */
    private get _circleFillId(): string;

    /**
     * @return {string} Unique ID for center handle stroke.
     */
    private get _circleCenterHandleStrokeId(): string;

    /**
     * @return {string} Unique ID for radius handles stroke.
     */
    private get _circleRadiusHandlesStrokeId(): string;

    /**
     * @return {string} Unique circle center handle ID.
     */
    private get _circleCenterHandleId(): string;

    /**
     * @return {string} Unique circle radius handles' ID.
     */
    private get _circleRadiusHandlesId(): string;

    /**
     * Add circle to `__MONOSTATE.activeEditableCircles` array and increase max broadcasting listeners by 1.
     * @param {MapboxCircle} circleObject
     */
    private static _addActiveEditableCircle(circleObject: MapboxCircle): void;

    /**
     * Remove circle from `__MONOSTATE.activeEditableCircles` array and decrease max broadcasting listeners by 1.
     * @param {MapboxCircle} circleObject
     */
    private static _removeActiveEditableCircle(circleObject: MapboxCircle): void;

    /**
     * Return `true` if current browser seems to be Safari.
     * @return {boolean}
     */
    private static _checkIfBrowserIsSafari(): boolean;

    /**
     * Subscribe to circle event.
     * @param event Event name; `click`, `contextmenu`, `centerchanged` or `radiuschanged`
     * @param fn Event handler, invoked with the target circle as first argument on
     *     *'centerchanged'* and *'radiuschanged'*, or a *MapMouseEvent* on *'click'* and *'contextmenu'* events
     * @param onlyOnce Remove handler after first call
     * @return {MapboxCircle}
     */
    on(
        event: "centerchanged" | "radiuschanged",
        fn: (circle: MapboxCircle) => void,
        onlyOnce?: boolean,
    ): this;
    on(
        event: "click" | "contextmenu",
        fn: (event: mapboxgl.MapMouseEvent) => void,
        onlyOnce?: boolean,
    ): this;
    on(
        event: "click" | "contextmenu" | "centerchanged" | "radiuschanged",
        fn: (circleOrEvent: MapboxCircle | mapboxgl.MapMouseEvent) => void,
        onlyOnce?: boolean,
    ): this;

    /**
     * Alias for registering event listener with *onlyOnce=true*, see {@link #on}.
     * @param event Event name
     * @param fn Event handler
     * @return {MapboxCircle}
     */
    once(
        event: "centerchanged" | "radiuschanged",
        fn: (circle: MapboxCircle) => void,
    ): this;
    once(
        event: "click" | "contextmenu",
        fn: (event: mapboxgl.MapMouseEvent) => void,
    ): this;
    once(
        event: "click" | "contextmenu" | "centerchanged" | "radiuschanged",
        fn: (circle: MapboxCircle | mapboxgl.MapMouseEvent) => void,
    ): this;

    /**
     * Unsubscribe to circle event.
     * @param event Event name
     * @param fn Handler to be removed
     * @return {MapboxCircle}
     */
    off(
        event: "click" | "contextmenu" | "centerchanged" | "radiuschanged",
        fn: (circle: MapboxCircle | mapboxgl.MapMouseEvent) => void,
    ): this;

    /**
     * @param {mapboxgl.Map} map Target map for adding and initializing circle Mapbox GL layers/data/listeners.
     * @param {?string} [before='waterway-label'] Layer ID to insert the circle layers before; explicitly pass `null` to
     *     get the circle assets appended at the end of map-layers array
     * @return {MapboxCircle}
     */
    addTo(map: mapboxgl.Map, before?: string | null): this;

    /**
     * Remove source data, layers and listeners from map.
     * @return {MapboxCircle}
     */
    remove(): this;

    /**
     * @return {{lat: number, lng: number}} Circle center position
     */
    getCenter(): { lat: number; lng: number };

    /**
     * @param {{lat: number, lng: number}} position
     * @return {MapboxCircle}
     */
    setCenter(position: { lat: number; lng: number }): this;

    /**
     * @return {number} Current radius, in meters
     */
    getRadius(): number;

    /**
     * @param {number} newRadius Meter radius
     * @return {MapboxCircle}
     */
    setRadius(newRadius: number): this;

    /**
     * @return {{sw: {lat: number, lng: number}, ne: {lat: number, lng: number}}} Southwestern/northeastern bounds
     */
    getBounds(): { sw: { lat: number; lng: number }; ne: { lat: number; lng: number } };

    /**
     * Highlight center handle, disable panning and add mouse-move listener (emulating drag until mouse-up event).
     */
    private _onCenterHandleMouseDown(): void;

    /**
     * Animate circle center change after _onCenterHandleMouseDown triggers.
     * @param {mapboxgl.MapMouseEvent} event
     */
    private _onCenterHandleMouseMove(event: mapboxgl.MapMouseEvent): void;

    /**
     * Reset center handle, re-enable panning and remove listeners from _onCenterHandleMouseDown.
     * @param {mapboxgl.MapMouseEvent} event
     */
    private _onCenterHandleMouseUpOrMapMouseOut(event: mapboxgl.MapMouseEvent): void;

    /**
     * Update _lastCenterLngLat on `centerchanged` event.
     */
    private _onCenterChanged(): void;

    /**
     * Reset center handle and re-enable panning, unless actively dragging.
     */
    private _onCenterHandleMouseLeave(): void;

    /**
     * Return vertical or horizontal resize arrow depending on if mouse is at left-right or top-bottom edit handles.
     * @param {mapboxgl.MapMouseEvent} event
     * @return {string} 'ew-resize' or 'ns-resize'
     */
    private _getRadiusHandleCursorStyle(event: mapboxgl.MapMouseEvent): "ns-resize" | "ew-resize";

    /**
     * Highlight radius handles and disable panning.
     * @param {mapboxgl.MapMouseEvent} event
     */
    private _onRadiusHandlesMouseEnter(event: mapboxgl.MapMouseEvent): void;

    /**
     * Stop listening to radius handles' events, unless it's what the circle is currently busy with.
     * @param {number} instanceId ID of the circle instance that requested suspension.
     * @param {string} typeOfHandle 'center' or 'radius'.
     */
    private _onRadiusHandlesSuspendEvents(instanceId: number, typeOfHandle: string): void;

    /**
     * Start listening to radius handles' events again, unless the circle was NOT among those targeted by suspend event.
     * @param {number} instanceId ID of the circle instance that said it's time to resume listening.
     * @param {string} typeOfHandle 'center' or 'radius'.
     */
    private _onRadiusHandlesResumeEvents(instanceId: number, typeOfHandle: string): void;

    /**
     * Highlight radius handles, disable panning and add mouse-move listener (emulating drag until mouse-up event).
     * @param {mapboxgl.MapMouseEvent} event
     */
    private _onRadiusHandlesMouseDown(event: mapboxgl.MapMouseEvent): void;

    /**
     * Animate circle radius change after _onRadiusHandlesMouseDown triggers.
     * @param {mapboxgl.MapMouseEvent} event
     */
    private _onRadiusHandlesMouseMove(event: mapboxgl.MapMouseEvent): void;

    /**
     * Reset radius handles, re-enable panning and remove listeners from _onRadiusHandlesMouseDown.
     * @param {mapboxgl.MapMouseEvent} event
     */
    private _onRadiusHandlesMouseUpOrMapMouseOut(event: mapboxgl.MapMouseEvent): void;

    /**
     * Update _lastRadius on `radiuschanged` event.
     */
    private _onRadiusChanged(): void;

    /**
     * Reset radius handles and re-enable panning, unless actively dragging.
     */
    private _onRadiusHandlesMouseLeave(): void;

    /**
     * Set pointer cursor when moving over circle fill, and it's clickable.
     * @param {mapboxgl.MapMouseEvent} event
     */
    private _onCircleFillMouseMove(event: mapboxgl.MapMouseEvent): void;

    /**
     * Stop listening to circle fill events.
     */
    private _onCircleFillSuspendEvents(): void;

    /**
     * Start listening to circle fill events again.
     */
    private _onCircleFillResumeEvents(): void;

    /**
     * Fire 'contextmenu' event.
     * @param {mapboxgl.MapMouseEvent} event
     */
    private _onCircleFillContextMenu(event: mapboxgl.MapMouseEvent): void;

    /**
     * Fire 'click' event.
     * @param {mapboxgl.MapMouseEvent} event
     */
    private _onCircleFillClick(event: mapboxgl.MapMouseEvent): void;

    /**
     * Remove pointer cursor when leaving circle fill.
     * @param {mapboxgl.MapMouseEvent} event
     */
    private _onCircleFillMouseLeave(event: mapboxgl.MapMouseEvent): void;

    /**
     * When map style is changed, remove circle assets from map and add it back on next MapboxGL 'styledata' event.
     * @param {mapboxgl.MapMouseEvent} event
     */
    private _onMapStyleDataLoading(event: mapboxgl.MapMouseEvent): void;

    /**
     * Add all static listeners for center handle.
     * @param {mapboxgl.Map} [map]
     */
    private _bindCenterHandleListeners(map?: mapboxgl.Map);

    /**
     * Remove all static listeners for center handle.
     * @param {mapboxgl.Map} [map]
     */
    private _unbindCenterHandleListeners(map?: mapboxgl.Map): void;

    /**
     * Add all static listeners for radius handles.
     * @param {mapboxgl.Map} [map]
     */
    private _bindRadiusHandlesListeners(map?: mapboxgl.Map): void;

    /**
     * Remove all static listeners for radius handles.
     * @param {mapboxgl.Map} [map]
     */
    private _unbindRadiusHandlesListeners(map?: mapboxgl.Map): void;

    /**
     * Add all click/contextmenu listeners for circle fill layer.
     * @param {mapboxgl.Map} [map]
     */
    private _bindCircleFillListeners(map?: mapboxgl.Map): void;

    /**
     * Remove all click/contextmenu listeners for circle fill.
     * @param {mapboxgl.Map} [map]
     */
    private _unbindCircleFillListeners(map?: mapboxgl.Map): void;

    /**
     * Add suspend/resume listeners for `__MONOSTATE.broadcast` event emitter.
     */
    private _bindBroadcastListeners(): void;

    /**
     * Remove suspend/resume handlers from `__MONOSTATE.broadcast` emitter.
     */
    private _unbindBroadcastListeners(): void;

    /**
     * @return GeoJSON map source for the circle.
     */
    private _getCircleMapSource(): { type: "geojson"; data: FeatureCollection; buffer: 1 };

    /**
     * @return GeoJSON map source for center handle.
     */
    private _getCenterHandleMapSource(): { type: "geojson"; data: FeatureCollection; buffer: 1 };

    /**
     * @return GeoJSON map source for radius handles.
     */
    private _getRadiusHandlesMapSource(): { type: "geojson"; data: FeatureCollection; buffer: 1 };

    /**
     * @return Style layer for the stroke around the circle.
     */
    private _getCircleStrokeLayer(): {
        id: string;
        type: "line";
        source: string;
        paint: { "line-color": string; "line-width": number; "line-opacity": number };
        filter: string[];
    };

    /**
     * @return Style layer for the circle fill.
     */
    private _getCircleFillLayer(): {
        id: string;
        type: "fill";
        source: string;
        paint: { "fill-color": string; "fill-opacity": number };
        filter: string[];
    };

    /**
     * @return Style layer for the center handle's stroke.
     */
    private _getCenterHandleStrokeLayer(): {
        id: string;
        type: "line" | "circle";
        source: string;
        paint: { "line-color": string; "line-width": number; "line-opacity": number };
        filter: string[];
    };

    /**
     * @return Style layer for the radius handles' stroke.
     */
    private _getRadiusHandlesStrokeLayer(): {
        id: string;
        type: "line";
        source: string;
        paint: { "line-color": string; "line-width": number; "line-opacity": number };
        filter: string[];
    };

    /**
     * @return Default paint style for edit handles.
     */
    private _getEditHandleDefaultPaintOptions(): {
        "circle-color": string;
        "circle-radius": number;
        "circle-stroke-color": string;
        "circle-stroke-opacity": number;
        "circle-stroke-width": number;
    };

    /**
     * @return Style layer for the circle's center handle.
     */
    private _getCircleCenterHandleLayer(): {
        id: string;
        type: "circle";
        source: string;
        paint: {
            "circle-color": string;
            "circle-radius": number;
            "circle-stroke-color": string;
            "circle-stroke-opacity": number;
            "circle-stroke-width": number;
        };
        filter: string[];
    };

    /**
     * @return Style layer for the circle's radius handles.
     */
    private _getCircleRadiusHandlesLayer(): {
        id: string;
        type: "circle";
        source: string;
        paint: {
            "circle-color": string;
            "circle-radius": number;
            "circle-stroke-color": string;
            "circle-stroke-opacity": number;
            "circle-stroke-width": number;
        };
        filter: string[];
    };

    /**
     * @return {string} Current cursor style
     */
    private _getCursorStyle(): string;

    /**
     * Add debounced event handler to map.
     * @param event Mapbox GL event name
     * @param handler Event handler
     */
    private _mapOnDebounced(event: string, handler: (event: unknown) => void): void;

    /**
     * Remove debounced event handler from map.
     * @param event Mapbox GL event name
     * @param handler Event handler
     */
    private _mapOffDebounced(event: string, handler: (event: unknown) => void): void;

    /**
     * Re-calculate/update circle polygon and handles.
     */
    private _updateCircle(): void;

    /**
     * Return GeoJSON for circle and handles.
     * @return {FeatureCollection}
     */
    private _getCircleGeoJSON(): FeatureCollection;

    /**
     * Return GeoJSON for center handle and stroke.
     * @return {FeatureCollection}
     */
    private _getCenterHandleGeoJSON(): FeatureCollection;

    /**
     * Return GeoJSON for radius handles and stroke.
     * @return {FeatureCollection}
     */
    private _getRadiusHandlesGeoJSON(): FeatureCollection;

    /**
     * Refresh map with GeoJSON for circle/handles.
     */
    private _animate(): void;

    /**
     * Returns true if cursor point is on a center/radius edit handle.
     * @param {{x: number, y: number}} point
     * @return {boolean}
     */
    private _pointOnHandle(point: { x: number; y: number }): boolean;

    /**
     * Broadcast suspend event to other interactive circles, instructing them to stop listening during drag interaction.
     * @param {string} typeOfHandle 'radius' or 'circle'.
     */
    private _suspendHandleListeners(typeOfHandle: string): void;

    /**
     * Broadcast resume event to other editable circles, to make them to resume interactivity after a completed drag op.
     * @param {string} typeOfHandle 'radius' or 'circle'.
     */
    private _resumeHandleListeners(typeOfHandle: string): void;

    /**
     * Disable map panning, set cursor style and highlight handle with new fill color.
     * @param {string} layerId
     * @param {string} cursor
     */
    private _highlightHandles(layerId: string, cursor: string): void;

    /**
     * Re-enable map panning, reset cursor icon and restore fill color to white.
     * @param {string} layerId
     */
    private _resetHandles(layerId: string): void;

    /**
     * Adjust circle precision (steps used to draw the polygon).
     */
    private _onZoomEnd(): void;

    /**
     * Highlight center handle and disable panning.
     */
    private _onCenterHandleMouseEnter(): void;

    /**
     * Stop listening to center handle events, unless it's what the circle is currently busy with.
     * @param {number} instanceId ID of the circle instance that requested suspension.
     * @param {string} typeOfHandle 'center' or 'radius'.
     */
    private _onCenterHandleSuspendEvents(instanceId, typeOfHandle): void;

    /**
     * Start listening to center handle events again, unless the circle was NOT among those targeted by suspend event.
     * @param {number} instanceId ID of the circle instance that said it's time to resume listening.
     * @param {string} typeOfHandle 'center' or 'radius'.
     */
    private _onCenterHandleResumeEvents(instanceId, typeOfHandle): void;
}

export = MapboxCircle;
