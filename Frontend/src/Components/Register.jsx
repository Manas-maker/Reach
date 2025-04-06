import './Register.css'
const Register = ({ open, setOpen }) =>{
    const registerSubmit = async (e)=>{
        e.preventDefault();
        const formData = new FormData(e.target); 

        const formDataObject = {};
        formData.forEach((value, key) => {
            formDataObject[key] = value;
        });

        const user = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/Register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formDataObject), 
        }).then((res)=> {
            if (res.status === 204) {
                window.alert("User already exists");
                return;
            }
        });
        if ( open !== null ){
            window.localStorage.setItem('loggedUser', JSON.stringify(user))
            setOpen(false);
            console.log(user)
        }
    }
    return (
        <div id="formPopup" className="registerForm">
            <form onSubmit={ registerSubmit }>
                <h2>Register User</h2>
                <fieldset>
                    <input type="text" placeholder="First and Last Name*" name="name" />
                    <input type="text" placeholder="User Name*" name="username" />
                    <input type="password" placeholder="Password*" name="password" />
                </fieldset>
                <fieldset>
                    <h3>Contact Info:(choose one)*</h3>
                    <input type="email" placeholder="Email" name="email" />
                    <input type="text" placeholder="Phone No." name="phoneNo" />
                </fieldset>
                <p className="formDisclaimer">By signing up, confirm that you've read and accepted our <span className="redLink"><a>terms of service</a></span> and <span className="redLink"><a>privacy policy</a></span></p>
                <button type="submit" >Register</button>
            </form>
        </div>
    )
}

export default Register