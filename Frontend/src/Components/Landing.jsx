import Header from './Header'
import './Landing.css'
import { useAuth } from './services/AuthProvider'
import LoadingScreen from './LoadingScreen'
const  Landing = ()=> {
    const {loading} = useAuth()
    while (loading) {
        return (<LoadingScreen/>)
    }
    return (
        <div id="heroPage">
            <Header/>
            <div className='floatIn'>
            <div id='hero'>
                <h1>REACH</h1>
                <p>spot it. reach it.</p>
            </div>
            <div id='categoryCarousel'>
            <div className='carouselItem'>
                        <a href="/search/restaurant">
                        <img src='restaurant.jpg' alt='restaurant' className="carouselImage" />
                        <p className="carouselText">Restaurants</p>
                        </a>
            </div>
            <div className='carouselItem'>
                        <a href="/search/grocery">
                        <img src='grocery.jpg' alt='grocery' className="carouselImage" />
                        <p className="carouselText">Groceries</p>
                        </a>
            </div>
            <div className='carouselItem'>
                        <a href="/search/laundromat">
                        <img src='laundry.jpg' alt='laundromat' className="carouselImage" />
                        <p className="carouselText">Laundromats</p>
                        </a>
            </div>
            <div className='carouselItem'>
                        <a href="/search/pg">
                        <img src='pg.jpg' alt='pg' className="carouselImage" />
                        <p className="carouselText">PGs</p>
                        </a>
            </div>
            <div className='carouselItem'>
                        <a href="/search/salon">
                        <img src='salon.jpg' alt='salon' className="carouselImage" />
                        <p className="carouselText">Salons</p>
                        </a>
            </div>
            </div>
        </div>
        </div>
    )
}

export default Landing