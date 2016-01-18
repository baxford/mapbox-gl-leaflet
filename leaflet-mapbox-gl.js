L.MapboxGL = L.TileLayer.extend({

  initialize: function (options) {
    L.setOptions(this, options);

    //if (options.accessToken) {
    //  mapboxgl.accessToken = options.accessToken;
    //} else {
    //  throw new Error('You should provide a Mapbox GL access token as a token option.');
    //}
    //this.transform = new Transform(options.minZoom, options.maxZoom);
  },

  onAdd: function (map) {
    this._map = map;

    if (!this._glContainer) {
      this._initContainer();
    }

    map._panes.tilePane.appendChild(this._glContainer);
    map.on('zoomanim', this._animateZoom, this);
    map.on('move', this._update, this);

    this._initGL();
  },

  onRemove: function (map) {
    map.getPanes().tilePane.removeChild(this._glContainer);
    map.off('zoomanim', this._animateZoom, this);
    map.off('move', this._update, this);
    this._glMap.remove();
    this._glMap = null;
  },

  addTo: function (map) {
    map.addLayer(this);
    return this;
  },

  _initContainer: function () {
    var container = this._glContainer = L.DomUtil.create('div', 'leaflet-gl-layer');

    var size = this._map.getSize();
    container.style.width  = size.x + 'px';
    container.style.height = size.y + 'px';
  },

  _initGL: function () {
    var center = this._map.getCenter();

    var options = L.extend({}, this.options, {
      container: this._glContainer,
      interactive: false,
      center: [center.lng, center.lat],
      zoom: this._map.getZoom() - 1,
      attributionControl: false
    });

    this._glMap = new mapboxgl.Map(options);
    this._glMap.transform.latRange = null;
  },

  //_layerAdd: function(e) {
  //  console.log(e);
  //},
  _update: function () {
    var size = this._map.getSize(),
        container = this._glContainer,
        gl = this._glMap,
        topLeft = this._map.containerPointToLayerPoint([0, 0]);

    L.DomUtil.setPosition(container, topLeft);

    var center = this._map.getCenter();

    // gl.setView([center.lat, center.lng], this._map.getZoom() - 1, 0);
    // calling setView directly causes sync issues because it uses requestAnimFrame

    var tr = gl.transform;
    var newCenter = mapboxgl.LngLat.convert([center.lng, center.lat]);
    var newZoom = this._map.getZoom() - 1;
    //tr.zoom = newZoom;
    this._glMap.setZoom(newZoom)
    tr.center = newCenter;
    console.log(center.lat + ', ' + center.lng)
    console.log(newCenter.lat + ', ' + newCenter.lng)


    console.log(this._map.getZoom() + ', '  + newZoom+', '+ tr.zoom);
    if (gl.transform.width !== size.x || gl.transform.height !== size.y) {
      container.style.width  = size.x + 'px';
      container.style.height = size.y + 'px';
      gl.resize();
    } else {
      gl._update();
    }
  },

  _animateZoom: function (e) {
    var halfSize = this._map.getSize().divideBy(2);
    var currentPos = this._map._getMapPanePos();

    var map = this._map,
        origin = map._latLngToNewLayerPoint(e.center, e.zoom, map.getCenter());
    var offset = origin.add(currentPos).subtract(halfSize);
    this._glMap.zoomTo(e.zoom - 1, {
      duration: 250,
      offset: [offset.x, offset.y],
      easing: [0, 0, 0.25, 1]
    });
  }
});

L.mapboxGL = function (options) {
  return new L.MapboxGL(options);
};