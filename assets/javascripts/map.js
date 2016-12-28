$(document).ready(function() {
    // map
    var mapBounds = L.latLngBounds(L.latLng(21.88, 118.12), L.latLng(25.44, 122.49));


    var tileLayers = {
        nlscEmap: L.tileLayer("http://maps.nlsc.gov.tw/S_Maps/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=EMAP&STYLE=_null&TILEMATRIXSET=EPSG:3857&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png", {
            maxZoom: 19,
            attribution: "Map data &copy; <a href='http://maps.nlsc.gov.tw/' target='_blank'>國土測繪中心</a>-臺灣通用電子地圖"
        }),
        nlscImage: L.tileLayer("http://maps.nlsc.gov.tw/S_Maps/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=PHOTO2&STYLE=_null&TILEMATRIXSET=EPSG:3857&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png", {
            maxZoom: 19,
            attribution: "Map data &copy; <a href='http://maps.nlsc.gov.tw/' target='_blank'>國土測繪中心</a>-正射影像"
        }),
        osmCycle: L.tileLayer("http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png", {
            subdomains: "abc",
            maxZoom: 20,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a>'
        }),
        gsm: L.tileLayer('http://mt{s}.google.com/vt/x={x}&y={y}&z={z}', {
            subdomains: '0123',
            maxZoom: 20,
            attribution: 'Map data &copy; Google'
        }),
        gim: L.tileLayer('http://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
            subdomains: '0123',
            maxZoom: 20,
            attribution: 'Map data &copy; Google'
        })
    };

    var map = L.map('map', {
        attributionControl: true,
        zoomControl: false,
        layers: tileLayers.nlscEmap
    }).fitBounds(mapBounds);
    L.control.layers({
        "臺灣通用電子地圖": tileLayers.nlscEmap,
        "正射影像": tileLayers.nlscImage,
        "OSM-CycleMap": tileLayers.osmCycle,
        "Google Street": tileLayers.gsm,
        "Google Image": tileLayers.gim
    }, null).addTo(map);
    // move zoom controller to bottom right
    L.control.zoom({
        position: "bottomright"
    }).addTo(map);

    // 定位
    // 因為這個搞https搞了好久啊!!
    var geolocationButton = {
        control: L.control({ position: "bottomright" }),
        opened: false
    };
    geolocationButton.control.onAdd = function(map) {
        var triggerButton = L.DomUtil.create("div", "leaflet-bar");
        triggerButton.style.backgroundImage = "url(style/images/geolocation.png)";
        triggerButton.style.backgroundSize = "20px 20px";
        triggerButton.style.width = "30px";
        triggerButton.style.height = "30px";
        triggerButton.style.backgroundRepeat = "no-repeat";
        triggerButton.style.backgroundPosition = "center";
        triggerButton.style.backgroundColor = "white";
        triggerButton.style.cursor = "pointer";

        L.DomEvent.addListener(triggerButton, 'click', function(e) {
            //geolocation
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    map.setView([position.coords.latitude, position.coords.longitude], 16);
                    geolocationMarker.range([position.coords.latitude, position.coords.longitude], position.coords.accuracy);
                    geolocationMarker.go([position.coords.latitude, position.coords.longitude]);
                });
            }
        });

        return triggerButton;
    }
    geolocationButton.control.addTo(map);

    var geolocationMarker = { //定位點以及周圍
        go: function(latlng) {
            var self = this;
            if (this.marker) {
                this.marker.setLatLng(latlng).addTo(this.layers);
            }
            else {
                this.marker = L.marker(latlng, {
                    icon: L.icon({
                        iconUrl: 'style/images/pin_red.png',
                        iconSize: [40, 40],
                        iconAnchor: [20.5, 37],
                        popupAnchor: [0, 0]
                    })
                });

                var id = L.Util.stamp(this.marker)
                this.marker.on("click", function() {
                    self.remove();
                }).addTo(this.layers);
            }
        },
        range: function(latlng, radius) {
            var self = this;
            if (this.circle) {
                this.circle.setLatLng(latlng).setRadius(radius).addTo(this.layers);
            }
            else {
                this.circle = L.circle(latlng, radius);
                this.circle.setStyle({ color: "#00BCD4", fillColor: "#00BCD4" });
                var id = L.Util.stamp(this.circle);
                this.circle.on("click", function() {
                    self.remove();
                }).addTo(this.layers);
            }
            return this.circle.getBounds();
        },
        remove: function() {
            this.layers.clearLayers();
        },
        layers: L.layerGroup().addTo(map)
    };

    //右邊的側邊攔
    // var rightPanels = L.control.sidebar("right_panels", {
    //     closeButton: true,
    //     autoPan: false,
    //     position: "right"
    // }).on('hide', function () {
    //     rightMenuButton.opened = false;
    // }).on('show', function () {
    //     rightMenuButton.opened = true;
    // });
    // map.addControl(rightPanels);

    // // right menu button
    // var rightMenuButton = {
    //     control: L.control({ position: "topright" }),
    //     opened: false
    // };
    // rightMenuButton.control.onAdd = function (map) {
    //     var triggerButton = L.DomUtil.create("div", "leaflet-bar");
    //     triggerButton.style.backgroundImage = "url(style/images/menu.png)";
    //     triggerButton.style.backgroundSize = "20px 20px";
    //     triggerButton.style.width = "30px";
    //     triggerButton.style.height = "30px";
    //     triggerButton.style.backgroundRepeat = "no-repeat";
    //     triggerButton.style.backgroundPosition = "center";
    //     triggerButton.style.backgroundColor = "white";
    //     triggerButton.style.cursor = "pointer";

    //     L.DomEvent
    //         .addListener(triggerButton, 'click', L.DomEvent.stopPropagation)
    //         .addListener(triggerButton, 'click', L.DomEvent.preventDefault)
    //         .addListener(triggerButton, 'click', function () {
    //             if (rightMenuButton.opened) {
    //                 rightPanels.hide();
    //             } else {
    //                 rightPanels.show();
    //             }
    //         });

    //     return triggerButton;
    // }
    // rightMenuButton.control.addTo(map);


    var menuItem = {
        "1w": {
            "name": "一週預報",
            "county": "option",
            "dataType": [{ "name": "天氣型態", "value": "Wx" }
                , { "name": "最高溫", "value": "MaxT" }
                , { "name": "最低溫", "value": "MinT" }]
        },
        "2d": {
            "name": "2天天氣預報",
            "county": "true",
            "dataType": [{ "name": "天氣型態", "value": "Wx" }
                , { "name": "溫度", "value": "T" }
                , { "name": "體感溫度", "value": "AT" }
                , { "name": "露點溫度", "value": "Td" }
                , { "name": "相對溼度", "value": "RH" }
                , { "name": "降雨機率", "value": "PoP" }
                , { "name": "降雨機率6h", "value": "PoP6h" }
                , { "name": "風", "value": "Wind" }
                , { "name": "舒適度", "value": "CI" }
                , { "name": "天氣描述", "value": "WeatherDescription" }
            ]
        },
        "36h": {

        }

    }
});
