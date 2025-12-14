import { useState, useMemo } from "react";

type Note = {
    id: string, value: string, date: string
}

export const Notes = () => {
    const [note, setNote] = useState('');
    const [notesList, setNotesList] = useState<Note[]>([]);
    const [search, setSearch] = useState('');

    const filterList = useMemo(() => {
        return search ? notesList.filter(data => data.value?.toLowerCase()?.includes(search.toLowerCase())) : notesList;
    }, [notesList, search])

    const onSave = () => {
        if (!note) return;
        setNotesList((prev: any) => [...prev, { id: Date.now(), date: getDate(), value: note}]);
        setNote('');
    };

    const getDate = () => {
        const date = new Date();
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yy = date.getFullYear();

        return `${dd}/${mm}/${yy}`;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px'}}>
            <h3> Notes </h3>
            <div style={{ height: '30px', width: '80%', border: '1px solid black', padding: '1px 4px', borderRadius: '6px', display: 'flex'}}>
                <div>	&#x1F50E;&#xFE0E; </div>
                <input style={{ border: 'none', outline: 'none', height: '80%', width: '96%', }} onChange={(e) => setSearch(e.target.value)}/>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                <div style={{height: '150px', width: '300px', border: '1px solid black', borderRadius: '10px', 
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '6px',
                }}>
                    <textarea placeholder="Type to add a note" name='add notes'
                        value={note}
                        style={{ height: '78%', resize: 'none', border: 'none', outline: 'none'}}
                        onChange={(e) => note.length < 200 && setNote(e.target.value)}
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between'}}>
                        <span> {200 - note.length} Remaining </span>
                        <button onClick={onSave}> Save </button>
                    </div>
                </div>
                {filterList.map((data) => 
                    <div style={{height: '150px', width: '300px', border: '1px solid black', borderRadius: '10px', 
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '6px'
                        }}
                        key={data.id}
                    >
                        <div
                            title={data.value}
                            style={{ height: '78%', whiteSpace: 'normal', wordBreak: 'break-word', overflowY: 'auto'}}
                        > {data.value} </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between'}}>
                            <span> {data.date} </span>
                            <button onClick={() => setNotesList((prev) => prev.filter(note => note.id !== data.id))}> Delete </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}