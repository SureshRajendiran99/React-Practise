import { useState} from "react";


export const Accordion = () => {
    const [list] = useState<{id: number, title: string, content: string, active: boolean}[]>([
        { id: 1, title: 'This is the first accordion header', content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', active: false},
        { id: 2, title: 'This is the second accordion header', content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', active: false},
        { id: 3, title: 'This is the third accordion header', content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', active: false}
    ]);

    // const onSetActive = (id: number) => {
    //     setList((pre) => pre.map(d => ({
    //         ...d, active: d.id === id ? !d.active : d.active
    //     })));
    // }

    // return (list.map(d =>
    //     <div key={d.id as number} style={{ width: '100%'}}>
    //         <div
    //             className="header"
    //             onClick={() => onSetActive(d.id as number)}
    //             style={{ 
    //                 display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center',
    //                 background: '#cccccc', padding: '10px 24px 10px 10px', borderBottom: '1px solid #e5e7eb', cursor: 'pointer'
    //             }}
    //         >
    //             <div
    //                 style={{flex: 1, fontWeight: 600}}
    //             > {d.title} </div>
    //             <span style={{ fontSize: '24px'}}> { d.active ? '-' : '+' } </span>
            
    //         </div>
    //         <div
    //             style={{
    //                 padding: '12px',
    //                 display: d.active ? 'block' : 'none',
    //                 transition: 'all 0.6s',
    //             }}
    //             className="text-overflow"
    //             title={d.content as string}
    //         > {d.content} </div>
    //     </div>
    // ))

    const Item = ({ data }: any) => {
        const { title, content} = data || {};
        const [active, setActive] = useState(false);

        return (
            <>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#cccccc', borderBottom: '1px solid #e5e7eb', padding: '4px', alignItems: 'center'}} onClick={() => setActive(!active)}>
                    <span> {title} </span>
                    <span> { active ? '-' : '+'} </span>
                </div>
                {active && <div style={{ background: 'white', padding: '10px'}}> {content}</div>}
            </>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column'}}>
            { list.map(data => <Item data={data} key={data.id}/>)}
        </div>
    )
}