import { useMemo, useState, useEffect, useRef } from "react";
import './snakeGame.css'

const SIZE = 15;
const dirMap: any = {
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1],
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0]
}
export const SnakeGame = () => {
    const board: string[][] = useMemo(() => {
        return Array.from({ length: SIZE}, () => Array(SIZE).fill(''));
    }, [])

    const [snake, setSnake] = useState([[2,3]]);
    const directionRef = useRef<string>('ArrowRight');
    const foodRef = useRef<number[]>([~~(Math.random() * SIZE), ~~(Math.random() * SIZE)]);
    const intervaRef = useRef<any>(null);
    const boardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        boardRef.current?.focus();
    }, []);


    useEffect(() => {
        intervaRef.current = setInterval(() => {
            setSnake((pre: number[][]) => {
                const copy = pre.map((data: number[]) => [...data]);
                const newValue = [copy[0][0] + dirMap[directionRef.current][0], copy[0][1] + dirMap[directionRef.current][1]];
                if ((newValue[0] === foodRef.current[0] && newValue[1] === foodRef.current[1])) {
                    foodRef.current = [~~(Math.random() * SIZE), ~~(Math.random() * SIZE)];
                } else {
                    copy.pop();
                }
                const isExist = copy.some((data: number[]) => data[0] === newValue[0] && data[1] === newValue[1]);
                if (newValue[0] < 0 || newValue[0] > SIZE || newValue[1] < 0 || newValue[1] > SIZE || isExist) {
                    directionRef.current = 'ArrowRight';
                    // alert('Game Over')
                    return [[2,3]];
                }
                copy.unshift([...newValue]);
                return copy;
            })
        }, 200)

        const handleKeydowm = (e: any) => {
            if (!dirMap[e.key]) return;
            if ((e.key === 'ArrowDown' && directionRef.current === 'ArrowUp') || (e.key === 'ArrowUp' && directionRef.current === 'ArrowDown') || (e.key === 'ArrowLeft' && directionRef.current === 'ArrowRight') || (e.key === 'ArrowRight' && directionRef.current === 'ArrowLeft')) {
                return;
            }
            directionRef.current = e.key;
        }

        window.addEventListener('keydown', handleKeydowm);

        return () => {
            window.removeEventListener('keydown', handleKeydowm);
            if (intervaRef.current) clearInterval(intervaRef.current)
        }
    }, [])

    const isSnake = (row: number, col: number) => {
        return snake.some((data: number[]) => data[0] === row && data[1] === col)
    }

    return (
        <div className="board" tabIndex={0} ref={boardRef}>
            {board.map((row: string[], ri: number) => <div key={ri} className="board-row">
                    { row.map((col, ci) => <div 
                        key={`${ri}-${ci}`} 
                        className={`board-col ${isSnake(ri, ci) ? 'snake' : ''} ${ri === foodRef.current[0] && ci === foodRef.current[1] ? 'food' : ''}`}
                    />)}
                </div>
            )}
        </div>
    )
}