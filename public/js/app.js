$(document).ready(function(){var t=L.latLngBounds(L.latLng(21.88,118.12),L.latLng(25.44,122.49)),o={nlscEmap:L.tileLayer("http://maps.nlsc.gov.tw/S_Maps/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=EMAP&STYLE=_null&TILEMATRIXSET=EPSG:3857&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png",{maxZoom:19,attribution:"Map data &copy; <a href='http://maps.nlsc.gov.tw/' target='_blank'>國土測繪中心</a>-臺灣通用電子地圖"}),nlscImage:L.tileLayer("http://maps.nlsc.gov.tw/S_Maps/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=PHOTO2&STYLE=_null&TILEMATRIXSET=EPSG:3857&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png",{maxZoom:19,attribution:"Map data &copy; <a href='http://maps.nlsc.gov.tw/' target='_blank'>國土測繪中心</a>-正射影像"}),osmCycle:L.tileLayer("http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png",{subdomains:"abc",maxZoom:20,attribution:'Map data &copy; <a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a>'}),gsm:L.tileLayer("http://mt{s}.google.com/vt/x={x}&y={y}&z={z}",{subdomains:"0123",maxZoom:20,attribution:"Map data &copy; <a href='http://maps.google.com' target='_blank'>GoogleStreetMap</a>"}),gim:L.tileLayer("http://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",{subdomains:"0123",maxZoom:20,attribution:"Map data &copy; <a href='http://maps.google.com' target='_blank'>GoogleImages</a>"})},e=L.map("map",{attributionControl:!0,zoomControl:!1,layers:o.nlscEmap}).fitBounds(t);L.control.layers({"臺灣通用電子地圖":o.nlscEmap,"正射影像":o.nlscImage,"OSM-CycleMap":o.osmCycle,"Google Street":o.gsm,"Google Image":o.gim},null).addTo(e),L.control.zoom({position:"bottomright"}).addTo(e);var a={control:L.control({position:"bottomright"}),opened:!1};a.control.onAdd=function(t){var o=L.DomUtil.create("div","leaflet-bar");return o.style.backgroundImage="url(style/images/geolocation.png)",o.style.backgroundSize="20px 20px",o.style.width="30px",o.style.height="30px",o.style.backgroundRepeat="no-repeat",o.style.backgroundPosition="center",o.style.backgroundColor="white",o.style.cursor="pointer",L.DomEvent.addListener(o,"click",function(o){navigator.geolocation&&navigator.geolocation.getCurrentPosition(function(o){t.setView([o.coords.latitude,o.coords.longitude],16),r.range([o.coords.latitude,o.coords.longitude],o.coords.accuracy),r.go([o.coords.latitude,o.coords.longitude])})}),o},a.control.addTo(e);var r={go:function(t){var o=this;if(this.marker)this.marker.setLatLng(t).addTo(this.layers);else{this.marker=L.marker(t,{icon:L.icon({iconUrl:"style/images/pin_red.png",iconSize:[40,40],iconAnchor:[20.5,37],popupAnchor:[0,0]})});L.Util.stamp(this.marker);this.marker.on("click",function(){o.remove()}).addTo(this.layers)}},range:function(t,o){var e=this;if(this.circle)this.circle.setLatLng(t).setRadius(o).addTo(this.layers);else{this.circle=L.circle(t,o),this.circle.setStyle({color:"#00BCD4",fillColor:"#00BCD4"});L.Util.stamp(this.circle);this.circle.on("click",function(){e.remove()}).addTo(this.layers)}return this.circle.getBounds()},remove:function(){this.layers.clearLayers()},layers:L.layerGroup().addTo(e)}});