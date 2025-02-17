import { createSlice } from "@reduxjs/toolkit";

export const planeSizeSlice = createSlice(
    {
        name: 'PlaneSize',
        initialState:
        {
            width: null,
            height: null
        },
        reducers: 
        {
            setPlaneSize : (state ,action) =>
            {
                state.width = action.payload.width;
                state.height = action.payload.height;
            }
        }
    }
);

export const {setPlaneSize} = planeSizeSlice.actions;

export default planeSizeSlice.reducer;