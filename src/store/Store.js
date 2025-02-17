import { configureStore } from '@reduxjs/toolkit';
import areaSelectorReducer from './slices/AreaSelectionSlice';
import elevationDataReducer from './slices/ElevationDataSlice';
import planeSizeReducer from './slices/PlaneSizeSlice';

const Store = configureStore (
    {
        reducer: 
        {
            areaSelector : areaSelectorReducer,
            elevationDataSetter : elevationDataReducer,
            planeSizeSetter : planeSizeReducer,
        }
    }
)

export default Store;