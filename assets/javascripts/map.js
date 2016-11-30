$(document).ready(function () {
    var map = L.map('map', {
        attributionControl: false
    }).setView([23.6, 121], 8);

    var tileLayer = L.tileLayer("http://maps.nlsc.gov.tw/S_Maps/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=EMAP&STYLE=_null&TILEMATRIXSET=EPSG:3857&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png", {
        maxZoom: 19
    })
    map.addLayer(tileLayer);

});
