$(document).ready(function(){var E=L.map("map",{attributionControl:!1}).setView([23.6,121],8),t=L.tileLayer("http://maps.nlsc.gov.tw/S_Maps/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=EMAP&STYLE=_null&TILEMATRIXSET=EPSG:3857&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png",{maxZoom:19});E.addLayer(t)});