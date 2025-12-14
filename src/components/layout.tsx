import { useState, useEffect } from "react";

const n = 2;
const TIMEOUT = 1 //sec
export const Layout = () => {
    const [grid, setGrid] = useState(Array.from({ length: n * n}, (_, i) => i));
    const [selected, setSelected] = useState<number[]>([]);
    const [isAllSel, setIsAllSel] = useState(false);

    const onClickCell = (ind: number) => {
        if (isAllSel || selected.includes(ind)) return;

        setSelected((pre: number[]) => {
            return [ind, ...pre];
        });
    };

    useEffect(() => {
        if (selected.length === n*n) {
            setIsAllSel(true);
            selected.forEach((_, i) => {
                setTimeout(() => {
                   setSelected((pre) => {
                        const updated = [...pre];
                        updated.pop();
                        return updated;
                   })

                   if (i === (n * n - 1)) setIsAllSel(false);
                }, TIMEOUT * 1000 * (i + 1))
            });
        }
    }, [selected])


    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 'calc(100vh - 32px)',
        }}>
            <div style ={{
                display: 'grid',
                // textAlign: 'center',
                alignContent: 'center',
                gridTemplateColumns: `repeat(${n}, 1fr)`,
                gridGap: '10px',
            }}>
                {grid.map((g =>
                <span key={g}
                    style={{
                        height: '100px',
                        width: '100px',
                        background: selected.includes(g) ? 'green' : '#e1f1f2',
                        alignContent: 'center',
                        textAlign: 'center',
                        color: 'black'
                    }}
                    onClick={() => onClickCell(g)}
                
                > {g} </span>))}
            </div>
        </div>
    )
};

