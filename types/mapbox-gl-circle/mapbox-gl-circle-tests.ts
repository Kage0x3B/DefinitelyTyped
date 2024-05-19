import mapboxgl from "mapbox-gl";
import MapboxCircle from "mapbox-gl-circle";

const myMapboxGlMap = undefined as unknown as mapboxgl.Map;
const console = {
    log: (...args: unknown[]) => {
    },
};

// @ts-expect-error
new MapboxCircle();

const myCircle = new MapboxCircle({ lat: 39.984, lng: -75.343 }, 25000, {
    editable: true,
    minRadius: 1500,
    fillColor: "#29AB87",
}).addTo(myMapboxGlMap);

myCircle.on("centerchanged", function(circleObj) {
    console.log("New center:", circleObj.getCenter());
});
myCircle.once("radiuschanged", function(circleObj) {
    console.log("New radius (once!):", circleObj.getRadius());
});
myCircle.on("click", function(mapMouseEvent) {
    console.log("Click:", mapMouseEvent.point);
});
myCircle.on("contextmenu", function(mapMouseEvent) {
    console.log("Right-click:", mapMouseEvent.lngLat);
});
