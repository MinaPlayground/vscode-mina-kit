import {ChangeEvent, FC, PropsWithChildren} from "react";

const Select: FC<PropsWithChildren<CTAModalProps>> = ({
  title, items, onChange
}) => {
  return (
      <select className="select select-primary w-full max-w-xs" onChange={onChange}>
          <option disabled selected>{title}</option>
          {items.map(({value, name}) => <option value={value}>{name}</option> )}
      </select>
  );
};

interface CTAModalProps {
  title: string;
  items: {value: string; name: string;}[];
  onChange(event: ChangeEvent<HTMLSelectElement>): void;
}

export default Select;
