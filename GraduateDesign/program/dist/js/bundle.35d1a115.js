(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _weibovis = require('./weibovis.js');

var _layout = require('./layout.js');

var _taxiVis = require('./taxiVis.js');

var _poivis = require('./poivis.js');

//global varible relate to vistap
var INITOBJ = {
    'textmap': 0,
    'eventmap': 0,
    'poimap': 0,
    'taxichart': 0
};

//weibo-vis dropdown-button initialize
$("#textvis-list").on("click", function (e) {
    switch (event.target.id) {
        case "weibo-text-vis":
            cleanMainWindow();
            if (INITOBJ.textmap) {
                INITOBJ.textmap.show();
            } else {
                var text_map = new _weibovis.WeiboTextMap("weibo-text-map");
                INITOBJ.textmap = text_map;
            }
            break;
        case "weibo-event-vis":
            cleanMainWindow();
            if (INITOBJ.eventmap) {

                INITOBJ.eventmap.show();
            } else {
                var event_map = new _weibovis.Event3DMapCesium("weibo-event-map");
                INITOBJ.eventmap = event_map;
            }

            break;
    }
});

//spatial-vis dropdown-button initialize
$("#spatialvis-list").on("click", function (e) {
    switch (event.target.id) {
        case "poi-vis":
            cleanMainWindow();
            if (INITOBJ.poimap) {
                INITOBJ.poimap.show();
            } else {
                var poi_map = new _poivis.PoiVisMap("poi-vis-map");
                INITOBJ.poimap = poi_map;
            }
            break;
    }
});

//time-vis dropdown-button initialize
$("#timevis-list").on("click", function (e) {
    switch (event.target.id) {
        case "trajectory-vis":
            cleanMainWindow();
            if (INITOBJ.taxichart) {

                INITOBJ.taxichart.show();
            } else {
                var taxichart = new _taxiVis.TaxiVisChart("trajectory-vis-container");
                INITOBJ.taxichart = taxichart;
            }
            break;
    }
});

function cleanMainWindow() {
    for (var name in INITOBJ) {
        if (INITOBJ[name]) {
            INITOBJ[name].hide();
        }
    }
}
//main window initialize
(0, _layout.layoutInit)();

// Initialize the index page
var text_map = new _weibovis.WeiboTextMap("weibo-text-map");
INITOBJ.textmap = text_map;

},{"./layout.js":2,"./poivis.js":3,"./taxiVis.js":4,"./weibovis.js":5}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
function layoutInit() {
	var clientHeight = document.body.clientHeight;
	var navHeight = $("nav").height();
	var mainHeight = clientHeight - navHeight - 15;
	$("#main").height(mainHeight);
}

exports.layoutInit = layoutInit;

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * the class of poi-vis-map
 */

var PoiVisMap = (function () {
	function PoiVisMap(domId) {
		_classCallCheck(this, PoiVisMap);

		this.domId = domId;
		$("#" + domId).show();
		var map = initMap(domId);
		$.get("http://202.114.123.53/zx/weibo/getWeiboData.php", { 'city': '武汉' }).then(function (data) {
			data = JSON.parse(data);
			var points = [];
			var heatMapPoint = [];
			for (var x in data) {
				var item = data[x];
				var lat = item.geo.coordinates[0];
				var lon = item.geo.coordinates[1];
				points.push([lat, lon]);
				heatMapPoint.push([lat, lon, 100.0]);
			}

			var heatMap = createHeatMap(heatMapPoint);
			map.addLayer(heatMap);

			var cluster = createCluster(points);
			cluster.on('layerremove', function (e) {
				console.log('heat');
			});

			createClusterLens(cluster, map, 'zoomlens');
			map.on('zoomend', function (e) {
				var current_level = e.target.getZoom();
				console.log(current_level);
				if (current_level <= 12) {
					map.addLayer(heatMap);
					map.removeLayer(cluster);
					$('#zoomlens').hide();
				} else if (current_level > 12 && current_level <= 15) {
					map.removeLayer(heatMap);
					map.addLayer(cluster);
				} else if (current_level > 15) {
					map.removeLayer(heatMap);
					map.removeLayer(cluster);
					$('#zoomlens').hide();
				}
			});
		});
	}

	_createClass(PoiVisMap, [{
		key: "show",
		value: function show() {
			$("#" + this.domId).show();
		}
	}, {
		key: "hide",
		value: function hide() {
			$("#" + this.domId).hide();
		}
	}]);

	return PoiVisMap;
})();

/**
 * initialize the map
 * @param  {[String]} domId [id of map's container]
 * @return {[Object]}       [map]
 */

function initMap(domId) {
	L.mapbox.accessToken = 'pk.eyJ1IjoiZG9uZ2xpbmdlIiwiYSI6Ik1VbXI1TkkifQ.7ROsya7Q8kZ-ky9OmhKTvg';
	var map = L.mapbox.map(domId, 'mapbox.light').setView([30.608623, 114.274462], 11);
	return map;
}

/**
 * create ClusterGroup
 * @param  {[Array]} data [like [[lat1,lon1],[lat2,lon2],...]  ]
 * @return {[Object]}      [MarkerClusterGroup]
 */
function createCluster(data) {
	var markers = new L.MarkerClusterGroup({
		showCoverageOnHover: false,
		zoomToBoundsOnClick: false
	});
	for (var i = 0, length = data.length; i < length; i++) {
		var latlng = new L.LatLng(data[i][0], data[i][1]);
		var marker = L.marker(latlng, {
			icon: L.mapbox.marker.icon({ 'marker-symbol': 'post', 'marker-color': '0044FF' })
		});
		markers.addLayer(marker);
	}

	return markers;
}

/**
 * create the cluster's lens
 * @param  {Object} cluster  [the cluster Object]
 * @param  {Object} map      [map object]
 * @param  {String} lendomId [lens's container ]
 * @return {null}          [null]
 */
function createClusterLens(cluster, map, lendomId) {
	//初始化zoommap
	var zoommap = L.mapbox.map('zoommap', 'mapbox.streets', {
		fadeAnimation: false,
		zoomControl: false,
		attributionControl: false
	});

	var oldLayer = [];
	var zl = document.getElementById(lendomId);
	cluster.on('clustermouseover', function (e) {

		var point = map.latLngToContainerPoint(e.latlng);
		$(zl).show();
		//get the current markers
		var clickMarkers = e.layer.getAllChildMarkers();

		//remove the old-marker of lens
		for (var m in oldLayer) {
			var old_marker = oldLayer[m];
			zoommap.removeLayer(old_marker);
		}
		oldLayer = [];
		//add the current markers to lens and oldLayer
		for (var i in clickMarkers) {
			var marker = clickMarkers[i];
			var latlng = marker._latlng;
			var zoomMarker = L.marker(latlng, {
				icon: L.mapbox.marker.icon({ 'marker-symbol': 'post', 'marker-color': '0044FF' })
			});
			zoomMarker.addTo(zoommap);
			oldLayer.push(zoomMarker);
		}
		//set the top/left of lens
		zl.style.top = point.y - 100 + 'px';
		zl.style.left = point.x - 100 + 'px';
		//set view of lens
		zoommap.setView(e.latlng, map.getZoom() + 1, true);
	});

	cluster.on('clusterlayerremove', function (e) {
		console.log(e);
	});

	map.on('click', function () {
		$("#" + lendomId).hide();
	});
	map.on("mouseout", function (e) {
		$("#" + lendomId).hide();
	});
}
/**
 * create HeatMap
 * @param  {Array} data [like [[lat,lon,value],[lat,lon,value],...] ]
 * @return {[Object]}      [heatLayer]
 */
