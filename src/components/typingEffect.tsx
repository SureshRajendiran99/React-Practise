import { useEffect, useState, useRef } from 'react';

const text = 'Test the typing effect.';

export const TypingEffect = () => {
  const [value, setValue] = useState('');
  const valueRef = useRef({
    index: 0,
    step: 1,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (valueRef.current.index === text.length) {
        valueRef.current.step = -1;
      } else if (valueRef.current.index === 0 && valueRef.current.step === -1) {
        valueRef.current.step = 0;
        clearInterval(interval);
      }

      valueRef.current.index = valueRef.current.index + valueRef.current.step;
      setValue(text.slice(0, valueRef.current.index));
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return <div> {value}| </div>;
};
