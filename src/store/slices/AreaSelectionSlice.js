import { createSlice } from "@reduxjs/toolkit";

export const areaSelectionSlice = createSlice(
    {
        name: 'AreaSelection',
        initialState:
        {
            north: null,
            south: null,
            east: null,
            west: null
        },
        reducers: 
        {
            setAreaSelection : (state ,action) =>
            {
                state.north = action.payload.north;
                state.south = action.payload.south;
                state.east = action.payload.east;
                state.west = action.payload.west;
            }
        }
    }
);

export const {setAreaSelection} = areaSelectionSlice.actions;

export default areaSelectionSlice.reducer;