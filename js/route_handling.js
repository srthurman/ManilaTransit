//toggle route editing sidebar on/off
$('.sidebar-toggle').click(function() {
    $('#header').css({
	'height': '100%',
	'width': '315px',
	'border-bottom': 'none',
	'border-right': '6px solid #350805'
	});
    $(this).css('display','none');
    $('.bus_select').offset({left: 20, top: 88});
    $('.jeep_select').offset({left: 20, top: 140});
    $('.bus_routes, .jeep_routes').after('</br>');
    $('.leaflet-top .leaflet-control-layers').css({
	'margin-top': '5px'});
    $('.leaflet-top .leaflet-draw div.leaflet-draw-section:nth-child(2)').css({
	'margin-top': '35px',
	'display': 'block'});
    
});
//$('.sidebar-toggle').click(function() {
//    $('.sidebar').toggle();
//});

//get value from input box for edited route URL
function updateInput(rval){
    merge_vars[0].vars[1].content = document.getElementById("edited_route").value;
    console.log(merge_vars[0].vars[1].content);
};

$('#edit_submission').click(function() {
    $('.success_message').text("Thank you, your edits have been submitted.");
    setTimeout(function() {
        $(".success_message").fadeOut().empty();
        $('#edited_route').val('');
    }, 5000);
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

// Initialise the FeatureGroup to store editable layers
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// Initialise the draw control and pass it the FeatureGroup of editable layers
var drawControl = new L.Control.Draw({
    edit: {
        featureGroup: drawnItems
    },
    position: 'topright'
});

//{position: 'bottomright'}
map.addControl(drawControl);


////construct URL for route editing
//var a = document.getElementById('edit_route');
//function update_href(route_edit) {
//    a.href = "http://geojson.io/#data=data:application/json," + route_edit;
//};

//create select lists for all bus and jeepny routes
//var pub_dict = {}
//var puj_dict = {}

for (var i = 0; i < pub_routes.features.length; i++) { 
    var route_name = pub_routes.features[i].properties['FULL_RT_NM'];
    addRoute(route_name, 'PUB', ui);
    //pub_dict[route_name] = pub_routes.features[i];
};

for (var i = 0; i < puj_routes.features.length; i++) { 
    var route_name = puj_routes.features[i].properties['FULL_RT_NM'];
    addRoute(route_name, 'PUJ', ui2);
    //puj_dict[route_name] = puj_routes.features[i];
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
    //console.log(pub_dict[selected]);
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
    //console.log(puj_dict[selected]);
    map.fitBounds(featj.getBounds());    
});

function resetRoute(uioption, feature) {
    $(uioption).prop('selected',true);
    feature.setFilter(function() { return false; });
};
