var CIRCLE_PARAM = {
    center: [0, 0],
    radius: 100,
    unit: 'meters',
    color: '#0000ff',
    opacity: 0.2,
    outlinecolor: '#ffffff',
    outlinewidth: 3,
    dashline: undefined,
    circleStep: 128,
    icon: {
        "default": undefined,
        zoomIn: undefined,
        zoomOut: undefined //缩小状态图标
    },
    iconPosition: 80,
    callback: null //返回函数
};
var mapboxpro;
(function (mapboxpro) {
    var CircleControl = /** @class */ (function () {
        function CircleControl(map, options) {
            this._geojson = {
                type: 'FeatureCollection',
                features: []
            };
            this._source = {
                type: 'geojson',
                data: this._geojson
            };
            this._marker = null;
            this._sourceId = null;
            this._layerIds = [];
            this._map = map;
            var param = this._param = JSON.parse(JSON.stringify(CIRCLE_PARAM));
            for (var key in options) {
                if (options[key]) {
                    param[key] = options[key];
                }
            }
            this.createLayer();
            this.createMarker();
            this.createCircle();
        }
        CircleControl.prototype.createMarker = function () {
            var param = this._param;
            var geojson = this._geojson;
            var source = this._source;
            var image = document.createElement('img');
            image.src = param.icon["default"];
            var marker = this._marker = new mapboxgl.Marker({
                element: image,
                draggable: true
            }).setLngLat([0, 0]).addTo(this._map);
            var preDistance = 100;
            function onDrag() {
                var lngLat = [marker.getLngLat().lng, marker.getLngLat().lat];
                var center = param.center;
                var distance = MathDistance(center, lngLat) * 111325;
                if (distance > preDistance) {
                    image.setAttribute('src', param.icon.zoomIn);
                }
                else {
                    image.setAttribute('src', param.icon.zoomOut);
                }
                preDistance = distance;
                var circle_options = { steps: param.circleStep, units: param.unit };
                var circle = turf.circle(center, distance, circle_options);
                var lngLat2 = circle.geometry.coordinates[0][param.iconPosition];
                marker.setLngLat(lngLat2);
                // console.log(lngLat2.toString());
                geojson.features[0] = circle;
                source.setData(geojson);
            }
            function onDragEnd() {
                image.setAttribute('src', param.icon["default"]);
                if (param.callback) {
                    var lngLat = [marker.getLngLat().lng, marker.getLngLat().lat];
                    var center = param.center;
                    var distance = MathDistance(center, lngLat) * 111325;
                    param.callback({
                        radius: distance,
                        center: center
                    });
                }
            }
            marker.on('drag', onDrag);
            marker.on('dragend', onDragEnd);
            function MathDistance(pnt1, pnt2) {
                return (Math.sqrt(Math.pow((pnt1[0] - pnt2[0]), 2) + Math.pow((pnt1[1] - pnt2[1]), 2)));
            }
        };
        CircleControl.prototype.createLayer = function () {
            var param = this._param;
            var map = this._map;
            var guid = this._newGuid();
            var sourceId = this._sourceId = 'circle_control_source_' + guid;
            map.addSource(sourceId, this._source);
            // 线图层
            var layer_line = {
                id: 'circle_control_layer_line_' + guid,
                source: sourceId,
                type: 'line',
                paint: {
                    'line-color': param.outlinecolor,
                    'line-width': param.outlinewidth
                },
                filter: ['all',
                    ['==', '$type', 'Polygon']
                ]
            };
            // 面图层
            var layer_fill = {
                id: 'circle_control_layer_fill_' + guid,
                source: sourceId,
                type: 'fill',
                paint: {
                    'fill-color': param.color,
                    'fill-opacity': param.opacity
                },
                filter: ['all',
                    ['==', '$type', 'Polygon']
                ]
            };
            map.addLayer(layer_line);
            map.addLayer(layer_fill);
            this._layerIds.push(layer_fill.id, layer_line.id);
            this._source = map.getSource(sourceId);
        };
        CircleControl.prototype.createCircle = function () {
            var param = this._param;
            var center = param.center;
            var circle_options = { steps: param.circleStep, units: param.unit };
            var circle = turf.circle(center, param.radius, circle_options);
            var lngLat = circle.geometry.coordinates[0][param.iconPosition];
            this._marker.setLngLat(lngLat);
            //console.log(lngLat.toString());
            this._geojson.features.push(circle);
            this._source.setData(this._geojson);
        };
        CircleControl.prototype.clear = function () {
            if (this._source && this._layerIds.length > 0) {
                for (var i = 0; i < this._layerIds.length; i++) {
                    this._map.removeLayer(this._layerIds[i]);
                }
                this._map.removeSource(this._sourceId);
                this._marker.remove();
            }
        };
        /**
         * 生成GUID
         * @returns {string}
         */
        CircleControl.prototype._newGuid = function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        };
        return CircleControl;
    }());
    mapboxpro.CircleControl = CircleControl;
})(mapboxpro || (mapboxpro = {}));
