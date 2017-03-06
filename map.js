
      var currentSelectedDivName;
      var currentSelectedLayer;

      var mymap = L.map('mapid',{
        minZoom: 4,
      }).setView([-25.61, 134.355], 4);
      //Lambert Gravitational Centre


      function bracketDevicePixelRatio() {
          var brackets = [1, 1.3, 1.5, 2, 2.6, 3],
              baseRatio = window.devicePixelRatio || 1;
          for (var i = 0; i < brackets.length; i++) {
              var scale = brackets[i];
              if (scale >= baseRatio || (baseRatio - scale) < 0.1) {
                  return scale;
              }
          }
          return brackets[brackets.length - 1];
      }

      var scale = bracketDevicePixelRatio();
      var scalex = (scale === 1) ? '' : ('@' + scale + 'x');

      // Add a map layer
      var tiles = L.tileLayer('https://maps.wikimedia.org/osm-intl' + '/{z}/{x}/{y}' + scalex + '.png', {
          maxZoom: 18,
          //bounds: mymap.getBounds(),
          id: 'wikipedia-map-01'
      }).addTo(mymap);

      var geojsonlayer;

      geojsonlayer = L.geoJSON(bounds.features, {
          style: style,
          onEachFeature: onEachFeature

        }).addTo(mymap);

      function style(feature) {

          var col;

          var results = divResults[feature.properties.Elect_div];

          if(results)
          {
            feature.properties.PartyNm = results.PartyNm;
            feature.properties.PartyAb = results.PartyAb;
          }

          switch (feature.properties.PartyAb) {
              case 'ALP': col = "#DE2C34"; break;
              case 'GRN': col = "#39b54a"; break;
              case 'LP': col = "#0047AB"; break;
              case 'LNP': col = "#1456F1"; break;
              case 'NP': col = "#006644"; break;
              case 'XEN': col = "#ff6300"; break;
              case 'KAP': col = "#b50204"; break;
              case 'IND': col = "#808080"; break;
              default: col = "#ffffff"; break;
          }

          return {
            weight: 1,
            opacity: 0.5,
            fillColor: col,
            fillOpacity: 0.5,
            color: '#ffffff',
            dashArray: '3'
          }

        }

      function highlightFeature(e) {
        var layer = e.target;

        layer.setStyle({

            fillOpacity: 0.7
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
      };

      function resetHighlight(e) {

        if (e.target.feature.properties.Elect_div != currentSelectedDivName)
        {
          geojsonlayer.resetStyle(e.target);
        }


      };

      function clickFeature(e) {
        // Zoom to Division feature
        //mymap.fitBounds(e.target.getBounds());

        if (currentSelectedDivName == e.target.feature.properties.Elect_div)
        {
          currentSelectedDivName = null;
          currentSelectedLayer = null;
        }

        else {
          if (currentSelectedLayer) {geojsonlayer.resetStyle(currentSelectedLayer);}
          currentSelectedDivName = e.target.feature.properties.Elect_div;
          currentSelectedLayer = e.target;
        }

        //


      }

      function onEachFeature(feature, layer) {

        layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: clickFeature
        });

        var results = divResults[feature.properties.Elect_div];

        layer._leaflet_id = feature.properties.Elect_div;

        if (results)
        {
          feature.properties.StateAb = results.StateAb;
          feature.properties.GivenNm = results.GivenNm;
          feature.properties.Surname = results.Surname;
          feature.properties.PartyNm = results.PartyNm;
          feature.properties.PartyAb = results.PartyAb;
        }

        var tooltipContent = "" + feature.properties.Elect_div;

        if (feature.properties && feature.properties.tooltipContent) {
          tooltipContent += feature.properties.tooltipContent;
        }

        layer.bindTooltip(tooltipContent);



      }

      mymap.addControl(new L.Control.Fullscreen());

      //fix this
      mymap.addHardBounds();

      // Get layer by name id!
      //alert(geojsonlayer.getLayer("Wills").feature.properties.Elect_div);
      //alert(divResults["Wills"].PartyAb);



      //Credits?
      //attribution: 'Wikimedia maps beta | Map data &copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap contributors</a>',
