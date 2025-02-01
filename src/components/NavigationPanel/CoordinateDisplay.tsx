import { Typography} from '@mui/material';
import { Coordinate } from "./CoordinateInterface";
import React, { useState } from "react";

interface CoordProps {
    coord: Coordinate;
}

export const CoordinateDisplay = (props: CoordProps) => {
    return (
        <Typography variant="h6">
            {"Lat: " + props.coord.lat + " Long: " + props.coord.lng}
        </Typography>
    )
        
}