import React from 'react';
import { Switch, Box, Typography } from '@mui/material';

interface EnableSwitchProps {
  checked: boolean;
  onToggle: (checked: boolean) => void;
}

export const EnableSwitch: React.FC<EnableSwitchProps> = (props) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.onToggle(event.target.checked);
  };

  return (
    <Box display="flex" alignItems="center" gap={1}>
        <Typography variant="body2">Disabled</Typography>
        <Switch
          checked={props.checked}
          onChange={handleChange}
          color="primary"
        />
        <Typography variant="body2">Enabled</Typography>
    </Box>
  );
};
