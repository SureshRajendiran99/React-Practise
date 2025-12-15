import { useState } from 'react'
import image1 from '../assets/img_1.jpg'
import image2 from '../assets/img_2.jpeg'
import image3 from '../assets/img_3.jpeg';
import './slider.css'

export const Slider = () => {
    const [images, setImages] = useState([
        { url: image1, active: true, caption: 'A calm and beautifully composed moment captured in time'},
        { url: image2, active: false, caption: 'Highlighting the details that make this scene truly stand out'},
        { url: image3, active: false, caption: 'A snapshot that blends light, color, and emotion perfectly'},
    ]);

    const onSetImages = (activeInd: number) => {
        if (activeInd >= images.length) {
            activeInd = 0;
        } else if (activeInd < 0) {
            activeInd = images.length - 1;
        }

        setImages(images.map((d,i) => ({
            ...d, active: activeInd === i ? true : false
        })));
    }

    return (
        images.map((d, i) =>
            <div style={{
                display: d.active ? 'block' : 'none',
            }}>
                <figure 
                    style={{border: '1px solid black', borderRadius: '8px', position: 'fixed' }}
                >
                    <span className='arrow arrow-left' onClick={() => onSetImages(i-1)}> {'<'} </span>
                    <img key={i} src={d.url} style={{
                        height: '350px',
                        width: '350px',
                        objectFit: 'contain',
                        borderBottom: '1px solid #e5e7eb',
                        padding: '5px'
                    }} />
                    <span className='arrow arrow-right' onClick={() => onSetImages(i + 1)}> {'>'} </span>
                    <figcaption style={{ width: '350px', padding: '5px'}}> <i> {d.caption} </i></figcaption>
                </figure>
            </div>
        )
    )
}