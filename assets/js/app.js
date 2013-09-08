// params par défaut
var latStart = 48.861027361567494;
var lonStart = 2.3358754089260856;
var zoomStart = 6;

// recupérer les paramètres GET
var prmstr = window.location.search.substr(1);
var prmarr = prmstr.split ("&");
var params = {};
var il = prmarr.length;
for(var i=0; i<il; i++) {
	var tmparr = prmarr[i].split("=");
	if(tmparr[0] == 'lat' && tmparr[1]) 
		latStart = tmparr[1];
	if(tmparr[0] == 'lon' && tmparr[1]) 
		lonStart = tmparr[1];
	if(tmparr[0] == 'zoom' && tmparr[1]) 
		zoomStart = parseInt(tmparr[1]);
}

var url = document.URL.split('?')[0];

var mapDiv = null;
var map = null;
var geocoder = null;
var marker = null;
var infoWindow;

var llDiv = document.getElementById("ll");
var zoomDiv = document.getElementById("zoom");
var genDiv = document.getElementById("generate");
var codeDiv = document.getElementById("code");
var maskDiv = document.getElementById("mask");
var linkDiv = document.getElementById("link");

// rafraichir les coordonnées affichées
function refreshCoords() {
	llDiv.value = marker.getPosition().lat()+', '+marker.getPosition().lng();
	llDiv.className = 'active';
	window.setTimeout(function() {
		llDiv.className = 'inactive';
	}, 100);
	refreshLink();
}

// rafraichir le zoom affiché
function refreshZoom() {
	zoomDiv.value = map.getZoom();
	zoomDiv.className = 'active';
	window.setTimeout(function() {
		zoomDiv.className = 'inactive';
	}, 100);
	refreshLink();	
}

// rafraichir le lien direct
function refreshLink() {
	linkDiv.value = url+'?lat='+marker.getPosition().lat()+'&lon='+marker.getPosition().lng()+'&zoom='+map.getZoom();
}

// fonction de geocoding
function showAddress(address) {
	if (geocoder) {
		geocoder.geocode(
			{address: address},
			function(result) {
				if (!result || result.length == 0) {
					alert(address + " (inconnu)");
				} else {
					var point = result[0].geometry.location;
					map.panTo(point);
					createMarker(point, address);
					refreshCoords();
					refreshZoom();
				}
			}
		);
	}
	return false;
}

// Créer un marqueur a position donnée
function createMarker(point, texte) {
	if(marker)
		marker.setMap(null);
	marker = new google.maps.Marker({
		position: point,
		draggable: true,
		map: map,
		title: texte
	});	

	google.maps.event.addListener(marker, 'dragend', function() {
		map.panTo(marker.getPosition());
		refreshCoords();
	});
}

// génère le code d'une GMap
function generate() {
	var EOL = String.fromCharCode(13);

	codeDiv.innerHTML  = "&lt;div id=\"map\" style=\"width: 500px; height: 500px\"&gt;&lt;/div&gt;"+EOL+EOL;
	codeDiv.innerHTML += "&lt;script type=\"text/javascript\" src=\"http://maps.google.com/maps/api/js?sensor=false\"&gt;&lt;/script&gt;"+EOL;
	codeDiv.innerHTML += "&lt;script type=\"text/javascript\"&gt;"+EOL;
	codeDiv.innerHTML += "window.onload = function() {"+EOL;
	codeDiv.innerHTML += "    var lat = "+marker.getPosition().lat()+";"+EOL;
	codeDiv.innerHTML += "    var lon = "+marker.getPosition().lng()+";"+EOL;
	codeDiv.innerHTML += "    var latlng = new google.maps.LatLng(lat, lon);"+EOL;
	codeDiv.innerHTML += "    var myOptions = {"+EOL;
	codeDiv.innerHTML += "        zoom: "+map.getZoom()+","+EOL;
	codeDiv.innerHTML += "        center: latlng,"+EOL;
	codeDiv.innerHTML += "        mapTypeId: google.maps.MapTypeId.ROADMAP"+EOL;
	codeDiv.innerHTML += "    };"+EOL;
	codeDiv.innerHTML += "    var map = new google.maps.Map(document.getElementById('map'), myOptions);"+EOL;
	codeDiv.innerHTML += "    var infowindow = new google.maps.InfoWindow({"+EOL;
	codeDiv.innerHTML += "        content: lat+', '+lon"+EOL;
	codeDiv.innerHTML += "    });"+EOL;
	codeDiv.innerHTML += "    var marker = new google.maps.Marker({"+EOL;
	codeDiv.innerHTML += "        position: latlng,"+EOL;
	codeDiv.innerHTML += "        map: map"+EOL;
	codeDiv.innerHTML += "    });"+EOL;
	codeDiv.innerHTML += "    google.maps.event.addListener(marker, 'click', function() {"+EOL;
	codeDiv.innerHTML += "        infowindow.open(map,marker);"+EOL;
	codeDiv.innerHTML += "    });"+EOL;
	codeDiv.innerHTML += "    infowindow.open(map,marker);"+EOL;
	codeDiv.innerHTML += "};"+EOL;
	codeDiv.innerHTML += "&lt;/script&gt;"+EOL;

	codeDiv.className = 'active';
	maskDiv.style.display = 'block';
}

// chargement de la page
function load() {
	
	mapDiv = document.getElementById('map');
	mapDiv.style.width = window.innerWidth;
	mapDiv.style.height = window.innerHeight;

	geocoder = new google.maps.Geocoder();
	var latlng = new google.maps.LatLng(latStart, lonStart);
	var myOptions = {
		zoom: zoomStart,
		center: latlng,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(mapDiv, myOptions);
	createMarker(map.getCenter());

	google.maps.event.addListener(map, 'zoom_changed', refreshZoom);	

	refreshCoords();
	refreshZoom();

	maskDiv.addEventListener('click', function() {
		codeDiv.className = 'inactive';
		mask.style.display = 'none';
	})
}