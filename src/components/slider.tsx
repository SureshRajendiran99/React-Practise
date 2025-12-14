import { useState } from 'react'
import image1 from '../assets/img_1.jpg'
import image2 from '../assets/img_2.jpeg'
import image3 from '../assets/img_3.jpeg';
import './slider.css'

export const Slider = () => {
    const [images, setImages] = useState([
        { url: image1, active: true},
        { url: image2, active: false},
        { url: image3, active: false}
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
                <div 
                // style={{ display: 'flex', justifyContent: 'space-between', padding: '12px' }}
                >
                    <span className='arrow' onClick={() => onSetImages(i-1)}> {'<'} </span>
                    <img key={i} src={d.url} style={{
                        height: '350px',
                        width: '350px',
                        objectFit: 'contain',

                    }} />
                    <span className='arrow' onClick={() => onSetImages(i + 1)}> {'>'} </span>
                </div>
            </div>
        )
    )
}