import React, { useState } from 'react';
import { TextField, Button, Typography } from '@mui/material';

export const Latitude: React.FC = () => {
  // State to hold the text field value
  const [inputValue, setInputValue] = useState<string>('');

  // Handle change event for the text field
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          variant="outlined"
          style={{width: '150px'}}
          label="Latitude"
          value={inputValue}
          onChange={handleChange}
          placeholder="Type something..."
          margin="normal"
        />
        {/* <Button variant="outlined" color="secondary" onClick={handleClear} style={{ marginLeft: '10px' }}>
          Clear
        </Button> */}
      </div>
    </div>
  );
};