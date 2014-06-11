$(window).load(function() {

//set container height for map
function body_size() {
    $('#container').height(function () {
        return $(window).height() - $('#header').outerHeight();
    });
};

body_size();

$( window ).resize(function() {
  body_size();
  //if ($(window).width() < 769) {
  //  $('#sidebar').hide();
  //};
  console.log($(window).width());
});


//declare map and layers. Add UI elements
var map = L.map('map', {zoomControl: false}).setView([14.6, 121.01], 11);
map.addLayer(L.mapbox.tileLayer('srthurman.ib0e160e'));

new L.Control.Zoom({position: 'bottomright'}).addTo(map);

var ui = document.getElementById('bus-ui');
var ui2 = document.getElementById('jeep-ui');

var featb = L.mapbox.featureLayer(pub_routes)
    .setFilter(function() { return false; })
    .addTo(map);

var featj = L.mapbox.featureLayer(puj_routes)
    .setFilter(function() { return false; })
    .addTo(map);

var rail = L.mapbox.featureLayer(rail_lines);

rail.setFilter(function() { return false; });

var railg = L.geoJson(rail.getGeoJSON(), {
    style: function(feature) {
        return {color: feature.properties.routeColor};
        }
    })
    .addTo(map);

var baseMaps = {
    "Mapbox": map
};

var overlayMaps = {
    "Rail Routes": railg
};

L.control.layers(null, overlayMaps, {collapsed: false}).addTo(map);

//toggle route editing sidebar on/off
$('.sidebar-toggle').click(function() {
    $('#sidebar').toggle();
    console.log($('#sidebar').css('display'));
    //$('.leaflet-top .leaflet-draw div.leaflet-draw-section:nth-child(2)').toggle();
	if($('#map').width() === $(window).width()) {
    		$('#map').width('65%');
	} else {
		$('#map').width('100%');
	};
});

// Initialise the FeatureGroup to store editable layers
var drawnItems = new L.FeatureGroup().addTo(map);
//map.addLayer(drawnItems);

// Initialise the draw control and pass it the FeatureGroup of editable layers
var drawControl = new L.Control.Draw({
    edit: {
        featureGroup: drawnItems
    },
    position: 'topright'
});

//{position: 'bottomright'}
map.addControl(drawControl);

//create select lists for all bus and jeepny routes
var pub_dict = {}
var puj_dict = {}
var edit_route = {}


for (var i = 0; i < pub_routes.features.length; i++) { 
    var route_name = pub_routes.features[i].properties['FULL_RT_NM'];
    addRoute(route_name, 'PUB', ui);
    pub_dict[route_name] = pub_routes.features[i];
};

for (var i = 0; i < puj_routes.features.length; i++) { 
    var route_name = puj_routes.features[i].properties['FULL_RT_NM'];
    addRoute(route_name, 'PUJ', ui2);
    puj_dict[route_name] = puj_routes.features[i];
};

function addRoute(rname, classname, element) {
    var item = document.createElement('option');

    item.value = rname;
    item.className = classname;
    item.innerHTML = rname;

    element.appendChild(item);
};

//jquery that sets one select list to 'none' if a value from the other is selected
//and fits the bounds of the map to the selected route
$("#bus-ui").change(function() {
    var selected = $("#bus-ui option:selected").val();
    //console.log(selected);
    merge_vars[0].vars[0].content = selected;
    featb.setFilter(function(f) {
        if(selected === 'all') {
        resetRoute("#jeep-ui option:eq(0)", featj);
        return true;
    } else if(selected === 'none') {
        return false;
    };
        resetRoute("#jeep-ui option:eq(0)", featj);
        return f.properties['FULL_RT_NM'] === selected;
    });
    edit_route = pub_dict[selected]
    console.log(edit_route);
    map.fitBounds(featb.getBounds());
});

$("#jeep-ui").change(function() {
    var selected = $("#jeep-ui option:selected").val();
    merge_vars[0].vars[0].content = selected;
    featj.setFilter(function(f) {
        if(selected === 'all') {
        resetRoute("#bus-ui option:eq(0)", featb);
        return true;
    } else if(selected === 'none') {
        return false;
    };
        resetRoute("#bus-ui option:eq(0)", featb);
        return f.properties['FULL_RT_NM'] === selected;
    });
    edit_route = puj_dict[selected]
    console.log(edit_route);
    //console.log(puj_dict[selected]);
    map.fitBounds(featj.getBounds());    
});

function resetRoute(uioption, feature) {
    $(uioption).prop('selected',true);
    feature.setFilter(function() { return false; });
};

//Make select lists unavailable if edit_button pressed
$("#edit_button").click(function() {
    if(jQuery.isEmptyObject(edit_route) !== true) {
        $("#jeep-ui, #bus-ui, #edit_button").prop("disabled", true);
        $("#stop_edit_button, #submit_edit_button").prop("disabled", false);

        var llayer = L.GeoJSON.geometryToLayer(edit_route);
        //llayer.addTo(map);
        llayer.addTo(drawnItems);

        $('.leaflet-top .leaflet-draw div.leaflet-draw-section:nth-child(2)').show();
        }
    });

//Make select lists available if stop_edit_button pressed
$("#stop_edit_button").click(function() {
    $("#jeep-ui, #bus-ui, #edit_button").prop("disabled", false);
    $("#stop_edit_button, #submit_edit_button").prop("disabled", true);

    drawnItems.clearLayers();

    $('.leaflet-top .leaflet-draw div.leaflet-draw-section:nth-child(2)').hide();
    });

//Send email with route info for edited route and clear the screen.
$("#submit_edit_button").click(function() {
    var e = drawnItems.getLayers()[0];
    geoJSON_edit = e.toGeoJSON();
    //console.log(geoJSON_edit);
    merge_vars[0].vars[1].content = JSON.stringify(geoJSON_edit);
    sendTheMail();

    $("#jeep-ui, #bus-ui, #edit_button").prop("disabled", false);
    $("#stop_edit_button, #submit_edit_button").prop("disabled", true);
    drawnItems.clearLayers();

    $('.leaflet-top .leaflet-draw div.leaflet-draw-section:nth-child(2)').hide();
    });


//convert currently shown geojson route to a leaflet path layer
//var llayer = L.GeoJSON.geometryToLayer(edit_route)
//llayer.addTo(map)
//llayer.addTo(drawnItems)


});