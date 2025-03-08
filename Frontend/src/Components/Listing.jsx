import Header from './Header'
import { useAuth } from './services/AuthProvider'
const Listing = () =>{
    const  {user}  = useAuth();
    return (<>
    <Header/>
        <h1>HELLO {user?user.username:"REACHER!"}</h1>
        </>
    )
}

export default Listing