import { Typography } from "@mui/material";
import { Coordinate } from "./CoordinateInterface";

interface CoordProps {
  coord: Coordinate;
}

export const CoordinateDisplay = (props: CoordProps) => {
  return (
    <Typography variant="h6">
      {"Latitude: " + props.coord.lat + " Longitude: " + props.coord.lng}
    </Typography>
  );
};
