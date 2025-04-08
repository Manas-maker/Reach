import "./LoadingScreen.css"
const LoadingScreen=()=>{
    return(<div style={{display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center"}}>
        <img src='/bee-cute.gif' style={{marginTop:"50vh", transform:"translateY(-50%)"}}/>
        <h1 id="loadingReaching" style={{textAlign:"center"}}></h1>
        </div>
    )
}

export default LoadingScreen;