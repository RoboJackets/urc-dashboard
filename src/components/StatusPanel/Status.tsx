interface StatusOptions {
  value: string;
  color: string;
}

export const Status = (props: StatusOptions) => {
  return (
    <div
      className={
        "p-2 rounded-md text-center whitespace-nowrap text-white " + props.color
      }
    >
      {props.value}
    </div>
  );
};
