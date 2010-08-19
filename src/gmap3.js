$(document).ready(function() {
  $.fn.gmap3 = function (options) {
        var defaults = {
            lat: 0.0,
            lng: 0.0,
            zoom: 4,
            navControl: true
        };
        var options = $.extend(defaults, options);

        // Allows multiple elements to be selected.
        if (this.length > 1) {
            this.each(function () { $(this).gmap(options) });
            return this;
        }

        // global var to access the google map object
        this.map;

        // overlay hash used for clearing
        this.overlays = [];

        // Initializes the map
        this.initialize = function () {
            var latlng = new google.maps.LatLng(options.lat, options.lng);
            var settings = {
                zoom: options.zoom,
                center: latlng,
                mapTypeControl: true,
                mapTypeControlOptions: { style: google.maps.MapTypeControlStyle.DROPDOWN_MENU },
                navigationControl: options.navControl,
                navigationControlOptions: { style: google.maps.NavigationControlStyle.SMALL },
                mapTypeId: google.maps.MapTypeId.SATELLITE
            }
            this.map = new google.maps.Map($(this)[0], settings);
            return this;
        };

        // set map type
        this.setTypeRoadMap = function () {
            this.map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
        }
        this.setTypeSatellite = function () {
            this.map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
        }
        this.setTypeHybrid = function () {
            this.map.setMapTypeId(google.maps.MapTypeId.HYBRID);
        }
        this.setTypeTerrain = function () {
            this.map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
        }

        // set the map center
        this.setCenter = function (lat, lng) {
            this.map.setCenter(new google.maps.LatLng(lat, lng));
        }

        // zoom methods
        this.getZoom = function () {
            return this.map.getZoom();
        }
        this.setZoom = function (level) {
            this.map.setZoom(level);
        }

        // add a marker to the map by address
        this.addMarkerByAddress = function (address, title, html) {
            var localmap = this.map;
            $.fn.gmap3.geoCodeAddress(address, function (latlng) {
                return _addMarkerByLatLng(latlng, title, html, localmap);
            });
        }
        // add a marker to the map by lat / lng
        this.addMarkerByLatLng = function (lat, lng, title, html) {
            var latlng = new google.maps.LatLng(lat, lng);
            return _addMarkerByLatLng(latlng, title, html, this.map, this.overlays);
        }

        // add a path to the map
        this.addPath = function (data, opts) {
            var defOpts = {
                color: "#ff0000",
                opacity: 1.0,
                strokeWeight: 2.0
            };
            var opts = $.extend(defOpts, opts);

            if (data != undefined) {

                var path = new google.maps.Polyline({
                    path: _convertData(data),
                    strokeColor: opts.color,
                    strokeOpacity: opts.opacity,
                    strokeWeight: opts.strokeWeight
                });

                path.setMap(this.map);
                this.overlays.push(path);
            }
            return this;
        }

        // add a polygon to the map
        this.addPolygon = function (data, opts) {
            return _addPolygonToMap(data, null, opts, this.map, this.overlays);
        };

        // add a polygon to the map
        this.addClickablePolygon = function (data, html, opts) {
            return _addPolygonToMap(data, html, opts, this.map, this.overlays);
        };

        // clear the overlays
        this.clear = function () {
            if (this.overlays != undefined) {
                for (var i = 0; i < this.overlays.length; i++) {
                    this.overlays[i].setMap(null);
                }
                this.overlays = [];
            }
        }

        this.toggleDebug = function () {

            // Create new control to display latlng and coordinates under mouse.
            var latLngControl = new _latLngControl(this.map);

            // Register event listeners
            google.maps.event.addListener(this.map, 'mouseover', function (mEvent) {
                latLngControl.set('visible', true);
            });
            google.maps.event.addListener(this.map, 'mouseout', function (mEvent) {
                latLngControl.set('visible', false);
            });
            google.maps.event.addListener(this.map, 'mousemove', function (mEvent) {
                latLngControl.updatePosition(mEvent.latLng);
            });

            return this;
        }

        this.onclickReverseGeocode = function (callback) {
            geocode = google.maps.event.addListener(this.map, 'click', function (me) {
                $.fn.gmap3.geoCodeLatLng(me.latLng.lat(), me.latLng.lng(), function (address) {
                    if (callback != undefined) {
                        callback(address);
                    }
                });
            });
        }

        this.onclickGetLatLng = function (callback) {
            geocode = google.maps.event.addListener(this.map, 'click', function (me) {
                var result = [me.latLng.lat(), me.latLng.lng()];
                if (callback != undefined) {
                    callback(result);
                }
            });
        }

        /* ------------- Globals functions ------------------ */

        // Updates a registered element with the address (reverse geocode)
        $.fn.gmap3.geocoder = new google.maps.Geocoder();
        $.fn.gmap3.geoCodeLatLng = function (lat, lng, callback) {
            var latlng = new google.maps.LatLng(lat, lng);
            $.fn.gmap3.geocoder.geocode({ 'latLng': latlng }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var str = results[0].formatted_address;
                    /*                            $.each(results, function () {
                    str += "<h4>" + this.formatted_address + "</h4>";
                    str += "types: " + this.types.join(", ") + "<br />";
                    str += "address components: <ul>"
                    $.each(this.address_components, function () {
                    str += "<li>" + this.types.join(", ") + ": " + this.long_name + "</li>";
                    });
                    str += "</ul>";
                    });*/
                    callback(str);
                } else {
                    alert("Geocoder failed due to: " + status);
                }
            });
        }

        $.fn.gmap3.geoCodeAddress = function (address, callback) {
            $.fn.gmap3.geocoder.geocode({ 'address': address }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (callback != undefined) {
                        callback(results[0].geometry.location);
                    }
                    else {
                        return results;
                    }
                } else {
                    alert("Geocoder failed due to: " + status);
                }
            });
        }



        /* ------------- Private functions ------------------ */

        // Adds a marker to the map
        function _addMarkerByLatLng(latlng, title, html, theMap, overlays) {
            var marker = new google.maps.Marker({
                position: latlng,
                map: theMap,
                title: title
            });
            overlays.push(marker);

            if (html != undefined) {
                var infowindow = new google.maps.InfoWindow();
                google.maps.event.addListener(marker, 'click', function () {
                    infowindow.setContent(html);
                    infowindow.open(theMap, marker);
                });
            }
            return this;
        }

        // Adds a polygon to the map
        function _addPolygonToMap(data, html, opts, theMap, overlays) {
            var defOpts = {
                strokeColor: "#ff0000",
                strokeOpacity: 0.8,
                strokeWeight: 2.0,
                fillColor: "#ff0000",
                fillOpacity: 0.35
            };
            var opts = $.extend(defOpts, opts);

            if (data != undefined) {

                var polygon = new google.maps.Polygon({
                    paths: _convertData(data),
                    strokeColor: opts.strokeColor,
                    strokeOpacity: opts.strokeOpacity,
                    strokeWeight: opts.strokeWeight,
                    fillColor: opts.fillColor,
                    fillOpacity: opts.fillOpacity
                });

                polygon.setMap(theMap);
                overlays.push(polygon);

                if (html != undefined) {
                    var infowindow = new google.maps.InfoWindow();
                    google.maps.event.addListener(polygon, 'click', function (event) {
                        infowindow.setContent(html);
                        infowindow.setPosition(event.latLng);
                        infowindow.open(theMap);
                    });
                }
            }

            return this;
        }

        // Converts array of JSON lat/lng into google array
        function _convertData(data) {
            var pts = [];
            for (var i = 0; i < data.length; i++) {
                pts[i] = new google.maps.LatLng(data[i].lat, data[i].lng);
            }
            return pts;
        }

        // Creates html that follows the mouse and displays lat/lng.
        function _latLngControl(map) {
            /**
            * Offset the control container from the mouse by this amount.
            */
            this.ANCHOR_OFFSET_ = new google.maps.Point(8, 8);

            /**
            * Pointer to the HTML container.
            */
            this.node_ = this.createHtmlNode_();

            // Add control to the map. Position is irrelevant.
            map.controls[google.maps.ControlPosition.TOP].push(this.node_);

            // Bind this OverlayView to the map so we can access MapCanvasProjection
            // to convert LatLng to Point coordinates.
            this.setMap(map);

            // Register an MVC property to indicate whether this custom control
            // is visible or hidden. Initially hide control until mouse is over map.
            this.set('visible', false);
        }

        // Extend OverlayView so we can access MapCanvasProjection.
        _latLngControl.prototype = new google.maps.OverlayView();
        _latLngControl.prototype.draw = function () { };

        _latLngControl.prototype.createHtmlNode_ = function () {
            var divNode = document.createElement('div');
            divNode.id = 'latlng-control';
            divNode.index = 100;
            return divNode;
        };

        _latLngControl.prototype.visible_changed = function () {
            this.node_.style.display = this.get('visible') ? '' : 'none';
        };

        _latLngControl.prototype.updatePosition = function (latLng) {
            var projection = this.getProjection();
            var point = projection.fromLatLngToContainerPixel(latLng);

            // Update control position to be anchored next to mouse position.
            this.node_.style.left = point.x + this.ANCHOR_OFFSET_.x + 'px';
            this.node_.style.top = point.y + this.ANCHOR_OFFSET_.y + 'px';

            // Update control to display latlng and coordinates.
            this.node_.innerHTML = [
                          latLng.toUrlValue(4),
                          '<br/>',
                          point.x,
                          'px, ',
                          point.y,
                          'px'
                        ].join('');
        };

        // Initialize the map
        return this.initialize();
    };
});