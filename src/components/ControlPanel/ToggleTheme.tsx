import Button from "@mui/material/Button";

interface ToggleThemeProps {
  isDark: boolean;
  toggleIsDark: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ToggleTheme = ( props: ToggleThemeProps) => {
  const toggleTheme = () => {
    if (props.isDark) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
    props.toggleIsDark(!props.isDark);
  };

  return (
    <Button
      variant="contained"
      color={props.isDark ? "warning" : "primary"}
      onClick={toggleTheme}
      sx={{
        "&:hover": {
          backgroundColor: props.isDark ? "yellow.400" : "yellow.500",
        },
        textTransform: "none",
      }}
    >
      Toggle Theme
    </Button>
  );
};
