export const calculatePlaneSize = (north, south, east, west) => 
    {
        const latToMeters = 111320; // Approximate meters per degree latitude
        const avgLat = (north + south) / 2; // Average latitude for longitude conversion
        const lonToMeters = latToMeters * Math.cos(avgLat * (Math.PI / 180)); // Adjust for latitude
    
        let height = (north - south) * latToMeters; // Height in meters
        let width = (east - west) * lonToMeters;    // Width in meters
        height = ((Math.floor(height/10))+1)*10;
        width = ((Math.floor(width/10))+1)*10;
    
        return { width, height };
    };