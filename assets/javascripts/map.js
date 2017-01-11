$(document).ready(function () {
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
            attribution: "Map data &copy; <a href='http://maps.google.com' target='_blank'>GoogleStreetMap</a>"
        }),
        gim: L.tileLayer('http://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
            subdomains: '0123',
            maxZoom: 20,
            attribution: "Map data &copy; <a href='http://maps.google.com' target='_blank'>GoogleImages</a>"
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
    }, null, { position: "bottomleft" }).addTo(map);
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
    geolocationButton.control.onAdd = function (map) {
        var triggerButton = L.DomUtil.create("div", "leaflet-bar");
        triggerButton.style.backgroundImage = "url(style/images/geolocation.png)";
        triggerButton.style.backgroundSize = "20px 20px";
        triggerButton.style.width = "30px";
        triggerButton.style.height = "30px";
        triggerButton.style.backgroundRepeat = "no-repeat";
        triggerButton.style.backgroundPosition = "center";
        triggerButton.style.backgroundColor = "white";
        triggerButton.style.cursor = "pointer";

        L.DomEvent.addListener(triggerButton, 'click', function (e) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    map.setView([position.coords.latitude, position.coords.longitude], 16);
                    geolocationMarker.range([position.coords.latitude, position.coords.longitude], position.coords.accuracy);
                    geolocationMarker.go([position.coords.latitude, position.coords.longitude]);
                }, function (err) {
                    alert(JSON.stringify(err));
                }, { timeout: 10000 });
            }
        });

        return triggerButton;
    }
    geolocationButton.control.addTo(map);

    var geolocationMarker = { //定位點以及周圍
        go: function (latlng) {
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
                this.marker.on("click", function () {
                    self.remove();
                }).addTo(this.layers);
            }
        },
        range: function (latlng, radius) {
            var self = this;
            if (this.circle) {
                this.circle.setLatLng(latlng).setRadius(radius).addTo(this.layers);
            }
            else {
                this.circle = L.circle(latlng, radius);
                this.circle.setStyle({ color: "#00BCD4", fillColor: "#00BCD4" });
                var id = L.Util.stamp(this.circle);
                this.circle.on("click", function () {
                    self.remove();
                }).addTo(this.layers);
            }
            return this.circle.getBounds();
        },
        remove: function () {
            this.layers.clearLayers();
        },
        layers: L.layerGroup().addTo(map)
    };

    var menuItem = {
        "1w": {
            "name": "一週預報",
            "county": "option",
            "dataType": {
                "Wx":
                {
                    "name": "天氣型態", "calValue": "parameterValue", "popup": [{ "value": "parameterName" }]
                    , colorMap: function (value) {
                        return "rgb(0,200,200)";
                    }
                }
                , "MaxT": {
                    "name": "最高溫", "calValue": "parameterName", "popup": [{ "value": "parameterName", "after": "\xB0 C" }]
                    , colorMap: function (value) {
                        var num = parseInt(value);
                        if (num > 20) {
                            if (num > 35) {
                                return "rgb(255,255,0)"
                            } else {
                                var gb = parseInt((35 - num) / 15 * 255);
                                return "rgb(255," + gb + "," + gb + ")";
                            };
                        } else if (num <= 20) {
                            if (num < 5) {
                                return "rgb(0,255,0)"
                            } else {
                                var rg = parseInt((num - 5) / 15 * 255);
                                return "rgb(" + rg + "," + rg + ",255)";
                            };
                        }
                    }
                }
                , "MinT": {
                    "name": "最低溫", "calValue": "parameterName", "popup": [{ "value": "parameterName", "after": "\xB0 C" }]
                    , colorMap: function (value) {
                        var num = parseInt(value);
                        if (num > 20) {
                            if (num > 35) {
                                return "rgb(255,255,0)"
                            } else {
                                var gb = parseInt((35 - num) / 15 * 255);
                                return "rgb(255," + gb + "," + gb + ")";
                            };
                        } else if (num <= 20) {
                            if (num < 5) {
                                return "rgb(0,255,0)"
                            } else {
                                var rg = parseInt((num - 5) / 15 * 255);
                                return "rgb(" + rg + "," + rg + ",255)";
                            };
                        }
                    }
                }
            }
        },
        "36h": {
            "name": "三十六小時天氣預報",
            "county": "false",
            "dataType": {
                "Wx": {
                    "name": "天氣型態", "calValue": "parameterValue", "popup": [{ "value": "parameterName" }]
                    , colorMap: function (value) {
                        return "rgb(0,200,200)";
                    }
                }
                , "MaxT": {
                    "name": "最高溫", "calValue": "parameterName", "popup": [{ "value": "parameterName", "after": "\xB0 C" }]
                    , colorMap: function (value) {
                        var num = parseInt(value);
                        // 35-5 color map
                        if (num > 20) {
                            if (num > 35) {
                                return "rgb(255,255,0)"
                            } else {
                                var gb = parseInt((35 - num) / 15 * 255);
                                return "rgb(255," + gb + "," + gb + ")";
                            };
                        } else if (num <= 20) {
                            if (num < 5) {
                                return "rgb(0,255,0)"
                            } else {
                                var rg = parseInt((num - 5) / 15 * 255);
                                return "rgb(" + rg + "," + rg + ",255)";
                            };
                        }
                    }
                }
                , "MinT": {
                    "name": "最低溫", "calValue": "parameterName", "popup": [{ "value": "parameterName", "after": "\xB0 C" }]
                    , colorMap: function (value) {
                        var num = parseInt(value);
                        if (num > 20) {
                            if (num > 35) {
                                return "rgb(255,255,0)"
                            } else {
                                var gb = parseInt((35 - num) / 15 * 255);
                                return "rgb(255," + gb + "," + gb + ")";
                            };
                        } else if (num <= 20) {
                            if (num < 5) {
                                return "rgb(0,255,0)"
                            } else {
                                var rg = parseInt((num - 5) / 15 * 255);
                                return "rgb(" + rg + "," + rg + ",255)";
                            };
                        }
                    }
                }
                , "CI": { "name": "舒適程度", "calValue": "parameterName", "popup": [{ "value": "parameterName" }] }
                , "PoP": {
                    "name": "降雨機率", "calValue": "parameterName", "popup": [{ "value": "parameterName", "after": "\%" }], colorMap: function (value) {
                        var num = parseInt(value);
                        var rg = parseInt((100 - num) / 100 * 255);
                        return "rgb(" + rg + "," + rg + ",255)";
                    }
                }
            }

        }
        // , "2d": {
        //     "name": "2天天氣預報",
        //     "county": "true",
        //     "dataType": [{ "name": "天氣型態", "value": "Wx" }
        //         , { "name": "溫度", "value": "T" }
        //         , { "name": "體感溫度", "value": "AT" }
        //         , { "name": "露點溫度", "value": "Td" }
        //         , { "name": "相對溼度", "value": "RH" }
        //         , { "name": "降雨機率", "value": "PoP" }
        //         , { "name": "降雨機率6h", "value": "PoP6h" }
        //         , { "name": "風", "value": "Wind" }
        //         , { "name": "舒適度", "value": "CI" }
        //         , { "name": "天氣描述", "value": "WeatherDescription" }
        //     ]
        // }
    }


    //ui ======================
    var countyBoardLayerGroup = L.layerGroup();
    countyBoardLayerGroup.addTo(map);

    var currentDataLength = "36h";
    var sel_dataType = $("#sel_dataType");
    var sel_time = $("#sel_time");

    $(".radio_dataLength").click(function () {
        var dataLength = $(this).val();
        currentDataLength = dataLength;
        getData(dataLength);
    });

    var weatherData = {};
    getData("36h");
    //取得資料並繪製縣市區塊
    function getData(dataLength, county) {
        $(".enableWhenLoaded").attr("disabled", true);
        $("#span_loader").css("display", "inline-block");
        if (weatherData[dataLength]) {
            genDataTypeSelectMenu(dataLength);
            //genTimeSelectMenu(weatherData[dataLength].timeList);
            $(".enableWhenLoaded").attr("disabled", false);
            $("#span_loader").css("display", "none");
        } else {
            var url = "/api/" + dataLength;
            if (county) {
                url = url + "?county=" + encodeURI(county);
            }
            $.ajax({
                url: url
                , dataType: "json"
            }).done(function (data) {
                weatherData[dataLength] = data;
                genDataTypeSelectMenu(dataLength);
                //genTimeSelectMenu(data.timeList);
            }).always(function () {
                $(".enableWhenLoaded").attr("disabled", false);
                $("#span_loader").css("display", "none");
            });
        }
    }

    // generate dataType (wx,tmin,tmax...) menu from menuItem object
    function genDataTypeSelectMenu(dataLength) {
        var menuObj = menuItem[dataLength].dataType;
        sel_dataType.empty();
        for (var key in menuObj) {
            sel_dataType.append("<option value='" + key + "'>" + menuObj[key].name + "</option>");
        }
        sel_dataType.trigger("change");
    }

    sel_dataType.change(function () {
        var wxValue = this.value;
        sel_time.empty();
        for (var key in weatherData[currentDataLength]["data"][wxValue]) {
            sel_time.append("<option value='" + key + "'>" + key + "</option>");
        }
        sel_time.trigger("change");
    });

    sel_time.change(function () {
        var wxValue = sel_dataType.find("option:selected").val();
        var timeValue = this.value;

        drawData(wxValue, timeValue);
    });

    function drawData(wxValue, timeValue) {
        var dataPerCountyObj = weatherData[currentDataLength]["data"][wxValue][timeValue];
        var calValue = menuItem[currentDataLength]["dataType"][wxValue]["calValue"];
        var fillColorFunction = menuItem[currentDataLength]["dataType"][wxValue]["colorMap"];

        countyBoardLayerGroup.clearLayers();
        for (var key in dataPerCountyObj) {
            var dataValue = dataPerCountyObj[key][calValue];
            countyBoardLayerGroup.addLayer(L.geoJSON(countyBoard[key], {
                style: {
                    weight: 1,
                    opacity: 0.8,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7,
                    fillColor: fillColorFunction(dataValue)
                }
            })
            );
        }
    }
});
