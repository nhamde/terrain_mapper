import React, { useState, useRef } from "react";
import { GoogleMap, LoadScript, Rectangle } from "@react-google-maps/api";
import { REACT_APP_GOOGLE_MAPS_API_KEY } from "../ApiKey";
import { calculatePlaneSize } from "./Functionality";

const libraries = ["drawing"]; // Load drawing tools

const MapSelector = ({ onAreaSelect, setPlaneSize, setCenter }) => 
{
    const mapRef = useRef(null);
    const [selection, setSelection] = useState(null);

    const handleLoad = (map) => 
    {
    mapRef.current = map;
    const drawingManager = new window.google.maps.drawing.DrawingManager(
    {
      drawingMode: window.google.maps.drawing.OverlayType.RECTANGLE,
      drawingControl: true,
      drawingControlOptions: 
      {
        position: window.google.maps.ControlPosition.TOP_CENTER,
        drawingModes: ["rectangle", "polygon"],
      },
    });

    drawingManager.setMap(map);

    window.google.maps.event.addListener(drawingManager, "overlaycomplete", (event) => 
    {
        let bounds;
        if (event.type === "rectangle")
        {
            bounds = event.overlay.getBounds();
        }
        else if (event.type === "polygon")
        {
            bounds = new window.google.maps.LatLngBounds();
            const path = event.overlay.getPath(); // Get polygon vertices

            path.forEach((latLng) => bounds.extend(latLng));
        }   
        event.overlay.setMap(null); // Remove rectangle after selection
        console.log("shapeType: ", event.type)
        const selectedArea = 
        {
            north: bounds.getNorthEast().lat(),
            south: bounds.getSouthWest().lat(),
            east: bounds.getNorthEast().lng(),
            west: bounds.getSouthWest().lng()
        };
        console.log("SelectedArea: ",selectedArea)

        const {width, height} = calculatePlaneSize(selectedArea.north, selectedArea.south, selectedArea.east, selectedArea.west);
        setPlaneSize({width, height});
        setCenter({lat:(selectedArea.north+selectedArea.south)/2, lng:(selectedArea.east+selectedArea.west)/2});
        setSelection(selectedArea);
        onAreaSelect(selectedArea);
    });
  };

  return (
    <LoadScript googleMapsApiKey={REACT_APP_GOOGLE_MAPS_API_KEY} libraries={libraries}>
      <GoogleMap
        mapContainerStyle={{ width: "50vw", height: "50vh" }}
        center={{ lat: 30.734627, lng: 79.066895 }} // Default to San Francisco
        zoom={20}
        onLoad={handleLoad}
      >
        {selection && (
          <Rectangle
            bounds={{
              north: selection.north,
              south: selection.south,
              east: selection.east,
              west: selection.west,
            }}
            options={{ strokeColor: "#FF0000", fillColor: "#FF0000", fillOpacity: 0.2 }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapSelector;
