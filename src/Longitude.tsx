import React, { useState } from 'react';
import { TextField, Button, Typography } from '@mui/material';

export const Longitude: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };
  
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          variant="outlined"
          style={{width: '150px'}}
          label="Longitude"
          value={inputValue}
          onChange={handleChange}
          placeholder="Type something..."
          margin='none'
        />
      </div>
    </div>
  );
};