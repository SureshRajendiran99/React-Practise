import { useState, useRef } from "react";

export const useTimer = (sec: number) => {
    const [seconds, setSeconds] = useState(sec);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<number | null>(null)

    const start = () => {
        setIsRunning(true);
        intervalRef.current = setInterval(() => {
            setSeconds((prev: number) => {
                const val = prev - 1;
                
                if (val < 0) {
                    clearInterval(intervalRef?.current as number);
                    setIsRunning(false);
                }
                console.log(val, sec)
                return val;
            });
        }, 1000)
    }

    const stop = () => {
        setIsRunning(false);
        setSeconds(sec);
        clearInterval(intervalRef?.current as number);
    }

    return { seconds, isRunning, start, stop};

}