function createHeatMap(data) {
	console.log(data.length);
	var heat, gradient;
	if (data.length < 1000) {
		gradient = {
			0.05: '#c7f127',
			0.1: '#daf127',
			0.2: '#f3f73b',
			0.4: '#FBEF0E',
			0.6: '#FFD700',
			0.8: '#f48e1a',
			1: 'red'
		};
		heat = L.heatLayer(data, { radius: 35, gradient: gradient });
	} else if (data.length >= 1000 && data.length < 2000) {
		gradient = {
			0.3: '#c7f127',
			0.4: '#daf127',
			0.5: '#f3f73b',
			0.6: '#FBEF0E',
			0.7: '#FFD700',
			0.8: '#f48e1a',
			1: 'red'
		};
		heat = L.heatLayer(data, { radius: 15, gradient: gradient });
	} else if (data.length >= 2000 && data.length < 3000) {
		gradient = {
			0.5: '#c7f127',
			0.55: '#daf127',
			0.6: '#f3f73b',
			0.7: '#FBEF0E',
			0.8: '#FFD700',
			0.98: '#f48e1a',
			1: 'red'
		};
		heat = L.heatLayer(data, { radius: 15, gradient: gradient });
	} else {
		gradient = {
			0.55: '#c7f127',
			0.65: '#daf127',
			0.7: '#f3f73b',
			0.8: '#FBEF0E',
			0.9: '#FFD700',
			0.99: '#f48e1a',
			1: 'red'
		};
		heat = L.heatLayer(data, { radius: 15, gradient: gradient });
	}

	return heat;
}

exports.PoiVisMap = PoiVisMap;

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/**
 * get the charts of taxi-vis
 * @param  {[string]} domId [dom's id of container]
 * @return {[objct]}       [flowchart passchart]
 */

var getCharts = (function () {
	var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(domId) {
		var container, rowdiv, rowdiv2, rowdiv3, cal_heat_dom, passChartDom, flowChartDom, flowChartDom2, heatmapdom, flowChart, passChart, flowChart2, wuhan_od, result_data;
		return regeneratorRuntime.wrap(function _callee$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						container = document.getElementById(domId);
						rowdiv = document.createElement("div");

						rowdiv.className = 'row';

						rowdiv2 = document.createElement("div");

						rowdiv2.className = 'row';

						rowdiv3 = document.createElement("div");

						rowdiv3.className = 'row';

						//cal-heatmap month
						cal_heat_dom = document.createElement('div');
						// cal_heat_dom.style.width = '500px';
						// cal_heat_dom.style.height = '600px';

						cal_heat_dom.id = 'cal-heatmap';
						cal_heat_dom.className = 'col s6';
						rowdiv.appendChild(cal_heat_dom);

						//get cal-heat
						getCalHeat(cal_heat_dom);

						//Initialize
						passChartDom = document.createElement('div');
						// passChartDom.style.width = '500px';

						passChartDom.style.height = '600px';
						passChartDom.id = 'taxi-pass-chart';
						passChartDom.className = 'col s6';
						rowdiv.appendChild(passChartDom);

						flowChartDom = document.createElement('div');

						flowChartDom.style.height = '600px';
						flowChartDom.id = 'taxi-flow-chart';
						flowChartDom.className = 'col s6';
						rowdiv2.appendChild(flowChartDom);

						flowChartDom2 = document.createElement('div');

						flowChartDom2.style.height = '600px';
						flowChartDom2.id = 'taxi-flow-chart2';
						flowChartDom2.className = 'col s6';
						rowdiv2.appendChild(flowChartDom2);

						container.appendChild(rowdiv);
						container.appendChild(rowdiv2);
						heatmapdom = document.createElement('div');

						heatmapdom.style.height = '600px';
						heatmapdom.id = 'heatmap-taxi';
						heatmapdom.className = 'col s12';
						rowdiv3.appendChild(heatmapdom);
						container.appendChild(rowdiv3);

						flowChart = echarts.getInstanceByDom(flowChartDom);

						if (!flowChart) {
							flowChart = echarts.init(flowChartDom);
						}
						flowChart.showLoading();

						passChart = echarts.getInstanceByDom(passChartDom);

						if (!passChart) {
							passChart = echarts.init(passChartDom);
						}
						passChart.showLoading();

						flowChart2 = echarts.getInstanceByDom(flowChartDom2);

						if (!flowChart2) {
							flowChart2 = echarts.init(flowChartDom2);
						}
						flowChart2.showLoading();

						//get od-data of wuhan
						_context.next = 46;
						return getODData();

					case 46:
						wuhan_od = _context.sent;

						//get day-linechart
						getDayLineMap(wuhan_od);

						result_data = processODData(wuhan_od);

						//get Flowchart

						taxiFlowChart(flowChart, result_data['lines'], result_data['points']);

						//get Flowchart2
						taxiFlowChart2(flowChart2, result_data['lines2'], result_data['points2']);

						//get PassOutChart
						taxiPassOutChart(passChart, result_data['in'], result_data['out'], flowChart);

						_context.next = 54;
						return getODData(1389283200);

					case 54:
						wuhan_od = _context.sent;

						getHeatMap(wuhan_od, 'heatmap-taxi');

						return _context.abrupt("return", { 'flowChart': flowChart, 'passChart': passChart });

					case 57:
					case "end":
						return _context.stop();
				}
			}
		}, _callee, this);
	}));

	return function getCharts(_x) {
		return ref.apply(this, arguments);
	};
})();

/**
 * get the calheat
 * @param  {[string]} dom [dom's id of calheat container]
 * @return {[null]}     [null]
 */

var getCalHeat = (function () {
	var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(dom) {
		var month_data, month_result, m, item, d, max, min, _d, gap, calMonth, titleDom;

		return regeneratorRuntime.wrap(function _callee2$(_context2) {
			while (1) {
				switch (_context2.prev = _context2.next) {
					case 0:
						_context2.next = 2;
						return getMonthData();

					case 2:
						month_data = _context2.sent;
						month_result = {};

						for (m in month_data) {
							month_result[m] = 0;
							item = month_data[m];

							for (d in item) {
								month_result[m] += item[d];
							}
						}

						max = 0;
						min = Infinity;

						for (_d in month_result) {
							if (month_result[_d] > max) {
								max = month_result[_d];
							}
							if (month_result[_d] < min) {
								min = month_result[_d];
							}
						}

						gap = (max - min) / 7;
						calMonth = new CalHeatMap();

						calMonth.init({
							itemSelector: dom,
							domain: 'month',
							start: new Date(2014, 0, 1, 0),
							range: 1,
							data: month_result,
							subDomain: 'x_day',
							highlight: "now",
							cellSize: 40,
							subDomainTextFormat: "%d",
							displayLegend: true,
							legend: [min + gap, min + gap * 2, min + gap * 3, min + gap * 4, min + gap * 5, min + gap * 6],
							legendColors: {
								min: "#00E400",
								max: "#7E0023",
								empty: "#ffffff",
								base: "grey",
								overflow: "grey"
							},
							onClick: function onClick(date, nb) {
								if (nb === 0) {
									return;
								}
								getChartByTime(date.getTime() / 1000);
							}
						});
						titleDom = document.createElement('div');

						titleDom.style.textAlign = 'center';
						titleDom.innerHTML = "2014年1月各天车流量";
						dom.insertBefore(titleDom, dom.getElementsByTagName("svg")[0]);

					case 15:
					case "end":
						return _context2.stop();
				}
			}
		}, _callee2, this);
	}));

	return function getCalHeat(_x2) {
		return ref.apply(this, arguments);
	};
})();
/**
 * get the day-lineChart by time
 * @param  {[int]} timestamp [timestamp]
 * @return {[null]}           [null]
 */

