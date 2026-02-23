import { useTimer } from "../hooks/useTimer";
import { useToast } from "./toast";
import { Modal } from "./modal";
import { useState } from "react";

export const Timer = () => {
    const { seconds, isRunning, start, stop} = useTimer(10);
    const { setShowToast, onCloseToast } = useToast();
    const [open, setOpen] = useState(false);

    const onStart = () => {
        setShowToast('Timer started', 'success');
        setShowToast('Timer started', 'error');
        start();
    }

    const onStop = () => {
        onCloseToast();
        stop();
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', flexDirection: 'column', height: ''}}>
            <div 
                className="link"
                onClick={() => setOpen(true)}
            >
                Open Modal
            </div>
            <div> { isRunning ? seconds : 'App is not running'} </div>
            <div> 
                <button onClick={onStart} disabled={isRunning}> Start </button>
                <button onClick={onStop}> Stop </button>
            </div>
            <div style={{ display: 'flex', height: '300px', width: '300px', border: '1px solid black', borderRadius: '50%', justifyContent: 'center', alignItems: 'center'}}>
                <div style={{ display: 'flex', height: '150px', width: '150px', border: '1px solid black', borderRadius: '50%', justifyContent: 'center', alignItems: 'center'}}/>
            </div>
            {open && <Modal onClose={() => setOpen(false)}/>}
        </div>
    )
}