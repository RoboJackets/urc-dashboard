interface HostInputProps {
  host: string;
  setHost: Function;
  toggleHostSet: Function;
  defaultHost: string;
}

export const HostInput = (props: HostInputProps) => {
  return (
    <div className="App w-screen h-screen p-2 flex gap-2 items-center justify-center">
      <div className="card">
        <div className="card-title">Input Rosbridge URL</div>
        <input
          placeholder={props.defaultHost}
          className="w-[200px] h-min"
          onChange={(e) => props.setHost(e.target.value)}
        />
        <button
          onClick={() => {
            if (props.host) {
              props.toggleHostSet(true);
            }
          }}
        >
          Set Rosbridge URL
        </button>
      </div>
    </div>
  );
};
