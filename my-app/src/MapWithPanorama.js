import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Select } from 'ol/interaction';
// import PANOLENS from 'panolens';
import * as PANOLENS from 'panolens';  

function MapWithPanorama() {
  const mapRef = useRef();
  const panoramaRef = useRef();
  const viewerRef = useRef();


  useEffect(() => {
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2,
      }),
    });

    const vectorSource = new VectorSource();
    fetch('/coordinates.txt')
      .then((response) => response.text())
      .then((text) => {
        const coordinates = text.trim().split('\n');
        console.log(coordinates);
        coordinates.forEach((coordinate) => {
          const [
            imageAddress,
            gpsSeconds,
            longitude,
            latitude,
            altitudeEllipsoidal,
            roll,
            pitch,
            heading,
          ] = coordinate.split(' ');


          const feature = new Feature({
            geometry: new Point(fromLonLat([+longitude, +latitude])),
            properties: {
              imageAddress: imageAddress,
              gpsSeconds: gpsSeconds,
              altitudeEllipsoidal: altitudeEllipsoidal,
              roll: roll,
              pitch: pitch,
              heading: heading,
            },
          });
          vectorSource.addFeature(feature);
        });
      });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });
    map.addLayer(vectorLayer);

    const select = new Select({
      layers: [vectorLayer],
    });
    map.addInteraction(select);

     viewerRef.current = new PANOLENS.Viewer({
      container: panoramaRef.current,
    });

    select.on('select', (event) => {
      if (event.selected.length > 0) {
        const properties = event.selected[0].getProperties().properties;
        var imageAddress =properties.imageAddress.replace(/"/g, '');

        // var imageAddress = properties.imageAddress;
        console.log("Image Address:", imageAddress);
        const panorama = new PANOLENS.ImagePanorama(imageAddress);
         viewerRef.current.setPanorama(panorama);
        // const viewer = new PANOLENS.Viewer({
        //   container: panoramaRef.current,
        // });
        
        // viewer.setPanorama(panorama);
       
        console.log('panoramaRef:', panoramaRef.current);
        console.log(panorama);
        // console.log(viewer)
      }
    });

    

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div ref={mapRef} style={{ flex: 1, zIndex: 0 }}></div>
      <div ref={panoramaRef} style={{ flex: 1, zIndex: 1 }}></div>
    </div>
  );
}


export default MapWithPanorama;
