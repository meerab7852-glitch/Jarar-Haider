
// ==========================================================
// PAKISTAN INTERACTIVE WEB GIS
// ==========================================================


// ==========================================================
// 1. CREATE MAP
// ==========================================================

var map = L.map("map", {

    center: [30.3753, 69.3451],

    zoom: 5,

    minZoom: 4,

    maxZoom: 18,

    zoomControl: true

});


// ==========================================================
// 2. OPENSTREETMAP BASEMAP
// ==========================================================

var osm = L.tileLayer(

    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

    {

        attribution:
            "&copy; OpenStreetMap contributors",

        maxZoom: 19

    }

);


// ==========================================================
// 3. SATELLITE BASEMAP
// ==========================================================

var satellite = L.tileLayer(

    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",

    {

        attribution:
            "Tiles &copy; Esri",

        maxZoom: 19

    }

);


// ==========================================================
// 4. ADD DEFAULT BASEMAP
// ==========================================================

osm.addTo(map);


// ==========================================================
// 5. CREATE LAYER GROUPS
// ==========================================================

var cityLayer = L.layerGroup();

var weatherLayer = L.layerGroup();


// ==========================================================
// 6. CITY MARKER
// ==========================================================

function cityStyle(feature, latlng) {

    return L.circleMarker(

        latlng,

        {

            radius: 8,

            fillColor: "#1976a8",

            color: "#ffffff",

            weight: 2,

            opacity: 1,

            fillOpacity: 0.95

        }

    );

}


// ==========================================================
// 7. WEATHER MARKER
// ==========================================================

function weatherStyle(feature, latlng) {

    return L.circleMarker(

        latlng,

        {

            radius: 7,

            fillColor: "#d88a28",

            color: "#ffffff",

            weight: 2,

            opacity: 1,

            fillOpacity: 0.95

        }

    );

}


// ==========================================================
// 8. CITY POPUP
// ==========================================================

function createCityPopup(properties) {

    return (

        "<div class='popup-title'>" +

        properties.name +

        "</div>" +

        "<b class='popup-label'>Province:</b> " +

        properties.province +

        "<br>" +

        "<b class='popup-label'>Type:</b> " +

        properties.type

    );

}


// ==========================================================
// 9. WEATHER POPUP
// ==========================================================

function createWeatherPopup(properties) {

    return (

        "<div class='popup-title'>" +

        properties.name +

        "</div>" +

        "<b class='popup-label'>Temperature:</b> " +

        properties.temperature +

        " °C<br>" +

        "<b class='popup-label'>Rainfall:</b> " +

        properties.rainfall +

        " mm"

    );

}


// ==========================================================
// 10. LOAD GEOJSON
// ==========================================================

fetch("pakistan.geojson")

    .then(function(response) {

        if (!response.ok) {

            throw new Error(

                "Could not find pakistan.geojson. " +

                "HTTP Status: " +

                response.status

            );

        }

        return response.json();

    })


    .then(function(data) {


        // ==================================================
        // CHECK GEOJSON
        // ==================================================

        if (!data.features) {

            throw new Error(
                "The GeoJSON file does not contain features."
            );

        }


        console.log(
            "GeoJSON loaded successfully."
        );


        console.log(
            "Total features:",
            data.features.length
        );


        // ==================================================
        // ADD EACH FEATURE
        // ==================================================

        data.features.forEach(

            function(feature) {


                if (
                    !feature.properties ||
                    !feature.geometry
                ) {

                    return;

                }


                var layerType =
                    feature.properties.layer;


                // ==========================================
                // CITY
                // ==========================================

                if (layerType === "city") {


                    var city = L.geoJSON(

                        feature,

                        {

                            pointToLayer:
                                cityStyle,

                            onEachFeature:
                                function(feature, layer) {

                                    layer.bindPopup(

                                        createCityPopup(
                                            feature.properties
                                        )

                                    );

                                }

                        }

                    );


                    cityLayer.addLayer(city);

                }


                // ==========================================
                // WEATHER
                // ==========================================

                else if (layerType === "weather") {


                    var weather = L.geoJSON(

                        feature,

                        {

                            pointToLayer:
                                weatherStyle,

                            onEachFeature:
                                function(feature, layer) {

                                    layer.bindPopup(

                                        createWeatherPopup(
                                            feature.properties
                                        )

                                    );

                                }

                        }

                    );


                    weatherLayer.addLayer(weather);

                }

            }

        );


        // ==================================================
        // ADD DATA LAYERS TO MAP
        // ==================================================

        cityLayer.addTo(map);

        weatherLayer.addTo(map);


        // ==================================================
        // LAYER CONTROL
        // ==================================================

        var baseMaps = {

            "OpenStreetMap": osm,

            "Satellite Imagery": satellite

        };


        var overlayMaps = {

            "Cities": cityLayer,

            "Weather Stations": weatherLayer

        };


        L.control.layers(

            baseMaps,

            overlayMaps,

            {

                collapsed: false

            }

        ).addTo(map);


        // ==================================================
        // FIT MAP TO DATA
        // ==================================================

        var allFeatures = L.featureGroup();

        cityLayer.eachLayer(

            function(layer) {

                allFeatures.addLayer(layer);

            }

        );


        weatherLayer.eachLayer(

            function(layer) {

                allFeatures.addLayer(layer);

            }

        );


        if (allFeatures.getLayers().length > 0) {

            map.fitBounds(

                allFeatures.getBounds(),

                {

                    padding: [30, 30]

                }

            );

        }


        // ==================================================
        // FIX MAP SIZE
        // ==================================================

        setTimeout(

            function() {

                map.invalidateSize();

            },

            300

        );

    })


    // ======================================================
    // ERROR HANDLING
    // ======================================================

    .catch(

        function(error) {

            console.error(
                "GeoJSON Error:",
                error
            );


            var errorBox = document.createElement("div");


            errorBox.style.position = "absolute";

            errorBox.style.top = "50%";

            errorBox.style.left = "50%";

            errorBox.style.transform =
                "translate(-50%, -50%)";

            errorBox.style.background =
                "#111b2e";

            errorBox.style.color =
                "#ff6b6b";

            errorBox.style.padding =
                "20px 25px";

            errorBox.style.border =
                "1px solid #ff6b6b";

            errorBox.style.borderRadius =
                "8px";

            errorBox.style.zIndex =
                "1000";

            errorBox.style.fontFamily =
                "Inter, sans-serif";

            errorBox.style.fontSize =
                "13px";

            errorBox.style.textAlign =
                "center";

            errorBox.innerHTML =

                "<strong>GeoJSON Loading Error</strong>" +

                "<br><br>" +

                "Make sure that " +

                "<b>pakistan.geojson</b> " +

                "is in the same folder as " +

                "<b>index.html</b>.";


            document
                .getElementById("map")
                .appendChild(errorBox);

        }

    );


// ==========================================================
// 11. SCALE CONTROL
// ==========================================================

L.control.scale({

    imperial: true,

    metric: true,

    position: "bottomleft"

}).addTo(map);

