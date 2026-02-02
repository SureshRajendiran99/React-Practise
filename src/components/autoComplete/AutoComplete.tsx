import { useState } from 'react'
import './autocomplete.css'
const FRUITS = ['Apple', 'Orange', 'Grapes', 'Pine-Apple', 'Lemon', 'Fig', 'Chikoo', 'Mango', 'Guava']

const debounce = (fn : Function, delay = 500) => {
    let timeout: number;

    return (...arg: any) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            fn.apply(this, arg);
        }, delay);
    }
}

export const AutoComplete = () => {
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const onChange = debounce((e: any) => {
        const value = e.target.value;
        console.log('value', value)
        if (value) {
            setSuggestions(FRUITS.filter(d => d.toLowerCase().includes(e.target.value?.toLowerCase())));
        } else {
            setSuggestions([]);
        }
    });

    return (
        <div className='autocomplete'>
            <input className='input' onChange={onChange}/>
            {suggestions.length > 0 && <div className='suggestion'>
                { suggestions.map(fruit => <div key={fruit} className='option'> {fruit} </div>)}
            </div>}
        </div>
    )
}