var getChartByTime = (function () {
	var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(timestamp) {
		var flowChart, flowChart2, passChart, wuhan_od, result_data;
		return regeneratorRuntime.wrap(function _callee3$(_context3) {
			while (1) {
				switch (_context3.prev = _context3.next) {
					case 0:
						flowChart = echarts.getInstanceByDom(document.getElementById("taxi-flow-chart"));
						flowChart2 = echarts.getInstanceByDom(document.getElementById("taxi-flow-chart2"));
						passChart = echarts.getInstanceByDom(document.getElementById("taxi-pass-chart"));

						flowChart.showLoading();
						passChart.showLoading();
						_context3.next = 7;
						return getODData(timestamp);

					case 7:
						wuhan_od = _context3.sent;
						result_data = processODData(wuhan_od);

						getDayLineMap(wuhan_od);

						//get Flowchart
						taxiFlowChart(flowChart, result_data['lines'], result_data['points']);

						//get Flowchart2
						taxiFlowChart2(flowChart2, result_data['lines2'], result_data['points2']);

						//get PassOutChart

						taxiPassOutChart(passChart, result_data['in'], result_data['out'], flowChart);
						flowChart.hideLoading();
						passChart.hideLoading();
						getHeatMap(wuhan_od);

					case 16:
					case "end":
						return _context3.stop();
				}
			}
		}, _callee3, this);
	}));

	return function getChartByTime(_x3) {
		return ref.apply(this, arguments);
	};
})();
/**
 * [getDayLineMap by data]
 * @param  {[Array]} odData [[obj,obj]]]
 * @return {[null]}        [null]
 */

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * the class of taxi-vis
 */

var TaxiVisChart = (function () {
	function TaxiVisChart(domId) {
		_classCallCheck(this, TaxiVisChart);

		this.domId = domId;
		$("#" + domId).show();
		var chartObj = getCharts(domId);
		this.flowChart = chartObj.flowChart;
		this.passChart = chartObj.passChart;
	}

	_createClass(TaxiVisChart, [{
		key: "show",
		value: function show() {
			$("#" + this.domId).show();
		}
	}, {
		key: "hide",
		value: function hide() {
			$("#" + this.domId).hide();
		}
	}]);

	return TaxiVisChart;
})();

function getHeatMap(data, domId) {
	var heatMapPoint = [];
	for (var i = 0, length = data.length; i < length; i++) {
		var item = data[i];
		var lat = item.geom.coordinates[1];
		var lon = item.geom.coordinates[0];
		heatMapPoint.push([lat, lon, 100.0]);
	}
	//get heatmap
	if (!window.taximap) {
		L.mapbox.accessToken = 'pk.eyJ1IjoiZG9uZ2xpbmdlIiwiYSI6Ik1VbXI1TkkifQ.7ROsya7Q8kZ-ky9OmhKTvg';
		var map = L.mapbox.map(domId, 'mapbox.light').setView([30.608623, 114.274462], 11);
		window.taximap = map;
	}
	if (!window.taxiheat) {
		var gradient = {
			0.55: '#c7f127',
			0.65: '#daf127',
			0.7: '#f3f73b',
			0.8: '#FBEF0E',
			0.9: '#FFD700',
			0.99: '#f48e1a',
			1: 'red'
		};
		var heat = L.heatLayer(heatMapPoint, { radius: 15, gradient: gradient });
		map.addLayer(heat);
		window.taxiheat = heat;
	} else {
		window.taxiheat.setLatLngs(heatMapPoint);
	}
}function getDayLineMap(odData) {
	var origintime = odData[0].time_point;
	var origindate = new Date(origintime * 1000);
	var starttime = new Date(origindate.getFullYear(), origindate.getMonth(), origindate.getDate(), 0).getTime() / 1000;
	var lineData = [];
	for (var d = 0; d < odData.length; d++) {
		var item = odData[d];
		var index = parseInt((item.time_point - origintime) / 3600);
		if (lineData[index] >= 0) {
			lineData[index] += 1;
		} else {
			lineData[index] = 0;
		}
	}
	var option = {
		tooltip: {
			trigger: 'axis'
		},
		title: {
			left: 'left',
			text: '各小时车流量'
		},
		legend: {
			top: 'bottom',
			data: ['意向']
		},
		toolbox: {
			show: true,
			feature: {
				dataView: { show: true, readOnly: false },
				magicType: { show: true, type: ['line', 'bar', 'stack', 'tiled'] },
				restore: { show: true },
				saveAsImage: { show: true }
			}
		},
		xAxis: {
			type: 'category',
			boundaryGap: false,
			data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
		},
		yAxis: {
			type: 'value',
			boundaryGap: [0, '100%']
		},
		series: [{
			name: '出租车流量',
			type: 'line',
			smooth: true,
			symbol: 'none',
			sampling: 'average',
			itemStyle: {
				normal: {
					color: 'rgb(255, 70, 131)'
				}
			},
			areaStyle: {
				normal: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
						offset: 0,
						color: 'rgb(255, 158, 68)'
					}, {
						offset: 1,
						color: 'rgb(255, 70, 131)'
					}])
				}
			},
			data: lineData,
			markPoint: {
				data: [{ type: 'max', name: '最大值' }, { type: 'min', name: '最小值' }]
			},
			markLine: {
				data: [{ type: 'average', name: '平均值' }]
			}
		}]
	};

	var cal_haat_container = document.getElementById("cal-heatmap");
	var dayElement = document.getElementById('day-calheat');
	if (!dayElement) {
		var dayElement = document.createElement("div");
		dayElement.id = 'day-calheat';
		dayElement.style.height = '300px';
		cal_haat_container.appendChild(dayElement);
	}
	var dayBarChart = echarts.getInstanceByDom(dayElement);
	if (!dayBarChart) {
		dayBarChart = echarts.init(dayElement);
	}

	dayBarChart.showLoading();
	dayBarChart.setOption(option);
	dayBarChart.hideLoading();
}

/**
 * get the json data by url
 * @param  {[String]} url [url]
 * @return {[Promise]}     [proimise object]
 */
function getJSON(url) {
	var promise = new Promise(function (resolve, reject) {
		var client = new XMLHttpRequest();
		client.open("GET", url);
		client.onreadystatechange = handler;
		client.responseType = "json";
		client.setRequestHeader("Accept", "application/json");
		client.send();

		function handler() {
			if (this.readyState !== 4) {
				return;
			}
			if (this.status === 200) {
				resolve(this.response);
			} else {
				reject(new Error(this.statusText));
			}
		};
	});
	return promise;
}

/**
 * get the geojson of city
 * @param  {[String]} city [the name of city]
 * @return {[Promise]}      [Promise Object]
 */
