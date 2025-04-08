const TOS = ()=>{
    return (
        <div>
                  <iframe 
        src="/tos.html" 
        title="Terms of Service" 
        style={{
          width: '80vw', 
          height: '800px', 
          border: 'none'
        }}
      />
        </div>
    )
}

const Privacy = () => {
    return (
        <div>
            <iframe 
        src="/privacy.html" 
        title="Privacy Policy" 
        style={{
          width: '80vw', 
          height: '800px', 
          border: 'none'
        }}
      />
        </div>
    )
}

export {TOS, Privacy}