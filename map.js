
      var currentSelectedDivName;
      var currentSelectedLayer;

      // Set the map centrepoint
      // Alternatively, We could set the map centre at the Lambert Gravitational Centre [-25.61, 134.355]
      var mapCentre = [-28.497660832963472, 133.48388671875003];

      var mymap = L.map('mapid',{
        minZoom: 4,
        fullscreenControl: {
          pseudoFullscreen: false}
      }).setView(mapCentre, 5);




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
          attribution: 'Built by <a href="https://twitter.com/jimsm1th" target="_blank">@jimsm1th <i class="fa fa-twitter fa-lg" aria-hidden="true"></i> </a>',
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
              case 'LNP': col = "#0047AB"; break; //#1456F1
              case 'NP': col = "#006644"; break;
              case 'XEN': col = "#ff6300"; break;
              case 'KAP': col = "#808080"; break; //#b50204
              case 'IND': col = "#808080"; break;
              default: col = "#ffffff"; break;
          }

          return {
            weight: 1,
            opacity: 0.5,
            fillColor: col,
            fillOpacity: 0.3,
            color: '#ffffff',
            dashArray: '3'
          }

        }

      function highlightFeature(e) {
        var layer = e.target;

        layer.setStyle({

            fillOpacity: 0.6
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

        if (currentSelectedDivName == e.target.feature.properties.Elect_div)
        {
          currentSelectedDivName = null;
          currentSelectedLayer = null;
          info.update();
        }

        else {
          if (currentSelectedLayer) {geojsonlayer.resetStyle(currentSelectedLayer);}
          currentSelectedDivName = e.target.feature.properties.Elect_div;
          currentSelectedLayer = e.target;
          info.update(e.target.feature.properties);
        }

      }

      function zoomToDiv() {

        // Zoom to Division feature
        mymap.fitBounds(geojsonlayer.getLayer(currentSelectedDivName).getBounds());

      }

      function resetMapCentre() {

        mymap.setView(mapCentre, 5);

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

        var tooltipContent = feature.properties.Elect_div;

        if (feature.properties && feature.properties.tooltipContent) {
          tooltipContent += feature.properties.tooltipContent;
        }

        layer.bindTooltip(tooltipContent, {className: 'tooltiptext'});

      }

      var info = L.control();

      info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        L.DomEvent.disableClickPropagation(this._div);
        return this._div;
      };

      // method that we will use to update the control based on feature properties passed
      info.update = function (props) {
        this._div.innerHTML = '<h4>Information</h4>' +  (props ?
        '<h5>Division of ' + props.Elect_div + ' ('+ props.State + ')' +
        ' <a href="#"><i class="fa fa-search-plus" onclick="zoomToDiv()" aria-hidden="true"></i></a>' +
        '</h5>' +
        '<h6>MP: '+ props.GivenNm + ' ' + props.Surname + '</h6>' +
        '<h6>Party: '+ props.PartyNm + ' (' + props.PartyAb + ')</h6>' +
        ''
        : '<h5><em>Please select an electoral division on the map for more information.<em></h5>');
      };

      info.addTo(mymap);
