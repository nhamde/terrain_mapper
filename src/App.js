import React from "react";
import MapSelector from "./components/MapSelector";
import TerrainViewer from "./components/TerrainViewer";
import {useDispatch} from 'react-redux';
import { setElevationData } from "./store/slices/ElevationDataSlice";

const fetchElevationData = async (selectedArea) => 
  {
      const { north: maxLat, south: minLat, east: maxLong, west: minLong } = selectedArea;
      const meterToDegree = 0.000009;
      const stepSizeLat = 10 * meterToDegree;
      const stepSizeLongBase = 10 * meterToDegree;
  
      let interpolatedPoints = [];
      let gridX = 0, gridY = 0;
  
      for (let lat = minLat; lat <= maxLat; lat += stepSizeLat) 
      {
          const stepSizeLong = stepSizeLongBase / Math.cos(lat * (Math.PI / 180));
          let rowPoints = [];
  
          for (let lng = minLong; lng <= maxLong; lng += stepSizeLong) 
          {
              rowPoints.push({ lat, lng });
          }
  
          if (gridX === 0) gridX = rowPoints.length; // Fix grid width
          interpolatedPoints.push(...rowPoints);
      }
  
      gridY = interpolatedPoints.length / gridX; // Fix grid height
  
      console.log(`Grid size: ${gridX} x ${gridY} (Total points: ${interpolatedPoints.length})`);
  
      const elevator = new window.google.maps.ElevationService();
      const locations = interpolatedPoints.map(p => ({ lat: p.lat, lng: p.lng }));
  
      try 
      {
          const results = await elevator.getElevationForLocations({ locations });
          return { results: results.results.map(res => res.elevation), gridX, gridY };
      } 
      catch (e) 
      {
          console.log("Cannot show elevation: request failed because " + e);
          return null;
      }
  };

function App() 
{
  const dispatch = useDispatch();

  const handleAreaSelect = async (selectedArea) => 
  {
    const elevations = await fetchElevationData(selectedArea);
    dispatch(setElevationData(elevations));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100vw", height: "100vh" }}>
      <div style={{ flex: 1, minHeight: "50%" }}>
        <MapSelector onAreaSelect={handleAreaSelect}/>
      </div>
      <div style={{ flex: 2, height: "50%" }}>
        {<TerrainViewer/>}
      </div>
    </div>
  );
  
}

export default App;