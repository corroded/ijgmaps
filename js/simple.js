$(document).ready(function() {
  
  //Example 1: Simple declaration with default coordinates and zoom
  var map = $("#map").gmap3( {
    lat: 25.928407,
    lng: -79.727783,
    zoom: 7
  });
  
  //Example 2: Simple map with button to add a specific marker
  var map2 = $('#map2').gmap3( {
    lat: 25.928407,
    lng: -79.727783,
    zoom: 7
  })
  
  $('#add-marker').click( function() {
    //marker name is optional but required if you want the delete functionality
    map2.addMarkerByLatLng(25.928407, -79.727783, "my-marker");
    return false;
  })
  
  //Example 3: Simple map with add/remove marker functionality
  var map3 = $('#map3').gmap3( {
    lat: 25.928407,
    lng: -79.727783,
    zoom: 7
  })
  
  $('#add-marker2').click( function() {
    //marker name is optional but required if you want the delete functionality
    map3.addMarkerByLatLng(25.928407, -79.727783, "my-marker");
    return false;
  })
  
  $('#remove-marker').click( function() {
    map3.removeMarker("my-marker");
    return false;
  })
  
});