function getGeojson(city) {
	return getJSON("http://202.114.123.53/zx/taxi/getGeojson.php?city=" + city);
}
/**
 * get the month data
 * @return {[Promise]} [Promise obj]
 */
function getMonthData() {
	return getJSON("http://202.114.123.53/zx/taxi/getDistrictDay.php");
}
/**
 * get the od data
 * @param  {[int]} timestamp [timestamp]
 * @return {[type]}           [description]
 */
function getODData(timestamp) {
	if (timestamp) {
		return getJSON("http://202.114.123.53/zx/taxi/getAllOdDataM.php?timestamp=" + timestamp);
	} else {
		return getJSON("http://202.114.123.53/zx/taxi/getAllOdDataM.php");
	}
}
/**
 * process of the OD-data
 * @param  {[Array]} data [[{state,district},{}]]
 * @return {[Object]}      [{lines,points,in,out}]
 */
function processODData(data) {
	var taxi_data = data;

	var draw_data = {};

	//武汉三镇
	var draw_data2 = {};

	//calculate in/out between two district
	for (var i = 0, length = taxi_data.length; i < length; i++) {
		var start_point = taxi_data[i];

		if (start_point.state !== 0) {
			continue;
		}

		if (i >= length - 1) {
			break;
		}
		var end_point = taxi_data[i + 1];
		if (start_point.district === '' || end_point.district === '') {
			continue;
		}
		var dislink = {
			'江岸区': '汉口',
			'江汉区': '汉口',
			'硚口区': '汉口',
			'汉阳区': '汉阳',
			'武昌区': '武昌',
			'青山区': '武昌',
			'洪山区': '武昌'
		};

		if (draw_data2[dislink[start_point.district]]) {
			if (draw_data2[dislink[start_point.district]][dislink[end_point.district]]) {
				draw_data2[dislink[start_point.district]][dislink[end_point.district]] += 1;
			} else {
				draw_data2[dislink[start_point.district]][dislink[end_point.district]] = 1;
			}
		} else {
			draw_data2[dislink[start_point.district]] = {};
			draw_data2[dislink[start_point.district]][dislink[end_point.district]] = 1;
		}

		if (draw_data[start_point.district]) {
			if (draw_data[start_point.district][end_point.district]) {
				draw_data[start_point.district][end_point.district] += 1;
			} else {
				draw_data[start_point.district][end_point.district] = 1;
			}
		} else {
			draw_data[start_point.district] = {};
			draw_data[start_point.district][end_point.district] = 1;
		}

		i++;
	}

	data = draw_data;
	var districtLonLat = {
		"江汉区": [114.274462, 30.608623],
		"武昌区": [114.320455, 30.56087],
		"青山区": [114.39275, 30.630875],
		"江岸区": [114.311256, 30.606385],
		"洪山区": [114.349919, 30.506497],
		"汉阳区": [114.221569, 30.56286],
		"东西湖区": [114.140794, 30.627519],
		"硚口区": [114.219557, 30.58848],
		"蔡甸区": [114.03271, 30.589226],
		"黄陂区": [114.375934, 30.889686],
		"江夏区": [114.329941, 30.381085],
		"新洲区": [114.807983, 30.848025],
		"汉南区": [114.193972, 30.479202]
	};

	var distirct2 = {
		"汉口": [114.277336, 30.624536],
		"武昌": [114.396919, 30.518071],
		"汉阳": [114.210646, 30.533003]
	};
	function getDistrictIn(district) {
		var value = 0;
		for (var name in data) {
			if (name != district) {
				for (var inname in data[name]) {
					if (inname === district) {
						value += data[name][district];
					}
				}
			}
		}
		return value;
	}

	var temp_markline_data = {};
	var temp_point_data = {};
	var temp_markline_data2 = {};
	var temp_point_data2 = {};
	var taxi_region_in = []; //各区域车辆流入数量
	var taxi_region_out = []; //各区域车辆流出数量
	for (var name in data) {
		var temp_lime = [];
		var temp_point = [];
		var item = data[name];

		var out_num = 0;

		for (var name2 in item) {
			if (name2 != name) {
				out_num += item[name2];
				temp_lime.push([{ name: name, coord: districtLonLat[name], value: item[name2] }, { name: name2, coord: districtLonLat[name2], value: item[name2] }]);
				temp_point.push({ name: name2, value: districtLonLat[name2].concat([item[name2]]) });
			}
		}

		temp_markline_data[name] = temp_lime;
		temp_point_data[name] = temp_point;

		var in_num = getDistrictIn(name);
		taxi_region_in.push(in_num);

		taxi_region_out.push(out_num);
	}

	//flowdata2
	for (var name in draw_data2) {
		if (name == "undefined") {
			continue;
		}
		var temp_lime = [];
		var temp_point = [];
		var item = draw_data2[name];

		var out_num = 0;

		for (var name2 in item) {
			if (name2 == "undefined") {
				continue;
			}
			if (name2 != name) {
				out_num += item[name2];
				temp_lime.push([{ name: name, coord: distirct2[name], value: item[name2] }, { name: name2, coord: distirct2[name2], value: item[name2] }]);
				temp_point.push({ name: name2, value: distirct2[name2].concat([item[name2]]) });
			}
		}

		temp_markline_data2[name] = temp_lime;
		temp_point_data2[name] = temp_point;
	}

	return {
		"lines": temp_markline_data,
		'points': temp_point_data,
		"lines2": temp_markline_data2,
		'points2': temp_point_data2,
		'in': taxi_region_in,
		'out': taxi_region_out
	};
}

/**
 * get the taxi-flow-chart
 * @param  {[Object]} flowChart  [Echarts Instance]
 * @param  {[Array]} linesData  [[[{name,coord,value},{name,coord,value}],[]]]
 * @param  {[Array]} pointsData [[{name:value}]]
 * @return {[Object]}            [Echarts Instance]
 */
