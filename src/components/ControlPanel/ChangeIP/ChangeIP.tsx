interface IPProps {
	toggleHostSet: Function
	setHost: Function
	defaultHost: string
}

export const ChangeIP = (props: IPProps) => {
	return (
		<div className="flex items-center justify-center">
			<div className="w-1/3 flex card-subtitle">{localStorage.getItem("ip")}</div>
			<div className="w-1/3 flex justify-end">
				<button
					onClick={() => {
						props.setHost(props.defaultHost);
						props.toggleHostSet();
					}}
				>
					Change IP
				</button>
			</div>
		</div>
	);
};
