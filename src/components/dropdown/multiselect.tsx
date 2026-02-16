import { useRef, useState, useEffect } from 'react';
import './multiselect.css';
const valuesList = ['apple', 'orange', 'pine-apple', 'mango', 'jackfruit'];

export const MultiSelect = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [bar, setBar] = useState(0); const interval = useRef<any>(null);
    const [isShow, setIsShow] = useState(false);
    const [selected, setSelected] = useState<string[]>([]);
    const [values, setValues] = useState([
        'apple',
        'acd',
        'amd',
        'orange',
        'onion',
        'pine-apple',
        'mango',
        'jackfruit',
    ]);

    useEffect(() => {
        interval.current = setInterval(() => {
            setBar((prev) => {
                const val = prev + 1;
                console.log(val);
                if (val * 4 >= 400) clearInterval(interval.current);
                return val;
            });
        }, 300);

        return () => clearInterval(interval.current);
    }, []);

    const debounce = (fn: (...args: any[]) => void, delay = 500) => {
        let timeout: any;

        return (...arg: any[]) => {
            if (timeout) clearTimeout(timeout);

            timeout = setTimeout(() => {
                fn(...arg);
            }, delay);
        };
    };

    const filterValues = debounce((value) => {
        setValues(valuesList.filter((d) => d.includes(value)));
    });

    const onKeyDown = () => {
        let value = '';

        return {
            addValue: (e: any) => {
                if (e.key === 'Backspace') {
                    value = value.slice(0, value.length - 1);
                } else {
                    value += e.key;
                }

                filterValues(value);
            },
            removeValue: () => {
                value = '';
            },
        };
    };

    const onClick = () => {
        containerRef.current?.focus();
        setValues(valuesList);
        setIsShow(!isShow);
    };

    const onSelect = (data: string) => {
        console.log(data);
        setSelected((prev: string[]) => {
            const updated = prev.includes(data)
                ? prev.filter((d) => d !== data)
                : [...prev, data];
            console.log(updated);
            return updated;
        });
        // setIsShow(false);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                // console.log('test');
                setIsShow(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const onCheckboxChange = (item: string, checked: boolean) => {
        console.log(item, checked);
        setSelected((prev: string[]) => {
            if (checked) {
                if (prev.includes(item)) return prev; // no-op
                return [...prev, item];
            }
            // remove
            return prev.filter((d) => d !== item);
        });
    };

    return (
        <div>
            <div
                className="dropdown"
                tabIndex={0}
                ref={containerRef}
                onKeyDown={onKeyDown().addValue}
                onClick={onClick}
            >
                <div className="dropdown-top">
                    <span className={selected.length > 0 ? '' : 'placeholder'}>
                        {selected.length > 0
                            ? selected.map((d) => (
                                <div
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        border: '1px solid gray',
                                        padding: '2px 6px',
                                        borderRadius: 4,
                                        marginRight: 6,
                                    }}
                                    key={d}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelected((prev) => prev.filter((data) => data !== d));
                                    }} // prevent toggle when clicking on chips
                                >
                                    <span> {d} </span>
                                    <span> x </span>
                                </div>
                            ))
                            : 'Please Select'}
                    </span>
                    <div className="drp-right">
                        {selected.length > 0 && (
                            <div
                                className="clear"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setSelected([]);
                                    setIsShow(false);
                                }}
                            >
                                {' '}
                                x{' '}
                            </div>
                        )}
                        <span> {isShow ? '^' : 'v'}</span>
                    </div>
                </div>
            </div>
            {isShow && (
                <div className="options-list">
                    {/* <input
            style={{ width: '100%', height: '20px' }}
            onClick={(e) => e.stopPropagation()}
          /> */}
                    {values.map((d) => (
                        <div
                            key={d}
                            className={`option ${selected.includes(d) ? 'selected' : ''}`}
                            // onMouseDown={(e) => {
                            //   e.stopPropagation();
                            // }}
                            onClick={(e) => {
                                console.log(d);
                                e.stopPropagation();
                                onSelect(d);
                            }}
                        >
                            <input
                                type="checkbox"
                                name={d}
                                value={d}
                                id={d}
                                // readOnly
                                onChange={(e) => onCheckboxChange(d, e.target.checked)}
                                onClick={(e) => e.stopPropagation()}
                                checked={selected.includes(d)}
                            />{' '}
                            <label htmlFor={d} onClick={(e) => e.stopPropagation()}>
                                {d}
                            </label>
                        </div>
                    ))}

                    {!values.length && <div className="align-center">{'No options'}</div>}
                </div>
            )}

            <div
                style={{
                    height: '30px',
                    width: '400px',
                    border: '1px solid black',
                    borderRadius: '40px',
                    overflow: 'hidden',
                    marginTop: '20px',
                }}
            >
                <div
                    style={{
                        height: '100%',
                        width: `${bar * 4}px`,
                        background: 'green',
                        borderRadius: '100px',
                    }}
                />
            </div>
        </div>
    );
}