function taxiFlowChart(flowChart, linesData, pointsData) {

	var option = {
		backgroundColor: '#404a59',
		title: {
			text: '武汉各区之间出租车流动图',
			subtext: '',
			left: 'center',
			textStyle: {
				color: '#fff'
			}
		},
		tooltip: {
			trigger: 'item',
			formatter: function formatter(v) {
				return v.data[0].name + " > " + v.data[1].name + " : " + v.value;
			}
		},
		legend: {
			orient: 'vertical',
			top: 'bottom',
			left: 'right',
			data: [],
			textStyle: {
				color: '#fff'
			},
			selectedMode: 'single'
		},
		bmap: {
			center: [114.274462, 30.608623],
			zoom: 11,
			roam: true,
			mapStyle: {
				styleJson: [{
					"featureType": "water",
					"elementType": "all",
					"stylers": {
						"color": "#134f5c"
					}
				}, {
					"featureType": "land",
					"elementType": "all",
					"stylers": {
						"color": "#444444"
					}
				}, {
					"featureType": "boundary",
					"elementType": "geometry",
					"stylers": {
						"color": "#064f85"
					}
				}, {
					"featureType": "railway",
					"elementType": "all",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "highway",
					"elementType": "geometry",
					"stylers": {
						"color": "#3d85c6",
						"lightness": -53
					}
				}, {
					"featureType": "highway",
					"elementType": "geometry.fill",
					"stylers": {
						"color": "#76a5af"
					}
				}, {
					"featureType": "highway",
					"elementType": "labels",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "arterial",
					"elementType": "geometry",
					"stylers": {
						"color": "#33707d"
					}
				}, {
					"featureType": "arterial",
					"elementType": "geometry.fill",
					"stylers": {
						"color": "#45818e",
						"lightness": -56
					}
				}, {
					"featureType": "poi",
					"elementType": "all",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "green",
					"elementType": "all",
					"stylers": {
						"color": "#056197",
						"visibility": "off"
					}
				}, {
					"featureType": "subway",
					"elementType": "all",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "manmade",
					"elementType": "all",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "local",
					"elementType": "all",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "arterial",
					"elementType": "labels",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "boundary",
					"elementType": "geometry.fill",
					"stylers": {
						"color": "#029fd4"
					}
				}, {
					"featureType": "building",
					"elementType": "all",
					"stylers": {
						"color": "#1a5787"
					}
				}, {
					"featureType": "label",
					"elementType": "all",
					"stylers": {
						"visibility": "off"
					}
				}]
			}
		},
		visualMap: [{
			type: 'continuous',
			min: 0,
			max: 50,
			text: ['High', 'Low'],
			realtime: true,
			calculable: true,
			color: ['orangered', 'yellow', 'lightskyblue']
		}],
		series: []
	};
	var series = [];
	for (var name in linesData) {
		option.legend.data.push(name);
		var temp_markline_data = linesData[name];
		var temp_point_data = pointsData[name];
		series.push({
			name: name,
			type: 'lines',
			coordinateSystem: 'bmap',
			effect: {
				show: true,
				period: 6,
				trailLength: 0,
				symbol: 'arrow',
				symbolSize: 15
			},
			lineStyle: {
				normal: {
					width: 1,
					opacity: 0.4,
					curveness: 0.2
				}
			},
			data: temp_markline_data
		}, {
			name: name,
			type: 'lines',
			coordinateSystem: 'bmap',
			zlevel: 1,
			effect: {
				show: true,
				period: 6,
				trailLength: 0.7,
				color: '#fff',
				symbolSize: 3
			},
			lineStyle: {
				normal: {
					width: 1,
					curveness: 0.2
				}
			},
			data: temp_markline_data
		}, {
			name: name,
			type: 'effectScatter',
			coordinateSystem: 'bmap',
			zlevel: 2,
			rippleEffect: {
				brushType: 'stroke'
			},
			label: {
				normal: {
					show: true,
					position: 'right',
					formatter: '{b}'
				}
			},
			symbolSize: function symbolSize(val) {
				var size = Math.log(val[2]) * 3;
				return size;
			},
			itemStyle: {
				normal: {
					color: '#a6c84c'
				}
			},
			data: temp_point_data
		});
	}

	option.series = series;
	flowChart.setOption(option);
	flowChart.hideLoading();
	return flowChart;
}

/**
 * get the taxi-flow-chart2
 * @param  {[Object]} flowChart  [Echarts Instance]
 * @param  {[Array]} linesData  [[[{name,coord,value},{name,coord,value}],[]]]
 * @param  {[Array]} pointsData [[{name:value}]]
 * @return {[Object]}            [Echarts Instance]
 */
function taxiFlowChart2(flowChart, linesData, pointsData) {

	var option = {
		backgroundColor: '#404a59',
		title: {
			text: '武汉三镇之间出租车流动图',
			subtext: '',
			left: 'center',
			textStyle: {
				color: '#fff'
			}
		},
		tooltip: {
			trigger: 'item',
			formatter: function formatter(v) {
				return v.data[0].name + " > " + v.data[1].name + " : " + v.value;;
			}
		},
		legend: {
			orient: 'vertical',
			top: 'bottom',
			left: 'right',
			data: [],
			textStyle: {
				color: '#fff'
			},
			selectedMode: 'single'
		},
		bmap: {
			center: [114.274462, 30.608623],
			zoom: 11,
			roam: true,
			mapStyle: {
				styleJson: [{
					"featureType": "water",
					"elementType": "all",
					"stylers": {
						"color": "#134f5c"
					}
				}, {
					"featureType": "land",
					"elementType": "all",
					"stylers": {
						"color": "#444444"
					}
				}, {
					"featureType": "boundary",
					"elementType": "geometry",
					"stylers": {
						"color": "#064f85"
					}
				}, {
					"featureType": "railway",
					"elementType": "all",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "highway",
					"elementType": "geometry",
					"stylers": {
						"color": "#3d85c6",
						"lightness": -53
					}
				}, {
					"featureType": "highway",
					"elementType": "geometry.fill",
					"stylers": {
						"color": "#76a5af"
					}
				}, {
					"featureType": "highway",
					"elementType": "labels",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "arterial",
					"elementType": "geometry",
					"stylers": {
						"color": "#33707d"
					}
				}, {
					"featureType": "arterial",
					"elementType": "geometry.fill",
					"stylers": {
						"color": "#45818e",
						"lightness": -56
					}
				}, {
					"featureType": "poi",
					"elementType": "all",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "green",
					"elementType": "all",
					"stylers": {
						"color": "#056197",
						"visibility": "off"
					}
				}, {
					"featureType": "subway",
					"elementType": "all",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "manmade",
					"elementType": "all",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "local",
					"elementType": "all",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "arterial",
					"elementType": "labels",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "boundary",
					"elementType": "geometry.fill",
					"stylers": {
						"color": "#029fd4"
					}
				}, {
					"featureType": "building",
					"elementType": "all",
					"stylers": {
						"color": "#1a5787"
					}
				}, {
					"featureType": "label",
					"elementType": "all",
					"stylers": {
						"visibility": "off"
					}
				}]
			}
		},
		visualMap: [{
			type: 'continuous',
			min: 50,
			max: 1800,
			text: ['High', 'Low'],
			realtime: true,
			calculable: true,
			color: ['orangered', 'yellow', 'lightskyblue']
		}],
		series: []
	};
	var series = [];
	for (var name in linesData) {
		option.legend.data.push(name);
		var temp_markline_data = linesData[name];
		var temp_point_data = pointsData[name];
		series.push({
			name: name,
			type: 'lines',
			coordinateSystem: 'bmap',
			effect: {
				show: true,
				period: 6,
				trailLength: 0,
				symbol: 'arrow',
				symbolSize: 15
			},
			lineStyle: {
				normal: {
					width: 20,
					opacity: 0.4,
					curveness: 0.2
				}
			},
			data: temp_markline_data
		}, {
			name: name,
			type: 'lines',
			coordinateSystem: 'bmap',
			zlevel: 1,
			effect: {
				show: true,
				period: 6,
				trailLength: 0.7,
				color: '#fff',
				symbolSize: 3
			},
			lineStyle: {
				normal: {
					width: 5,
					curveness: 0.2
				}
			},
			data: temp_markline_data
		}, {
			name: name,
			type: 'effectScatter',
			coordinateSystem: 'bmap',
			zlevel: 2,
			rippleEffect: {
				brushType: 'stroke'
			},
			label: {
				normal: {
					show: true,
					position: 'right',
					formatter: '{b}'
				}
			},
			symbolSize: function symbolSize(val) {
				var size = Math.log(val[2]) * 3;
				return size;
			},
			itemStyle: {
				normal: {
					color: '#a6c84c'
				}
			},
			data: temp_point_data
		});
	}

	option.series = series;
	flowChart.setOption(option);
	flowChart.hideLoading();
	// flowChart.on("bmapRoam",function(e){
	// 	console.log(e);
	// });
	return flowChart;
}

