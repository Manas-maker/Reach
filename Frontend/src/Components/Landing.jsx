import Header from './Header'
import './Landing.css'
const  Landing = ()=> {
    return (
        <div id="heroPage">
            <Header/>
            <div id='hero'>
                <h1>REACH</h1>
                <p>spot it. reach it.</p>
            </div>
            <div id='categoryCarousel'>
            <div className='carouselItem'></div>
            <div className='carouselItem'></div>
            <div className='carouselItem'></div>
            <div className='carouselItem'></div>
            <div className='carouselItem'></div>
            </div>
        </div>
    )
}

export default Landing