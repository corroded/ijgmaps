$(document).ready(function() {
  var map = $("#map").gmap3( {
    lat: 25.928407,
    lng: -79.727783,
    zoom: 7
  });
  
  map.addMarkerByLatLng(25.928407, -79.727783, "test");
  map.addMarkerByLatLng(25.928407, -80.727783, "pew");
  
  $('#clickme').click( function() {
    map.removeMarker("test");
  })
  
});