/**
 * get the taxi-pass-chart
 * @param  {[Object]} passChart [Echarts Instance]
 * @param  {[Array]} inData    [[value1,value2,..]]
 * @param  {[Array]} outData   [[value1,value2,..]]
 * @param  {[Object]} flowChart [Echarts Instance]
 * @return {[Object]}           [Echarts Instance]
 */
function taxiPassOutChart(passChart, inData, outData, flowChart) {
	var option = {
		title: {
			text: '武汉各区出租车流入流出',
			subtext: '',
			left: 'left',
			bottom: '15%',
			textStyle: {
				color: '#070716'
			}
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: { // 坐标轴指示器，坐标轴触发有效
				type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
			}
		},
		legend: {
			left: 'right',
			data: ['流入', '流出']
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '3%',
			containLabel: true
		},
		xAxis: [{
			type: 'category',
			data: []
		}],
		yAxis: [{
			type: 'value'
		}],
		series: []
	};
	option.series.push({
		name: '流入',
		type: 'bar',
		stack: '流动',
		data: inData
	}, {
		name: '流出',
		type: 'bar',
		stack: '流动',
		data: outData
	});
	var flowOption = flowChart.getOption();
	option.xAxis[0].data = flowChart.getOption().legend[0].data;

	passChart.setOption(option);

	passChart.on("click", function (e) {
		flowChart.dispatchAction({
			'type': 'legendSelect',
			'name': e.name
		});
	});
	passChart.hideLoading();
}
// var districtLonLat = {
// 	"海淀区":[116.299059,39.966493],
// 	"朝阳区":[116.479583,39.963396],
// 	"东城区":[116.419217,39.937289],
// 	"丰台区":[116.29101,39.86511],
// 	"通州区":[116.661831,39.917813],
// 	"石景山区":[116.22317,39.9125],
// 	"门头沟区":[116.107037,39.948353],
// 	"西城区":[116.369199,39.918698],
// 	"房山区":[116.147856,39.754701],
// 	"大兴区":[116.147856,39.754701],
// 	"昌平区":[116.237831,40.227662],
// 	"顺义区":[116.659819,40.136379],
// 	"怀柔区":[116.637972,40.322782]
// };

exports.TaxiVisChart = TaxiVisChart;

},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/**
* initialize WeiboTextMap
* @param  {[Object]} map [map Object]
* @return {[null]}     [null]
*/

