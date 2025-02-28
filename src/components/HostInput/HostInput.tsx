import { Box, TextField, Button, Card, CardContent, Typography } from "@mui/material"

interface HostInputProps {
  host: string;
  setHost: Function;
  toggleHostSet: Function;
  defaultHost: string;
}

export const HostInput = (props: HostInputProps) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      width="100vw"
      height="100vh"
      p={2}
    >
      <Card elevation={3} sx={{ maxWidth: 400, p: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom align="center">
            Input Rosbridge Host
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={props.defaultHost}
            onChange={(e) => props.setHost(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => {
              if (props.host) {
                props.toggleHostSet(true);
              }
            }}
          >
            Connect
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};
