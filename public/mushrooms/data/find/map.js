export default function makeMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
            zoom: 10,
        }),
        initialPos = { lat: 34.0488, lng: -118.2518 };
    setLatLngFormValues(initialPos);
    // initial map position: downtown Los Angeles
    map.setCenter(initialPos);
    map.addListener("click", handleClick);
    map.addListener("center_changed", handleCenterChanged);

    function handleClick(e) {
        const { latLng } = e,
            lat = latLng.lat(),
            lng = latLng.lng();
        console.log(lat, lng);
        setLatLngFormValues({ lat, lng });
        map.setCenter(latLng);
    }

    function handleCenterChanged(e) {
        const { lat, lng } = map.getCenter();
        setLatLngFormValues({ lat: lat(), lng: lng() });
    }

    return map;
}

function setLatLngFormValues({ lat, lng }) {
    const form = document.getElementById("finder-form");
    form.latitude.value = lat;
    form.longitude.value = lng;
}
