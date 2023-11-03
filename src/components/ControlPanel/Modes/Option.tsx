interface OptionProps {
  value: string;
  idx: number;
  curIdx: number;
  updateIdx: Function;
}

export const Option = (props: OptionProps) => {
  let styling =
    "w-full whitespace-nowrap p-2 text-center rounded-md text-neutral-400 select-none";
  return (
    <div
      className={
        styling +
        (props.idx === props.curIdx
          ? " bg-neutral-700 text-white"
          : " hover:cursor-pointer")
      }
      onClick={() => props.updateIdx(props.idx)}
    >
      {props.value}
    </div>
  );
};
