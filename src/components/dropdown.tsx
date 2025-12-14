import { useCallback } from "react"
import { v4 as uuidv4 } from 'uuid';

interface IDropdown {
    option: { label: string, value: string | number, id: string | number, [key: string]: any}[];
    value: string | number;
    onChange: (value: any) => void;
    name?: string;
}

export const Dropdown = ({ option, value, onChange, name }: IDropdown) => {
    const onChangeOption = useCallback((e: any) => {
        const val = e.target.value ?? '';
        const selected = option.find(op => op.id?.toString() === val);
        if (onChange) onChange(selected);
    }, [option]);

    return (
        <select
            value={value}
            onChange={onChangeOption}
            id={uuidv4()}
            name={`${name ?? ''}-dropdown-${uuidv4}`}
        >
            { option.map(op => <option value={op.id} key={op.id}> {op.label} </option>)}
        </select>
    )
}