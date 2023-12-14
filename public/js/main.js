
var sock = io();
var map;

function moveCercle( obj )
{
  var lat = obj.position.lat;
  var lng = obj.position.lng;
  var index = obj.index;
  var rayon = obj.rayon;
  var couleur = obj.couleur;

  var cercle = L.circle
  (
    [ lat, lng ], 
    {
      color: couleur,
      fillColor: couleur,
      fillOpacity: 1,
      radius: rayon
    }
  ).on
  (
    'mouseover', 
    function(e) //open popup;
    {
      var popup = L.popup().setLatLng( e.latlng ).setContent( "Nbre = " +  index ).openOn( map );
    }
  ).addTo(map);
}

function updateCercles( link )
{ 
   var index;
   for ( index = link.tabCellule.length-1; index >= 0; index-- )
   {
      if( link.tabCellule[index].isToUpdate == true )
        moveCercle( link.tabCellule[index] );
   }

   for ( index = link.tabVoiture.length-1; index >= 0; index-- )
   {
      if( link.tabVoiture[index].isToUpdate == true )
        moveCercle( link.tabVoiture[index] );
   }
}

function initMap()
{
  console.log('Initializing map');
  map = L.map('map').setView([33.705, -7.356], 17);

  // Set up map source
  L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Open Street Map',
      maxZoom: 18
    }).addTo(map);
}

initMap();
sock.on
( 
  'dataTube', 
  function(data) 
  {
    console.log( data.prompt );
    updateCercles( data.link ); //c.lat, c.lng
  }
);