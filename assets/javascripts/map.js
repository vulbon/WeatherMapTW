$(document).ready(function () {
    var proxyUrl = "/proxy?";
    // map
    var mapBounds = L.latLngBounds(L.latLng(21.88, 118.12), L.latLng(25.44, 122.49));

    var tileLayers = {
        nlscEmap: L.tileLayer(proxyUrl + "http://maps.nlsc.gov.tw/S_Maps/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=EMAP&STYLE=_null&TILEMATRIXSET=EPSG:3857&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png", {
            maxZoom: 19,
            attribution: "Map data &copy; <a href='http://maps.nlsc.gov.tw/' target='_blank'>國土測繪中心</a>-臺灣通用電子地圖"
        }),
        nlscImage: L.tileLayer(proxyUrl + "http://maps.nlsc.gov.tw/S_Maps/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=PHOTO2&STYLE=_null&TILEMATRIXSET=EPSG:3857&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png", {
            maxZoom: 19,
            attribution: "Map data &copy; <a href='http://maps.nlsc.gov.tw/' target='_blank'>國土測繪中心</a>-正射影像"
        }),
        osmCycle: L.tileLayer(proxyUrl + "http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png", {
            subdomains: "abc",
            maxZoom: 20,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a>'
        }),
        gsm: L.tileLayer(proxyUrl + "http://mt{s}.google.com/vt/x={x}&y={y}&z={z}", {
            subdomains: '0123',
            maxZoom: 20,
            attribution: "Map data &copy; <a href='http://maps.google.com' target='_blank'>GoogleStreetMap</a>"
        }),
        gim: L.tileLayer(proxyUrl + "http://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
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

    // move zoom controller to bottom right
    L.control.zoom({
        position: "bottomright"
    }).addTo(map);

    // layers change
    L.control.layers({
        "臺灣通用電子地圖": tileLayers.nlscEmap,
        "正射影像": tileLayers.nlscImage,
        "OSM-CycleMap": tileLayers.osmCycle,
        "Google Street": tileLayers.gsm,
        "Google Image": tileLayers.gim
    }, null, { position: "bottomright" }).addTo(map);

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
                    map.setView([position.coords.latitude, position.coords.longitude]);
                    geolocationMarker.range([position.coords.latitude, position.coords.longitude], position.coords.accuracy);
                    geolocationMarker.go([position.coords.latitude, position.coords.longitude]);
                }, function (err) {
                    alert("無法取得您的目前位置");
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

    var colorMapFunction = {
        "Wx": function (value) {
            // http://opendata.cwb.gov.tw/opendatadoc/MFC/A0012-001.pdf
            var rgbValue = "rgb(0,0,0)";
            switch (value) {
                // 晴天，多雲
                case "1": case "2": case "7": case "8":
                    rgbValue = "rgb(255,200,50)";
                    break;
                // 陰天
                case "3": case "5": case "6":
                    rgbValue = "rgb(150,150,150)";
                    break;
                // 雨天
                case "4": case "12": case "13": case "17": case "18": case "24": case "26": case "31": case "34": case "36": case "49": case "57": case "58": case "59":
                    rgbValue = "rgb(100,100,255)";
                    break;
                // 霧
                case "43": case "44": case "45": case "46":
                    rgbValue = "rgb(255,255,100)";
                    break;
                // 雪
                case "60":
                    rgbValue = "rgb(255,255,255)";
                    break;
            }
            return rgbValue;
        },
        "T": function (value) {
            var num = parseInt(value);
            if (num > 20) {
                if (num > 35) {
                    return "rgb(255,0,255)";
                } else {
                    var gb = parseInt((35 - num) / 15 * 255);
                    return "rgb(255," + gb + "," + gb + ")";
                };
            } else if (num <= 20) {
                if (num < 5) {
                    return "rgb(255,0,255)";
                } else {
                    var rg = parseInt((num - 5) / 15 * 255);
                    return "rgb(" + rg + "," + rg + ",255)";
                };
            }
        }, "CI": function (value) {

        }, "PoP": function (value) {
            var num = parseInt(value);
            var rg = parseInt((100 - num) / 100 * 255);
            return "rgb(" + rg + "," + rg + ",255)";
        }
    }

    var menuItem = {
        "1w": {
            "name": "一週預報",
            "county": "option",
            "dataType": {
                "Wx":
                {
                    "name": "天氣型態"
                    , "showInMenu": true
                    , "calValue": "parameterValue"
                    , "popupValue": "parameterName"
                    , colorMap: colorMapFunction.Wx
                }
                , "MaxT": {
                    "name": "最高溫"
                    , "showInMenu": true
                    , "calValue": "parameterName"
                    , "popupValue": "parameterName"
                    , colorMap: colorMapFunction.T

                }
                , "MinT": {
                    "name": "最低溫"
                    , "showInMenu": true
                    , "calValue": "parameterName"
                    , "popupValue": "parameterName"
                    , colorMap: colorMapFunction.T
                }
            }
        },
        "36h": {
            "name": "三十六小時天氣預報",
            "county": "false",
            "dataType": {
                "Wx": {
                    "name": "天氣型態"
                    , "showInMenu": true
                    , "calValue": "parameterValue"
                    , "popupValue": "parameterName"
                    , colorMap: colorMapFunction.Wx
                }
                , "MaxT": {
                    "name": "最高溫"
                    , "showInMenu": true
                    , "calValue": "parameterName"
                    , "popupValue": "parameterName"
                    , colorMap: colorMapFunction.T
                }
                , "MinT": {
                    "name": "最低溫"
                    , "showInMenu": true
                    , "calValue": "parameterName"
                    , "popupValue": "parameterName"
                    , colorMap: colorMapFunction.T
                }
                , "CI": {
                    "name": "舒適程度"
                    , "showInMenu": false
                    , "calValue": "parameterName"
                    , "popupValue": "parameterName"
                }
                , "PoP": {
                    "name": "降雨機率"
                    , "showInMenu": true
                    , "calValue": "parameterName"
                    , "popupValue": "parameterName"
                    , colorMap: colorMapFunction.PoP
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
    // right panel
    var rightPanel = L.control.sidebar("right_panel", {
        closeButton: true,
        autoPan: false,
        position: "right"
    });
    map.addControl(rightPanel);


    // data to show
    var currentDataLength = "1w";
    var currentDisplayTime = "";
    var countyBoardLayerGroup = L.layerGroup();
    countyBoardLayerGroup.addTo(map);

    var sel_dataType = $("#sel_dataType");
    var sel_time = $("#sel_time");
    var div_panelContent = $("#div_panelContent");

    $(".radio_dataLength").click(function () {
        var dataLength = $(this).val();
        currentDataLength = dataLength;
        currentDisplayTime = "";
        getData(dataLength);
    });

    var weatherData = {};
    getData(currentDataLength);
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
            if (menuObj[key].showInMenu) {
                sel_dataType.append("<option value='" + key + "'>" + menuObj[key].name + "</option>");
            }
        }
        sel_dataType.trigger("change");
    }

    sel_dataType.change(function () {
        var wxValue = this.value;
        sel_time.empty();
        for (var key in weatherData[currentDataLength]["data"][wxValue]) {
            sel_time.append("<option value='" + key + "'>" + key + "</option>");
        }

        if (currentDisplayTime != "") {
            sel_time.val(currentDisplayTime);
        }
        sel_time.trigger("change");
    });

    sel_time.change(function () {
        var wxValue = sel_dataType.find("option:selected").val();
        var timeValue = this.value;

        currentDisplayTime = timeValue;
        drawData(wxValue, timeValue);
    });

    function generatePanelContent(county) {
        div_panelContent.empty();

        var data = weatherData[currentDataLength]["data"];

        var showItem = menuItem[currentDataLength]["dataType"]
        var resultTable = "<table class='table_popup'><tbody><tr><td>時間</td>";
        for (var key in showItem) {
            resultTable += "<td>" + showItem[key]["name"] + "</td>";
        }
        resultTable += "</tr>";

        for (var i = 0, ii = weatherData[currentDataLength]["timeList"].length; i < ii; i++) {
            var time = weatherData[currentDataLength]["timeList"][i];
            resultTable += "<tr><td>" + time + "</td>";
            for (var wxValue in showItem) {

                var calValue = menuItem[currentDataLength]["dataType"][wxValue]["calValue"]; // get config in menuItem
                var popupValue = menuItem[currentDataLength]["dataType"][wxValue]["popupValue"]; // get config in menuItem

                var dataValue = data[wxValue][time][county][calValue]; // get value in data;
                var showValue = data[wxValue][time][county][popupValue]; // get show value in data;

                var fillColorFunction = menuItem[currentDataLength]["dataType"][wxValue]["colorMap"];
                if (fillColorFunction) {
                    resultTable += "<td style='background-color:" + fillColorFunction(dataValue) + ";'>" + showValue + "</td>";
                } else {
                    resultTable += "<td>" + showValue + "</td>";
                }


            }
            resultTable += "</tr>";
        }

        resultTable += "</tbody></table>";

        div_panelContent.append("<label class='popup_title'>" + county + "</label></br>" + resultTable);
        //return resultTable;
    }

    function drawData(wxValue, timeValue) {
        var dataPerCountyObj = weatherData[currentDataLength]["data"][wxValue][timeValue];
        var calValue = menuItem[currentDataLength]["dataType"][wxValue]["calValue"];
        var fillColorFunction = menuItem[currentDataLength]["dataType"][wxValue]["colorMap"];

        countyBoardLayerGroup.clearLayers();
        for (var key in dataPerCountyObj) {
            var dataValue = dataPerCountyObj[key][calValue];
            var geojsonLayer = L.geoJSON(countyBoard[key], {
                style: {
                    weight: 1,
                    opacity: 0.8,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7,
                    fillColor: fillColorFunction(dataValue)
                },
                onEachFeature: function (feature, layer) {
                    layer.on({
                        click: function (e) {
                            generatePanelContent(feature.properties.COUNTYNAME);
                            rightPanel.show();
                        }
                    });
                }
            });
            // geojsonLayer.bindPopup(generatePanelContent(key),{"width":"350px"});
            // geojsonLayer.on("click", function (e) {
            //     e.originalEvent.preventDefault();
            //     e.originalEvent.stopPropagation();
            //     generatePanelContent(key);
            //     rightPanel.show();
            // });
            countyBoardLayerGroup.addLayer(geojsonLayer);
        }
    }
});
