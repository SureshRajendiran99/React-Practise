import { useState, useEffect } from "react";

const n = 3;
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
        <>
            <h4 style={{ textAlign: 'center'}}> Memory Game: Once you select all boxes, it will reset in selected order</h4>
            <div style ={{
                display: 'grid',
                justifyContent: 'center',
                gridTemplateColumns: `repeat(${n}, 80px)`,
                gridGap: '5px',
                marginTop: '50px'
            }}>
                {grid.map((g =>
                <span key={g}
                    style={{
                        height: '50px',
                        // width: '100px',
                        background: selected.includes(g) ? 'green' : '#e1f1f2',
                        alignContent: 'center',
                        textAlign: 'center',
                        color: 'black',
                        borderRadius: '4px'
                    }}
                    onClick={() => onClickCell(g)}
                
                />))}
            </div>
        </>
    )
};

