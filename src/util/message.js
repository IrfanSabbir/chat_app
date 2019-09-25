const generateMessage = (username,text)=>{
    return {
        username,
        text,
        ceratedAt: new Date().getTime()
    }
}
const generateLocation =(username,coords)=>{
    return{
        username,
        url: `http://google.com/maps?q=${coords.latitude},${coords.longitude}`,
        ceratedAt: new Date().getTime()
    }
}

module.exports={
    generateMessage,
    generateLocation
}