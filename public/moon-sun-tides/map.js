const initialPos = { lat: 34.0488, lng: -118.2518 };

function makeMap(latElem, lngElem) {
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 10,
    });
    // initial map position: downtown Los Angeles
    map.setCenter(initialPos);
    map.addListener("click", handleClick);
    map.addListener("center_changed", handleCenterChanged);

    function handleClick(e) {
        const { latLng } = e,
            lat = latLng.lat(),
            lng = latLng.lng();
        setLatLngElems(latElem, lngElem, lat, lng);
        map.setCenter(latLng);
    }

    function handleCenterChanged(e) {
        const { lat, lng } = map.getCenter();
        setLatLngElems(latElem, lngElem, lat(), lng());
    }

    return map;
}

function setLatLngElems(latElem, lngElem, lat, lng) {
    latElem.innerHTML = lat;
    lngElem.innerHTML = lng;
}

export default makeMap;
export { initialPos, setLatLngElems };
