import { useState, useRef } from "react";

type Cell = '' | 'X' | 'O';
type Board = Cell[][];

export const TicTacToe = ({ boardSize = 3}) => {
    const [board, setBoard] = useState<Board>(Array.from({length: boardSize}, () => Array(boardSize).fill('')));
    const [isXTurn, setIsXTurn] = useState(true);
    const [winner, setWinner] = useState('');
    const countRef = useRef<number>(0);

    const isGameEnd = (data: any, row: number, col: number) => {
        const value = data[row][col];
        const vCount = 1 + countDirection(data, row, col, -1, 0, value) + countDirection(data, row, col, 1, 0, value);
        const hCount = 1 + countDirection(data, row, col, 0, -1, value) + countDirection(data, row, col, 0, 1, value);
        const crossX = 1 + countDirection(data, row, col, -1, -1, value) + countDirection(data, row, col, 1, 1, value);
        const crossY = 1 + countDirection(data, row, col, -1, 1, value) + countDirection(data, row, col, 1, -1, value);

        if (hCount >= boardSize || vCount >= boardSize || crossX >= boardSize || crossY >= boardSize) {
            setWinner(`${value} wins the game`);
        } else if (countRef.current === (boardSize * boardSize)) {
            setWinner(`Match draw`);
        }
    }

    
    const countDirection = (data: Board, row: number, col: number, dr: number, dc: number, value: Cell): number => {
        let r = row + dr;
        let c = col + dc;
        let count = 0;

        while (r >= 0 && r < boardSize && c >= 0 && c < boardSize && data[r][c] === value) {
            count += 1;
            r += dr;
            c += dc;
        }
        return count;
    };


    // const topCount = (data: any, row: number, col: number, value: string): number => {
    //     if (row < 0 || data[row][col] !== value) return 0;

    //     return 1 + topCount(data, row - 1, col, value);
    // }

    // const bottomCount = (data: any, row: number, col: number, value: string): number => {
    //     if (row >= boardSize || data[row][col] !== value) return 0;

    //     return 1 + bottomCount(data, row + 1, col, value);
    // }

    // const leftCount = (data: any, row: number, col: number, value: string): number => {
    //     if (col < 0 || data[row][col] !== value) return 0;

    //     return 1 + leftCount(data, row, col - 1, value);
    // }

    // const rightCount = (data: any, row: number, col: number, value: string): number => {
    //     if (col >= boardSize || data[row][col] !== value) return 0;

    //     return 1 + rightCount(data, row, col + 1, value);
    // }

    // const crossTopLeftCount = (data: any, row: number, col: number, value: string): number => {
    //     if (row < 0 || col < 0 || data[row][col] !== value) return 0;

    //     return 1 + crossTopLeftCount(data, row - 1, col - 1, value);
    // }

    // const crossBottomRightCount = (data: any, row: number, col: number, value: string): number => {
    //     if (row >= boardSize || col >= boardSize || data[row][col] !== value) return 0;

    //     return 1 + crossBottomRightCount(data, row + 1, col + 1, value);
    // }

    // const crossBottomleftCount = (data: any, row: number, col: number, value: string): number => {
    //     if (col < 0 || row >= boardSize || data[row][col] !== value) return 0;

    //     return 1 + crossBottomleftCount(data, row + 1, col - 1, value);
    // }

    // const crossTopRightCount = (data: any, row: number, col: number, value: string): number => {
    //     if (col >= boardSize || row < 0 || data[row][col] !== value) return 0;

    //     return 1 + crossTopRightCount(data, row - 1, col + 1, value);
    // }

    const onChangeBoard = (r: number, c: number) => {
        if (winner) return;

        if (!board[r][c]) {
            countRef.current = countRef.current + 1;
            const isCallWinner = countRef.current >= (boardSize * 2 - 1);
            setBoard((prev: Board) => {
                prev[r][c] = isXTurn ? 'X' : 'O';
                isCallWinner && isGameEnd(prev, r, c);
                return prev;
            })
            setIsXTurn(!isXTurn);
        }
    }

    const onResetBoard = () => {
        setBoard(Array.from({length: boardSize}, () => Array(boardSize).fill('')));
        setIsXTurn(true);
        setWinner('');
        countRef.current = 0;
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: '5px'}}>
            <h3> Tic Tac Toe </h3>
            {winner ? <p>{winner} <button onClick={onResetBoard}> Reset </button></p>: null}
            {board.map((row, ri) => <div key={ri} style={{ display: 'flex', gap: '5px'}}>
                {row.map((col, ci) => <div key={`${ri}_${ci}`} 
                    style={{
                        height: '50px',
                        width: '50px',
                        border: '1px solid black',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700
                    }}
                    onClick={() => onChangeBoard(ri, ci)}
                > {col} </div> )}
            </div>)}
        </div>
    )
}