import { createContext, useContext, useState, useCallback, memo } from "react";

const ToastContext = createContext<{setShowToast: Function,  onCloseToast: Function} | null>(null);
export const ToastProvider = memo(({ children }: any) => {
    const [show, setShow] = useState(false);
    const [toastProps, setToastProps] = useState({
        message: '',
        type: ''
    });
    
    const setShowToast = useCallback((message='', type='success') => {
        setToastProps({
            message,
            type
        });
        setShow(true);
    }, []);

    const getBorderColor = () => {
        return toastProps.type === 'warning'
            ? 'orange'
            : toastProps.type === 'error' ? 'red' : 'green';
    }

    const onCloseToast = useCallback(() => {
        setShow(false);
        setToastProps({
            message: '',
            type: ''
        })
    }, []);

    return (
        <ToastContext.Provider value={{
            setShowToast,
            onCloseToast
        }} >
            {children}
        {show && (
        <div style={{
            display: 'flex',
            position: 'fixed',
            justifyContent: 'flex-end',
            top: 0,
            right: 0,
            // padding: '10px',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '40px',
                width: '400px',
                padding: '4px',
                border: `2px solid ${getBorderColor()}`,
                gap: '10px',
                borderRadius: '10px'
            }}>
                <div style={{
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden'
                }}> {toastProps.message} </div>
                <div>
                    <div
                        onClick={onCloseToast}
                        style={{
                            alignSelf: 'flex-end',
                            height: '20px',
                            width: '20px',
                            border: '1px solid lightgray',
                            borderRadius: '50%',
                            textAlign: 'center',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    > X </div> 
                </div>
            </div>
            {/* <div> {toastProps.message} </div> */}
        </div>)}
        </ToastContext.Provider>
    )
})

export const useToast = () => {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error('no context');
    }

    console.log(context);
    return context;
}