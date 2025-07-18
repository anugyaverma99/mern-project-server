 //Example of USERAGENT:
 // Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36



const getDeviceInfo=(userAgent)=>{
    const isMobile=/mobile/i.test(userAgent);
    const browser=userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)/i)?.[0] ||'unknown';

    return{
        deviceType:isMobile?'Mobile':'Desktop',
        browser:browser
    };

};

module.exports={getDeviceInfo};