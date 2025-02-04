import Button from "@mui/material/Button";

interface IPProps {
	toggleHostSet: Function
	setHost: Function
	defaultHost: string
	isDark: boolean
}

export const ChangeIP = (props: IPProps) => {
	return (
		<Button
			variant="contained"
			color={props.isDark ? "warning" : "primary"}
			onClick={() => {
				props.setHost(props.defaultHost);
				props.toggleHostSet();
			}}
			sx={{
				bgcolor:"#B3A300",
				"&:hover": {
				backgroundColor: props.isDark ? "yellow.400" : "yellow.500",
				},
				textTransform: "none",
			}}
		>
		Change IP
		</Button>
	);
};