var initWeiboTextMap = (function () {
  var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(map) {
    var IDF, weibo_data;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return getIdfData();

          case 2:
            IDF = _context.sent;
            _context.next = 5;
            return getWeiboData("武汉");

          case 5:
            weibo_data = _context.sent;

            getWeiboTextCluster(weibo_data, map, IDF);

          case 7:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function initWeiboTextMap(_x) {
    return ref.apply(this, arguments);
  };
})();
/**
* get data by URL
* @param  {[string]} url [api's uri]
* @return {[Object]}     [promise Object]
*/

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
* the class of weibo-text-map
*/

var WeiboTextMap = (function () {
  function WeiboTextMap(domId) {
    _classCallCheck(this, WeiboTextMap);

    this.domId = domId;
    $("#" + domId).show();
    var map = initMap(domId);
    initWeiboTextMap(map);
  }

  _createClass(WeiboTextMap, [{
    key: "show",
    value: function show() {
      $("#" + this.domId).show();
    }
  }, {
    key: "hide",
    value: function hide() {
      $("#" + this.domId).hide();
    }
  }]);

  return WeiboTextMap;
})();

function getData(url) {
  var promise = new Promise(function (resolve, reject) {
    var client = new XMLHttpRequest();
    client.open("GET", url);
    client.onreadystatechange = handler;
    client.send();

    function handler() {
      console.log(this.status);
      if (this.status === 500) {
        alert("数据加载出错，请刷新浏览器");
      }
      if (this.readyState !== 4) {
        return;
      }
      if (this.status === 200) {
        resolve(this.response);
      } else {
        reject(new Error(this.statusText));
      }
    };
  });
  return promise;
}

/**
* get the idf-dat by /data/idf.txt
* @return {[Object]} [Promise Object]
*/
function getIdfData() {
  return getData("data/idf.txt");
}
/**
* map initialize
* @param  {[string]} domId [map container dom id]
* @return {[obj]}       [map object]
*/
function initMap(domId) {
  L.mapbox.accessToken = 'pk.eyJ1IjoiZG9uZ2xpbmdlIiwiYSI6Ik1VbXI1TkkifQ.7ROsya7Q8kZ-ky9OmhKTvg';
  var layer = L.mapbox.tileLayer('mapbox.streets');
  var layer_satelite = L.mapbox.tileLayer('mapbox.streets-satellite');
  var map = L.mapbox.map(domId).setView([30.590623, 114.274462], 11).addLayer(layer);

  //append the title of map
  var container = document.getElementById(domId);
  var width = container.clientWidth;
  var title = document.createElement("div");
  title.style.position = "absolute";
  title.style.left = width / 2 - 183 + "px";
  title.style.fontSize = "24px";
  title.style.color = "chocolate";
  title.style.marginTop = "10px";
  title.textContent = "武汉近24小时微博聚合可视化结果";
  container.appendChild(title);

  return map;
}
/**
* the class of 3d-map of weibo-event
*/

var Event3DMap = (function () {
  function Event3DMap(domId) {
    _classCallCheck(this, Event3DMap);

    this.domId = domId;
    $("#" + domId).show();
    var container = document.getElementById(domId);
    var globe = new DAT.Globe(container);
    $.get("http://202.114.123.53/zx/aqi/getAQICityList.php").then(function (data) {
      data = JSON.parse(data);
      var mapdata = [];
      mapdata['1990'] = [];
      for (var i in data) {
        var city = data[i];
        mapdata['1990'].push(city.lat);
        mapdata['1990'].push(city.lon);
        mapdata['1990'].push(Math.random() - 0.6);
      }
      globe.addData(mapdata['1990'], { format: 'magnitude', name: '1990' });
      // Create the geometry
      globe.createPoints();
      // Begin animation
      globe.animate();
    });
  }

  _createClass(Event3DMap, [{
    key: "hide",
    value: function hide() {
      $("#" + this.domId).hide();
    }
  }, {
    key: "show",
    value: function show() {
      $("#" + this.domId).show();
    }
  }]);

  return Event3DMap;
})();

var Event3DMapCesium = (function () {
  function Event3DMapCesium(domId) {
    _classCallCheck(this, Event3DMapCesium);

    this.domId = domId;
    $("#" + domId).show();
    var container = document.getElementById(domId);
    var viewer = new Cesium.Viewer(domId, {
      imageryProvider: new Cesium.MapboxImageryProvider({
        mapId: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiZG9uZ2xpbmdlIiwiYSI6Ik1VbXI1TkkifQ.7ROsya7Q8kZ-ky9OmhKTvg'
      }),
      baseLayerPicker: false,
      timeline: false,
      animation: false
    });
    viewer.camera.flyTo({
      destination: new Cesium.Cartesian3(-5684691.475775821, 17842237.40444678, 8249814.7129382705),
      orientation: {
        direction: new Cesium.Cartesian3(.27770357937769374, -.8716127060411228, -.40394555656488096),
        up: new Cesium.Cartesian3(.12478882416432377, -.3841927524950891, .9147806722340971)
      }
    });

    var latlons = [{ name: "上海", lon: 121.465443, lat: 31.222671 }, { name: "北京", lon: 116.3847, lat: 39.9125 }, { name: "广州", lon: 113.2507, lat: 23.1296 }, { name: "深圳", lon: 114.0435, lat: 22.5439 }, { name: "天津", lon: 117.2076, lat: 39.1313 }, { name: "重庆", lon: 106.556, lat: 29.5509 }, { name: "苏州", lon: 120.5919, lat: 31.3089 }, { name: "武汉", lon: 114.2796, lat: 30.5728 }, { name: "成都", lon: 104.0626, lat: 30.6517 }, { name: "杭州", lon: 120.1513, lat: 30.3047 }, { name: "南京", lon: 118.7849, lat: 32.0129 }, { name: "青岛", lon: 120.4051, lat: 36.1173 }, { name: "长沙", lon: 112.9923, lat: 28.1868 }, { name: "无锡", lon: 120.3142, lat: 31.5927 }, { name: "佛山", lon: 113.1355, lat: 23.0297 }, { name: "宁波", lon: 121.5967, lat: 29.8766 }, { name: "大连", lon: 122.6129, lat: 38.9228 }, { name: "郑州", lon: 113.6968, lat: 34.6934 }, { name: "沈阳", lon: 123.4238, lat: 41.8016 }, { name: "烟台", lon: 121.3739, lat: 37.4928 }, { name: "济南", lon: 117.0382, lat: 36.6701 }, { name: "东莞", lon: 113.7553, lat: 23.0339 }, { name: "泉州", lon: 118.6028, lat: 24.9147 }, { name: "南通", lon: 120.9523, lat: 32.0325 }, { name: "唐山", lon: 118.1766, lat: 39.6426 }, { name: "西安", lon: 108.9562, lat: 34.2704 }, { name: "哈尔滨", lon: 126.6588, lat: 45.768 }, { name: "福州", lon: 119.3143, lat: 26.0822 }, { name: "长春", lon: 125.3054, lat: 43.8884 }, { name: "石家庄", lon: 114.5195, lat: 38.0406 }, { name: "合肥", lon: 117.29, lat: 31.8581 }, { name: "潍坊", lon: 119.1518, lat: 36.724 }, { name: "徐州", lon: 117.1908, lat: 34.2768 }, { name: "常州", lon: 119.9743, lat: 31.8082 }, { name: "温州", lon: 120.689, lat: 28.0059 }, { name: "绍兴", lon: 120.594, lat: 30.0075 }, { name: "海口", lon: 110.324, lat: 20.01 }, { name: "南昌", lon: 115.9230, lat: 28.6738 }, { name: "厦门", lon: 118.1433, lat: 24.4973 }, { name: "南宁", lon: 108.3730, lat: 22.8161 }, { name: "昆明", lon: 102.7051, lat: 25.0473 }, { name: "拉萨", lon: 91.1386, lat: 29.6683 }, { name: "呼和浩特", lon: 111.6975, lat: 40.8345 }, { name: "贵阳", lon: 106.7063, lat: 26.5959 }, { name: "太原", lon: 112.5518, lat: 37.8534 }, { name: "乌鲁木齐", lon: 87.6066, lat: 43.8357 }, { name: "银川", lon: 106.1993, lat: 38.4914 }, { name: "西宁", lon: 101.7829, lat: 36.6361 }, { name: "兰州", lon: 103.8588, lat: 36.0561 }];
    $.get("http://202.114.123.53/zx/weibo/getnewyear.php").then(function (data) {
      data = JSON.parse(data);
      console.log(data);
      for (var i = 0; i < data.length; i++) {
        viewer.entities.add({
          name: latlons[i].name,
          position: Cesium.Cartesian3.fromDegrees(latlons[i].lon, latlons[i].lat, 200000.0),
          cylinder: {
            length: data[i].num * 300,
            topRadius: 40000.0,
            bottomRadius: 40000.0,
            material: Cesium.Color.fromCssColorString('#F71552').withAlpha(1)
          },
          value: data[i].num
        });
      }
      viewer.zoomTo(viewer.entities);
      var z, A;
      var e = Cesium.Color.FUSCHIA,
          o = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      o.setInputAction(function (o) {
        if (void 0 != z) {
          var i = z;
          i.cylinder && (i.cylinder.material = A);
        }
        var t = viewer.scene.pick(o.position);
        if (Cesium.defined(t)) {
          var i = Cesium.defaultValue(t.id, t.primitive.id);
          z = i, i.cylinder && (A = i.cylinder.material, i.cylinder.material = e);
          viewer.infoBox.frame.style.display = 'block';
          viewer.infoBox.frame.style.height = '30px';
          var bodycontainer = viewer.infoBox.frame.contentDocument.body;
          console.log(bodycontainer);
          var old = bodycontainer.querySelector('#cy-value');
          if (old) {
            old.innerHTML = i.value;
          } else {
            var p = document.createElement("div");
            p.id = 'cy-value';
            p.innerHTML = i.value;
            p.style.textAlign = 'center';
            p.style.color = 'white';
            bodycontainer.appendChild(p);
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    });
  }

  _createClass(Event3DMapCesium, [{
    key: "hide",
    value: function hide() {
      $("#" + this.domId).hide();
    }
  }, {
    key: "show",
    value: function show() {
      $("#" + this.domId).show();
    }
  }]);

  return Event3DMapCesium;
})();

/**
* get the weibo-data
* @param  {[string]} city     [name of city]
* @return {[Promise]}          [promise object]
*/

function getWeiboData(city) {
  return getData('http://202.114.123.53/zx/weibo/getWeiboData.php?city=' + city);
}

/**
* get the weibo-text-cluster-map
* @param  {[Array]} data     [weibo-data:[{text:..,geo:..},{}]]
* @param  {[Object]} map      [leaflet map object]
* @param  {[Array]} idfArray [idf-data]
* @return {[null]}          [null]
*/
function getWeiboTextCluster(data, map, idfData) {
  // process the idf-data
  var split_array = idfData.split("\n");
  var idfArray = [];
  for (var i = 0; i < split_array.length; i++) {
    var item = split_array[i].split(" ");
    idfArray[item[0]] = parseInt(item[1]);
  }

  if (typeof data === 'string') {
    data = JSON.parse(data);
  }

  //get the MarkerClusterGroup
  var markers = new L.MarkerClusterGroup({
    showCoverageOnHover: false,
    zoomToBoundsOnClick: false,
    iconCreateFunction: function iconCreateFunction(cluster) {
      var markers = cluster.getAllChildMarkers();
      var allText = '';
      for (var i = 0, length = markers.length; i < length; i++) {
        allText += markers[i].options.title;
      }
      var innerTag = wordseg(allText, idfArray);
      var c = ' marker-cluster-';
      if (length < 10) {
        c += 'small';
      } else if (length < 100) {
        c += 'medium';
      } else {
        c += 'large';
      }
      var iconRadius = Math.log(length) * 7 + 30;
      var innerDivWidth = iconRadius * 0.8;
      var innerDivMargin = iconRadius * 0.1;
      var divString = "<div style='width:" + innerDivWidth + "px;height:" + innerDivWidth + "px;margin-top:" + innerDivMargin + "px;margin-left:" + innerDivMargin + "px;'>";
      divString += "<span style='line-height:" + innerDivWidth + "px;'>" + innerTag + "</span></div>";
      var divOption = {
        html: divString,
        className: 'marker-cluster' + c,
        iconSize: new L.Point(iconRadius, iconRadius)
      };
      return new L.DivIcon(divOption);
    }
  });

  //add marker to markers
  for (var x in data) {
    var item = data[x];
    var lat = item.geo.coordinates[0];
    var lon = item.geo.coordinates[1];
    var re = /\[.*\]/g;

    var text = item.text.replace(re, "");
    var http_index = text.indexOf("http://");
    if (http_index != -1) {
      text = text.substr(0, http_index);
    }
    text = text.replace("分享图片", "");
    var latlng = new L.LatLng(lat, lon);
    var marker = L.marker(latlng, {
      icon: L.mapbox.marker.icon({ 'marker-symbol': 'post', 'marker-color': '0044FF' }),
      title: text
    });
    markers.addLayer(marker);
    //map.addLayer(marker)
  }
  //bind the tooltip to MarkerClusterGroup
  markers.on("clustermouseover", showWeiboDetail);

  map.addLayer(markers);
  //hide the tooltip when mouse out the cluster or container
  //无效
  map.on("mouseover", function (e) {
    $("#tooltip").hide();
  });
  map.on("mouseout", function (e) {
    $("#tooltip").hide();
  });
  map.on("click", function (e) {
    $("#tooltip").hide();
  });
}
/**
* show the tooltip of cluster
* @param  {[Object]} e [mouse event]
* @return {[null]}   [null]
*/
function showWeiboDetail(e) {

  var tooltip = $("#tooltip");
  var tooltip_content = $("#tooltip-content");
  var centerText = e.layer._icon.textContent;
  var map_container = e.target._map._container;
  var point = e.target._map.latLngToContainerPoint(e.latlng);

  //get the current markers of cluster
  var currentMarkers = e.layer.getAllChildMarkers();

  tooltip.css("left", point.x + map_container.offsetLeft);
  tooltip_content.css("width", '200px');
  tooltip.css("width", '205px');

  //set the top of tooltip
  if (map_container.clientHeight - point.y <= 250) {
    tooltip.css("top", point.y - 250);
  } else {
    tooltip.css("top", point.y);
  }

  tooltip_content.empty();

  var related_weibo_num = 0;
  tooltip.show();
  var centerReg = new RegExp(centerText, 'g');
  //set the content of tooltip
  for (var i = 0, length = currentMarkers.length; i < length; i++) {
    var marker = currentMarkers[i];
    var text = marker.options.title;
    var center_index = text.indexOf(centerText);
    if (center_index != -1) {
      related_weibo_num++;
      text = text.replace(centerReg, "<span class='weibo-center-text'>" + centerText + "</span>");
      tooltip_content.append("<div class='weibo-text-item'>" + text + "</div>");
    }
  }
  var text_item = $('.weibo-text-item:last-child');
  //set the height of tooltip base the content's height
  if (text_item[0].offsetTop > 190) {
    tooltip.css("height", '245px');
    tooltip_content.css("height", '200px');
  } else {
    tooltip.css("height", '');
    tooltip_content.css("height", '');
  }

  $("#tooltip-header").html("共" + related_weibo_num + "条相关微博");
}

var wordsAndValue = [];
var wordsOnly = [];
var valueOnly = [];

/**
* word segment
* @param  {[String]} allText  [words]
* @param  {[Array]} idfArray [idf-data ]
* @return {[Array]}          [[{key:value},...]]
*/
function wordseg(allText, idfArray) {

  //loaddic();
  var list = [];
  var list1 = [];
  var list2 = [];
  var text = allText;
  var stopWords = ['的', '是', '我', ',', '自己', '哈哈', '今天', '北京', '啊', '你', '也', '为', '每', '人', '着', '个', '说', '们', '在', '再', '它', '若', '没', '有', '想', '她', '都', '不', '分', '享', '客', '户', '一', '那', '这', '呀', '吧', '些', '很', '啦', '了', '吗', '得', '怎', '什', '么', '多', '少'];
  //console.log(stopWords);
  if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (callback, thisArg) {
      var T, k;
      if (this === null) {
        throw new TypeError(" this is null or not defined");
      }
      var O = Object(this);
      var len = O.length >>> 0; // Hack to convert O.length to a UInt32
      if (({}).toString.call(callback) != "[object Function]") {
        throw new TypeError(callback + " is not a function");
      }
      if (thisArg) {
        T = thisArg;
      }
      k = 0;
      while (k < len) {
        var kValue;
        if (k in O) {
          kValue = O[k];
          callback.call(T, kValue, k, O);
        }
        k++;
      }
    };
  }

  var terms = Object.create(null);
  //console.log(text);
  //segment
  var regexp = /[^\u4E00-\u9FFF\u3400-\u4DBF]+/g;
  text = text.replace(regexp, '\n');
  //console.log(text);

  stopWords.forEach(function (stopWord) {
    if (!/^[\u4E00-\u9FFF\u3400-\u4DBF]+$/.test(stopWord)) return;
    text = text.replace(new RegExp(stopWord, 'g'), 'a');
  });
  text = text.replace(/a+/g, '\n');
  //console.log(text);
  var chunks = text.split(/\n+/);
  var pendingTerms = Object.create(null);
  chunks.forEach(function processChunk(chunk) {
    if (chunk.length <= 1) return;
    var substrings = [];
    //console.log(chunk);
    substrings = getAllSubStrings(chunk, 5);
    //console.log(substrings);
    substrings.forEach(function (substr) {
      if (substr.length <= 1) //fileter the substring
        return;
      if (!(substr in pendingTerms)) pendingTerms[substr] = 0;
      pendingTerms[substr]++;
    });
  });
  for (var term in pendingTerms) {
    if (!(term in terms)) terms[term] = 0;

    terms[term] += pendingTerms[term];
  }
  pendingTerms = undefined;

  for (term in terms) {
    if (terms[term] < 0) continue;
    if (idfArray[term]) {
      terms[term] *= idfArray[term];
    } else {}
    list.push([term, terms[term]]);
  }

  list = list.sort(function (a, b) {
    if (a[1] > b[1]) return -1;
    if (a[1] < b[1]) return 1;
    if (a[0] === b[0]) return 0;
    var t = [a[0], b[0]].sort();
    if (t[0] !== a[0]) return 1;
    return -1;
  });

  for (var i = 0; i < list.length; i++) {
    list2.push(list[i][0]);
    list1.push(list[i][1]);
  }

  wordsOnly = list2;
  valueOnly = list1;

  return wordsOnly[0];
}

/**
* get the substring
* @param  {[String]} str       [parent string]
* @param  {[Int]} maxLength [the max-length of processed the length of string]
* @return {[String]}           [substring]
*/
function getAllSubStrings(str, maxLength) {
  if (!str.length) return [];

  var result = [];
  var i = Math.min(str.length, maxLength);
  do {
    result.push(str.substr(0, i));
  } while (--i);

  if (str.length > 1) result = result.concat(getAllSubStrings(str.substr(1), maxLength)); // 迭代

  return result;
}
exports.WeiboTextMap = WeiboTextMap;
exports.Event3DMap = Event3DMap;
exports.Event3DMapCesium = Event3DMapCesium;

},{}]},{},[1]);



//# sourceMappingURL=bundle.js.570099ef.map
