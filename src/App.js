import React, { useRef, useEffect } from "react";
import { loadModules } from "esri-loader";
import {geoJsonUrl} from "./geoJsonUrl";

function App() {
  const mapEl = useRef(null);
  useEffect(
    () => {
      let view;
      loadModules(["esri/views/MapView", "esri/WebMap", "esri/widgets/Search", "esri/layers/GeoJSONLayer", "esri/widgets/Home", "esri/widgets/Legend"], {
        css: true
      }).then(([MapView, WebMap, Search, GeoJSONLayer, Home, Legend]) => {
        const geoJsonLayers = getGeoJson(GeoJSONLayer)
        const webmap = new WebMap({
          layers: [geoJsonLayers],
          basemap: "gray-vector",
        });
        view = new MapView({
          map: webmap,
          container: mapEl.current,
          center: [-168, 46],
          zoom: 2,
        });
        addWidgets(view, webmap, Search, Home, Legend);
      });
      return () => {
        // clean up the map view
        if (!!view) {
          view.destroy();
          view = null;
        }
      };
    }, []);

  const getGeoJson = (GeoJSONLayer) => {
    const template = {
      title: "Earthquake Info",
      content: "Magnitude {mag} {type} hit {place} on {time}",
      fieldInfos: [
        {
          fieldName: 'time',
          format: {
            dateFormat: 'short-date-short-time'
          }
        }
      ]
    };
    const renderer = {
      type: "simple",
      field: "mag",
      symbol: {
        type: "simple-marker",
        color: "#14b9ad",
        outline: {
          color: "white"
        }
      },
      visualVariables: [{
        type: "size",
        field: "mag",
        stops: [{
          value: 2.5,
          size: "4px"
        },
        {
          value: 8,
          size: "40px"
        }
        ]
      }]
    };

    const geojsonLayer = new GeoJSONLayer({
      url: geoJsonUrl,
      copyright: "USGS Earthquakes",
      popupTemplate: template,
      renderer: renderer,
      orderBy: {
        field: "mag"
      }
    });
    return geojsonLayer;
  }

  const addWidgets = (view, webmap, Search, Home, Legend,) => {
    const searchWidget = new Search({
      view: view
    });
    view.ui.add(searchWidget, {
      position: "top-right"
    });

    const homeBtn = new Home({
      view: view
    });

    view.ui.add(homeBtn, "top-left");

    const featureLayer = webmap.layers.getItemAt(0);
    const legend = new Legend({
      view: view,
      layerInfos: [
        {
          layer: featureLayer,
          title: "Earthquake Info"
        }
      ]
    });
    view.ui.add(legend, "bottom-right");

  }

  return <div style={{ height: 730 }} ref={mapEl} />;
}

export default App;
