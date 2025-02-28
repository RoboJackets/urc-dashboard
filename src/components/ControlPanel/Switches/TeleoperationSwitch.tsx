import React from 'react';
import { Switch, Typography, Box } from '@mui/material';

interface TeleoperationSwitchProps {
  checked: boolean;
  onToggle: (checked: boolean) => void;
  disabled: boolean;
}

export const TeleoperationSwitch: React.FC<TeleoperationSwitchProps> = (props) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!props.disabled) {
        props.onToggle(event.target.checked);
      }
    };
  
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <Typography variant="body2">Auto</Typography>
        <Switch
          checked={props.checked}
          onChange={handleChange}
          color="primary"
        />
        <Typography variant="body2">Teleoperation</Typography>
      </Box>
    );
  };